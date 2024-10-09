import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["menu"];

  connect() {
    console.log("Navbar controller connected");
    document.addEventListener("click", this.close.bind(this));
  }

  toggle() {
    this.menuTarget.classList.toggle("show");
  }

  close(event) {
    if (!this.element.contains(event.target)) {
      this.menuTarget.classList.remove("show");
    }
  }

  disconnect() {
    document.removeEventListener("click", this.close.bind(this));
  }
}
