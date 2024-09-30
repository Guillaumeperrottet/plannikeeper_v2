class RemoveImageFromTasks < ActiveRecord::Migration[7.1]
  def change
    remove_column :tasks, :image, :string
  end
end
