class Objet < ApplicationRecord
  belongs_to :user, optional: true # Si l'objet peut être sans utilisateur (entreprise)
  belongs_to :company, optional: true # Si l'objet peut être sans entreprise (utilisateur privé)

  has_one_attached :image

  has_many :secteurs, dependent: :destroy
  has_many :articles, dependent: :destroy

  accepts_nested_attributes_for :secteurs, allow_destroy: true

  # Validation : exiger une entreprise si l'utilisateur est enterprise_admin ou enterprise_user
  validates :company, presence: true, if: -> { user&.enterprise_admin? || user&.enterprise_user? }
end
