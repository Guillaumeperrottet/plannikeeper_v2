import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["thisWeekTasks", "upcomingTasks"]

  connect() {
    console.log("Task controller connected");
    console.log("Element connected:", this.element); // Vérifie si l'élément est bien trouvé
    console.log("Targets:", this.hasThisWeekTasksTarget, this.hasUpcomingTasksTarget); // Vérifie si les targets sont bien connectées
  }

  submit(event) {
    event.preventDefault(); // Empêche le comportement par défaut du formulaire
    console.log("Form submission intercepted");

    const formData = new FormData(event.target); // Récupère les données du formulaire
    console.log("Form data:", formData);

    // Assurez-vous de récupérer les IDs nécessaires pour construire l'URL
    const objetId = localStorage.getItem('selectedObjetId') || this.element.dataset.objetId;
    const secteurId = localStorage.getItem('selectedSectorId') || this.element.dataset.selectedSectorId;
    const articleId = localStorage.getItem('selectedArticleId'); // Récupère l'ID de l'article depuis localStorage

    console.log(`Submitting task for Objet ID: ${objetId}, Secteur ID: ${secteurId}, Article ID: ${articleId}`);

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
      console.log('Tâche créée avec succès:', data);
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
      console.log("Panel Tab Controller found, opening TODO tab.");
      panelTabController.showTab('todo'); // Affiche l'onglet TODO
    } else {
      console.error("Panel Tab Controller not found.");
    }
  }

  loadTasks(event) {
    const selectedObjectId = event.target.value;
    console.log(`Loading tasks for selected object ID: ${selectedObjectId}`);

    if (selectedObjectId) {
      // Effectue une requête AJAX pour charger les tâches associées à l'objet
      fetch(`/objets/${selectedObjectId}/tasks`)
        .then(response => response.json())
        .then(data => {
          console.log("Tâches chargées:", data);
          this.updateTasks(data);
        })
        .catch(error => console.error('Erreur lors du chargement des tâches:', error));
    }
  }

  updateTasks(data) {
    console.log("Mise à jour des tâches avec les données reçues:", data);

    // Met à jour la liste des tâches pour cette semaine
    this.thisWeekTasksTarget.innerHTML = data.this_week_tasks.length > 0
      ? data.this_week_tasks.map(task => `<li>${task.realisation_date} - ${task.cfc} / ${task.description}</li>`).join('')
      : '<li>Aucune tâche cette semaine.</li>';

    // Met à jour la liste des tâches à venir
    this.upcomingTasksTarget.innerHTML = data.upcoming_tasks.length > 0
      ? data.upcoming_tasks.map(task => `<li>${task.cfc} - ${task.description}</li>`).join('')
      : '<li>Aucune tâche à venir.</li>';

    console.log("Tâches mises à jour dans le DOM");
  }
}
