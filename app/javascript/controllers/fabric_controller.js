import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["canvas"]

  connect() {
    // Initialiser le canevas Fabric.js
    this.canvas = new fabric.Canvas(this.canvasTarget.id);
    window.canvas = this.canvas; // Option pour partager le canevas avec d'autres contrôleurs
    window.canvas.initialized = true; // Marqueur indiquant que le canevas est initialisé
    console.log("Fabric.js initialized");

    // Émettre un événement pour notifier que le canevas est prêt
    const canvasReadyEvent = new CustomEvent('canvasReady', { detail: { canvas: this.canvas } });
    window.dispatchEvent(canvasReadyEvent);

    // Écouter l'événement pour ajuster la taille du canevas une fois l'image chargée
    window.addEventListener('imageLoaded', (event) => {
      console.log("Event 'imageLoaded' captured");
      this.adjustCanvasSize(event.detail.imageElement);
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

  saveZone(event) {
    // Désactiver le bouton pour empêcher plusieurs enregistrements
    const saveButton = event.currentTarget;
    saveButton.disabled = true;

    const objetId = this.element.dataset.sectorSelectObjetId; // Récupère l'ID de l'objet depuis l'attribut 'data-sector-select-objet-id'
    const sectorId = document.body.dataset.selectedSectorId || localStorage.getItem('selectedSectorId'); // Récupère l'ID du secteur sélectionné, depuis localStorage ou body.dataset

    console.log("Objet ID:", objetId);
    console.log("Sector ID:", sectorId);

    if (!objetId || !sectorId) {
      console.error("Objet ID or Sector ID is missing.");
      saveButton.disabled = false;
      return;
    }

    const objects = this.canvas.getObjects();

    if (objects.length === 0) {
      console.error("No objects to save.");
      saveButton.disabled = false;
      return;
    }

    // Prenons uniquement le premier objet, si tu veux enregistrer un seul article
    const obj = objects[0];

    const data = {
      article: {
        position_x: obj.left,
        position_y: obj.top,
        width: obj.width * obj.scaleX,
        height: obj.height * obj.scaleY,
        title: "Default Title",
        description: "Default Description",
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
      this.canvas.clear(); // Effacer le canevas après la sauvegarde
    })
    .catch((error) => {
      console.error("Erreur lors de la création de l'article :", error);
    })
    .finally(() => {
      saveButton.disabled = false; // Réactiver le bouton après l'enregistrement
    });
  }
}
