class Company < ApplicationRecord
  has_many :users, dependent: :destroy
  has_many :objets, dependent: :destroy # Une compagnie possède plusieurs objets

  validates :name, presence: true
  validates :adress, presence: true
end
