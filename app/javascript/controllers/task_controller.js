import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  connect() {
    console.log("Task controller connected");
  }

  submit(event) {
    event.preventDefault(); // Empêche le comportement par défaut du formulaire

    const formData = new FormData(event.target); // Récupère les données du formulaire

    // Assurez-vous de récupérer les IDs nécessaires pour construire l'URL
    const objetId = localStorage.getItem('selectedObjetId') || this.element.dataset.objetId;
    const secteurId = localStorage.getItem('selectedSectorId') || this.element.dataset.selectedSectorId;
    const articleId = localStorage.getItem('selectedArticleId'); // Récupère l'ID de l'article depuis localStorage

    // Construire l'URL pour l'API
    const url = `/objets/${objetId}/secteurs/${secteurId}/articles/${articleId}/tasks`;

    fetch(url, {
      method: 'POST',
      body: formData,
      headers: {
        'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      console.log('Tâche créée:', data);
      this.openTodoTab(); // Ouvre le panneau et affiche l'onglet TODO
    })
    .catch(error => {
      console.error('Erreur lors de la création de la tâche:', error);
    });
  }

  openTodoTab() {
    // Récupère le panneau et le contrôleur
    const panelElement = document.getElementById('article-panel');
    const panelTabController = this.application.getControllerForElementAndIdentifier(panelElement, 'panel-tab');

    if (panelTabController) {
      panelTabController.showTab('todo'); // Affiche l'onglet TODO
      console.log("Opened TODO tab in the panel.");
    } else {
      console.error("Panel Tab Controller not found.");
    }
  }
}
