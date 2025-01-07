import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["thisWeekTasks", "upcomingTasks"]

  connect() {
    // console.log("Task controller connected");
    // console.log("Element connected:", this.element);
    // console.log("Targets:", this.hasThisWeekTasksTarget, this.hasUpcomingTasksTarget);

        // Récupère le sélecteur d'objet
    const selector = this.element.querySelector("#object-selector");

    if (selector) {
      // Vérifie si un objet est déjà sélectionné
      const selectedObjectId = selector.value;
      // console.log(`Objet pré-sélectionné : ${selectedObjectId}`);

      if (selectedObjectId) {
        // Charge les tâches pour l'objet pré-sélectionné
        this.loadTasks({ target: selector });
      }
    }
  }

  loadTasks(event) {
    const selectedObjectId = event.target.value;
    // console.log(`Loading tasks for selected object ID: ${selectedObjectId}`);

    if (selectedObjectId) {
      // Effectue une requête AJAX pour charger les tâches associées à l'objet
      fetch(`/objets/${selectedObjectId}/tasks`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          // console.log("Tâches chargées:", data);
          this.updateTasks(data);
        })
        .catch(error => console.error('Erreur lors du chargement des tâches:', error));
    }
  }

  updateTasks(data) {
    // console.log("Mise à jour des tâches avec les données reçues:", data);

    // Ajoute des logs supplémentaires pour voir la structure des données
    // console.log("Tâches 'Cette semaine':", data.this_week_tasks);
    // console.log("Tâches 'À venir':", data.upcoming_tasks);

    // Met à jour la liste des tâches pour cette semaine avec la bonne redirection vers l'article
  this.thisWeekTasksTarget.innerHTML = data.this_week_tasks.length > 0
  ? data.this_week_tasks.map(task => `
      <li data-task-url="/objets/${task.objet_id}/secteurs/${task.secteur_id}/articles/${task.article_id}">
        ${task.end_date} - ${task.name} - ${task.article_title}
        <span class="task-description">${task.description || ""}</span> <!-- Enlever style display: none -->
      </li>
    `).join('')
  : '<li>Aucune tâche cette semaine.</li>';

// Met à jour la liste des tâches à venir
this.upcomingTasksTarget.innerHTML = data.upcoming_tasks.length > 0
  ? data.upcoming_tasks.map(task => `
      <li data-task-url="/objets/${task.objet_id}/secteurs/${task.secteur_id}/articles/${task.article_id}">
        ${task.end_date} - ${task.name} - ${task.article_title}
        <span class="task-description">${task.description || ""}</span> <!-- Enlever style display: none -->
      </li>
    `).join('')
  : '<li>Aucune tâche à venir.</li>';

      // console.log("Tâches 'Cette semaine':", data.this_week_tasks);
      // console.log("Tâches 'À venir':", data.upcoming_tasks);
      // console.log("This Week Target:", this.thisWeekTasksTarget);
      // console.log("Upcoming Target:", this.upcomingTasksTarget);

    // Ajoute un écouteur d'événement sur chaque tâche pour rediriger lors du clic
    document.querySelectorAll('[data-task-url]').forEach(taskElement => {
      taskElement.addEventListener('click', (event) => {
        const taskUrl = event.currentTarget.getAttribute('data-task-url');
        // console.log("Redirection vers l'URL :", taskUrl); // Vérification de l'URL générée
        window.location.href = taskUrl; // Redirige vers l'URL de l'article
      });
    });

    // console.log("Tâches mises à jour dans le DOM avec redirection");
  }


  submit(event) {
    event.preventDefault();
    // console.log("Form submission intercepted");

    const formData = new FormData(event.target);
    // console.log("Form data:", formData);

    const objetId = localStorage.getItem('selectedObjetId') || this.element.dataset.objetId;
    const secteurId = localStorage.getItem('selectedSectorId') || this.element.dataset.selectedSectorId;
    const articleId = localStorage.getItem('selectedArticleId');

    // console.log(`Submitting task for Objet ID: ${objetId}, Secteur ID: ${secteurId}, Article ID: ${articleId}`);

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
      // console.log('Tâche créée avec succès:', data);
      this.openTodoTab();
    })
    .catch(error => {
      console.error('Erreur lors de la création de la tâche:', error);
    });
  }

  openTodoTab() {
    const panelElement = document.getElementById('article-panel');
    const panelTabController = this.application.getControllerForElementAndIdentifier(panelElement, 'panel-tab');

    if (panelTabController) {
      // console.log("Panel Tab Controller found, opening TODO tab.");
      panelTabController.showTab('todo');
    } else {
      console.error("Panel Tab Controller not found.");
    }
  }
}
