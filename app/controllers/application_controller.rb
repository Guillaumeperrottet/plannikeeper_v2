class ApplicationController < ActionController::Base
  before_action :set_current_path

  private

  def set_current_path
    @current_path = case request.path
                    when root_path
                      "Home"
                    when new_objet_path
                      "Créer un objet"
                    when %r{\A/objets/new\z}
                      "Créer un objet"
                    when %r{\A/objets/(\d+)/edit\z}
                      begin
                        @objet = Objet.find($1)
                        "Modifier un objet : #{@objet.nom}"
                      rescue ActiveRecord::RecordNotFound
                        "Modifier un objet"
                      end
                    when %r{\A/objets/(\d+)\z}
                      begin
                        @objet = Objet.find($1)
                        "Objet : #{@objet.nom}"
                      rescue ActiveRecord::RecordNotFound
                        "Objet"
                      end
                    when objets_path
                      "Objets"
                    else
                      "Page"
                    end
  end
end
