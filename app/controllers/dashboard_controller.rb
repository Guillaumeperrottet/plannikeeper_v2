class DashboardController < ApplicationController
  before_action :set_current_path

  def dashboard
    # Récupérer les objets visibles en fonction de l'utilisateur
    if current_user.enterprise_admin?
      # Admin voit tous les objets de l'entreprise
      @objets = Objet.where(company_id: current_user.company_id)
    elsif current_user.enterprise_user?
      # Utilisateur entreprise voit uniquement les objets qui lui sont assignés
      @objets = current_user.objets
    else
      # Utilisateur privé voit uniquement ses propres objets
      @objets = current_user.objets
    end

    # Gestion des tâches pour l'objet sélectionné
    selected_objet = @objets.find_by(id: params[:objet_id]) if params[:objet_id].present?

    @this_week_tasks = selected_objet&.tasks&.this_week || [] # Tâches de cette semaine
    @upcoming_tasks = selected_objet&.tasks&.upcoming || []   # Tâches à venir

    # Debugging
    Rails.logger.debug "Objets visibles : #{@objets.map { |o| "ID: #{o.id}, Nom: #{o.nom}" }}"
    Rails.logger.debug "Tâches de cette semaine : #{@this_week_tasks.map(&:name)}"
    Rails.logger.debug "Tâches à venir : #{@upcoming_tasks.map(&:name)}"

    render 'dashboard/mobile/mobile_dashboard' if browser.device.mobile?
  end



  def print_tasks
    selected_objet = Objet.find(params[:objet_id]) if params[:objet_id].present?

    # Préparer les tâches pour l'impression
    @this_week_tasks = selected_objet&.tasks&.this_week || []
    @upcoming_tasks = selected_objet&.tasks&.upcoming || []

    render 'dashboard/print_tasks'
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
