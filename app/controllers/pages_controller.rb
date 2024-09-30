class PagesController < ApplicationController
  def home
    @objets = Objet.all
    selected_objet = Objet.find(params[:objet_id]) if params[:objet_id].present?

    # Initialiser les tâches de la semaine et à venir
    @this_week_tasks = selected_objet&.tasks&.this_week || [] # Retourne un tableau vide s'il n'y a rien
    @upcoming_tasks = selected_objet&.tasks&.upcoming || []   # Retourne un tableau vide s'il n'y a rien
  end
end
