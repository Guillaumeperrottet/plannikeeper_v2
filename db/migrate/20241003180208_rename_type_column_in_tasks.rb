class RenameTypeColumnInTasks < ActiveRecord::Migration[6.0]
  def change
    rename_column :tasks, :type, :task_type
  end
end
