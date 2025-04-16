class ObjetsController < ApplicationController
  load_and_authorize_resource
  before_action :set_objet, only: %i[show edit update destroy]
  before_action :set_page_title, only: %i[new edit show] # Ajuste les actions où tu veux afficher ce titre
  before_action :set_breadcrumbs, only: %i[show edit new]

  def index
    if current_user.enterprise_admin? || current_user.enterprise_user?
      # Charge tous les objets de l'entreprise
      @objets = Objet.where(company_id: current_user.company_id).accessible_by(current_ability)
    else
      # Charge uniquement les objets de l'utilisateur privé
      @objets = current_user.objets.accessible_by(current_ability)
    end
    # Rails.logger.debug "Objets visibles : #{@objets.map { |o| "ID: #{o.id}, Nom: #{o.nom}" }}"
    redirect_to authenticated_root_path # Si une vue spécifique est nécessaire
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
    @objet = Objet.new(objet_params)

    if current_user.enterprise_admin? || current_user.enterprise_user?
      @objet.company = current_user.company
    end

    @objet.user = current_user # Associe toujours l'utilisateur actuel à l'objet

    if @objet.save
      flash[:notice] = 'Votre objet a été créé !'
      redirect_to authenticated_root_path
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
    flash[:notice] = 'Votre objet a bien été supprimer !'
    redirect_to authenticated_root_path
  end

  private

  def set_objet
    if current_user.enterprise_admin? || current_user.enterprise_user?
      # Recherche les objets liés à l'entreprise
      @objet = Objet.where(company_id: current_user.company_id).find(params[:id])
    else
      # Recherche les objets directement liés à l'utilisateur privé
      @objet = current_user.objets.find(params[:id])
    end
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

    if @objet&.persisted?
      add_breadcrumb "Modifier l'objet", edit_objet_path(@objet) if action_name == 'edit'
      add_breadcrumb @objet.nom, objet_path(@objet) unless action_name == 'edit'
    elsif action_name == 'new'
      add_breadcrumb "Création d'un objet"
    end

    if @article.present?
      add_breadcrumb "Todo", article_path(@article)
    end
  end


end
