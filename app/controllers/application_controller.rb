class ApplicationController < ActionController::Base
  before_action :set_current_path

  private

  def set_current_path
    @current_path = case request.path
                    when root_path then "Home"
                    when new_objet_path then "Créer un objet"
                    when edit_objet_path
                      "Modifier un objet"
                    when objet_path
                      if params[:id]
                        begin
                          @objet = Objet.find(params[:id])
                          "Objet : #{@objet.nom}"
                        rescue ActiveRecord::RecordNotFound
                          "Objet : Inconnu"
                        end
                      else
                        "Objet"
                      end
                    when objets_path then "Objets"
                    else "Page"
                    end
  end
end
