class Task < ApplicationRecord
  belongs_to :article

  # Pour l'image avec ActiveStorage
  # has_one_attached :image

  # Validations
  validates :name, presence: true
  validates :realisation_date, presence: true
  validates :cfc, presence: true
  validates :executant, presence: true
  validates :description, presence: true
end
