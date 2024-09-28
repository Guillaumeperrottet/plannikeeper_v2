class AddSecteurIdToArticles < ActiveRecord::Migration[7.1]
  def change
    add_column :articles, :secteur_id, :integer
  end
end
