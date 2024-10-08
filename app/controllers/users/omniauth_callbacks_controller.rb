class Users::OmniauthCallbacksController < Devise::OmniauthCallbacksController
  include Rails.application.routes.url_helpers
  skip_before_action :verify_authenticity_token, only: :google_oauth2

  def google_oauth2
    Rails.logger.debug "Google OAuth2 callback called"
    puts "===> google_oauth2 method called"
    auth_data = request.env['omniauth.auth']
    if auth_data
      puts "===> Received auth data: #{auth_data.inspect}"
      @user = User.from_omniauth(auth_data)
    else
      puts "===> No auth data received"
      redirect_to new_user_registration_url, alert: "Authentication data was not provided. Please try again."
      return
    end

    if @user&.persisted?
      puts "===> User persisted, signing in and redirecting"
      sign_in_and_redirect @user, event: :authentication
      set_flash_message(:notice, :success, kind: 'Google') if is_navigational_format?
    else
      puts "===> User not persisted or user is nil, redirecting to registration"
      session['devise.google_data'] = auth_data.except(:extra) if auth_data
      redirect_to new_user_registration_url, alert: @user&.errors&.full_messages&.join("\n") || "Unable to authenticate."
    end
  end

  def failure
    puts "===> failure method called"
    redirect_to unauthenticated_root_path
  end
end
