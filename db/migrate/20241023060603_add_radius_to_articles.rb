class AddRadiusToArticles < ActiveRecord::Migration[7.1]
  def change
    add_column :articles, :radius, :decimal
  end
end
