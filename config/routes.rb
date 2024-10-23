Rails.application.routes.draw do
  devise_scope :user do
    get 'users/auth/google_oauth2', to: 'users/omniauth_callbacks#google_oauth2'
    get 'users/auth/google_oauth2/callback', to: 'users/omniauth_callbacks#google_oauth2'

    authenticated :user do
      root to: 'dashboard#dashboard', as: :authenticated_root
    end

    unauthenticated do
      root to: 'pages#home', as: :unauthenticated_root
    end
  end

  devise_for :users, controllers: {
    registrations: 'users/registrations',
    omniauth_callbacks: 'users/omniauth_callbacks'
  }

  # Pages supplémentaires
  get 'public', to: 'pages#public'
  get '/privacy', to: 'pages#privacy'
  get '/terms', to: 'pages#terms'

  # Page de santé
  get "up" => "rails/health#show", as: :rails_health_check

  # Route pour le profil utilisateur
  resource :profile, only: [:show]

  resources :objets do
    get 'tasks', to: 'tasks#index_for_objet'

    resources :secteurs, only: [:edit, :update, :destroy] do
      member do
        get 'image', to: 'secteurs#image'
      end

      resources :articles, only: [:create, :index, :show, :update, :edit, :destroy] do
        resources :tasks, only: [:new, :create, :edit, :update, :destroy, :index] do
          member do
            patch 'archive', to: 'tasks#archive'
          end
          collection do
            get 'historique', to: 'tasks#historique'
          end
        end
      end
    end
  end
end
