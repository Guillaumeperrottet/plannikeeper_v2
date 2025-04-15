// app/javascript/application.js
import { Application } from "@hotwired/stimulus"
import { eagerLoadControllersFrom } from "@hotwired/stimulus-loading"

const application = Application.start()
application.debug = false

eagerLoadControllersFrom("controllers", application)

window.Stimulus = application

function refreshStimulusForElement(element) {
  // Recharge Stimulus pour cet élément
  window.Stimulus.load(element);
}
