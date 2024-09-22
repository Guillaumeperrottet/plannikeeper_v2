import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  connect() {
    console.log("ArticleController is connected!");
    this.canvas = new fabric.Canvas('canvas');
    this.loadImage();
    this.setupDrawing();
  }

  loadImage() {
    const imgElement = document.createElement('img');
    imgElement.src = document.querySelector('img.object-image').src; // Chemin de l'image de l'objet
    imgElement.onload = () => {
      const imgInstance = new fabric.Image(imgElement);
      imgInstance.set({
        left: 0,
        top: 0,
        selectable: false,
        evented: false
      });
      this.canvas.add(imgInstance);
      this.canvas.setBackgroundImage(imgInstance, this.canvas.renderAll.bind(this.canvas));
    };
  }

  setupDrawing() {
    this.canvas.on('mouse:down', (opt) => {
      const pointer = this.canvas.getPointer(opt.e);
      this.startX = pointer.x;
      this.startY = pointer.y;
      this.rect = new fabric.Rect({
        left: this.startX,
        top: this.startY,
        fill: 'rgba(255, 0, 0, 0.5)',
        width: 1,
        height: 1,
        selectable: false
      });
      this.canvas.add(this.rect);
    });

    this.canvas.on('mouse:move', (opt) => {
      if (!this.rect) return;
      const pointer = this.canvas.getPointer(opt.e);
      this.rect.set({
        width: Math.abs(pointer.x - this.startX),
        height: Math.abs(pointer.y - this.startY),
        left: Math.min(pointer.x, this.startX),
        top: Math.min(pointer.y, this.startY)
      });
      this.canvas.renderAll();
    });

    this.canvas.on('mouse:up', () => {
      this.canvas.off('mouse:move');
      this.canvas.off('mouse:up');

      const articleName = prompt("Entrez le nom de l'article :");
      if (articleName) {
        // Logique pour créer un nouvel article ici
        console.log(`Article créé : ${articleName}`);
      }

      // Réinitialiser la sélection
      this.rect = null;
    });
  }

  activateDrawing() {
    // Vous pouvez activer/désactiver le mode de dessin ici
    this.canvas.on('mouse:down', (opt) => { /* commence à dessiner */ });
    // Appeler les méthodes pour gérer le dessin
  }
}
