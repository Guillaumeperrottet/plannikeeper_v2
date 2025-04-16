class Users::RegistrationsController < Devise::RegistrationsController
  def create
    build_resource(sign_up_params)

    Rails.logger.info "Received Params: #{params[:user]}"
    Rails.logger.info "Built Resource: #{resource.inspect}"

    # Créer l'entreprise si l'utilisateur est un administrateur entreprise
    if resource.enterprise_admin?
      Rails.logger.info "User is an enterprise admin, creating company."

      company = Company.new(
        name: sign_up_params[:company_name],
        adress: sign_up_params[:company_adress] # Correspond à la colonne DB
      )

      if company.save
        Rails.logger.info "Company created successfully: #{company.inspect}"
        resource.company = company
        Rails.logger.info "Company assigned to user: #{resource.company.inspect}"
      else
        Rails.logger.error "Company Creation Errors: #{company.errors.full_messages.join(', ')}"
        resource.errors.add(:base, "Erreur lors de la création de l'entreprise : #{company.errors.full_messages.join(', ')}")
        render :new and return
      end
    end

    Rails.logger.info "Saving Resource: #{resource.inspect}"

    if resource.save
      unless params[:user][:avatar].present?
        default_avatar_path = Rails.root.join("app/assets/images/default_avatar.png")
        resource.avatar.attach(
          io: File.open(default_avatar_path),
          filename: "default_avatar.png",
          content_type: "image/png"
        )
      end
      Rails.logger.info "User saved successfully: #{resource.inspect}"
      yield resource if block_given?
      if resource.active_for_authentication?
        set_flash_message! :notice, :signed_up
        sign_up(resource_name, resource)
        respond_with resource, location: after_sign_up_path_for(resource)
      else
        set_flash_message! :notice, :"signed_up_but_#{resource.inactive_message}"
        expire_data_after_sign_in!
        respond_with resource, location: after_inactive_sign_up_path_for(resource)
      end
    else
      Rails.logger.error "Final User Save Errors: #{resource.errors.full_messages.join(', ')}"
      clean_up_passwords resource
      set_minimum_password_length
      respond_with resource
    end
  end

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
    params.require(:user).permit(:email, :password, :password_confirmation, :current_password, :avatar, :name)
  end

  # Autorise les champs pour l'inscription
  def sign_up_params
    params.require(:user).permit(:email, :password, :password_confirmation, :role, :company_id, :company_name, :company_adress, :name)
  end
end
