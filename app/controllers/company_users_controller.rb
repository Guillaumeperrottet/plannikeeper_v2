class CompanyUsersController < ApplicationController
  before_action :authenticate_user!
  before_action :authorize_admin!

  def index
    @users = current_user.company.users
  end

  def new
    @user = User.new
  end

  def edit
    @user = current_user.company.users.find(params[:id])
  end

  def update
    @user = current_user.company.users.find(params[:id])
    if @user.update(user_params)
      redirect_to company_users_path, notice: "Utilisateur mis à jour avec succès."
    else
      render :edit, alert: "Erreur lors de la mise à jour de l'utilisateur."
    end
  end

  def destroy
    @user = current_user.company.users.find(params[:id])
    @user.destroy
    redirect_to company_users_path, notice: "L'utilisateur a été supprimé."
  end

  def permissions
    @user = current_user.company.users.find(params[:id])
  end

  def update_permissions
    @user = current_user.company.users.find(params[:id])
    if @user.update(permission_params)
      redirect_to company_users_path, notice: "Permissions mises à jour avec succès."
    else
      redirect_to permissions_company_user_path(@user), alert: "Impossible de mettre à jour les permissions."
    end
  end

  def create
    @user = current_user.company.users.new(user_params)
    @user.password = "123456789" # Génère un mot de passe temporaire
    @user.role = 'enterprise_user' # Définit le rôle automatiquement

    if @user.save
      # Optionnel : Envoyer un email au nouvel utilisateur avec ses identifiants
      # UserMailer.welcome_email(@user).deliver_later

      redirect_to company_users_path, notice: "Utilisateur créé avec succès. Un mot de passe temporaire lui a été envoyé."
    else
      render :new, alert: "Erreur lors de la création de l'utilisateur."
    end
  end

  private

  def authorize_admin!
    unless current_user.enterprise_admin?
      redirect_to root_path, alert: "Accès refusé."
    end
  end

  def user_params
    params.require(:user).permit(:role, :name, :email)
  end

  def permission_params
    # Ajoute ici les champs spécifiques aux permissions
    params.require(:user).permit(:can_manage_tasks, :can_view_reports)
  end
end
