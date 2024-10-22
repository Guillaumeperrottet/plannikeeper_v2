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
    this.isMoving = false; // Ajout pour le déplacement
    this.selectedArticle = null; // Stocke l'article sélectionné

    // Désactiver le mode dessin lors de l'initialisation pour éviter les conflits
    this.canvas.isDrawingMode = false;

    this.tooltip = null; // Stocke la référence à l'encadré d'information

    console.log("Initial canvas dimensions:", this.canvas.width, this.canvas.height);

    this.canvas.on('mouse:down', this.startDrawing.bind(this));
    this.canvas.on('mouse:move', this.drawRectangle.bind(this));
    this.canvas.on('mouse:up', this.stopDrawing.bind(this));

    this.canvas.isDrawingMode = false;

    window.addEventListener('imageLoaded', (event) => {
      console.log("Event 'imageLoaded' captured");
      this.adjustCanvasSize(event.detail.imageElement);
    });

    window.addEventListener('resize', () => {
      console.log("Window resized, adjusting canvas and articles.");
      this.adjustCanvasSize(document.querySelector('img[data-sector-select-target="sectorImage"]'));
    });
  }

    // Activer le mode déplacement
    activateMoveMode() {
      console.log("Activate move called");
      this.isDrawing = false;  // Désactiver le mode dessin pendant le déplacement
      this.isMoving = true;

      const objects = this.canvas.getObjects();  // Obtenir tous les objets sur le canvas
      console.log(`Total objects on canvas: ${objects.length}`);  // Afficher le nombre d'objets

      // Rendre les articles déplaçables
      objects.forEach((article) => {
        article.selectable = true;
        article.evented = true;
        article.hasControls = true;  // Afficher les contrôles de l'article pour le déplacer
        console.log("Article ready to move:", article);
      });

        // Lorsque l'article est déplacé, enregistre l'objet sélectionné
      this.canvas.on('object:moving', (event) => {
        if (this.isMoving) {
          this.selectedArticle = event.target;
          console.log("Moving article:", this.selectedArticle);
        }
      });

        // Lorsque l'article est modifié, sauvegarde la nouvelle position
        this.canvas.on('object:modified', () => {
          if (this.isMoving && this.selectedArticle) {
            this.deactivateMoveMode(); // Sauvegarde la position et arrête le mode de déplacement
          }
        });

        // Assure-toi que le mode déplacement se désactive aussi au relâchement de la souris
        this.canvas.on('mouse:up', () => {
          if (this.isMoving && this.selectedArticle) {
            console.log("Mouse up, deactivating move mode");
            this.deactivateMoveMode(); // Désactiver le mode déplacement au relâchement de la souris
          }
        });


      this.canvas.renderAll();  // Actualiser l'affichage du canvas
    }

  // Désactiver le mode déplacement et sauvegarder la nouvelle position
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

      // Ajoute des logs pour voir les valeurs utilisées dans la requête PATCH
      console.log("Objet ID:", objetId);
      console.log("Sector ID:", sectorId);
      console.log("Article ID:", articleId);

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
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log("Article position updated successfully:", data);
        this.selectedArticle = null; // Réinitialiser après la sauvegarde
        this.isMoving = false; // Désactiver le mode déplacement

        // Désactiver les contrôles après le déplacement
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


    // Supprimer un article
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
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        console.log("Article deleted successfully.");
        this.loadAndDisplayArticles(); // Recharger les articles après la suppression
      })
      .catch(error => {
        console.error("Error deleting article:", error);
      });
    }


  // // Fonction pour afficher l'encadré avec titre et description
  // showTooltip(event, article) {
  //   console.log("Showing tooltip for article:", article);

  //   if (this.tooltip) {
  //     this.tooltip.remove();
  //   }

  //   this.tooltip = document.createElement('div');
  //   this.tooltip.classList.add('tooltip');

  //   this.tooltip.style.zIndex = '9999 !important';
  //   this.tooltip.style.position = 'absolute !important';
  //   this.tooltip.style.background = 'white !important';
  //   this.tooltip.style.border = '1px solid black !important';
  //   this.tooltip.style.padding = '5px !important';
  //   this.tooltip.style.color = 'black !important';
  //   this.tooltip.style.fontSize = '14px !important';
  //   this.tooltip.style.display = 'block !important';
  //   this.tooltip.style.visibility = 'visible !important';
  //   this.tooltip.innerHTML = `<strong>${article.title}</strong><br>${article.description}`;

  //   document.body.appendChild(this.tooltip);
  //   console.log('Tooltip added to the DOM:', this.tooltip);

  //   // Vérifie si le tooltip est effectivement ajouté
  //   console.log("Tooltip DOM element:", document.querySelector('.tooltip'));
  //   console.log('Contenu du tooltip:', this.tooltip.outerHTML);

  //   this.positionTooltip(event);
  // }

  // positionTooltip(event) {
  //   if (this.tooltip) {
  //     const canvasRect = this.canvas.upperCanvasEl.getBoundingClientRect(); // Obtenir la position du canvas dans la page

  //     // Ajuster la position du tooltip relativement à l'écran
  //     this.tooltip.style.left = `${event.e.clientX + canvasRect.left + 10}px`;
  //     this.tooltip.style.top = `${event.e.clientY + canvasRect.top + 10}px`;

  //     console.log(`Tooltip position: left=${event.e.clientX + 10}, top=${event.e.clientY + 10}`);
  //   }
  // }


  // // Cache l'encadré d'information
  // hideTooltip() {
  //   console.log("Hiding tooltip");
  //   if (this.tooltip) {
  //     this.tooltip.remove();
  //     this.tooltip = null;
  //   }
  // }

  adjustCanvasSize(imgElement) {
    const canvasEl = this.canvasTarget;

    if (imgElement) {
      const imgWidth = imgElement.clientWidth;
      const imgHeight = imgElement.clientHeight;

      console.log("Image dimensions before adjusting canvas:", imgWidth, imgHeight);

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
        console.log("Canvas and image adjusted:", imgWidth, imgHeight);
      });

      this.adjustArticleDimensions(imgWidth, imgHeight);

      this.loadAndDisplayArticles();
    } else {
      console.log("Image element still not found in fabric_controller.");
    }
  }

  adjustArticleDimensions(canvasWidth, canvasHeight) {
    const originalWidth = 1728;
    const originalHeight = 504;

    const widthRatio = canvasWidth / originalWidth;
    const heightRatio = canvasHeight / originalHeight;

    console.log("Adjusting article dimensions with ratios:", widthRatio, heightRatio);

    this.canvas.getObjects().forEach((article) => {
      console.log("Article original positions:", article.originalLeft, article.originalTop, article.originalWidth, article.originalHeight);
      if (article.originalLeft !== undefined && article.originalTop !== undefined) {
        article.left = article.originalLeft * widthRatio;
        article.top = article.originalTop * heightRatio;
        article.setCoords();
        console.log("Adjusted article positions to:", article.left, article.top);
      }
    });

    this.canvas.renderAll();
    console.log("Articles adjusted based on new canvas dimensions:", canvasWidth, canvasHeight);
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
    console.log("Start drawing at:", this.startX, this.startY);
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
    console.log("Drawing rectangle:", this.currentRect.left, this.currentRect.top, this.currentRect.width, this.currentRect.height);
  }

  stopDrawing() {
    if (!this.isDrawing || !this.currentRect) return;

  document.body.classList.remove("cursor-plus"); // Ou le canevas, si tu préfères
  this.canvas.upperCanvasEl.classList.remove("cursor-plus");

    this.isDrawing = false;
    console.log("Stopped drawing, rectangle dimensions:", this.currentRect.left, this.currentRect.top, this.currentRect.width, this.currentRect.height);

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
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
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
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        this.canvas.clear();

        data.articles.forEach(article => {
          const left = article.position_x * this.canvas.width;
          const top = article.position_y * this.canvas.height;
          const width = article.width * this.canvas.width;
          const height = article.height * this.canvas.height;

          const rect = new fabric.Rect({
            left: left,
            top: top,
            width: width,
            height: height,
            fill: 'rgba(128, 128, 128, 0.1)', // Transparence pour l'article
            // stroke: 'rgba(0, 0, 0, 0.2)', // Contour gris léger (0.2 pour la transparence)
            stroke: 'rgba(0, 0, 0, 0.2)', // Contour gris léger (0.2 pour la transparence)
            strokeWidth: 1, // contour très léger
            selectable: false,
            evented: true,
            hoverCursor: 'pointer', // Change le curseur en main au survol
            shadow: {
              color: 'rgba(0, 0, 0, 0)', // Pas d'ombre par défaut
              blur: 0,
              offsetX: 0,
              offsetY: 0
                    }
        });

          rect.articleId = article.id;

           // Redirection au clic, mais seulement si le mode déplacement n'est pas activé
           rect.on('mousedown', () => {
            if (!this.isMoving) {  // Vérifie si le mode déplacement est actif
              console.log("Article clicked:", article);
              this.openPanelWithArticleData(article); // Ouvre le panneau avec les données de l'article
            } else {
              console.log("Move mode is active, not opening the panel.");
            }
          });

          //  // Survol - Afficher l'encadré d'information
          // rect.on('mouseover', (event) => {
          //   this.showTooltip(event, article);
          // });

          // // Mise à jour de la position de l'encadré
          // rect.on('mousemove', (event) => {
          //   this.positionTooltip(event);
          // });

          // // Enlever l'encadré lorsque la souris quitte la zone de l'article
          // rect.on('mouseout', () => {
          //   this.hideTooltip();
          // });


          // Survol - Ajout d'une ombre discrète au survol
          rect.on('mouseover', () => {
            rect.set({
              shadow: {
                color: 'rgba(0, 0, 0, 0.4)', // Ombre discrète noire
                blur: 10,
                offsetX: 5,
                offsetY: 5
              },
              fill: 'rgba(128, 128, 128, 0.1)' // Légèrement plus opaque au survol
            });
            this.canvas.renderAll();
          });

          rect.on('mouseout', () => {
            rect.set({
              shadow: {
                color: 'rgba(0, 0, 0, 0)', // Pas d'ombre en dehors du survol
                blur: 0,
                offsetX: 0,
                offsetY: 0
              }
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
    console.log("Trying to open panel with article:", article);
    const panelElement = document.getElementById('article-panel');
    const panelController = this.application.getControllerForElementAndIdentifier(panelElement, 'panel');

    if (panelController) {
      console.log("Panel controller found:", panelController);
      panelController.openPanel(article);
    } else {
      console.error("Panel controller not found.");
    }
  }

}
