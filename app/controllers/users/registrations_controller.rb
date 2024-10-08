class Users::RegistrationsController < Devise::RegistrationsController
  protected

  # Permet de mettre à jour un utilisateur sans mot de passe si aucun nouveau mot de passe n'est fourni
  def update_resource(resource, params)
    if params[:password].present?
      resource.update_with_password(params)
    else
      resource.update_without_password(params.except(:current_password))
    end
  end

  # Autorise la mise à jour de l'avatar
  def account_update_params
    params.require(:user).permit(:email, :password, :password_confirmation, :current_password, :avatar)
  end
end
