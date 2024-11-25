class AddCompanyIdToObjets < ActiveRecord::Migration[7.1]
  def change
    add_reference :objets, :company, foreign_key: true, null: true
  end
end
