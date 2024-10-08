class TasksController < ApplicationController
  before_action :set_article_and_sector, only: [:new, :create, :edit, :update, :index, :archive, :destroy]
  before_action :set_page_title, only: [:new, :edit, :show] # Ajuste les actions où tu veux afficher ce titre
  before_action :set_breadcrumbs, only: [:new, :edit, :show]
  before_action :set_task, only: [:edit, :update, :destroy, :archive]


  def new
    puts "Appel de la méthode 'new'"
    @objet = Objet.find(params[:objet_id])
    @secteur = Secteur.find(params[:secteur_id])
    @article = Article.find(params[:article_id])
    add_breadcrumb "Création de tâche", new_objet_secteur_article_task_path(@objet, @secteur, @article) # Ajout direct ici
    @task = @article.tasks.new
  end

  def create
    logger.debug "Appel de la méthode 'create'"

    @task = @article.tasks.new(task_params)

    # Définir la couleur en fonction du type de tâche
    case @task.task_type
    when 'réparations'
      @task.color = 'orange'
      @task.recurring = false # Non récurrent
    when 'récurrence'
      @task.color = 'lightblue' # Bleu clair
      @task.recurring = true # Récurrence activée automatiquement
    when 'entretiens'
      @task.color = 'lightgreen' # Vert clair
      @task.recurring = false # Non récurrent
    end

    # Gestion de la récurrence automatique pour les tâches récurrentes
    if @task.recurring?
      @task.recurrence_reminder_date ||= Date.today # Définir une date par défaut si elle n'est pas fournie
      current_date = @task.recurrence_reminder_date
      next_recurrence = calculate_next_recurrence(current_date, @task.period)
      @task.end_date = next_recurrence
    end

    if @task.save
      logger.debug("Tâche sauvegardée avec succès")

      if @task.image.attached?
        logger.debug("Image attached: #{@task.image.filename}")
      else
        logger.debug("No image attached.")
      end

      redirect_to objet_secteur_article_path(@objet, @secteur, @article), notice: 'La tâche a été créée avec succès.'
    else
      logger.debug("Task saving failed: #{@task.errors.full_messages}")
      render json: { errors: @task.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def show
    @article = Article.find(params[:id])
    @tasks = @article.tasks

    # Initialiser les variables avec des valeurs par défaut
    @executants = []
    @cfcs = []

    # Vérifier s'il y a des tâches disponibles
    if @tasks.present?
      # Extraire les exécutants et les CFC disponibles à partir des tâches
      @executants = @tasks.pluck(:executant).compact.uniq
      @cfcs = @tasks.pluck(:cfc).compact.uniq
    end

    # Ajout des filtres si nécessaire
    if params[:executant_filter].present?
      @tasks = @tasks.where(executant: params[:executant_filter])
    end

    if params[:cfc_filter].present?
      @tasks = @tasks.where(cfc: params[:cfc_filter])
    end
  end


  def destroy
    @task = @article.tasks.find(params[:id])
    if @task.destroy
      redirect_to objet_secteur_article_path(@objet, @secteur, @article), notice: 'La tâche a été supprimée avec succès.'
    else
      redirect_to objet_secteur_article_path(@objet, @secteur, @article), alert: "La suppression de la tâche a échoué."
    end
  end

  def archive
    if @task.update(status: "fermée")
      flash[:notice] = "Tâche archivée avec succès."
      redirect_to objet_secteur_article_path(@objet, @secteur, @article)
    else
      flash[:alert] = "Impossible d'archiver la tâche."
      redirect_to objet_secteur_article_path(@objet, @secteur, @article)
    end
  end

  def index_for_objet
    @objet = Objet.find(params[:objet_id])

    # Récupérer toutes les tâches ouvertes de cet objet
    @tasks = Task.joins(:article).where(articles: { objet_id: @objet.id }, task_open: true)

    # Filtrer les tâches pour cette semaine et celles à venir
    @this_week_tasks = @tasks.this_week
    @upcoming_tasks = @tasks.upcoming

    render json: {
      this_week_tasks: format_tasks(@this_week_tasks),
      upcoming_tasks: format_tasks(@upcoming_tasks)
    }
  end



  def index
    @tasks = @article.tasks
    @executants = @tasks.pluck(:executant).uniq
    @cfcs = @tasks.pluck(:cfc).uniq

    @tasks = @tasks.where(executant: params[:executant_filter]) if params[:executant_filter].present?
    @tasks = @tasks.where(cfc: params[:cfc_filter]) if params[:cfc_filter].present?
    @tasks = @tasks.where(status: params[:status_filter]) if params[:status_filter].present?
    # Scopes ou méthodes pour les tâches de cette semaine et à venir
    this_week_tasks = @tasks.this_week
    upcoming_tasks = @tasks.upcoming

    # Construction des tâches avec ou sans image pour "cette semaine"
    this_week_tasks_with_images = this_week_tasks.map do |task|
      {
        id: task.id,
        name: task.name,
        realisation_date: task.realisation_date.strftime("%d %b %Y"),
        cfc: task.cfc,
        description: task.description,
        image_url: task.image.attached? ? url_for(task.image) : nil
      }
    end

    # Construction des tâches avec ou sans image pour "à venir"
    upcoming_tasks_with_images = upcoming_tasks.map do |task|
      {
        id: task.id,
        name: task.name,
        realisation_date: task.realisation_date.strftime("%d %b %Y"),
        cfc: task.cfc,
        description: task.description,
        image_url: task.image.attached? ? url_for(task.image) : nil
      }
    end

    # Retourne un JSON avec les tâches de cette semaine et les tâches à venir
    render json: {
      this_week_tasks: this_week_tasks_with_images,
      upcoming_tasks: upcoming_tasks_with_images
    }
  end

  def edit
    @task = @article.tasks.find(params[:id])
  end

  def this_week
    where("(recurring = ? AND end_date BETWEEN ? AND ?) OR (recurring = ? AND realisation_date BETWEEN ? AND ?)",
          false, Date.today.beginning_of_week, Date.today.end_of_week,
          true, Date.today.beginning_of_week, Date.today.end_of_week)
  end

  def update
    @task = @article.tasks.find(params[:id])

    # Mise à jour de la date de rappel pour les tâches récurrentes
    if @task.recurring?
      @task.recurrence_reminder_date = calculate_next_recurrence(@task.recurrence_reminder_date, @task.period)
    end

    if @task.update(task_params)
      redirect_to objet_secteur_article_path(@objet, @secteur, @article), notice: 'Tâche mise à jour avec succès.'
    else
      render :edit
    end
  end

  def set_breadcrumbs
    logger.debug "---- Entrée dans la méthode 'set_breadcrumbs' ----"
  logger.debug "Objet: #{@objet}, Secteur: #{@secteur}, Article: #{@article}"

    if @objet && @secteur && @article
      add_breadcrumb "Vos objets", authenticated_root_path
      add_breadcrumb @objet.nom, objet_path(@objet)
      add_breadcrumb @secteur.nom, objet_secteur_path(@objet, @secteur)
      add_breadcrumb "Todo", objet_secteur_article_path(@objet, @secteur, @article)
    else
      logger.debug "Une ou plusieurs variables d'instance sont manquantes !"
    end
  end

  private

# Méthode pour calculer la prochaine date de récurrence
def calculate_next_recurrence(current_date, period)
  current_date ||= Date.today
  case period
  when 'Hebdomadaire'
    current_date + 1.week
  when 'Mensuelle'
    current_date + 1.month
  when 'Trimestrielle'
    current_date + 3.months
  when 'Annuelle'
    current_date + 1.year
  else
    current_date
  end
end


  def format_tasks(tasks)
    tasks.map do |task|
      {
        end_date: task.end_date&.strftime('%d %b'),
        name: task.name,
        article_title: task.article.title,
        article_id: task.article.id,
        secteur_id: task.article.secteur.id, # Inclut l'ID du secteur
        objet_id: task.article.objet.id, # Inclut l'ID de l'objet
        task_id: task.id
      }
    end
  end

  def set_article_and_sector
    logger.debug "Appel de la méthode 'set_article_and_sector'"
    @objet = Objet.find_by(id: params[:objet_id])
    @secteur = Secteur.find_by(id: params[:secteur_id])
    @article = Article.find_by(id: params[:article_id])

    # Si l'un des objets est nil, renvoyer une erreur 404 ou un message approprié
    if @objet.nil? || @secteur.nil? || @article.nil?
      render json: { error: "Objet, Secteur, ou Article introuvable" }, status: :not_found
    end
  end


  def set_article
    @article = Article.find(params[:article_id])
  end

  def set_page_title
    case action_name
    when 'new'
      @page_title = 'Création de tâche'
    when 'edit'
      @page_title = 'Édition de tâche'
    when 'show'
      @page_title = 'Détails de la tâche'
    else
      @page_title = 'Plannikeeper'
    end
  end

  def set_task
    @task = @article.tasks.find(params[:id])
  end

  def task_params
    params.require(:task).permit(:name, :description, :realisation_date, :cfc, :executant, :executant_comment, :image, :task_type, :color, :end_date, :period)
  end
end
