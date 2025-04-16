import { Controller } from "@hotwired/stimulus";
// import Swal from "sweetalert2";

export default class extends Controller {
  static values = {
    message: { type: String, default: "Êtes-vous sûr de vouloir effectuer cette suppression ? Cette action est irréversible." },
    url: String // URL dynamique pour l'action de suppression
  }

  confirm(event) {
    event.preventDefault(); // Empêche l'action par défaut

    Swal.fire({
      title: "Confirmation",
      text: this.messageValue,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
    }).then((result) => {
      if (result.isConfirmed) {
        // Vérifie que l'URL est bien définie pour éviter les erreurs
        if (!this.urlValue) {
          console.error("Aucune URL de suppression n'a été définie.");
          return;
        }

        // Soumettre le formulaire de suppression
        const form = document.createElement("form");
        form.method = "POST";
        form.action = this.urlValue;
        form.innerHTML = `<input type="hidden" name="_method" value="delete">
                          <input type="hidden" name="authenticity_token" value="${document.querySelector('meta[name="csrf-token"]').content}">`;
        document.body.appendChild(form);
        form.submit();
      }
    });
  }
}
