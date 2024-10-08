class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
<<<<<<< HEAD
=======
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable
>>>>>>> a95497a43f4de4240e4846efa001832231f7c649
  has_many :objets, dependent: :destroy
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable,
         :omniauthable, omniauth_providers: [:google_oauth2]

<<<<<<< HEAD
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
=======
  def self.from_omniauth(access_token)
    data = access_token.info
    user = User.where(email: data['email']).first

    unless user
      user = User.create(
        email: data['email'],
        password: Devise.friendly_token[0, 20],
        name: data['name'] # Si tu souhaites stocker le nom
      )
    end
    user
  end
>>>>>>> a95497a43f4de4240e4846efa001832231f7c649
end
