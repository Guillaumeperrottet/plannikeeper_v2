# Gemfile
source "https://rubygems.org"

ruby "3.1.2"

gem "rails", "~> 7.1.3", ">= 7.1.3.4"
gem "sprockets-rails"
gem "puma", ">= 5.0"
gem "importmap-rails"
gem "turbo-rails"
gem "stimulus-rails"
gem "jbuilder"
gem "tzinfo-data", platforms: %i[ mswin mswin64 mingw x64_mingw jruby ]
gem "bootsnap", require: false
gem "sassc-rails"
gem "bootstrap", "~> 5.2"
gem "font-awesome-sass", "~> 6.1"
gem "simple_form"
gem "autoprefixer-rails"
gem 'breadcrumbs_on_rails'
gem 'paper_trail'
gem 'devise'
gem 'omniauth', '~> 1.9'
gem 'omniauth-google-oauth2', '~> 0.8'

# Use PostgreSQL as the database for Active Record in production
group :production do
  gem 'pg', '~> 1.1'
end

# Use Active Storage variants [https://guides.rubyonrails.org/active_storage_overview.html#transforming-images]
# gem "image_processing", "~> 1.2"

# Use sqlite3 as the database for Active Record in development and test
group :development, :test do
  gem 'sqlite3', '~> 1.4'
  gem "debug", platforms: %i[ mri mswin mswin64 mingw x64_mingw ]
end

group :development do
  gem "web-console"
  gem "error_highlight", ">= 0.4.0", platforms: [:ruby]
end

group :test do
  gem "capybara"
  gem "selenium-webdriver"
end
