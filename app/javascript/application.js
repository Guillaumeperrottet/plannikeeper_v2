import { Application } from "@hotwired/stimulus"
// import ReactController from "./controllers/react_controller";
import { eagerLoadControllersFrom } from "@hotwired/stimulus-loading"
import "bootstrap"
import "@popperjs/core"


const application = Application.start()
application.debug = false

eagerLoadControllersFrom("controllers", application)

window.Stimulus = application
