import { Controller } from "@hotwired/stimulus";
import PinchZoom from "pinch-zoom";

export default class extends Controller {
  connect() {
    console.log('Sector Select Controller connected');

    // Récupère les éléments nécessaires
    this.sectorSelectTarget = document.querySelector('[data-sector-select-target="sectorSelect"]');
    this.sectorImageTarget = document.querySelector('[data-sector-select-target="sectorImage"]');

    console.log('Sector Select Target:', this.sectorSelectTarget);
    console.log('Sector Image Target:', this.sectorImageTarget);

    if (this.sectorSelectTarget) {
      // Restaure la sélection ou sélectionne automatiquement le premier secteur
      this.restoreSelection();

      // Ajoute un écouteur d'événement pour les changements dans le sélecteur
      this.sectorSelectTarget.addEventListener('change', (event) => this.handleSectorChange(event));
    }

    // Ajoute un écouteur d'événement pour savoir quand le canvas est prêt
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

    // Redirection de la page avec le secteur sélectionné en paramètre
    const objetId = this.data.get('objetId');
    window.location.href = `/objets/${objetId}?selected_sector_id=${sectorId}`;

    } else {
      this.hideImage();
      document.body.dataset.selectedSectorId = '';
      localStorage.removeItem('selectedSectorId');
    }
  }

  restoreSelection() {
    let selectedSectorId = localStorage.getItem('selectedSectorId');

    if (selectedSectorId) {
      // Restaure la sélection depuis le localStorage
      console.log('Restoring selection for Sector ID:', selectedSectorId);
      this.sectorSelectTarget.value = selectedSectorId;
      this.loadImage(selectedSectorId);
    } else {
      // Sélection automatique du premier secteur si aucune sélection existante
      const firstSectorOption = this.sectorSelectTarget.options[1]; // options[0] est "Choisir un secteur", donc on prend options[1]

      if (firstSectorOption) {
        selectedSectorId = firstSectorOption.value;
        console.log('Automatically selecting the first sector:', selectedSectorId);
        this.sectorSelectTarget.value = selectedSectorId;
        this.loadImage(selectedSectorId);

        // Stocker la sélection automatique dans le localStorage pour la prochaine fois
        localStorage.setItem('selectedSectorId', selectedSectorId);
      } else {
        this.hideImage(); // Aucun secteur disponible
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
          const radius = parseFloat(article.radius) * canvasWidth;  // Calcul du rayon relatif au canevas

          if (radius > 0) {
            console.log(`Calculated dimensions: left=${left}, top=${top}, radius=${radius}`);

            // Créer un cercle au lieu d'un rectangle
            const circle = new fabric.Circle({
              left: left,
              top: top,
              radius: radius,
              fill: 'transparent',
              stroke: 'transparent',
              strokeWidth: 2,
              originX: 'center',  // Centrer le cercle sur sa position
              originY: 'center',
              hoverCursor: 'pointer'
            });

            window.canvas.add(circle);
            window.canvas.renderAll();
          } else {
            console.warn(`Skipping article with invalid radius: left=${left}, top=${top}, radius=${radius}`);
          }
        });
      })
      .catch(error => {
        console.error("Erreur lors du chargement des articles :", error);
      });
  }
}
