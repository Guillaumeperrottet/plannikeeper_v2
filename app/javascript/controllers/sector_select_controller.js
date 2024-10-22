import { Controller } from "@hotwired/stimulus";
import PinchZoom from "pinch-zoom";

export default class extends Controller {
  connect() {
    console.log('sector select Controller connected');

    this.sectorSelectTarget = document.querySelector('[data-sector-select-target="sectorSelect"]');
    this.sectorImageTarget = document.querySelector('[data-sector-select-target="sectorImage"]');

    console.log('Sector Select Target:', this.sectorSelectTarget);
    console.log('Sector Image Target:', this.sectorImageTarget);

    if (this.sectorSelectTarget) {
      this.sectorSelectTarget.addEventListener('change', (event) => this.handleSectorChange(event));
      this.restoreSelection();
    }

    // Écouter l'événement pour savoir quand le canevas est prêt
    window.addEventListener('canvasReady', (event) => {
      console.log("Canvas is ready, loading articles if needed.");
      const sectorId = document.body.dataset.selectedSectorId;
      const objetId = this.element.dataset.sectorSelectObjetId;
      if (sectorId && objetId) {
        this.loadArticles(sectorId);
      }
    });
  }

  handleSectorChange(event) {
    const sectorId = event.target.value;
    console.log("Selected Sector ID from navbar:", sectorId);

    if (sectorId) {
      this.loadImage(sectorId);
      document.body.dataset.selectedSectorId = sectorId;
      localStorage.setItem('selectedSectorId', sectorId);
      console.log("Updated body dataset with selected-sector-id:", sectorId);
    } else {
      this.hideImage();
      document.body.dataset.selectedSectorId = '';
      localStorage.removeItem('selectedSectorId');
    }
  }

  restoreSelection() {
    let selectedSectorId = localStorage.getItem('selectedSectorId');

    if (selectedSectorId) {
      // Restaure la sélection si elle existe dans le localStorage
      console.log('Restoring selection for Sector ID:', selectedSectorId);
      this.sectorSelectTarget.value = selectedSectorId;
      this.loadImage(selectedSectorId);
    } else {
      // Sélection automatique du premier secteur si aucune sélection précédente
      const firstSectorOption = this.sectorSelectTarget.options[1]; // options[0] est généralement "Sélectionner un secteur", donc on prend options[1]

      if (firstSectorOption) {
        selectedSectorId = firstSectorOption.value;
        console.log('Automatically selecting the first sector:', selectedSectorId);
        this.sectorSelectTarget.value = selectedSectorId;
        this.loadImage(selectedSectorId);

        // Stocker la sélection automatique dans le localStorage pour la prochaine fois
        localStorage.setItem('selectedSectorId', selectedSectorId);
      } else {
        this.hideImage(); // S'il n'y a pas de secteurs disponibles
      }
    }
  }

