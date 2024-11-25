class ChangeCompanyIdInObjetsToNotNull < ActiveRecord::Migration[7.1]
  def change
    def up
      # Assigner un ID de compagnie générique pour tous les objets restants sans `company_id`
      default_company_id = Company.first&.id || -1 # Utilise un ID générique

      # Met à jour les `company_id` manquants avec la valeur par défaut
      Objet.where(company_id: nil).update_all(company_id: default_company_id)

      # Applique la contrainte `NOT NULL`
      change_column_null :objets, :company_id, false, default: nil
    end

    def down
      # Revert la contrainte NOT NULL si nécessaire
      change_column_null :objets, :company_id, true
    end
  end
end
