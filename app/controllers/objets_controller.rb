class ObjetsController < ApplicationController
  before_action :set_objet, only: %i[show edit update destroy]

  def index
    @objets = Objet.all
  end

  def show
    @secteurs = @objet.secteurs.includes(:image_attachment)
    @selected_sector_id = params[:selected_sector_id]
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
end
