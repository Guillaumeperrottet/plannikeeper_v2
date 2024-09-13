class Objet < ApplicationRecord
  has_one_attached :image
  has_many :secteurs, dependent: :destroy
  has_many :articles, dependent: :destroy
  accepts_nested_attributes_for :secteurs, allow_destroy: true
end
