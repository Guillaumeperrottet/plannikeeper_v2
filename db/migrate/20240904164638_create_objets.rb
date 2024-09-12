class CreateObjets < ActiveRecord::Migration[7.1]
  def change
    create_table :objets do |t|
      t.string :nom
      t.string :adresse
      t.string :secteur

      t.timestamps
    end
  end
end
