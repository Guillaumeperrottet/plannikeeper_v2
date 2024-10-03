import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["title", "todoList", "taskForm", "panel", "sectorImageContainer"]

  connect() {
    console.log("Panel controller connected.");
    // if (this.hasTitleTarget) {
    //   console.log("Title target:", this.titleTarget);
    // } else {
    //   console.warn("Title target is missing at connect time.");
    // }
  }

  openPanel(article) {
    console.log("Opening panel with article:", article);

    localStorage.setItem('selectedArticleId', article.id);

    if (this.titleTarget) {
      this.titleTarget.innerHTML = `<a href="#" data-action="click->panel#redirectToArticle">${article.title}</a>`;
      this.titleTarget.dataset.articleId = article.id;
      console.log("Title set to:", article.title);
    } else {
      console.error("Title target is missing!");
    }

    this.loadTasks(article.id);
    this.showPanel();
  }

  loadTasks(articleId) {
    const objetId = this.element.dataset.panelObjetId;
    const secteurId = localStorage.getItem('selectedSectorId') || this.element.dataset.panelSelectedSectorId;

    console.log("Chargement des tâches pour l'article ID:", articleId);

    if (!objetId || !secteurId) {
      console.error("Objet ID ou Secteur ID manquant !");
      return;
    }

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
        console.log("Received tasks data:", tasks); // Ajout du log ici
        this.displayTasks(tasks);
      })
      .catch(error => {
        console.error("Erreur lors du chargement des tâches:", error);
      });
  }


  displayTasks(tasksData) {
    const taskList = document.getElementById('task-list');

    if (!taskList) {
      console.error("Element 'task-list' non trouvé.");
      return;
    }

    taskList.innerHTML = '';

    // Combine les tâches "cette semaine" et "à venir"
    const allTasks = [...tasksData.this_week_tasks, ...tasksData.upcoming_tasks];

    if (allTasks.length === 0) {
      taskList.innerHTML = '<li>Aucune tâche disponible.</li>';
      console.log("No tasks found, displaying default message.");
      return;
    }

    console.log("All tasks received:", allTasks);

    // Parcourir les tâches et accéder aux propriétés directement depuis l'objet taskData
    allTasks.forEach(taskData => {
      // Vérification que taskData contient les propriétés attendues
      if (taskData && taskData.realisation_date && taskData.description) {
        const taskItem = document.createElement('li');
        taskItem.textContent = `${taskData.realisation_date} - ${taskData.description}`;
        taskList.appendChild(taskItem);
        console.log("Task added to list:", taskData);
      } else {
        console.error("Task data is missing realisation_date or description:", taskData);
      }
    });

    console.log("All tasks displayed.");
  }




  showPanel() {
    const panel = document.getElementById("article-panel");
    if (panel) {
      panel.classList.add("visible");
      const imageContainer = document.getElementById("sector-image-container");
      imageContainer.classList.add("with-panel");

      this.resizeImageContainer();
      console.log("Panel opened");
    } else {
      console.error("Panel element not found.");
    }
  }

  closePanel() {
    const panel = document.getElementById("article-panel");
    const imageContainer = document.getElementById("sector-image-container");

    panel.classList.remove("visible");

    setTimeout(() => {
      imageContainer.classList.remove("with-panel");
      this.resizeImageContainer(true);
    }, 300);
  }

  resizeImageContainer(reset = false) {
    const sectorImageContainer = this.sectorImageContainerTarget;
    if (reset) {
      sectorImageContainer.style.width = "100%";
    } else {
      sectorImageContainer.style.width = "calc(100% - 1325px)";
    }
  }

  redirectToArticle(event) {
    event.preventDefault(); // Empêche le comportement par défaut du lien

    // Récupérer l'ID de l'article depuis l'élément
    const articleId = this.titleTarget.dataset.articleId;
    const objetId = this.element.dataset.panelObjetId;  // ID de l'objet
    const secteurId = localStorage.getItem('selectedSectorId') || this.element.dataset.panelSelectedSectorId;  // ID du secteur

    // Vérifications de sécurité pour s'assurer que les IDs sont valides
    if (articleId && objetId && secteurId) {
      // Redirection vers la page de l'article en utilisant les IDs récupérés
      window.location.href = `/objets/${objetId}/secteurs/${secteurId}/articles/${articleId}`;
    } else {
      console.error("Impossible de rediriger, Article ID, Objet ID ou Secteur ID manquant !");
    }
  }

}
