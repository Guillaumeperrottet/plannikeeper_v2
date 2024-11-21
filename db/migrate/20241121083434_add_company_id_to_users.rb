class AddCompanyIdToUsers < ActiveRecord::Migration[7.1]
  def change
    add_column :users, :company_id, :integer
  end
end
