Rails.application.routes.draw do
  devise_for :users, controllers: {
    omniauth_callbacks: 'users/omniauth_callbacks'
  }

  # Redirection conditionnelle selon si l'utilisateur est authentifié ou non
  authenticated :user do
    root to: 'pages#home', as: :authenticated_root
  end

  unauthenticated do
    root to: 'devise/sessions#new', as: :unauthenticated_root
  end

  get 'public', to: 'pages#public'
  get '/privacy', to: 'pages#privacy'
  get '/terms', to: 'pages#terms'
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Page de santé
  get "up" => "rails/health#show", as: :rails_health_check
  get 'public', to: 'pages#public'


  root 'pages#home'
  # Route pour le profil utilisateur
  resource :profile, only: [:show]

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