  loadImage(sectorId) {
    const objetId = this.data.get('objetId');

    console.log('Loading image for Sector ID:', sectorId);
    console.log('Objet ID:', objetId);

    if (sectorId && objetId) {
      const url = `/objets/${objetId}/secteurs/${sectorId}/image`;
      console.log("Fetching image from URL:", url);
      fetch(url)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
          }
          return response.json();
        })
        .then(data => {
          console.log('Data received:', data);
          if (data.image_url) {
            this.showImage(data.image_url);
            this.loadArticles(sectorId);
          } else {
            this.hideImage();
          }
        })
        .catch(error => {
          console.error('Fetch operation problem:', error);
          this.hideImage();
        });
    } else {
      this.hideImage();
    }
  }

  showImage(imageUrl) {
    const image = this.sectorImageTarget;
    if (imageUrl) {
      image.src = imageUrl;
      image.style.display = 'block';

      setTimeout(() => {
        console.log("Image loaded and displayed after delay");

        // Initialisation du canevas après le zoom
        const event = new CustomEvent('imageLoaded', { detail: { imageElement: image } });
        window.dispatchEvent(event);
      }, 500);
    } else {
      this.hideImage();
    }
  }

  hideImage() {
    if (this.sectorImageTarget) {
      this.sectorImageTarget.style.display = 'none';
    } else {
      console.error('sectorImageTarget est undefined, impossible de cacher l\'image.');
    }
  }

  loadArticles(sectorId) {
    const objetId = this.element.dataset.sectorSelectObjetId;
    console.log("Loading articles for sector:", sectorId, "and object:", objetId);

    if (!objetId || !sectorId) {
      console.error("Objet ID or Sector ID is missing.");
      return;
    }

    if (!window.canvas || !window.canvas.initialized) {
      console.error("Canvas is not initialized. Waiting for 'canvasReady' event.");
      return;
    }

    const url = `/objets/${objetId}/secteurs/${sectorId}/articles`;
    console.log("Fetching articles from URL:", url);
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log("Articles loaded from server:", data.articles);

        const canvasWidth = window.canvas.width;
        const canvasHeight = window.canvas.height;

        data.articles.forEach(article => {
          console.log("Adding article to canvas:", article);

          const left = parseFloat(article.position_x) * canvasWidth;
          const top = parseFloat(article.position_y) * canvasHeight;
          const width = parseFloat(article.width) * canvasWidth;
          const height = parseFloat(article.height) * canvasHeight;

          if (width > 0 && height > 0) {
            console.log(`Calculated dimensions: left=${left}, top=${top}, width=${width}, height=${height}`);

            const rect = new fabric.Rect({
              left: left,
              top: top,
              width: width,
              height: height,
              fill: 'transparent',
              stroke: 'transparent',
              strokeWidth: 2,
            });

            window.canvas.add(rect);
            window.canvas.renderAll();
          } else {
            console.warn(`Skipping article with invalid dimensions: left=${left}, top=${top}, width=${width}, height=${height}`);
          }
        });
      })
      .catch(error => {
        console.error("Erreur lors du chargement des articles :", error);
      });
  }

  initializePinchZoom(imageElement) {
    const pinchZoomInstance = new PinchZoom(imageElement, {
      zoomOutFactor: 1.3,
      minZoom: 0.8,
      maxZoom: 3,
      draggableUnzoomed: true
    });

    console.log("PinchZoom initialized", pinchZoomInstance);

    // Mettre à jour le canevas lorsqu'il y a un changement de zoom ou de déplacement
    imageElement.addEventListener('transform', () => {
      const scale = pinchZoomInstance.zoomFactor;
      const offsetX = pinchZoomInstance.offset.x;
      const offsetY = pinchZoomInstance.offset.y;

      console.log("Zoom factor updated:", scale);
      console.log("Offset X and Y:", offsetX, offsetY);

      // Appel à Fabric Controller pour appliquer les transformations sur le canvas
      const fabricController = this.application.getControllerForElementAndIdentifier(
        document.querySelector('[data-controller="fabric"]'),
        'fabric'
      );

      if (fabricController) {
        fabricController.updateCanvasTransform(scale, offsetX, offsetY);
      }
    });
  }


}


// ------------------------------------------------

// import { Controller } from "@hotwired/stimulus";
// import PinchZoom from "pinch-zoom";

// export default class extends Controller {
//   connect() {
//     console.log('sector select Controller connected');

//     this.sectorSelectTarget = document.querySelector('[data-sector-select-target="sectorSelect"]');
//     this.sectorImageTarget = document.querySelector('[data-sector-select-target="sectorImage"]');

//     console.log('Sector Select Target:', this.sectorSelectTarget);
//     console.log('Sector Image Target:', this.sectorImageTarget);

//     if (this.sectorSelectTarget) {
//       this.sectorSelectTarget.addEventListener('change', (event) => this.handleSectorChange(event));
//       this.restoreSelection();
//     }

//     // Écouter l'événement pour savoir quand le canevas est prêt
//     window.addEventListener('canvasReady', (event) => {
//       console.log("Canvas is ready, loading articles if needed.");
//       const sectorId = document.body.dataset.selectedSectorId;
//       const objetId = this.element.dataset.sectorSelectObjetId;
//       if (sectorId && objetId) {
//         this.loadArticles(sectorId);
//       }
//     });
//   }

//   handleSectorChange(event) {
//     const sectorId = event.target.value;
//     console.log("Selected Sector ID from navbar:", sectorId);

//     if (sectorId) {
//       this.loadImage(sectorId);
//       document.body.dataset.selectedSectorId = sectorId;
//       localStorage.setItem('selectedSectorId', sectorId);
//       console.log("Updated body dataset with selected-sector-id:", sectorId);
//     } else {
//       this.hideImage();
//       document.body.dataset.selectedSectorId = '';
//       localStorage.removeItem('selectedSectorId');
//     }
//   }

//   restoreSelection() {
//     const selectedSectorId = localStorage.getItem('selectedSectorId') || this.data.get('selectedSectorId');
//     console.log('Restoring selection for Sector ID:', selectedSectorId);

//     if (selectedSectorId) {
//       this.sectorSelectTarget.value = selectedSectorId;
//       this.loadImage(selectedSectorId);
//     } else {
//       this.hideImage();
//     }
//   }

//   loadImage(sectorId) {
//     const objetId = this.data.get('objetId');

