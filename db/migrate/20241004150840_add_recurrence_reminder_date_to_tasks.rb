class AddRecurrenceReminderDateToTasks < ActiveRecord::Migration[7.1]
  def change
    add_column :tasks, :recurrence_reminder_date, :date
  end
end
