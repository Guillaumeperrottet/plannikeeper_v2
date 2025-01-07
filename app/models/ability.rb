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
      can :manage, [Objet, Task, Article, User], company_id: user.company_id
      can :manage, Objet, company_id: user.company_id

      # Gestion des utilisateurs de l'entreprise
      can :manage, User, company_id: user.company_id

      # Permet de gérer les tâches liées à un article appartenant à la même entreprise
      can :create, Task do |task|
        task.article&.secteur&.objet&.company_id == user.company_id
      end


    elsif user.enterprise_user?
      # Utilisateur entreprise : accès limité
      can :manage, Task, article: { secteur: { objet: { id: user.objet_ids } } }
      can :read, Article, secteur: { objet: { company_id: user.company_id } }
      # can :manage, Task, user_id: user.id # Peut gérer uniquement les tâches qui lui sont assignées
      # can :read, Objet, company_id: user.company_id # Accès en lecture aux objets de l'entreprise
      can :read, Objet, id: user.objet_ids
    end
  end
end
