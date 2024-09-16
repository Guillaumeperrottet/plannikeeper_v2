import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["sectorSelect", "sectorImage"]

  connect() {
    // Assurez-vous que le sélecteur est initialisé correctement
    this.loadImage()
    // Ajouter un écouteur d'événements pour le changement de sélection
    this.sectorSelectTarget.addEventListener('change', () => this.loadImage())
  }

  loadImage() {
    const sectorId = this.sectorSelectTarget.value
    const objetId = this.data.get('objetId')

    if (sectorId && objetId) {
      const url = `/objets/${objetId}/secteurs/${sectorId}/image` // Utilisation des backticks pour l'interpolation
      fetch(url)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`)
          }
          return response.json()
        })
        .then(data => {
          console.log('Data received:', data)  // Pour vérifier les données reçues
          if (data.image_url) {
            this.showImage(data.image_url)
          } else {
            this.hideImage()
          }
        })
        .catch(error => {
          console.error('There was a problem with the fetch operation:', error)
          this.hideImage()  // Masquer l'image en cas d'erreur
        })
    } else {
      this.hideImage()
    }
  }

  showImage(imageUrl) {
    const image = this.sectorImageTarget
    if (imageUrl) {
      image.src = imageUrl
      image.style.display = 'block'
    } else {
      this.hideImage()
    }
  }

  hideImage() {
    this.sectorImageTarget.style.display = 'none'
  }
}
