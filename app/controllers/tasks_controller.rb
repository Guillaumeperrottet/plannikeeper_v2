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
    # logger.debug "Task params: #{task_params.inspect}" # Ajout pour inspection

    @task = @article.tasks.new(task_params) # Utilise les paramètres autorisés

      # Définir la couleur en fonction du type de tâche
  case @task.task_type
  when 'réparations'
    @task.color = 'orange'
  when 'récurrence'
    @task.color = 'lightblue' # Bleu clair
  when 'entretiens'
    @task.color = 'lightgreen' # Vert clair
  end

    if @task.save
      logger.debug("Tâche sauvegarder avec succès")

      # Vérifier l'attachement de l'image après que la tâche a été sauvegardée
      if @task.image.attached?
        logger.debug("Image attached: #{@task.image.filename}")
      else
        logger.debug("No image attached.")
      end

    # Rediriger vers la page de l'article
    redirect_to objet_secteur_article_path(@objet, @secteur, @article), notice: 'La tâche a été créée avec succès.'
      # render json: { success: true, task: @task }, status: :created
    else
      logger.debug("Task saving failed: #{@task.errors.full_messages}")
      render json: { errors: @task.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def show
    @task = @article.tasks.find(params[:id]) # Si tu souhaites afficher une tâche spécifique
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
    @tasks = @objet.articles.joins(:tasks).map(&:tasks).flatten

    tasks_with_images = @tasks.map do |task|
      if task.image.attached?
        { task: task, image_url: url_for(task.image) }
      else
        { task: task, image_url: nil }
      end
    end

    render json: { this_week_tasks: tasks_with_images, upcoming_tasks: [] } # Ajuste selon tes besoins
  end

  def index
    @tasks = @article.tasks

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

  def update
    @task = @article.tasks.find(params[:id])
    if @task.update(task_params)
      redirect_to @article, notice: 'Tâche mise à jour avec succès.'
    else
      render :edit
    end
  end

  def set_breadcrumbs
    logger.debug "---- Entrée dans la méthode 'set_breadcrumbs' ----"
  logger.debug "Objet: #{@objet}, Secteur: #{@secteur}, Article: #{@article}"

    if @objet && @secteur && @article
      add_breadcrumb "Vos objets", root_path
      add_breadcrumb @objet.nom, objet_path(@objet)
      add_breadcrumb @secteur.nom, objet_secteur_path(@objet, @secteur)
      add_breadcrumb "Todo", objet_secteur_article_path(@objet, @secteur, @article)
    else
      logger.debug "Une ou plusieurs variables d'instance sont manquantes !"
    end
  end

  private

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

  def set_task
    @task = @article.tasks.find(params[:id])
  end

  def task_params
    params.require(:task).permit(:name, :description, :realisation_date, :cfc, :executant, :executant_comment, :image, :task_type, :color, :status, :recurring, :end_date, :period)
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
end
