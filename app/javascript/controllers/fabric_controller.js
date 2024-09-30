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

    this.isDrawing = false;
    console.log("Stopped drawing, rectangle dimensions:", this.currentRect.left, this.currentRect.top, this.currentRect.width, this.currentRect.height);

    this.showArticleForm();
  }

  showArticleForm() {
    const formHtml = `
      <div id="article-form" style="position: absolute; background: white; padding: 10px; border: 1px solid black; z-index: 1000;">
        <label for="article-title">Title:</label>
        <input type="text" id="article-title-input" name="title" required><br>
        <label for="article-description">Description:</label>
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
            fill: 'transparent',
            stroke: 'red',
            selectable: false,
            evented: true  // Permet les événements de clic
          });

          rect.articleId = article.id;

          // Redirection au clic
          rect.on('mousedown', () => {
            this.openPanelWithArticleData(article); // Ouvre le panneau avec les données de l'article
          });

          // Changement de couleur au survol
          rect.on('mouseover', () => {
            rect.set('stroke', 'blue');
            this.canvas.renderAll();
          });

          rect.on('mouseout', () => {
            rect.set('stroke', 'red');
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
