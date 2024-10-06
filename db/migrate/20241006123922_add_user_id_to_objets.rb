class AddUserIdToObjets < ActiveRecord::Migration[7.1]
  def change
    add_reference :objets, :user, foreign_key: true
  end
end
