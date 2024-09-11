// app/javascript/controllers/sector_controller.js
import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["template", "container"]

  addSector(event) {
    event.preventDefault()
    console.log("Add sector clicked")  // Debugging line
    const content = this.templateTarget.innerHTML.replace(/NEW_RECORD/g, new Date().getTime())
    this.containerTarget.insertAdjacentHTML('beforeend', content)
  }

  removeSector(event) {
    event.preventDefault()
    const field = event.target.closest(".field")
    field.querySelector("input[name*='_destroy']").value = '1'
    field.style.display = 'none'
  }
}
