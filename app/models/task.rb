class Task < ApplicationRecord
  belongs_to :article

  # Pour l'image avec ActiveStorage
  has_one_attached :image

  # Validations
  validates :name, presence: true
  validates :realisation_date, presence: true
  validates :cfc, presence: true
  validates :executant, presence: true
  validates :description, presence: true

  scope :this_week, -> { where(realisation_date: Date.today.beginning_of_week..Date.today.end_of_week) }
  scope :upcoming, -> { where('realisation_date > ?', Date.today.end_of_week) }
end
