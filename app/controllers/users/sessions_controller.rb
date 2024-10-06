class Users::SessionsController < Devise::SessionsController
  # Surchargez l'action `new` si c'est celle qui pose problème
  def new
    @request.env["devise.mapping"] = Devise.mappings[:user]
    super
  end
end
