import { Controller } from "@hotwired/stimulus";

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
      document.body.dataset.selectedSectorId = sectorId; // Stocke l'ID dans un attribut 'data' global
<<<<<<< HEAD
      localStorage.setItem('selectedSectorId', sectorId); // Stocke l'ID du secteur dans localStorage
=======
>>>>>>> 2cbc6962e5d21ae5040baf60661564cfe97e5709
      console.log("Updated body dataset with selected-sector-id:", sectorId);
    } else {
      this.hideImage();
      document.body.dataset.selectedSectorId = ''; // Remets à zéro si aucun secteur n'est sélectionné
<<<<<<< HEAD
      localStorage.removeItem('selectedSectorId'); // Supprime du localStorage si aucun secteur n'est sélectionné
=======
>>>>>>> 2cbc6962e5d21ae5040baf60661564cfe97e5709
    }
  }


  restoreSelection() {
    // Vérifie si un secteur est stocké dans localStorage
    const selectedSectorId = localStorage.getItem('selectedSectorId') || this.data.get('selectedSectorId');
    console.log('Restoring selection for Sector ID:', selectedSectorId);

    if (selectedSectorId) {
      this.sectorSelectTarget.value = selectedSectorId;
      this.loadImage(selectedSectorId); // Charge l'image pour le secteur restauré
    } else {
      this.hideImage(); // Cache l'image si aucun secteur n'est sélectionné
    }
  }


  loadImage(sectorId) {
    const objetId = this.data.get('objetId'); // Assure-toi que `objetId` est récupéré une seule fois

    console.log('Loading image for Sector ID:', sectorId);
    console.log('Objet ID:', objetId);

    if (sectorId && objetId) {
      const url = `/objets/${objetId}/secteurs/${sectorId}/image`;
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
            this.loadArticles(sectorId); // Appelle loadArticles après avoir chargé l'image
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
      image.style.display = 'block'; // Affiche l'image

      console.log("Preparing to dispatch 'imageLoaded' event");
      console.log("Image element:", image);
      console.log("Image element src:", image.src);
      console.log("Image element display style:", image.style.display);

      setTimeout(() => {
        console.log("Image loaded and displayed after delay");
        const event = new CustomEvent('imageLoaded', { detail: { imageElement: image } });
        window.dispatchEvent(event);
      }, 500); // 500 ms de délai pour laisser l'image se charger
    } else {
      this.hideImage();
    }
  }

  hideImage() {
    if (this.sectorImageTarget) {
      this.sectorImageTarget.style.display = 'none'; // Cache l'image
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

    // Attendre que Fabric.js soit initialisé avant d'ajouter les articles
    if (!window.canvas || !window.canvas.initialized) {
      console.error("Canvas is not initialized. Waiting for 'canvasReady' event.");
      return;
    }

    console.log(`Loading articles for sector: ${sectorId} and object: ${objetId}`);

    fetch(`/objets/${objetId}/secteurs/${sectorId}/articles`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log("Articles loaded:", data.articles);

        if (!data.articles || data.articles.length === 0) {
          console.log("No articles to load.");
          return;
        }

        // Ajoute chaque article au canevas
        data.articles.forEach(article => {
          console.log("Adding article to canvas:", article);

          const rect = new fabric.Rect({
            left: article.position_x,
            top: article.position_y,
            width: article.width,
            height: article.height,
            fill: 'rgba(0, 255, 0, 0.5)',
            stroke: 'green',
            strokeWidth: 2,
          });

          window.canvas.add(rect); // Ajoute le rectangle au canevas
          window.canvas.renderAll(); // Rafraîchir le canevas après ajout
        });
      })
      .catch(error => {
        console.error("Erreur lors du chargement des articles :", error);
      });
  }
}
