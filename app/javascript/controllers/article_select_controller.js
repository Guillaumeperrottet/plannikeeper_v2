import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static values = {
    objetId: Number,
    secteurId: Number
  }

  connect() {
    console.log("ArticleSelectController connecté");

    // Charge les articles dans le sélecteur dès que le contrôleur est connecté
    this.loadArticlesForSelector();
  }

  loadArticlesForSelector() {
    const objetId = this.objetIdValue;  // Assure-toi que this.objetIdValue est défini
    const sectorId = this.secteurIdValue || localStorage.getItem('selectedSectorId');  // Priorité à secteurId dans Stimulus

    if (!objetId || !sectorId) {
      console.error("Objet ID ou Secteur ID manquant.");
      return;
    }

    const url = `/objets/${objetId}/secteurs/${sectorId}/articles`;

    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Erreur HTTP ! statut : ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        const articleSelector = document.getElementById('article-selector');
        articleSelector.innerHTML = '<option value="">Sélectionnez un article</option>';

        data.articles.forEach(article => {
          const option = document.createElement('option');
          option.value = article.id;
          option.textContent = article.title;
          articleSelector.appendChild(option);
        });

        console.log("Articles chargés dans le sélecteur :", data.articles);
      })
      .catch(error => {
        console.error("Erreur lors du chargement des articles :", error);
      });
  }

  selectArticle(event) {
    event.preventDefault(); // Empêche le comportement par défaut du sélecteur

    const articleId = event.target.value;
    const objetId = this.objetIdValue || this.data.get('objetId');  // Priorité à objetIdValue
    const secteurId = this.secteurIdValue || localStorage.getItem('selectedSectorId');  // Priorité à secteurIdValue

    console.log("Article ID:", articleId);
    console.log("Objet ID:", objetId);
    console.log("Secteur ID:", secteurId);

    if (articleId && objetId && secteurId) {
      window.location.href = `/objets/${objetId}/secteurs/${secteurId}/articles/${articleId}`;
    } else {
      console.error("Impossible de rediriger, Article ID, Objet ID ou Secteur ID manquant !");
    }
  }
}