//     console.log('Loading image for Sector ID:', sectorId);
//     console.log('Objet ID:', objetId);

//     if (sectorId && objetId) {
//       const url = `/objets/${objetId}/secteurs/${sectorId}/image`;
//       console.log("Fetching image from URL:", url);
//       fetch(url)
//         .then(response => {
//           if (!response.ok) {
//             throw new Error(`Network response was not ok: ${response.statusText}`);
//           }
//           return response.json();
//         })
//         .then(data => {
//           console.log('Data received:', data);
//           if (data.image_url) {
//             this.showImage(data.image_url);
//             this.loadArticles(sectorId);
//           } else {
//             this.hideImage();
//           }
//         })
//         .catch(error => {
//           console.error('Fetch operation problem:', error);
//           this.hideImage();
//         });
//     } else {
//       this.hideImage();
//     }
//   }

//   showImage(imageUrl) {
//     const image = this.sectorImageTarget;
//     if (imageUrl) {
//       image.src = imageUrl;
//       image.style.display = 'block';

//       setTimeout(() => {
//         console.log("Image loaded and displayed after delay");

//         // Initialiser PinchZoom ici
//         this.initializePinchZoom(image);

//         // Initialisation du canevas après le zoom
//         const event = new CustomEvent('imageLoaded', { detail: { imageElement: image } });
//         window.dispatchEvent(event);
//       }, 500);
//     } else {
//       this.hideImage();
//     }
//   }

//   hideImage() {
//     if (this.sectorImageTarget) {
//       this.sectorImageTarget.style.display = 'none';
//     } else {
//       console.error('sectorImageTarget est undefined, impossible de cacher l\'image.');
//     }
//   }

//   initializePinchZoom(imageElement) {
//     // Initialisation de PinchZoom sans écoute d'événements
//     const pinchZoomInstance = new PinchZoom(imageElement, {
//       zoomOutFactor: 1.3,
//       minZoom: 0.8,
//       maxZoom: 3,
//       draggableUnzoomed: true
//     });

//     console.log("PinchZoom initialized", pinchZoomInstance);

//     // Écouteur sur la transformation de l'image (style transform)
//     imageElement.addEventListener('transform', () => {
//       const scale = pinchZoomInstance.zoomFactor; // Obtenir le facteur de zoom actuel
//       console.log("Zoom factor updated:", scale);

//       // Mettre à jour le canevas avec le facteur de zoom
//       const canvasController = this.application.getControllerForElementAndIdentifier(
//         document.querySelector('[data-controller="fabric"]'),
//         'fabric'
//       );

//       if (canvasController) {
//         canvasController.canvas.setZoom(scale);
//         canvasController.canvas.renderAll();
//       }
//     });
//   }

//   loadArticles(sectorId) {
//     const objetId = this.element.dataset.sectorSelectObjetId;
//     console.log("Loading articles for sector:", sectorId, "and object:", objetId);

//     if (!objetId || !sectorId) {
//       console.error("Objet ID or Sector ID is missing.");
//       return;
//     }

//     if (!window.canvas || !window.canvas.initialized) {
//       console.error("Canvas is not initialized. Waiting for 'canvasReady' event.");
//       return;
//     }

//     const url = `/objets/${objetId}/secteurs/${sectorId}/articles`;
//     console.log("Fetching articles from URL:", url);
//     fetch(url)
//       .then(response => {
//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }
//         return response.json();
//       })
//       .then(data => {
//         console.log("Articles loaded from server:", data.articles);

//         const canvasWidth = window.canvas.width;
//         const canvasHeight = window.canvas.height;

//         data.articles.forEach(article => {
//           console.log("Adding article to canvas:", article);

//           const left = parseFloat(article.position_x) * canvasWidth;
//           const top = parseFloat(article.position_y) * canvasHeight;
//           const width = parseFloat(article.width) * canvasWidth;
//           const height = parseFloat(article.height) * canvasHeight;

//           if (width > 0 && height > 0) {
//             console.log(`Calculated dimensions: left=${left}, top=${top}, width=${width}, height=${height}`);

//             const rect = new fabric.Rect({
//               left: left,
//               top: top,
//               width: width,
//               height: height,
//               fill: 'transparent',
//               stroke: 'transparent',
//               strokeWidth: 2,
//             });

//             window.canvas.add(rect);
//             window.canvas.renderAll();
//           } else {
//             console.warn(`Skipping article with invalid dimensions: left=${left}, top=${top}, width=${width}, height=${height}`);
//           }
//         });
//       })
//       .catch(error => {
//         console.error("Erreur lors du chargement des articles :", error);
//       });
//   }
// }
