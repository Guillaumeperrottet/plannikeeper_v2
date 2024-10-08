# frozen_string_literal: true

class AddDeviseToUsers < ActiveRecord::Migration[7.1]
  def up
    change_table :users do |t|
      ## Devise fields (adapt this to match your needs)
      t.string :encrypted_password if !column_exists?(:users, :encrypted_password)
      t.string :reset_password_token if !column_exists?(:users, :reset_password_token)
      t.datetime :reset_password_sent_at if !column_exists?(:users, :reset_password_sent_at)
      t.datetime :remember_created_at if !column_exists?(:users, :remember_created_at)

      # Other fields for Devise like confirmation tokens...
      t.string :confirmation_token if !column_exists?(:users, :confirmation_token)
      t.datetime :confirmed_at if !column_exists?(:users, :confirmed_at)
      t.datetime :confirmation_sent_at if !column_exists?(:users, :confirmation_sent_at)
      t.string :unconfirmed_email if !column_exists?(:users, :unconfirmed_email)
    end

    # Add index only if it doesn't exist
    add_index :users, :email, unique: true unless index_exists?(:users, :email)
  end

  def down
    # Add logic here for rolling back the migration if necessary
  end
end
