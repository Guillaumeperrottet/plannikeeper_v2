class DashboardController < ApplicationController
  before_action :set_current_path

  def dashboard

    # Récupérer les objets en fonction de l'utilisateur connecté
    if current_user.enterprise_admin? || current_user.enterprise_user?
      @objets = Objet.where(company_id: current_user.company_id)
    else
      @objets = current_user.objets
    end

    # permet de sélectionner un objet pour filtrer les tâches
    selected_objet = Objet.find(params[:objet_id]) if params[:objet_id].present?

    # Initialiser les tâches de la semaine et à venir
    @this_week_tasks = selected_objet&.tasks&.this_week || [] # Retourne un tableau vide s'il n'y a rien
    @upcoming_tasks = selected_objet&.tasks&.upcoming || []   # Retourne un tableau vide s'il n'y a rien

    # Debug : Affiche les descriptions dans la console
    @this_week_tasks.each { |task| puts "Task: #{task.name}, Description: #{task.description}" }
    @upcoming_tasks.each { |task| puts "Task: #{task.name}, Description: #{task.description}" }
    # Debugging pour voir les tâches chargées
    Rails.logger.debug "Objets visibles : #{@objets.map { |o| "ID: #{o.id}, Nom: #{o.nom}" }}"
    Rails.logger.debug "Tâches de cette semaine : #{@this_week_tasks.map { |t| t.name }}"
    Rails.logger.debug "Tâches à venir : #{@upcoming_tasks.map { |t| t.name }}"


    if browser.device.mobile?
      render 'dashboard/mobile/mobile_dashboard'
    end
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
