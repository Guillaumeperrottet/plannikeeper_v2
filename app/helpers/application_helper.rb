module ApplicationHelper
  def current_page_title
    case controller.controller_name
    when "objets"
      case controller.action_name
      when "show"
        @objet.present? ? "Objet : #{@objet.nom}" : "Objet"
      when "edit"
        @objet.present? ? "Modifier l'objet : #{@objet.nom}" : "Modifier un objet"
      when "new"
        "Créer un objet"
      else
        "Objets"
      end
    when "pages"
      case controller.action_name
      when "home"
        "Home"
      else
        controller.action_name.titleize
      end
    else
      controller.controller_name.titleize
    end
  end
end
