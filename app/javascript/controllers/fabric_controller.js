import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["canvas"]

  connect() {
    this.canvas = new fabric.Canvas(this.canvasTarget.id);
    window.canvas = this.canvas;
    window.canvas.initialized = true;
    console.log("Fabric.js initialized");

    this.isDrawing = false;
    this.currentRect = null;
    this.startX = 0;
    this.startY = 0;
    this.isMoving = false;
    this.selectedArticle = null;

    this.canvas.isDrawingMode = false;
    this.tooltip = null;

    console.log("Initial canvas dimensions:", this.canvas.width, this.canvas.height);

    this.canvas.on('mouse:down', this.startDrawing.bind(this));
    this.canvas.on('mouse:move', this.drawCircle.bind(this));
    this.canvas.on('mouse:up', this.stopDrawing.bind(this));


    window.addEventListener('imageLoaded', (event) => {
      console.log("Event 'imageLoaded' captured");
      this.adjustCanvasSize(event.detail.imageElement);
    });

    window.addEventListener('resize', () => {
      console.log("Window resized, adjusting canvas and articles.");
      this.adjustCanvasSize(document.querySelector('img[data-sector-select-target="sectorImage"]'));
    });
  }

  activateMoveMode() {
    console.log("Activate move called");
    this.isDrawing = false;
    this.isMoving = true;

    const objects = this.canvas.getObjects();
    console.log(`Total objects on canvas: ${objects.length}`);

    objects.forEach((article) => {
      article.selectable = true;
      article.evented = true;
      article.hasControls = true;
      console.log("Article ready to move:", article);
    });

    this.canvas.on('object:moving', (event) => {
      if (this.isMoving) {
        this.selectedArticle = event.target;
        console.log("Moving article:", this.selectedArticle);
      }
    });

    this.canvas.on('object:modified', () => {
      if (this.isMoving && this.selectedArticle) {
        this.deactivateMoveMode();
      }
    });

    this.canvas.on('mouse:up', () => {
      if (this.isMoving && this.selectedArticle) {
        console.log("Mouse up, deactivating move mode");
        this.deactivateMoveMode();
      }
    });

    this.canvas.renderAll();
  }

  deactivateMoveMode() {
    if (this.selectedArticle) {
      console.log("Deactivating move mode and saving new position");

      const articleId = this.selectedArticle.articleId;
      const canvasWidth = this.canvas.width;
      const canvasHeight = this.canvas.height;

      const newPositionX = this.selectedArticle.left / canvasWidth;
      const newPositionY = this.selectedArticle.top / canvasHeight;

      const objetId = this.element.dataset.sectorSelectObjetId;
      const sectorId = document.body.dataset.selectedSectorId || localStorage.getItem('selectedSectorId');

      const data = {
        article: {
          position_x: newPositionX,
          position_y: newPositionY
        }
      };

      fetch(`/objets/${objetId}/secteurs/${sectorId}/articles/${articleId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': document.querySelector("[name='csrf-token']").content
        },
        body: JSON.stringify(data)
      })
      .then(response => response.ok ? response.json() : Promise.reject(response))
      .then(data => {
        console.log("Article position updated successfully:", data);
        this.selectedArticle = null;
        this.isMoving = false;

        this.canvas.getObjects().forEach((article) => {
          article.selectable = false;
          article.hasControls = false;
        });

        this.canvas.renderAll();
      })
      .catch(error => {
        console.error("Error updating article position:", error);
      });
    }
  }

  deleteArticle(articleId) {
    console.log("Deleting article with ID:", articleId);

    const objetId = this.element.dataset.sectorSelectObjetId;
    const sectorId = document.body.dataset.selectedSectorId || localStorage.getItem('selectedSectorId');

    fetch(`/objets/${objetId}/secteurs/${sectorId}/articles/${articleId}`, {
      method: 'DELETE',
      headers: {
        'X-CSRF-Token': document.querySelector("[name='csrf-token']").content
      }
    })
    .then(response => response.ok ? response.json() : Promise.reject(response))
    .then(() => {
      console.log("Article deleted successfully.");
      this.loadAndDisplayArticles();
    })
    .catch(error => {
      console.error("Error deleting article:", error);
    });
  }

  showTooltip(event, article, circle) {
    if (this.tooltip) {
      this.tooltip.remove();
    }

    // Contenu simplifié avec le style correspondant à l'image
    const tooltipHtml = `
      <div id="article-tooltip" style="position: absolute; background: rgba(0, 0, 0, 0.75); color: white; padding: 8px 12px; border-radius: 4px; font-size: 12px; z-index: 1000; box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.2);">
        ${article.title}<br>
        <small>${article.description}</small>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', tooltipHtml);
    this.tooltip = document.getElementById('article-tooltip');

    const canvasRect = this.canvas.upperCanvasEl.getBoundingClientRect();
    const articleLeft = circle.left + circle.radius + canvasRect.left;
    const articleTop = circle.top + circle.radius + canvasRect.top;

    this.tooltip.style.left = `${articleLeft + 0}px`; // Positionner à droite du cercle
    this.tooltip.style.top = `${articleTop}px`; // Positionner juste au-dessus du cercle

    // Garder une trace de l'état de la souris sur le cercle et le tooltip
    let isMouseOverTooltip = false;
    let isMouseOverArticle = true;

    this.tooltip.addEventListener('mouseenter', () => {
      isMouseOverTooltip = true;
    });

    this.tooltip.addEventListener('mouseleave', () => {
      isMouseOverTooltip = false;
      this.checkTooltipHover(isMouseOverArticle, isMouseOverTooltip); // Vérifier si le tooltip doit être masqué
    });

    circle.on('mouseout', () => {
      isMouseOverArticle = false;
      this.checkTooltipHover(isMouseOverArticle, isMouseOverTooltip); // Vérifier si le tooltip doit être masqué
    });

    circle.on('mouseover', () => {
      isMouseOverArticle = true; // Marquer que la souris est sur l'article
    });
  }

  // Vérifier si le tooltip doit être masqué
  checkTooltipHover(isMouseOverArticle, isMouseOverTooltip) {
    setTimeout(() => {
      if (!isMouseOverArticle && !isMouseOverTooltip) {
        this.hideTooltip();
      }
    }, 200); // Délai pour permettre de passer de l'article au tooltip sans le faire disparaître immédiatement
  }

  hideTooltip() {
    if (this.tooltip) {
      this.tooltip.remove();
      this.tooltip = null;
    }
  }

  saveArticleChanges(article) {
    const newTitle = document.getElementById('article-title-input').value;
    const newDescription = document.getElementById('article-description').value;

    if (newTitle && newDescription) {
      const data = {
        article: {
          title: newTitle,
          description: newDescription
        }
      };

      const objetId = this.element.dataset.sectorSelectObjetId;
      const sectorId = document.body.dataset.selectedSectorId || localStorage.getItem('selectedSectorId');

      fetch(`/objets/${objetId}/secteurs/${sectorId}/articles/${article.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': document.querySelector("[name='csrf-token']").content
        },
        body: JSON.stringify(data)
      })
      .then(response => response.ok ? response.json() : Promise.reject(response))
      .then(data => {
        console.log("Article modifié avec succès :", data);
        this.hideTooltip();
        this.loadAndDisplayArticles();
      })
      .catch(error => {
        console.error("Erreur lors de la modification de l'article :", error);
      });
    } else {
      alert("Le nom et la description sont obligatoires.");
    }
  }

  adjustCanvasSize(imgElement) {
    const canvasEl = this.canvasTarget;

    if (imgElement) {
      const imgWidth = imgElement.clientWidth;
      const imgHeight = imgElement.clientHeight;

      if (imgWidth === 0 || imgHeight === 0) {
        console.log("Image dimensions are not set correctly yet.");
        return;
      }

      canvasEl.width = imgWidth;
      canvasEl.height = imgHeight;

      this.canvas.setWidth(imgWidth);
      this.canvas.setHeight(imgHeight);

      fabric.Image.fromURL(imgElement.src, (img) => {
        img.set({
          left: 0,
          top: 0,
          scaleX: imgWidth / img.width,
          scaleY: imgHeight / img.height
        });
        this.canvas.setBackgroundImage(img, this.canvas.renderAll.bind(this.canvas));
      });

      this.adjustArticleDimensions(imgWidth, imgHeight);
      this.loadAndDisplayArticles();
    }
  }

  adjustArticleDimensions(canvasWidth, canvasHeight) {
    const originalWidth = 1728;
    const originalHeight = 504;

    const widthRatio = canvasWidth / originalWidth;
    const heightRatio = canvasHeight / originalHeight;

    this.canvas.getObjects().forEach((article) => {
      if (article.originalLeft !== undefined && article.originalTop !== undefined) {
        article.left = article.originalLeft * widthRatio;
        article.top = article.originalTop * heightRatio;
        article.setCoords();
      }
    });

    this.canvas.renderAll();
  }

  activateDrawing() {
    this.isDrawing = true;

    this.canvas.upperCanvasEl.classList.add("cursor-plus");
    document.body.classList.add("cursor-plus");

    console.log("Drawing mode activated");
  }

  startDrawing(options) {
    if (!this.isDrawing) return;

    const pointer = this.canvas.getPointer(options.e);
    this.startX = pointer.x;
    this.startY = pointer.y;

    this.currentCircle = new fabric.Circle({
      left: this.startX,
      top: this.startY,
      radius: 0,
      fill: 'rgba(128, 128, 128, 0.1)',
      stroke: 'green',
      strokeWidth: 2,
      selectable: false,
      evented: false,
      originX: 'center',
      originY: 'center'
    });

    this.canvas.add(this.currentCircle);
  }

  drawCircle(options) {
    if (!this.isDrawing || !this.currentCircle) return;

    const pointer = this.canvas.getPointer(options.e);
    const radius = Math.sqrt(Math.pow(pointer.x - this.startX, 2) + Math.pow(pointer.y - this.startY, 2));

    this.currentCircle.set({
      radius: Math.abs(radius)
    });

    this.canvas.renderAll();
  }

  stopDrawing() {
    if (!this.isDrawing || !this.currentCircle) return;

    document.body.classList.remove("cursor-plus");
    this.canvas.upperCanvasEl.classList.remove("cursor-plus");

    this.isDrawing = false;

    // Vérification pour s'assurer que le cercle a bien été créé
    if (this.currentCircle) {
      console.log("Circle drawn successfully, showing the form.");
      this.showArticleForm();  // Appelle le formulaire uniquement si le cercle existe
    } else {
      console.error("No circle found to show the form.");
    }
  }

  showArticleForm() {
    const formHtml = `
      <div id="article-form" style="position: absolute; background: white; padding: 10px; border: 1px solid black; z-index: 1000;">
        <label for="article-title-input">Nom de l'article :</label>
        <input type="text" id="article-title-input" name="title" required><br>
        <label for="article-description">Description :</label>
        <textarea id="article-description" name="description" required></textarea><br>
        <button id="save-article">Save</button>
        <button id="cancel-article">Cancel</button>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', formHtml);

    const form = document.getElementById('article-form');

    // Position initiale du formulaire
    let formLeft = this.currentCircle.left + 20;
    let formTop = this.currentCircle.top + 20;

    // Dimensions de la fenêtre et du formulaire
    const formRect = form.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Ajustement si le formulaire dépasse le bord droit de l'écran
    if (formLeft + formRect.width > viewportWidth) {
      formLeft = this.currentCircle.left - formRect.width - 20; // Positionner à gauche du cercle
    }

    // Ajustement si le formulaire dépasse le bord gauche de l'écran
    if (formLeft < 0) {
      formLeft = 10; // Positionner à 10px du bord gauche
    }

    // Ajustement si le formulaire dépasse le bas de l'écran
    if (formTop + formRect.height > viewportHeight) {
      formTop = viewportHeight - formRect.height - 10; // Positionner à 10px du bas de l'écran
    }

    // Ajustement si le formulaire dépasse le haut de l'écran
    if (formTop < 0) {
      formTop = 10; // Positionner à 10px du haut de l'écran
    }

    // Appliquer les positions ajustées
    form.style.left = `${formLeft}px`;
    form.style.top = `${formTop}px`;

    document.getElementById('save-article').addEventListener('click', this.saveArticle.bind(this));
    document.getElementById('cancel-article').addEventListener('click', this.cancelArticle.bind(this));
  }

  saveArticle() {
    const title = document.getElementById('article-title-input').value;
    const description = document.getElementById('article-description').value;

    if (title && description) {
      this.saveZone(title, description);
      document.getElementById('article-form').remove();
    } else {
      alert("Title and description are required.");
    }
  }

  cancelArticle() {
    this.canvas.remove(this.currentCircle);
    this.currentRect = null;
    document.getElementById('article-form').remove();
  }

  saveZone(title, description) {
    const circle = this.currentCircle;

    if (!circle) {
      console.error("No circle to save.");
      return;
    }

    const canvasWidth = this.canvas.width;
    const canvasHeight = this.canvas.height;

    const relativeX = circle.left / canvasWidth;
    const relativeY = circle.top / canvasHeight;
    const relativeRadius = circle.radius / canvasWidth;  // Sauvegarde le rayon relatif au canevas

    const objetId = this.element.dataset.sectorSelectObjetId;
    const sectorId = document.body.dataset.selectedSectorId || localStorage.getItem('selectedSectorId');

    const data = {
      article: {
        position_x: relativeX,
        position_y: relativeY,
        radius: relativeRadius,  // On enregistre le rayon du cercle
        title: title,
        description: description,
        secteur_id: sectorId,
        objet_id: objetId
      }
    };

    fetch(`/objets/${objetId}/secteurs/${sectorId}/articles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': document.querySelector("[name='csrf-token']").content
      },
      body: JSON.stringify(data)
    })
    .then(response => response.ok ? response.json() : Promise.reject(response))
    .then(data => {
      console.log("Article créé avec succès :", data);
      this.loadAndDisplayArticles();
    })
    .catch(error => {
      console.error("Erreur lors de la création de l'article :", error);
    });
  }

  loadAndDisplayArticles() {
    const objetId = this.element.dataset.sectorSelectObjetId;
    const sectorId = document.body.dataset.selectedSectorId || localStorage.getItem('selectedSectorId');

    const url = `/objets/${objetId}/secteurs/${sectorId}/articles`;

    fetch(url)
      .then(response => response.ok ? response.json() : Promise.reject(response))
      .then(data => {
        this.canvas.clear();

        data.articles.forEach(article => {
          const left = article.position_x * this.canvas.width;
          const top = article.position_y * this.canvas.height;
          const radius = article.radius * this.canvas.width;  // On récupère le rayon relatif

          const circle = new fabric.Circle({
            left: left,
            top: top,
            radius: radius,
            fill: 'rgba(128, 128, 128, 0.1)',
            stroke: 'rgba(0, 0, 0, 0.2)',
            strokeWidth: 1,
            selectable: false,
            evented: true,
            originX: 'center',
            originY: 'center',
            hoverCursor: 'pointer'
          });

          circle.articleId = article.id;

          circle.on('mousedown', () => {
            if (!this.isMoving) {
              this.openPanelWithArticleData(article);
            }
          });

          circle.on('mouseover', (event) => {
            this.showTooltip(event, article, circle);
          });

          circle.on('mouseout', () => {
            this.hideTooltip();
          });

          this.canvas.add(circle);
        });

        this.canvas.renderAll();
      })
      .catch(error => {
        console.error("Erreur lors du chargement des articles :", error);
      });
  }

  openPanelWithArticleData(article) {
    const panelElement = document.getElementById('article-panel');
    const panelController = this.application.getControllerForElementAndIdentifier(panelElement, 'panel');

    if (panelController) {
      panelController.openPanel(article);
    }
  }

  updateCanvasTransform(scale, offsetX, offsetY) {
    // Met à jour le facteur de zoom du canvas
    this.canvas.setZoom(scale);

    // Applique les offsets de l'image à la position du canvas
    this.canvas.absolutePan({ x: -offsetX, y: -offsetY });

    // Met à jour les objets (articles) sur le canevas
    this.canvas.getObjects().forEach((article) => {
      article.scaleX = article.originalScaleX * scale;
      article.scaleY = article.originalScaleY * scale;
      article.left = article.originalLeft * scale + offsetX;
      article.top = article.originalTop * scale + offsetY;
      article.setCoords();  // Met à jour les coordonnées de l'objet
    });

    this.canvas.renderAll();  // Redessine le canvas
  }
}
