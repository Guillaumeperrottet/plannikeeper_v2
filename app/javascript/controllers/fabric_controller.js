import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["canvas"]

  connect() {
    this.canvas = new fabric.Canvas(this.canvasTarget.id);
    console.log("Fabric.js initialized");

      // Écouter l'événement pour ajuster la taille du canevas une fois l'image chargée
    window.addEventListener('imageLoaded', (event) => {
      console.log("Event 'imageLoaded' captured");
    this.adjustCanvasSize(event.detail.imageElement);
  });

    // Appel de la méthode pour ajuster la taille du canevas en fonction de l'image
    this.adjustCanvasSize();

    this.canvas.on('mouse:move', function(event) {
      console.log('Mouse moving on canvas');
    });

    // Désactiver le comportement par défaut des événements de la souris sur le canevas
    ['mousedown', 'mouseup', 'mousemove', 'dragstart'].forEach(eventName => {
      this.canvasTarget.addEventListener(eventName, (event) => {
        event.preventDefault();
        event.stopPropagation();
      });
    });

    this.isDrawing = false;
  }

  adjustCanvasSize(imgElement) {
    const canvasEl = this.canvasTarget;

    if (imgElement) {
      console.log("Image element found in fabric_controller:", imgElement);
      console.log("Image element src:", imgElement.src);
      console.log("Image element display style:", imgElement.style.display);
      console.log("Image element width:", imgElement.clientWidth);
      console.log("Image element height:", imgElement.clientHeight);

      const imgWidth = imgElement.clientWidth;
      const imgHeight = imgElement.clientHeight;

      if (imgWidth === 0 || imgHeight === 0) {
        console.log("Image dimensions are not set correctly yet.");
        return;
      }

      // Ajuster la taille du canevas
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

      console.log("Canvas and container size adjusted:", imgWidth, imgHeight);
    } else {
      console.log("Image element still not found in fabric_controller.");
    }
  }



  resizeCanvas(imgElement, canvasEl) {
    const imgWidth = imgElement.clientWidth;
    const imgHeight = imgElement.clientHeight;

    // Ajuster la taille du canevas
    canvasEl.width = imgWidth;
    canvasEl.height = imgHeight;

    // Appliquer la taille à Fabric.js
    this.canvas.setWidth(imgWidth);
    this.canvas.setHeight(imgHeight);

    // Ajouter l'image comme arrière-plan dans Fabric.js
    fabric.Image.fromURL(imgElement.src, (img) => {
      img.set({
        left: 0,
        top: 0,
        scaleX: imgWidth / img.width,
        scaleY: imgHeight / img.height
      });
      this.canvas.setBackgroundImage(img, this.canvas.renderAll.bind(this.canvas));
    });

    console.log("Canvas size adjusted:", imgWidth, imgHeight);
  }

  activateDrawing() {
    this.isDrawing = true;
    this.canvas.isDrawingMode = true;
    this.canvas.freeDrawingBrush.color = "red";
    this.canvas.freeDrawingBrush.width = 5;

    this.canvasTarget.style.pointerEvents = 'auto';
    console.log("Drawing mode activated");
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
