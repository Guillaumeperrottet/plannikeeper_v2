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
  }

  handleSectorChange(event) {
    const sectorId = event.target.value;
    console.log("Selected Sector ID from navbar:", sectorId);

    if (sectorId) {
      this.loadImage(sectorId);
      document.body.dataset.selectedSectorId = sectorId; // Stocke l'ID dans un attribut 'data' global
      localStorage.setItem('selectedSectorId', sectorId); // Stocke l'ID du secteur dans localStorage
      console.log("Updated body dataset with selected-sector-id:", sectorId);
    } else {
      this.hideImage();
      document.body.dataset.selectedSectorId = ''; // Remets à zéro si aucun secteur n'est sélectionné
      localStorage.removeItem('selectedSectorId'); // Supprime du localStorage si aucun secteur n'est sélectionné
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
    const objetId = this.data.get('objetId');

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
}
