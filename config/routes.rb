Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Page de santé
  get "up" => "rails/health#show", as: :rails_health_check

  # Route racine
  root 'pages#home'

  resources :objets do
    resources :secteurs, only: [:edit, :update] do
      member do
        get 'image', to: 'secteurs#image'
      end
      resources :articles, only: [:create, :index] # Imbriquer les articles sous les secteurs
    end
  end
end
