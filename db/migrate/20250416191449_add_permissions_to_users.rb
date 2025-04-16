class AddPermissionsToUsers < ActiveRecord::Migration[7.1]
  def change
    add_column :users, :can_manage_tasks, :boolean
    add_column :users, :can_view_reports, :boolean
  end
end
