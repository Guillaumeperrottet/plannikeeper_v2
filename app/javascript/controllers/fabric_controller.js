import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["canvas"]

  connect() {
    this.canvas = new fabric.Canvas(this.canvasTarget.id);
    console.log("Fabric.js initialized");

    this.canvas.on('mouse:down', function(event) {
      console.log('Mouse down detected on canvas');
    });

    this.canvas.on('mouse:move', function(event) {
      console.log('Mouse moving on canvas');
    });

    // Désactiver le comportement par défaut de tous les événements de la souris
    ['mousedown', 'mouseup', 'mousemove', 'dragstart'].forEach(eventName => {
      this.canvasTarget.addEventListener(eventName, (event) => {
        event.preventDefault();
        event.stopPropagation();
      });
    });

    // Ajuste la taille du canevas en fonction de l'image
    this.adjustCanvasSize();

    this.isDrawing = false;
  }

  activateDrawing() {
    this.isDrawing = true;
    this.canvas.isDrawingMode = true;
    this.canvas.freeDrawingBrush.color = "red";
    this.canvas.freeDrawingBrush.width = 5;

    // Autoriser les interactions sur le canevas
    this.canvasTarget.style.pointerEvents = 'auto';
    console.log("Drawing mode activated");
  }

  adjustCanvasSize() {
    const img = document.querySelector('.sector-image');
    const canvasEl = this.canvasTarget;

    if (img) {
      canvasEl.width = img.clientWidth;
      canvasEl.height = img.clientHeight;
      this.canvas.setWidth(canvasEl.width);
      this.canvas.setHeight(canvasEl.height);

      console.log("Canvas size:", canvasEl.width, canvasEl.height);
    }
  }

  stopDrawing() {
    this.canvas.isDrawingMode = false;
    this.isDrawing = false;
    this.canvasTarget.style.pointerEvents = 'none';
    console.log("Drawing mode deactivated");
  }

  saveZone() {
    const objects = this.canvas.getObjects();
    objects.forEach((obj) => {
      const data = {
        article: {
          position_x: obj.left,
          position_y: obj.top,
          width: obj.width * obj.scaleX,
          height: obj.height * obj.scaleY,
          sector_id: this.data.get('selected-sector-id')
        }
      };

      fetch('/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': document.querySelector("[name='csrf-token']").content
        },
        body: JSON.stringify(data)
      })
      .then(response => response.json())
      .then(data => {
        console.log("Article créé avec succès :", data);
      })
      .catch((error) => {
        console.error("Erreur lors de la création de l'article :", error);
      });
    });
  }
}
