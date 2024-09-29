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

    // Log the initial dimensions of the canvas
    console.log("Initial canvas dimensions:", this.canvas.width, this.canvas.height);

    this.canvas.on('mouse:down', this.startDrawing.bind(this));
    this.canvas.on('mouse:move', this.drawRectangle.bind(this));
    this.canvas.on('mouse:up', this.stopDrawing.bind(this));

    this.canvas.isDrawingMode = false;

    window.addEventListener('imageLoaded', (event) => {
      console.log("Event 'imageLoaded' captured");
      this.adjustCanvasSize(event.detail.imageElement);
    });

    // Ajout d'un écouteur pour gérer le redimensionnement de la fenêtre
    window.addEventListener('resize', () => {
      console.log("Window resized, adjusting canvas and articles.");
      this.adjustCanvasSize(document.querySelector('img[data-sector-select-target="sectorImage"]'));
    });
  }

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

      // Appel à la fonction pour ajuster les articles
      this.adjustArticleDimensions(imgWidth, imgHeight);

      // Charger et afficher les articles existants
      this.loadAndDisplayArticles();
    } else {
      console.log("Image element still not found in fabric_controller.");
    }
  }

  // Fonction pour ajuster les articles après le redimensionnement
  adjustArticleDimensions(canvasWidth, canvasHeight) {
    const originalWidth = 1728; // La largeur d'origine de l'image
    const originalHeight = 504;  // La hauteur d'origine de l'image

    const widthRatio = canvasWidth / originalWidth;
    const heightRatio = canvasHeight / originalHeight;

    this.canvas.getObjects().forEach((article) => {
      if (article.originalLeft && article.originalTop) {
        article.left = article.originalLeft * widthRatio;
        article.top = article.originalTop * heightRatio;
        article.width = article.originalWidth * widthRatio;
        article.height = article.originalHeight * heightRatio;
        article.setCoords(); // Pour mettre à jour les coordonnées de l'article
      }
    });

    this.canvas.renderAll();
    console.log("Articles adjusted based on new canvas dimensions:", canvasWidth, canvasHeight);
  }

  activateDrawing() {
    this.isDrawing = true;
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
      fill: 'rgba(0, 255, 0, 0.5)',
      stroke: 'green',
      strokeWidth: 2,
      selectable: false,  // Désactive la sélection
      evented: false      // Désactive toutes les interactions (déplacement/redimensionnement)
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

    this.isDrawing = false;
    console.log("Stopped drawing, rectangle dimensions:", this.currentRect.left, this.currentRect.top, this.currentRect.width, this.currentRect.height);

    this.saveZone();
    this.currentRect = null;
  }

  saveZone() {
    const obj = this.currentRect;

    if (!obj) {
      console.error("No rectangle to save.");
      return;
    }

    const canvasWidth = this.canvas.width;
    const canvasHeight = this.canvas.height;

    console.log("Saving zone with current canvas size:", canvasWidth, canvasHeight);

    const relativeX = obj.left / canvasWidth;
    const relativeY = obj.top / canvasHeight;
    const relativeWidth = obj.width / canvasWidth;
    const relativeHeight = obj.height / canvasHeight;

    if (relativeWidth <= 0 || relativeHeight <= 0) {
      console.error("Invalid rectangle dimensions:", relativeWidth, relativeHeight);
      return;
    }

    console.log("Saving rectangle dimensions (relative): ", relativeX, relativeY, relativeWidth, relativeHeight);

    const objetId = this.element.dataset.sectorSelectObjetId;
    const sectorId = document.body.dataset.selectedSectorId || localStorage.getItem('selectedSectorId');

    if (!objetId || !sectorId) {
      console.error("Objet ID or Sector ID is missing.");
      return;
    }

    const data = {
      article: {
        position_x: relativeX,
        position_y: relativeY,
        width: relativeWidth,
        height: relativeHeight,
        title: "Default Title",
        description: "Default Description",
        secteur_id: sectorId,
        objet_id: objetId
      }
    };

    console.log("Data sent to the server:", data);  // Log the data being sent

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
    })
    .catch(error => {
      console.error("Erreur lors de la création de l'article :", error);
    });
  }

  // Fonction pour charger et afficher les articles existants
  loadAndDisplayArticles() {
    const articles = this.element.dataset.articles ? JSON.parse(this.element.dataset.articles) : [];

    articles.forEach(article => {
      const left = article.position_x * this.canvas.width;  // Ajuster en fonction de la taille actuelle du canevas
      const top = article.position_y * this.canvas.height;
      const width = article.width * this.canvas.width;
      const height = article.height * this.canvas.height;

      const rect = new fabric.Rect({
        left: left,
        top: top,
        width: width,
        height: height,
        fill: 'transparent',
        stroke: 'red',
        selectable: false,  // Désactive la sélection
        evented: false      // Désactive toutes les interactions (déplacement/redimensionnement)
      });

      this.canvas.add(rect);
    });

    console.log("Articles loaded and displayed on canvas");
  }
}
