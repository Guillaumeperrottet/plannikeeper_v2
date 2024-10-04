class AddDetailsToTasksSecond < ActiveRecord::Migration[7.1]
  def change
    add_column :tasks, :task_open, :boolean, default: true  # true = ouverte, false = fermée
    add_column :tasks, :type, :string
    add_column :tasks, :color, :string
    add_column :tasks, :status, :string
    add_column :tasks, :recurring, :boolean
    add_column :tasks, :end_date, :datetime
    add_column :tasks, :period, :string
    add_column :tasks, :executant_comment, :text
  end
end
