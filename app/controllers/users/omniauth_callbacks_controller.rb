class Users::OmniauthCallbacksController < Devise::OmniauthCallbacksController
  def google_oauth2
    puts "===> google_oauth2 method called"
    @user = User.from_omniauth(request.env['omniauth.auth'])

    if @user.persisted?
      puts "===> User persisted, signing in and redirecting"
      sign_in_and_redirect @user, event: :authentication
      set_flash_message(:notice, :success, kind: 'Google') if is_navigational_format?
    else
      puts "===> User not persisted, redirecting to registration"
      session['devise.google_data'] = request.env['omniauth.auth'].except(:extra)
      redirect_to new_user_registration_url, alert: @user.errors.full_messages.join("\n")
    end
  end

  def passthru
    puts "===> passthru method called"
    super
  end

  def failure
    puts "===> failure method called"
    redirect_to unauthenticated_root_path
  end
end
