class ArticlesController < ApplicationController
  before_action :set_page_title, only: [:new, :show] # Ajuste les actions où tu veux afficher ce titre
  before_action :set_breadcrumbs

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

  def index
    @articles = Article.where(secteur_id: params[:secteur_id], objet_id: params[:objet_id])

    Rails.logger.info "Articles trouvés : #{@articles.inspect}"

    if @articles.any?
      render json: { articles: @articles.as_json(only: [:id, :position_x, :position_y, :width, :height, :title, :description, :objet_id]) }, status: :ok
    else
      render json: { articles: [] }, status: :ok
    end
  end

  def show
    @objet = Objet.find(params[:objet_id])
    @secteur = Secteur.find(params[:secteur_id])
    @article = Article.find_by(id: params[:id])

    if @article.nil?
      # Gérer le cas où l'article n'existe pas
      redirect_to root_path, alert: "L'article n'existe pas"
    else
      # Tri des tâches par date de fin ou de réalisation (urgente en premier) avec Arel.sql
      @tasks = @article.tasks.order(Arel.sql('COALESCE(end_date, realisation_date) ASC'))

      # Application des filtres si nécessaire
      if params[:executant_filter].present?
        @tasks = @tasks.where(executant: params[:executant_filter])
      end

      if params[:cfc_filter].present?
        @tasks = @tasks.where(cfc: params[:cfc_filter])
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
    params.require(:article).permit(:title, :description, :position_x, :position_y, :width, :height, :secteur_id, :objet_id)
  end

  def set_page_title
    case action_name
    when 'show'
      @page_title = 'Article - TODO'
    else
      @page_title = 'Plannikeeper'
    end
  end
end
