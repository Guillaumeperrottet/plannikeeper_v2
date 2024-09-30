class HomeController < ApplicationController
  def index
    @objets = Objet.all
    @selected_objet = Objet.find_by(id: params[:selected_objet_id]) || @objets.first

    if @selected_objet
      @this_week_tasks = @selected_objet.tasks.where(realisation_date: Date.today.beginning_of_week..Date.today.end_of_week)
      @upcoming_tasks = @selected_objet.tasks.where("realisation_date > ?", Date.today.end_of_week)
    else
      @this_week_tasks = []
      @upcoming_tasks = []
    end
  end
end
