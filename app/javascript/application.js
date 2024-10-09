import "./rails-ujs";

import { Application } from "@hotwired/stimulus"
import { eagerLoadControllersFrom } from "@hotwired/stimulus-loading"
import "bootstrap"
import "@popperjs/core"

const application = Application.start()
application.debug = false

eagerLoadControllersFrom("controllers", application)

window.Stimulus = application

function refreshStimulusForElement(element) {
  // Recharge Stimulus pour cet élément
  window.Stimulus.load(element);
  console.log("Stimulus reloaded for new element:", element);
}
