import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["fields", "template"];

  connect() {
    console.log("Le contrôleur Sector est chargé");
  }

  addSector(event) {
    event.preventDefault();

    const fieldsContainer = this.fieldsTarget;
    const template = this.templateTarget.innerHTML.replace(/NEW_RECORD/g, new Date().getTime());
    fieldsContainer.insertAdjacentHTML("beforeend", template);
  }

  removeSector(event) {
    event.preventDefault();

    const field = event.target.closest(".sector-field");
    const destroyField = field.querySelector('input[name*="_destroy"]');

    if (destroyField) {
      // Si le secteur existe déjà, on marque le champ _destroy à true
      destroyField.value = "1";
      field.style.display = "none";
    } else {
      // Si le secteur est nouveau (pas encore sauvegardé), on le supprime du DOM
      field.remove();
    }
  }
}
