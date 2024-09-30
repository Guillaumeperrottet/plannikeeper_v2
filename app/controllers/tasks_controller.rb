class TasksController < ApplicationController
  before_action :set_article_and_sector, only: [:new, :create, :edit, :update, :index]
  before_action :set_page_title, only: [:new, :edit, :show] # Ajuste les actions où tu veux afficher ce titre

  def new
    @task = @article.tasks.new
  end

  def create
    @task = @article.tasks.new(task_params) # Utilise les paramètres autorisés
    if @task.save
      logger.debug("Task saved successfully")

      # Vérifier l'attachement de l'image après que la tâche a été sauvegardée
      if @task.image.attached?
        logger.debug("Image attached: #{@task.image.filename}")
      else
        logger.debug("No image attached.")
      end

      render json: { success: true, task: @task }, status: :created
    else
      logger.debug("Task saving failed: #{@task.errors.full_messages}")
      render json: { errors: @task.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def show
    @task = @article.tasks.find(params[:id]) # Si tu souhaites afficher une tâche spécifique
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

  private

  def set_article_and_sector
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

  def task_params
    params.require(:task).permit(:name, :description, :realisation_date, :cfc, :executant, :image) # Assurez-vous que tous ces champs sont bien inclus
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
