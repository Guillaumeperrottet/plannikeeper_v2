class Secteur < ApplicationRecord
  has_many :articles
  has_one_attached :image
  belongs_to :objet
end
