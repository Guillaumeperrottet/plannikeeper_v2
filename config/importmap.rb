# Pin npm packages by running ./bin/importmap

pin "application"
pin "@hotwired/turbo-rails", to: "turbo.min.js"
pin "@hotwired/stimulus", to: "stimulus.min.js"
pin "@hotwired/stimulus-loading", to: "stimulus-loading.js"
pin_all_from "app/javascript/controllers", under: "controllers"
pin "bootstrap", to: "bootstrap.min.js", preload: true
pin "@popperjs/core", to: "popper.js", preload: true
pin "react", to: "https://cdn.jsdelivr.net/npm/react@18/umd/react.production.min.js"
pin "react-dom", to: "https://cdn.jsdelivr.net/npm/react-dom@18/umd/react-dom.production.min.js"
pin "fabric", to: "https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.0/fabric.min.js"

pin "scheduler" # @0.23.2
