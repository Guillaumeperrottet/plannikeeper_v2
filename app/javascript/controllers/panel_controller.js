import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["title", "todoList", "taskForm", "panel", "sectorImageContainer"]

  connect() {
    console.log("Panel controller connected.");
  }

  openPanel(article) {
    console.log("Opening panel with article:", article);
    this.titleTarget.textContent = article.title;
    this.loadTasks(article.id);
    this.showPanel();
  }

  loadTasks(articleId) {
    // Assure-toi d'avoir les IDs nécessaires pour construire l'URL
    const objetId = this.element.dataset.panelObjetId;
    const secteurId = localStorage.getItem('selectedSectorId') || this.element.dataset.panelSelectedSectorId;
    // Ajout des logs pour débogage
    console.log("Objet ID from dataset:", this.element.dataset.panelObjetId);
    console.log("Secteur ID", secteurId);


    if (!objetId || !secteurId) {
      console.error("Objet ID ou Secteur ID manquant !");
      return;
    }

    // Construis l'URL imbriquée correcte
    const url = `/objets/${objetId}/secteurs/${secteurId}/articles/${articleId}/tasks`;
    console.log("Fetching tasks from URL:", url);

    // Effectue la requête pour charger les tâches
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(tasks => {
        console.log("Tasks loaded:", tasks);
        this.displayTasks(tasks); // Affiche les tâches dans le panel
      })
      .catch(error => {
        console.error("Erreur lors du chargement des tâches:", error);
      });
  }

  displayTasks(tasks) {
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = ''; // Vide la liste actuelle des tâches

    if (!tasks || tasks.length === 0) {
      taskList.innerHTML = '<li>Aucune tâche disponible.</li>';
      return;
    }

    tasks.forEach(task => {
      const taskItem = document.createElement('li');
      taskItem.textContent = `${task.name} - CFC: ${task.cfc} - Réalisation: ${task.realization_date} - Exécutant: ${task.executor}`;
      taskList.appendChild(taskItem);
    });

    console.log("Tasks displayed:", tasks);
  }

  showPanel() {
    const panel = document.getElementById("article-panel");
    if (panel) {
      panel.classList.add("visible");  // Assure-toi que cette classe est bien utilisée pour afficher le panel
      const imageContainer = document.getElementById("sector-image-container");
      imageContainer.classList.add("with-panel"); // Rétrécit l'image
      this.resizeImageContainer();  // Ajuste la taille du conteneur d'image si nécessaire
      console.log("Panel opened");
    } else {
      console.error("Panel element not found.");
    }
  }


  closePanel() {
    const panel = document.getElementById("article-panel");
    panel.classList.remove("visible");
    const imageContainer = document.getElementById("sector-image-container");
    imageContainer.classList.remove("with-panel"); // Réinitialise la taille de l'image

    this.resizeImageContainer(true); // Reset image container size when closing
  }

  resizeImageContainer(reset = false) {
    const sectorImageContainer = this.sectorImageContainerTarget;
    if (reset) {
      sectorImageContainer.style.width = "100%";
    } else {
      sectorImageContainer.style.width = "calc(100% - 300px)";
    }
  }
}
