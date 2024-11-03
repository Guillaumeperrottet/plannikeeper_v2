class ObjetsController < ApplicationController
  before_action :set_objet, only: %i[show edit update destroy]
  before_action :set_page_title, only: %i[new edit show] # Ajuste les actions où tu veux afficher ce titre
  before_action :set_breadcrumbs, only: %i[show edit new]

  def index
    @objets = current_user.objets # Ne récupère que les objets de l'utilisateur connecté
    redirect_to authenticated_root_path
  end

  def show
    @secteurs = @objet.secteurs.includes(:image_attachment)
    @selected_sector_id = params[:selected_sector_id]

    # Assurez-vous de récupérer le secteur et l'article si fournis
    @secteur = @secteurs.find_by(id: params[:secteur_id]) if params[:secteur_id].present?
    @article = Article.find_by(id: params[:article_id]) if params[:article_id].present?

    # Si un secteur est sélectionné, récupérer ses articles et les tris par nom
    @articles = @secteur ? @secteur.articles.order(:title) : []


    set_article_and_tasks

    # Vérifier si l'utilisateur force l'affichage de la vue "mobile_show_add_article"
    if params[:add_article]
      render 'objets/mobile/mobile_show_add_article'
    elsif browser.device.mobile? && !params[:force_desktop]
      render 'objets/mobile/mobile_show'
    else
      # Vue par défaut pour les écrans non mobiles ou si 'force_desktop' est présent
      render 'objets/show'
    end
  end

  def new
    @objet = Objet.new
    @objet.secteurs.build
  end

  def create
    @objet = current_user.objets.build(objet_params) # Associe l'objet à l'utilisateur actuel
    if @objet.save
      redirect_to @objet, notice: 'Votre objet a bien été créé.'
    else
      render :new
    end
  end

  def edit
  end

  def update
    if @objet.update(objet_params)
      redirect_to @objet, notice: 'Objet mis à jour avec succès.'
    else
      render :edit
    end
  end

  def destroy
    @objet.destroy
    redirect_to authenticated_root_path, notice: 'Objet supprimé avec succès.'
  end

  private

  def set_objet
    @objet = current_user.objets.find(params[:id]) # Recherche l'objet dans les objets de l'utilisateur connecté
  end

  def set_article_and_tasks
    @article = Article.find_by(id: params[:article_id])
    @secteur = Secteur.find_by(id: params[:secteur_id])
    @tasks = @article.present? ? @article.tasks : []
  end

  def objet_params
    params.require(:objet).permit(:nom, :adresse, secteurs_attributes: [:id, :nom, :title, :image, :_destroy])
  end

  def set_page_title
    @page_title = case action_name
                  when 'new'
                    'Création objet'
                  when 'edit'
                    'Édition objet'
                  else
                    'Plannikeeper'
                  end
  end

  def set_breadcrumbs
    add_breadcrumb "Vos objets", authenticated_root_path

    if @objet.present?
      add_breadcrumb "Modifier l'objet", edit_objet_path(@objet) if action_name == 'edit'
      add_breadcrumb @objet.nom, objet_path(@objet) unless action_name == 'edit'
    end

    if @article.present?
      add_breadcrumb "Todo", article_path(@article)
    end
  end


end
