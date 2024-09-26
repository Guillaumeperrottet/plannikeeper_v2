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
    if (sectorId) {
      this.loadImage(sectorId);
      this.element.dataset.selectedSectorId = sectorId; // Stocke la sélection dans un attribut de données
    } else {
      this.hideImage();
      this.element.dataset.selectedSectorId = '';
    }
  }

  restoreSelection() {
    const selectedSectorId = this.data.get('selectedSectorId');
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
