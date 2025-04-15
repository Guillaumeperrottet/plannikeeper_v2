class CreateUsers < ActiveRecord::Migration[6.0]
  def change
    create_table :users do |t|
      t.string :email, null: false, default: ""
      t.string :encrypted_password, null: false, default: ""
      # Ajoute d'autres colonnes si nécessaire pour Devise
      t.timestamps
    end
    add_index :users, :email, unique: true
  end
end
