class PagesController < ApplicationController
  def home
    @objets = Objet.all
  end
end
