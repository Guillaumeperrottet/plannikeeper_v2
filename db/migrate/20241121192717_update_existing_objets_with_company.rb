class UpdateExistingObjetsWithCompany < ActiveRecord::Migration[7.1]
  def up
    Objet.find_each do |objet|
      if objet.user.enterprise_admin? || objet.user.enterprise_user?
        objet.update!(company_id: objet.user.company_id)
      end
    end
  end

  def down
    Objet.update_all(company_id: nil)
  end
end
