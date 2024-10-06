class CreateUsers < ActiveRecord::Migration[7.1]
  change_table :users do |t|
    ## Devise modules
    ## Don't add email if it already exists
    t.string :encrypted_password, null: false, default: "" unless column_exists?(:users, :encrypted_password)
    t.string :reset_password_token unless column_exists?(:users, :reset_password_token)
    t.datetime :reset_password_sent_at unless column_exists?(:users, :reset_password_sent_at)
    t.datetime :remember_created_at unless column_exists?(:users, :remember_created_at)
    t.string :confirmation_token unless column_exists?(:users, :confirmation_token)
    t.datetime :confirmed_at unless column_exists?(:users, :confirmed_at)
    t.datetime :confirmation_sent_at unless column_exists?(:users, :confirmation_sent_at)
    t.string :unconfirmed_email unless column_exists?(:users, :unconfirmed_email)

    # If you have other Devise-related fields, make sure to check them here as well
  end

    add_index :users, :email, unique: true
  end
end
