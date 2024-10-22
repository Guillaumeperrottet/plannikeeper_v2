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
    this.canvas.on('mouse:move', this.drawRectangle.bind(this));
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

  showTooltip(event, article, rect) {
    if (this.tooltip) {
      this.tooltip.remove();
    }

    const tooltipHtml = `
      <div id="article-tooltip" style="position: absolute; background: white; padding: 10px; border: 1px solid black; z-index: 1000;">
        <label for="article-title-input">Nom de l'article :</label>
        <input type="text" id="article-title-input" name="title" value="${article.title}" required><br>
        <label for="article-description">Description :</label>
        <textarea id="article-description" name="description" required>${article.description}</textarea><br>
        <button id="save-article" class="tooltip-button">Enregistrer</button>
        <button id="cancel-article" class="tooltip-button">Annuler</button>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', tooltipHtml);
    this.tooltip = document.getElementById('article-tooltip');

    const canvasRect = this.canvas.upperCanvasEl.getBoundingClientRect();
    const articleLeft = rect.left + canvasRect.left;
    const articleTop = rect.top + canvasRect.top;

    this.tooltip.style.left = `${articleLeft + rect.width + 10}px`;
    this.tooltip.style.top = `${articleTop}px`;

    // Garder une trace de l'état de la souris sur l'article et le tooltip
    let isMouseOverTooltip = false;
    let isMouseOverArticle = true;

    this.tooltip.addEventListener('mouseenter', () => {
      isMouseOverTooltip = true;
    });

    this.tooltip.addEventListener('mouseleave', () => {
      isMouseOverTooltip = false;
      this.checkTooltipHover(isMouseOverArticle, isMouseOverTooltip); // Vérifier si le tooltip doit être masqué
    });

    // Gérer les boutons pour qu'ils n'interfèrent pas avec le survol
    const buttons = this.tooltip.querySelectorAll('.tooltip-button');
    buttons.forEach(button => {
      button.addEventListener('mouseenter', (e) => {
        e.stopPropagation(); // Empêche la propagation pour ne pas affecter le survol
        isMouseOverTooltip = true;
      });
      button.addEventListener('mouseleave', (e) => {
        e.stopPropagation();
        isMouseOverTooltip = false;
        this.checkTooltipHover(isMouseOverArticle, isMouseOverTooltip);
      });
    });

    rect.on('mouseout', () => {
      isMouseOverArticle = false;
      this.checkTooltipHover(isMouseOverArticle, isMouseOverTooltip); // Vérifier si le tooltip doit être masqué
    });

    rect.on('mouseover', () => {
      isMouseOverArticle = true; // Marquer que la souris est sur l'article
    });

    document.getElementById('save-article').addEventListener('click', () => this.saveArticleChanges(article));
    document.getElementById('cancel-article').addEventListener('click', this.hideTooltip.bind(this));
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

    this.currentRect = new fabric.Rect({
      left: this.startX,
      top: this.startY,
      width: 0,
      height: 0,
      fill: 'rgba(128, 128, 128, 0.1)',
      stroke: 'green',
      strokeWidth: 2,
      selectable: false,
      evented: false
    });

    this.canvas.add(this.currentRect);
  }

  drawRectangle(options) {
    if (!this.isDrawing || !this.currentRect) return;

    const pointer = this.canvas.getPointer(options.e);
    const width = pointer.x - this.startX;
    const height = pointer.y - this.startY;

    this.currentRect.set({
      width: Math.abs(width),
      height: Math.abs(height)
    });

    if (width < 0) this.currentRect.set({ left: pointer.x });
    if (height < 0) this.currentRect.set({ top: pointer.y });

    this.canvas.renderAll();
  }

  stopDrawing() {
    if (!this.isDrawing || !this.currentRect) return;

    document.body.classList.remove("cursor-plus");
    this.canvas.upperCanvasEl.classList.remove("cursor-plus");

    this.isDrawing = false;
    this.showArticleForm();
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
    form.style.left = `${this.currentRect.left + 20}px`;
    form.style.top = `${this.currentRect.top + 20}px`;

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
    this.canvas.remove(this.currentRect);
    this.currentRect = null;
    document.getElementById('article-form').remove();
  }

  saveZone(title, description) {
    const obj = this.currentRect;

    if (!obj) {
      console.error("No rectangle to save.");
      return;
    }

    const canvasWidth = this.canvas.width;
    const canvasHeight = this.canvas.height;

    const relativeX = obj.left / canvasWidth;
    const relativeY = obj.top / canvasHeight;
    const relativeWidth = obj.width / canvasWidth;
    const relativeHeight = obj.height / canvasHeight;

    const objetId = this.element.dataset.sectorSelectObjetId;
    const sectorId = document.body.dataset.selectedSectorId || localStorage.getItem('selectedSectorId');

    const data = {
      article: {
        position_x: relativeX,
        position_y: relativeY,
        width: relativeWidth,
        height: relativeHeight,
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
          const width = article.width * this.canvas.width;
          const height = article.height * this.canvas.height;

          const rect = new fabric.Rect({
            left, top, width, height,
            fill: 'rgba(128, 128, 128, 0.1)',
            stroke: 'rgba(0, 0, 0, 0.2)',
            strokeWidth: 1,
            selectable: false,
            evented: true,
            hoverCursor: 'pointer',
            shadow: {
              color: 'rgba(0, 0, 0, 0)',
              blur: 0,
              offsetX: 0,
              offsetY: 0
            }
          });

          rect.articleId = article.id;

          rect.on('mousedown', () => {
            if (!this.isMoving) {
              this.openPanelWithArticleData(article);
            }
          });

          rect.on('mouseover', (event) => {
            this.showTooltip(event, article, rect);
            rect.set({
              shadow: {
                color: 'rgba(0, 0, 0, 0.4)',
                blur: 10,
                offsetX: 5,
                offsetY: 5
              },
              fill: 'rgba(128, 128, 128, 0.1)'
            });
            this.canvas.renderAll();
          });

          rect.on('mouseout', () => {
            const tooltip = document.getElementById('article-tooltip');
            if (tooltip && !tooltip.dataset.hovered) {
              this.hideTooltip();
            }

            rect.set({
              shadow: { color: 'rgba(0, 0, 0, 0)', blur: 0 }
            });
            this.canvas.renderAll();
          });

          this.canvas.add(rect);
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
