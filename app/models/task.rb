class Task < ApplicationRecord
  belongs_to :article

  validates :name, presence: true
end
