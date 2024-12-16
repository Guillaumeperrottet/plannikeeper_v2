class Ability
  include CanCan::Ability

  def initialize(user)
    return unless user.present? # Invité (non connecté) : Pas d'accès

    if user.private_user?
      # Utilisateur privé peut gérer ses propres objets et tâches
      can :manage, Objet, user_id: user.id
      can :manage, Task, article: { secteur: { objet: { user_id: user.id } } }
    elsif user.enterprise_admin?
      # Admin entreprise peut tout gérer dans son entreprise
      can :manage, :all, company_id: user.company_id

      # Gestion des utilisateurs de l'entreprise
      can :manage, User, company_id: user.company_id

      # Permet de gérer les tâches liées à un article appartenant à la même entreprise
      can :manage, Task, article: { secteur: { objet: { company_id: user.company_id } } }
    elsif user.enterprise_user?
      # Utilisateur entreprise : accès limité
      can :read, Task, article: { secteur: { objet: { company_id: user.company_id } } }
      # can :manage, Task, user_id: user.id # Peut gérer uniquement les tâches qui lui sont assignées
      can :read, Objet, company_id: user.company_id # Accès en lecture aux objets de l'entreprise
    end
  end
end
