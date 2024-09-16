class PagesController < ApplicationController
  def home
    @objets = Objet.all
    @objet = Objet.find(params[:id]) if params[:id]
  end
end
