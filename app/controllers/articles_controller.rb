class ArticlesController < ApplicationController
  def create
    @secteur = Secteur.find(params[:secteur_id])
    @article = @secteur.articles.build(article_params)
    @article.objet_id = @secteur.objet_id  # Assigner l'ID de l'objet à l'article

    if @article.save
      render json: { article: @article }, status: :created
    else
      render json: { errors: @article.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def index
    @articles = Article.where(secteur_id: params[:secteur_id], objet_id: params[:objet_id])

    Rails.logger.info "Articles trouvés : #{@articles.inspect}"

    if @articles.any?
      render json: { articles: @articles.as_json(only: [:id, :position_x, :position_y, :width, :height, :title, :description, :objet_id]) }, status: :ok
    else
      render json: { articles: [] }, status: :ok
    end
  end

  def show
    @objet = Objet.find(params[:objet_id])
    @secteur = Secteur.find(params[:secteur_id])
    @article = Article.find_by(id: params[:id])

    if @article.nil?
      # Gérer le cas où l'article n'existe pas
      redirect_to root_path, alert: "L'article n'existe pas"
    else
      @tasks = @article.tasks # Maintenant que @article est défini, on peut accéder aux tâches
    end
  end


  private

  def article_params
    params.require(:article).permit(:title, :description, :position_x, :position_y, :width, :height, :secteur_id, :objet_id)
  end
end
