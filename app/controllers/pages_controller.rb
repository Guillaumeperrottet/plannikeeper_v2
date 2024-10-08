class PagesController < ApplicationController
  skip_before_action :authenticate_user!, only: [:home]

  def home
    # Code pour la page d'accueil
  end

  def dashboard
    # Code pour le tableau de bord de l'utilisateur authentifié
  end

  def public
    # Code pour la page publique
  end

  def privacy
    # Code pour la page des politiques de confidentialité
  end

  def terms
    # Code pour la page des termes et conditions
  end
end
