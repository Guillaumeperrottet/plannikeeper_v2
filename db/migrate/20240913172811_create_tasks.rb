class CreateTasks < ActiveRecord::Migration[7.1]
  def change
    create_table :tasks do |t|
      t.references :article, null: false, foreign_key: true
      t.string :name
      t.boolean :done

      t.timestamps
    end
  end
end
