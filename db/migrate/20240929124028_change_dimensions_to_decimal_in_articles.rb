class ChangeDimensionsToDecimalInArticles < ActiveRecord::Migration[7.1]
  def change
    change_column :articles, :position_x, :decimal, precision: 10, scale: 6
    change_column :articles, :position_y, :decimal, precision: 10, scale: 6
    change_column :articles, :width, :decimal, precision: 10, scale: 6
    change_column :articles, :height, :decimal, precision: 10, scale: 6
  end
end
