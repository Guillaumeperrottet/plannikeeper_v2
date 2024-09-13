class CreateArticles < ActiveRecord::Migration[7.1]
  def change
    create_table :articles do |t|
      t.references :objet, null: false, foreign_key: true
      t.string :title
      t.text :description

      t.timestamps
    end
  end
end
