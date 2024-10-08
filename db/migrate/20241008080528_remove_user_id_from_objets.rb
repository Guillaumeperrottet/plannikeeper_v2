class RemoveUserIdFromObjets < ActiveRecord::Migration[7.1]
  def change
    remove_column :objets, :user_id, :integer
  end
end
