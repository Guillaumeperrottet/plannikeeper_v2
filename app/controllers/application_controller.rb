class ApplicationController < ActionController::Base
  before_action :set_current_path
  before_action :set_devise_mapping
  before_action :authenticate_user!, unless: :devise_or_public?

  include Rails.application.routes.url_helpers # Ajout pour inclure les helpers de routes

  private

  def set_devise_mapping
    @request.env["devise.mapping"] = Devise.mappings[:user]
  end

  def devise_or_public?
    devise_controller? || action_name == "public"
  end

  def set_current_path
    # Accès au helper root_path
    root_url = main_app.root_url rescue nil

    @current_path = case request.path
                    when root_url
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
