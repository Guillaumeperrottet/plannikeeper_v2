class AddDimensionsToArticles < ActiveRecord::Migration[7.1]
  def change
    add_column :articles, :position_x, :integer
    add_column :articles, :position_y, :integer
    add_column :articles, :width, :integer
    add_column :articles, :height, :integer
  end
end
