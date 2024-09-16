// sector_select_controller.js
import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  connect() {
    console.log('Controller connected');

    this.sectorSelectTarget = document.querySelector('[data-sector-select-target="sectorSelect"]');
    this.sectorImageTarget = document.querySelector('[data-sector-select-target="sectorImage"]');

    console.log('Sector Select Target:', this.sectorSelectTarget);
    console.log('Sector Image Target:', this.sectorImageTarget);

    if (this.sectorSelectTarget) {
      this.sectorSelectTarget.addEventListener('change', () => this.loadImage());
      this.restoreSelection();
    }
  }

  restoreSelection() {
    const selectedSectorId = this.data.get('selectedSectorId');
    console.log('Restoring selection for Sector ID:', selectedSectorId);
    if (selectedSectorId) {
      this.sectorSelectTarget.value = selectedSectorId;
      this.loadImage();
    }
  }

  loadImage() {
    const sectorId = this.sectorSelectTarget?.value;
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
      image.style.display = 'block';
    } else {
      this.hideImage();
    }
  }

  hideImage() {
    this.sectorImageTarget.style.display = 'none';
  }
}
