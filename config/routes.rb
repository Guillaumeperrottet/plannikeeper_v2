Rails.application.routes.draw do
  devise_scope :user do
    get 'users/auth/google_oauth2', to: 'users/omniauth_callbacks#google_oauth2'
    get 'users/auth/google_oauth2/callback', to: 'users/omniauth_callbacks#google_oauth2'

    authenticated :user do
      root to: 'dashboard#dashboard', as: :authenticated_root
    end

    unauthenticated do
      root to: 'devise/sessions#new', as: :unauthenticated_root
    end
  end

  devise_for :users, controllers: {
    omniauth_callbacks: 'users/omniauth_callbacks'
  }

  get 'public', to: 'pages#public'
  get '/privacy', to: 'pages#privacy'
  get '/terms', to: 'pages#terms'
  get '/home', to: 'pages#home' # Nouvelle route pour la page Home

  # Page de santé
  get "up" => "rails/health#show", as: :rails_health_check

  # Route pour le profil utilisateur
  resource :profile, only: [:show]

  resources :objets do
    get 'tasks', to: 'tasks#index_for_objet'

    resources :secteurs, only: [:edit, :update] do
      member do
        get 'image', to: 'secteurs#image'
      end

      resources :articles, only: [:create, :index, :show] do
        resources :tasks, only: [:new, :create, :edit, :update, :destroy, :index] do
          member do
            patch 'archive', to: 'tasks#archive'
          end
        end
      end
    end
  end
end
