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
    add_breadcrumb "Création de tâche", new_objet_secteur_article_task_path(@objet, @secteur, @article)
    @task = @article.tasks.new


  # Vérifiez que l'utilisateur a les permissions nécessaires avant d'appeler `authorize!`
  unless @objet.company_id == current_user.company_id
    redirect_to objet_secteur_article_path(@objet, @secteur, @article), alert: "Vous n'êtes pas autorisé à créer une tâche pour cet article."
    return
  end

  # Appel explicite à `authorize!` après validation contextuelle
  authorize! :create, @task

    if browser.device.mobile?
      render 'tasks/mobile/mobile_new'
    else
      # Vue par défaut pour les écrans non mobiles
      render 'tasks/new'
    end
  end

  def create
    logger.debug "Appel de la méthode 'create'"

    @task = @article.tasks.new(task_params)


    # Définir la couleur en fonction du type de tâche
    case @task.task_type
    when 'construction'
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

    authorize! :create, @task

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
      render :new
    end
  end

  def show
    @article = Article.find(params[:id])
    @tasks = @article.tasks.where.not(status: 'fermée')

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

    if params[:cfc].present?
      @tasks = @tasks.where(cfc: params[:cfc])
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

  def historique
    @objet = Objet.find(params[:objet_id])
    @secteur = Secteur.find(params[:secteur_id])
    @article = Article.find(params[:article_id])

    # Récupérer les tâches avec le statut "fermée"
    @archived_tasks = @article.tasks.where(status: 'fermee')

    # Appliquer le tri selon les paramètres reçus
    @archived_tasks = case params[:sort_by]
                      when 'name_asc'
                        @archived_tasks.order(name: :asc)
                      when 'name_desc'
                        @archived_tasks.order(name: :desc)
                      when 'date_asc'
                        @archived_tasks.order(created_at: :asc)
                      when 'date_desc'
                        @archived_tasks.order(created_at: :desc)
                      else
                        @archived_tasks.order(name: :asc) # Tri par défaut si aucun paramètre n'est spécifié
                      end
  end


  def archive
    if @task.update(status: "fermee")
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
      # Charger les tâches liées à l'article tout en respectant les permissions
    @tasks = @article.tasks.accessible_by(current_ability)
    @executants = @tasks.pluck(:executant).uniq
    @cfcs = @tasks.pluck(:cfc).uniq

    # Filtrage selon les paramètres
    if params[:executant_filter].present? && params[:executant_filter] != "Tous les exécutants"
      @tasks = @tasks.where(executant: params[:executant_filter])
    end

    if params[:cfc].present? && params[:cfc] != "Tous les CFC"
      @tasks = @tasks.where(cfc: params[:cfc])
    end

    if params[:task_type_filter].present? && params[:task_type_filter] != "Tous les types"
      @tasks = @tasks.where(task_type: params[:task_type_filter])
    end

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

    # Renvoyer les tâches filtrées en JSON
    render json: {
      this_week_tasks: this_week_tasks_with_images,
      upcoming_tasks: upcoming_tasks
    }
  end



  def edit
    @task = @article.tasks.find(params[:id])
    @read_only = @task.status == 'fermée'
    if browser.device.mobile?
      render 'tasks/mobile/mobile_edit'
    else
      # Vue par défaut pour les écrans non mobiles
      render 'tasks/edit'
    end
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

      # Ajouter le texte de breadcrumb pour les actions spécifiques
      case action_name
      when 'historique'
        add_breadcrumb "Historique", historique_objet_secteur_article_tasks_path(@objet, @secteur, @article)
      when 'new'
        add_breadcrumb "Création de tâche", new_objet_secteur_article_task_path(@objet, @secteur, @article)
      when 'edit'
        add_breadcrumb "Modifier la tâche", edit_objet_secteur_article_task_path(@objet, @secteur, @article, @task) if @task
      end
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
        task_id: task.id,
        description: task.description,
        executant_comment: task.executant_comment
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
    when 'historique'
      @page_title = 'Historique des tâches archivées'
    else
      @page_title = 'Plannikeeper'
    end
  end

  def set_task
    @task = @article.tasks.find(params[:id])
  end

  def task_params
    params.require(:task).permit(:name, :description, :realisation_date, :cfc, :recurrence_reminder_date, :executant, :executant_comment, :image, :task_type, :color, :end_date, :period)
  end
end
