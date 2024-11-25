class User < ApplicationRecord
  # Modules de Devise activés
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable,
         :omniauthable, omniauth_providers: [:google_oauth2]

  # Associations
  belongs_to :company, optional: true
  has_one_attached :avatar
  has_many :objets, dependent: :destroy

  # Enums
  enum role: { private_user: 'private_user', enterprise_user: 'enterprise_user', enterprise_admin: 'enterprise_admin' }

  # Attributs virtuels pour le formulaire
  attr_accessor :company_name, :company_adress

  # Validations
  validates :password, length: { minimum: 6 }, if: -> { password.present? }
  validates :role, presence: true, inclusion: { in: roles.keys }
  validates :company, presence: true, if: -> { enterprise_user? || enterprise_admin? }

  # Méthode pour l'authentification via Omniauth
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
