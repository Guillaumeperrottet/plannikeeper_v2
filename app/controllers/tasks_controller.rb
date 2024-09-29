class TasksController < ApplicationController
  before_action :set_article

  def new
    @task = @article.tasks.new
  end

  # POST /articles/:article_id/tasks
  def create
    article = Article.find(params[:article_id])
    @tasks = article.tasks
    if @task.save
      render json: @task, status: :created
    else
      render json: @task.errors, status: :unprocessable_entity
    end
  end

  # GET /articles/:article_id/tasks
  def index
    article = Article.find(params[:article_id])
    @tasks = article.tasks
    render json: @tasks
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

  def set_article
    @article = Article.find(params[:article_id])
  end

  def task_params
    params.require(:task).permit(:name, :description, :realisation_date, :cfc, :executant, :image)
  end
end
