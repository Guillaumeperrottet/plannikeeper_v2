class ObjetsController < ApplicationController
  before_action :set_objet, only: %i[show edit update destroy]

  def index
    @objets = Objet.all
  end

  def show
  end

  def new
    @objet = Objet.new
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
    if @objet.update(objet_params)
      redirect_to @objet, notice: 'Objet was successfully updated.'
    else
      render :edit
    end
  end

  def destroy
    @objet.destroy
    redirect_to objets_url, notice: 'Objet was successfully destroyed.'
  end

  private

  def set_objet
    @objet = Objet.find(params[:id])
  end

  def objet_params
    params.require(:objet).permit(:nom, :adresse, :secteur, :image)
  end
end
