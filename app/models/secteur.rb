class Secteur < ApplicationRecord
  has_many :articles
  has_one_attached :image
  belongs_to :objet

  validate :acceptable_image

  private

  def acceptable_image
    return unless image.attached?

    unless image.content_type.in?(%w[image/jpeg image/png image/gif image/webp])
      errors.add(:image, "doit être un JPEG, JPG, PNG, GIF, ou WebP / Modifie le format gratuitement sur ce site : https://tools.pdf24.org/fr ")
    end

    if image.byte_size > 5.megabytes
      errors.add(:image, "La taille de l'image ne doit pas dépasser 5 Mo")
    end
  end
end
