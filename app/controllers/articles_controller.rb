class ArticlesController < ApplicationController
  before_action :set_page_title, only: [:new, :show] # Ajuste les actions où tu veux afficher ce titre
  before_action :set_breadcrumbs
  helper_method :toggle_sort_direction, :sort_arrow

  def create
    @secteur = Secteur.find(params[:secteur_id])
    @article = @secteur.articles.build(article_params)
    @article.objet_id = @secteur.objet_id  # Assigner l'ID de l'objet à l'article

    if @article.save
      render json: { article: @article }, status: :created
    else
      render json: { errors: @article.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @objet = Objet.find(params[:objet_id])
    @secteur = Secteur.find(params[:secteur_id])
    @article = Article.find(params[:id])

    if @article.destroy
      redirect_to objet_path(@objet), notice: 'Article supprimé avec succès.'
    else
      redirect_to objet_secteur_article_path(@objet, @secteur, @article), alert: 'Erreur lors de la suppression de l\'article.'
    end
  end

  def index
    @articles = Article.where(secteur_id: params[:secteur_id], objet_id: params[:objet_id])

    Rails.logger.info "Articles trouvés : #{@articles.inspect}"

    if @articles.any?
      render json: { articles: @articles.as_json(only: [:id, :position_x, :position_y, :radius, :title, :description, :objet_id]) }, status: :ok
    else
      render json: { articles: [] }, status: :ok
    end
  end

  def update
    @objet = Objet.find(params[:objet_id])
    @secteur = Secteur.find(params[:secteur_id])
    @article = @secteur.articles.find(params[:id])

    if @article.update(article_params)
      # Renvoyer la réponse JSON pour éviter une redirection
      render json: { article: @article, message: flash[:notice] }, status: :ok
    else
      # En cas d'erreur, renvoyer les erreurs en JSON sans redirection
      render json: { errors: @article.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def edit
    @objet = Objet.find(params[:objet_id])
    @secteur = Secteur.find(params[:secteur_id])
    @article = Article.find(params[:id])
  end

  def show
    @objet = Objet.find(params[:objet_id])
    @secteur = Secteur.find(params[:secteur_id])
    @article = Article.find_by(id: params[:id])

    if @article.nil?
      redirect_to root_path, alert: "L'article n'existe pas"
    else
      @tasks = @article.tasks.where.not(status: 'fermee')

      # Application des filtres si nécessaire
      if params[:executant_filter].present?
        @tasks = @tasks.where(executant: params[:executant_filter])
      end

      if params[:cfc].present?
        @tasks = @tasks.where(cfc: params[:cfc])
      end

      # Application du tri si les paramètres sont présents
      if params[:sort].present? && params[:direction].present?
        @tasks = @tasks.order("#{params[:sort]} #{params[:direction]}")
      else
        @tasks = @tasks.order(Arel.sql('COALESCE(end_date, realisation_date) ASC')) # Tri par défaut
      end

      # Vérifier si l'appareil est mobile et rendre la vue correspondante
      if browser.device.mobile?
        render 'articles/mobile/mobile_show'
      end
    end
  end



  def set_breadcrumbs
    add_breadcrumb "Vos objets", authenticated_root_path
    if @objet
      add_breadcrumb @objet.nom, objet_path(@objet)
    end
    if action_name == 'new'
      add_breadcrumb "Création de tâche", new_objet_secteur_article_task_path(@objet, @secteur, @article)
    elsif @article
      add_breadcrumb "Todo", article_path(@article)
    end
  end

  private

  def article_params
    params.require(:article).permit(:title, :description, :position_x, :position_y, :radius, :width, :height, :secteur_id, :objet_id)
  end

  def set_page_title
    case action_name
    when 'show'
      @page_title = 'Article - TODO'
    else
      @page_title = 'Plannikeeper'
    end
  end

  def toggle_sort_direction(column)
    if params[:sort] == column && params[:direction] == 'asc'
      'desc'
    else
      'asc'
    end
  end

  def sort_arrow(column)
    if params[:sort] == column
      direction_class = params[:direction] == 'asc' ? 'asc' : 'desc'
      return "<span class='sort-arrow #{direction_class}'></span>".html_safe
    else
      return "<span class='sort-arrow'></span>".html_safe
    end
  end

end
