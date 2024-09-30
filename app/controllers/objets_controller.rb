class ObjetsController < ApplicationController
  before_action :set_objet, only: %i[show edit update destroy]
  before_action :set_page_title, only: [:new, :edit, :show] # Ajuste les actions où tu veux afficher ce titre

  def index
    @objets = Objet.all
  end

  def show
    @objet = Objet.find(params[:id])
    @secteurs = @objet.secteurs.includes(:image_attachment)
    @selected_sector_id = params[:selected_sector_id]
    # Assurez-vous de récupérer l'ID de l'article depuis les paramètres
    @article = Article.find_by(id: params[:article_id])
    # Chargez les tâches seulement si l'article existe
    @tasks = @article.present? ? @article.tasks : []
  end

  def new
    @objet = Objet.new
    @objet.secteurs.build
  end

  def create
    @objet = Objet.new(objet_params)
    if @objet.save
      redirect_to @objet, notice: 'Objet was successfully created.'
    else
      render :new
    end
  end

  def edit
  end

  def update
    @objet = Objet.find(params[:id])
    if @objet.update(objet_params)
      redirect_to @objet, notice: 'Objet mis à jour avec succès.'
    else
      render :edit
    end
  end

  def destroy
    @objet.destroy
    redirect_to root_path, notice: 'Objet was successfully destroyed.'
  end

  private

  def set_objet
    @objet = Objet.find(params[:id])
  end

  def objet_params
    params.require(:objet).permit(:nom, :adresse, secteurs_attributes: [:id, :nom, :image, :_destroy])
  end

  def set_page_title
    case action_name
    when 'new'
      @page_title = 'Création objet'
    when 'edit'
      @page_title = 'Édition objet'
    else
      @page_title = 'Plannikeeper'
    end
  end
end
