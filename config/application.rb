require_relative "boot"

require "rails/all"

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module Plannikeeper
  class Application < Rails::Application
    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 7.1

    # Définir la langue par défaut
    config.i18n.default_locale = :fr

    # Configuration supplémentaire
    config.autoload_lib(ignore: %w(assets tasks))
  end
end
