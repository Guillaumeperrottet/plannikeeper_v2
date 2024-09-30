import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["title", "todoList", "taskForm", "panel", "sectorImageContainer"]

  connect() {
    console.log("Panel controller connected.");
  }

  openPanel(article) {
    console.log("Opening panel with article:", article);  // Log pour voir les données de l'article

    // Vérifier si l'élément `titleTarget` existe bien
    if (this.titleTarget) {
      this.titleTarget.textContent = article.title;
      console.log("Title set to:", article.title);  // Log pour vérifier si le titre est bien mis à jour
    } else {
      console.error("Title target not found.");
    }

    // Appel pour charger les tâches de l'article
    this.loadTasks(article.id);

    this.showPanel();  // Ouvre le panel
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

    // Log pour vérifier si l'élément taskList existe
    if (!taskList) {
      console.error("Element 'task-list' non trouvé.");
      return;
    }
    console.log("Task list element found:", taskList);

    // Log pour vérifier les tâches reçues
    console.log("Received tasks:", tasks);

    // Vide la liste actuelle des tâches
    taskList.innerHTML = '';

    if (!tasks || tasks.length === 0) {
      taskList.innerHTML = '<li>Aucune tâche disponible.</li>';
      console.log("No tasks found, displaying default message.");
      return;
    }

    // Ajoute chaque tâche dans la liste
    tasks.forEach(task => {
      const taskItem = document.createElement('li');
      taskItem.textContent = `${task.realization_date} - ${task.description}`;
      taskList.appendChild(taskItem);
      console.log("Task added to list:", task);
    });

    console.log("All tasks displayed.");
  }


  showPanel() {
    const panel = document.getElementById("article-panel");
    if (panel) {
      panel.classList.add("visible");
      const imageContainer = document.getElementById("sector-image-container");
      imageContainer.classList.add("with-panel");

      console.log("Classes on image container:", imageContainer.classList); // Vérifie les classes
      this.resizeImageContainer();
      console.log("Panel opened");
    } else {
      console.error("Panel element not found.");
    }
  }



  closePanel() {
    const panel = document.getElementById("article-panel");
    const imageContainer = document.getElementById("sector-image-container");

    // Retire la classe 'visible' du panneau pour le fermer
    panel.classList.remove("visible");

    // Ajoute un délai avant d'ajuster la taille du conteneur d'image
    // Cela attend que la transition de fermeture soit terminée
    setTimeout(() => {
      imageContainer.classList.remove("with-panel"); // Réinitialise la taille de l'image
      this.resizeImageContainer(true); // Reset image container size when closing
    }, 300);  // 300ms correspond à la durée de la transition CSS (transition: transform 0.3s ease)
  }

  resizeImageContainer(reset = false) {
    const sectorImageContainer = this.sectorImageContainerTarget;
    if (reset) {
      sectorImageContainer.style.width = "100%";
    } else {
      sectorImageContainer.style.width = "calc(100% - 1325px)";
    }
  }
}
