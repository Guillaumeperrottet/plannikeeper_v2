class ApplicationController < ActionController::Base
  before_action :set_current_path

  private

  def set_current_path
    @current_path = case request.path
                    when root_path then "Home"
                    when new_objet_path then "Créer un objet"
                    when edit_objet_path then "Modifier un objet"
                    when objet_path(params[:id]) then "Objet : #{@objet.nom}"
                    when objets_path then "Objets"
                    # Ajoute d'autres chemins si nécessaire
                    else "Page"
                    end
  end
end
