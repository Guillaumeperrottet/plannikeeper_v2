class Article < ApplicationRecord
  belongs_to :objet
  has_many :tasks, dependent: :destroy

  validates :title, presence: true
  validates :description, presence: true
  validates :position_x, :position_y, :width, :height, presence: true
end
