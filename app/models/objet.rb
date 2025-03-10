class Objet < ApplicationRecord
  belongs_to :user, optional: true # Si l'objet peut être sans utilisateur (entreprise)
  belongs_to :company, optional: true # Si l'objet peut être sans entreprise (utilisateur privé)

  has_one_attached :image

  has_many :secteurs, dependent: :destroy
  has_many :articles, dependent: :destroy
  has_many :tasks, through: :articles

  accepts_nested_attributes_for :secteurs, allow_destroy: true

  # Validation : exiger une entreprise si l'utilisateur est enterprise_admin ou enterprise_user
  validates :company, presence: true, if: -> { user&.enterprise_admin? || user&.enterprise_user? }

  def all_tasks
    Task.joins(article: :secteur)
        .where(articles: { secteur: secteurs })
        .where.not(status: 'fermee')
        .order(:end_date)
  end

  def this_week_tasks
    all_tasks.select { |task| task.end_date&.between?(Date.today.beginning_of_week, Date.today.end_of_week) }
  end

  def upcoming_tasks
    all_tasks.select { |task| task.end_date&.> Date.today.end_of_week }
  end
end
