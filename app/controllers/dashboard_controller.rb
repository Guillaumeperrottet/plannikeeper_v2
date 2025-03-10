class DashboardController < ApplicationController
  before_action :set_current_path

  def dashboard
    # Récupérer les objets visibles
    if current_user.enterprise_admin?
      @objets = Objet.where(company_id: current_user.company_id)
    elsif current_user.enterprise_user?
      @objets = current_user.objets
    else
      @objets = current_user.objets
    end

    # Sélectionner un objet par défaut
    selected_objet = if params[:objet_id].present?
                      @objets.find_by(id: params[:objet_id])
                    else
                      @objets.first
                    end

    # Récupérer les tâches si l'objet sélectionné a une méthode `tasks`
    @this_week_tasks = selected_objet&.respond_to?(:tasks) ? selected_objet.tasks.this_week : []
    @upcoming_tasks = selected_objet&.respond_to?(:tasks) ? selected_objet.tasks.upcoming : []

    @selected_objet = selected_objet

    render 'dashboard/mobile/mobile_dashboard' if browser.device.mobile?
  end



  def print_tasks
    @selected_objet = Objet.find(params[:objet_id]) if params[:objet_id].present?

    if @selected_objet
      @this_week_tasks = @selected_objet.this_week_tasks
      @upcoming_tasks = @selected_objet.upcoming_tasks
    else
      @this_week_tasks = []
      @upcoming_tasks = []
    end

    render layout: false
  end

  private

  def set_current_path
    @current_path = case request.path
                    when authenticated_root_path
                      "Home"
                    when new_objet_path
                      "Créer un objet"
                    else
                      "Autre"
                    end
  end
end
