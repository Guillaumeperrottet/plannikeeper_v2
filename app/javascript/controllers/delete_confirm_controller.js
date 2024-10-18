import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static values = {
    message: String
  }

  connect() {
    //console.log("DeleteConfirmController connecté");
  }

  confirm(event) {
    //console.log("Action confirm déclenchée avec message : ", this.messageValue);

    // Ajout d'une vérification pour s'assurer que le message est bien passé
    if (!this.messageValue || !window.confirm(this.messageValue)) {
      //console.log("Suppression annulée");
      event.preventDefault(); // Empêche la soumission du formulaire si l'utilisateur clique sur "Annuler"
    } else {
      //console.log("Suppression confirmée");
    }
  }
}
