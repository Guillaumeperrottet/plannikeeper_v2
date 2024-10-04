import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["menu"]

  toggle() {
    this.menuTarget.classList.toggle("show")
  }

  closeMenu(event) {
    if (!this.element.contains(event.target)) {
      this.menuTarget.classList.remove("show")
    }
  }

  connect() {
    document.addEventListener("click", this.closeMenu.bind(this))
  }

  disconnect() {
    document.removeEventListener("click", this.closeMenu.bind(this))
  }
}
