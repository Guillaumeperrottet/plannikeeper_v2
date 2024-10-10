class Secteur < ApplicationRecord
  has_many :articles
  has_one_attached :image
  belongs_to :objet

  validate :acceptable_image

  private

  def acceptable_image
    return unless image.attached?

    unless image.content_type.in?(%w[image/jpeg image/png image/gif image/webp])
      errors.add(:image, "doit être un JPEG, PNG, GIF, ou WebP")
    end

    if image.byte_size > 5.megabytes
      errors.add(:image, "La taille de l'image ne doit pas dépasser 5 Mo")
    end
  end
end
