// app/javascript/controllers/modal_controller.js

import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["modal"]

  connect() {
    // console.log("Modal controller connected")
  }

  open() {
    // Utilisation de window.bootstrap qui est défini par le CDN
    const bsModal = new window.bootstrap.Modal(this.modalTarget)
    bsModal.show()
  }

  close() {
    // Utilisation de window.bootstrap qui est défini par le CDN
    const bsModal = window.bootstrap.Modal.getInstance(this.modalTarget)
    if (bsModal) {
      bsModal.hide()
    }
  }

  // Pour ouvrir un modal depuis un lien avec data-action="modal#openById" data-modal-id="monModal"
  openById(event) {
    const modalId = event.currentTarget.dataset.modalId
    const bsModal = new window.bootstrap.Modal(document.getElementById(modalId))
    bsModal.show()
  }
}
