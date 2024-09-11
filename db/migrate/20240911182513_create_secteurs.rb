class CreateSecteurs < ActiveRecord::Migration[7.1]
  def change
    create_table :secteurs do |t|
      t.string :nom
      t.references :objet, null: false, foreign_key: true

      t.timestamps
    end
  end
end
