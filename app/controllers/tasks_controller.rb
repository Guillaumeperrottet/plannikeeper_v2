class TasksController < ApplicationController
  before_action :set_article_and_sector, only: [:new, :create, :edit, :update, :index]

  def new
    @task = @article.tasks.new
  end

  def create
    logger.debug("Entering Task creation")
    @task = @article.tasks.new(task_params) # Utilise les paramètres autorisés
    if @task.save
      logger.debug("Task saved successfully")

      # Vérifie si l'image existe avant de vérifier si elle est attachée
      if @task.image.present? && @task.image.attached?
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


  # GET /articles/:article_id/tasks
  def index
    @tasks = @article.tasks
    tasks_with_images = @tasks.map do |task|
      if task.image.present? && task.image.attached?
        { task: task, image_url: url_for(task.image) }
      else
        { task: task, image_url: nil }
      end
    end
    render json: tasks_with_images
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

end
