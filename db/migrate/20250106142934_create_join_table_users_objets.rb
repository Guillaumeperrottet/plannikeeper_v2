class CreateJoinTableUsersObjets < ActiveRecord::Migration[7.1]
  def change
    create_join_table :users, :objets do |t|
      t.index [:user_id, :objet_id]
      t.index [:objet_id, :user_id]
    end
  end
end
