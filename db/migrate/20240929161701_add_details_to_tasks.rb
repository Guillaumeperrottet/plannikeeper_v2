class AddDetailsToTasks < ActiveRecord::Migration[7.1]
  def change
    add_column :tasks, :realisation_date, :datetime
    add_column :tasks, :cfc, :string
    add_column :tasks, :executant, :string
    add_column :tasks, :description, :text
    add_column :tasks, :image, :string # On utilisera ActiveStorage pour les images, donc pas nécessaire d'ajouter cette colonne
  end
end
