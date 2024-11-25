class SetDefaultCompanyIdForObjets < ActiveRecord::Migration[7.1]
  def up
    Objet.find_each do |objet|
      # Si l'objet est lié à un utilisateur d'entreprise
      if objet.user&.enterprise_admin? || objet.user&.enterprise_user?
        objet.update!(company_id: objet.user.company_id)
      else
        # Sinon, laisse `company_id` à NULL (si logique pour utilisateur privé)
        objet.update!(company_id: nil)
      end
    end
  end

  def down
    Objet.update_all(company_id: nil)
  end
end
