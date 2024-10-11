class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  validates :password, length: { minimum: 6 }, if: -> { password.present? }

  has_one_attached :avatar
  has_many :objets, dependent: :destroy
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable,
         :omniauthable, omniauth_providers: [:google_oauth2]

  def self.from_omniauth(access_token)
  return unless access_token

  data = access_token.info
  user = User.where(email: data['email']).first

  if user.nil?
    user = User.new(
      email: data['email'],
      password: Devise.friendly_token[0, 20],
      name: data['name']
    )
    user.save(validate: false) # Sauvegarder sans validation en cas de données incomplètes
  end

  user
  end
end
