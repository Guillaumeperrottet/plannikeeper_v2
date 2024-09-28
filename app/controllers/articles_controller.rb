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

    # Vérifie que @articles est un tableau et renvoie une réponse JSON
    if @articles.any?
      render json: { articles: @articles }
    else
      render json: { articles: [] }
    end
  end


  private

  def article_params
    params.require(:article).permit(:position_x, :position_y, :width, :height, :title, :description)
  end
end
