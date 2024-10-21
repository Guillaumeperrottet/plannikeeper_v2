import { Controller } from "@hotwired/stimulus";
import PinchZoom from "pinch-zoom";

export default class extends Controller {
  static targets = ["imageContainer", "image"];  // Déclare les cibles

  connect() {
    console.log("PinchZoom controller connected");

    // Observer les changements dans l'imageContainer
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          // Si l'image a changé, on initialise PinchZoom
          this.initializePinchZoom();
        }
      });
    });

    // Démarrer l'observation des enfants dans l'élément imageContainer
    observer.observe(this.imageContainerTarget, {
      childList: true,
    });

    // Initialisation si l'image est déjà chargée
    if (this.imageTarget.complete) {
      this.initializePinchZoom();
    }
  }

  initializePinchZoom() {
    const el = this.element.querySelector("img");

    if (el) {
      console.log("Initializing PinchZoom for", el);

      // Initialiser PinchZoom pour l'image sélectionnée
      const pz = new PinchZoom(el, {
        draggableUnzoomed: true,
        minZoom: 1,
        maxZoom: 5,
        tapZoomFactor: 2,
        zoomOutFactor: 1.5,
        animationDuration: 300
      });

      // Écouter l'événement de zoom pour empêcher le recentrage automatique
      pz.on('zoomUpdate', (event) => {
        const { scale, x, y } = event;

        // Garder l'image centrée sur le point de zoom
        console.log("Zoom updated:", scale, x, y);

        // Empêcher le zoom excessif qui pourrait renvoyer l'image à l'origine
        if (scale > pz.options.maxZoom) {
          pz.zoomTo(pz.options.maxZoom);
        }
      });

    } else {
      console.error("Image element not found for PinchZoom!");
    }
  }
}
