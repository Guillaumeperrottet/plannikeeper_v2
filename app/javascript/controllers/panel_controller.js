import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["title", "todoList", "taskForm", "panel", "sectorImageContainer"]

  connect() {
    console.log("Panel controller connected.");
    if (this.hasTitleTarget) {
      console.log("Title target:", this.titleTarget);  // Vérifiez si la cible title est bien trouvée
    } else {
      console.warn("Title target is missing at connect time.");
    }
  }

  observeTitle() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (this.hasTitleTarget) {
          console.log("Title target found after DOM update:", this.titleTarget);
          observer.disconnect();  // Arrêter d'observer une fois que l'élément est trouvé
        }
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  openPanel(article) {
    console.log("Opening panel with article:", article);

    // Stockez l'ID de l'article dans localStorage
    localStorage.setItem('selectedArticleId', article.id);

    // Vérifie que l'élément `titleTarget` existe avant de le manipuler
    if (this.titleTarget) {
      // Mise à jour du contenu du titre et ajout de l'ID de l'article
      this.titleTarget.innerHTML = `<a href="#" data-action="click->panel#redirectToArticle">${article.title}</a>`;
      this.titleTarget.dataset.articleId = article.id;  // Stocke l'ID de l'article dans un data attribute
      console.log("Title set to:", article.title);
    } else {
      console.error("Title target is missing!");
    }

    // Charge les tâches associées à l'article
    this.loadTasks(article.id);

    // Affiche le panneau
    this.showPanel();
  }


  redirectToArticle(event) {
    event.preventDefault();
    const articleId = this.titleTarget.dataset.articleId;
    const objetId = this.element.dataset.panelObjetId;  // Récupère l'ID de l'objet depuis le dataset
    const secteurId = localStorage.getItem('selectedSectorId') || this.element.dataset.panelSelectedSectorId;  // Récupère l'ID du secteur depuis le localStorage ou le dataset

    console.log("Redirection avec : Article ID", articleId, "Objet ID", objetId, "Secteur ID", secteurId);
    console.log("Redirecting to article:", articleId, objetId, secteurId);


    if (articleId && objetId && secteurId) {
      window.location.href = `/objets/${objetId}/secteurs/${secteurId}/articles/${articleId}`;
    } else {
      console.error("Article ID, Objet ID ou Secteur ID est manquant !");
    }
  }



  loadTasks(articleId) {
    // Assure-toi d'avoir les IDs nécessaires pour construire l'URL
    const objetId = this.element.dataset.panelObjetId;
    const secteurId = localStorage.getItem('selectedSectorId') || this.element.dataset.panelSelectedSectorId;

    console.log("Chargement des tâches pour l'article ID:", articleId);

    if (!objetId || !secteurId) {
      console.error("Objet ID ou Secteur ID manquant !");
      return;
    }

    // Construis l'URL imbriquée correcte
    const url = `/objets/${objetId}/secteurs/${secteurId}/articles/${articleId}/tasks`;
    console.log("Fetching tasks from URL:", url);

    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(tasks => {
        console.log("Tasks loaded:", tasks);
        const taskList = document.getElementById('task-list');
        console.log("Task list element found:", taskList);

        // Vérifier si l'élément taskList existe
        if (!taskList) {
          console.error("Element 'task-list' non trouvé.");
          return;
        }

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
