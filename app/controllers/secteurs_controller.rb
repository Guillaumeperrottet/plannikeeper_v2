class SecteursController < ApplicationController
  before_action :set_objet
  before_action :set_secteur, only: [:new, :create, :edit, :update]

  def new
    @secteur = Secteur.new
  end

  def create
    @secteur = @objet.secteurs.build(secteur_params)
    if @secteur.save
      redirect_to edit_objet_path(@objet), notice: 'Secteur ajouté avec succès.'
    else
      render :new
    end
  end

  def edit
  end

  def update
    if @secteur.update(secteur_params)
      redirect_to @objet, notice: 'Secteur was successfully updated.'
    else
      render :edit
    end
  end

  private

  def set_objet
    @objet = Objet.find(params[:objet_id])
  end

  def set_secteur
    @secteur = @objet.secteurs.find(params[:id])
  end

  def secteur_params
    params.require(:secteur).permit(:nom)
  end
end
