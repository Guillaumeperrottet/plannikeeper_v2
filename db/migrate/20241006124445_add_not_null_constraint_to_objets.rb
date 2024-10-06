class AddNotNullConstraintToObjets < ActiveRecord::Migration[7.1]
  def change
    change_column_null :objets, :user_id, false
  end
end
