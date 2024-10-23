class Article < ApplicationRecord
  belongs_to :secteur
  belongs_to :objet
  has_many :tasks, dependent: :destroy

  validates :title, :description, presence: true
  validates :position_x, :position_y, :radius, numericality: { greater_than_or_equal_to: 0 }
end
