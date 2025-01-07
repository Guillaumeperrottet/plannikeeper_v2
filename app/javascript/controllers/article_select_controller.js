import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static values = {
    objetId: Number,
    secteurId: Number
  }

  connect() {
    // console.log("ArticleSelectController connecté");

    // Charge les articles dans la liste dès que le contrôleur est connecté
    this.loadArticlesForList();

    // Écoute le clic sur le bouton du menu déroulant pour afficher/masquer la liste
    const dropdownBtn = document.getElementById('article-dropdown');
    dropdownBtn.addEventListener('click', this.toggleDropdown.bind(this));

    // Ajoute l'écouteur d'événements pour fermer la liste au clic à l'extérieur
    document.addEventListener('click', this.closeDropdownOnOutsideClick.bind(this));

    // Ajoute l'écouteur pour fermer la liste quand la souris quitte le dropdown
    const dropdownContent = document.getElementById('article-list');
    dropdownContent.addEventListener('mouseleave', this.closeDropdown.bind(this));
  }

  disconnect() {
    // Retire l'écouteur d'événements pour éviter les fuites de mémoire
    document.removeEventListener('click', this.closeDropdownOnOutsideClick.bind(this));
  }

  loadArticlesForList() {
    const objetId = this.objetIdValue;
    const sectorId = this.secteurIdValue || localStorage.getItem('selectedSectorId');

    if (!objetId || !sectorId) {
      // console.error("Objet ID ou Secteur ID manquant.");
      return;
    }

    const url = `/objets/${objetId}/secteurs/${sectorId}/articles`;

    fetch(url)
      .then(response => response.ok ? response.json() : Promise.reject(response))
      .then(data => {
        const articleList = document.getElementById('article-list');
        articleList.innerHTML = '';  // Vide la liste des articles précédents

        // Trier les articles en utilisant un tri naturel
        data.articles.sort((a, b) => a.title.localeCompare(b.title, undefined, { numeric: true, sensitivity: 'base' }));

        data.articles.forEach(article => {
          const articleItem = document.createElement('div');
          articleItem.className = 'dropdown-item';
          articleItem.textContent = article.title;
          articleItem.dataset.articleId = article.id;

          // Ajoute des événements de survol pour chaque article
          articleItem.addEventListener('mouseenter', () => {
            // console.log(`Mouse entered on article ID ${article.id}`);
            this.highlightArticle(article.id, true);
          });
          articleItem.addEventListener('mouseleave', () => {
            // console.log(`Mouse left article ID ${article.id}`);
            this.highlightArticle(article.id, false);
          });

          articleItem.addEventListener('click', () => {
            this.selectArticle(article.id);
          });

          articleList.appendChild(articleItem);
        });

        // console.log("Articles chargés et triés :", data.articles);
      })
      .catch(error => {
        // console.error("Erreur lors du chargement des articles :", error);
        alert("Une erreur s'est produite lors du chargement des articles. Veuillez réessayer.");
      });
  }

  toggleDropdown() {
    const articleList = document.getElementById('article-list');
    if (articleList.style.display === "block") {
      articleList.style.display = "none";
    } else {
      articleList.style.display = "block";
    }
  }

  closeDropdown() {
    const articleList = document.getElementById('article-list');
    articleList.style.display = "none";
  }

  closeDropdownOnOutsideClick(event) {
    const dropdownBtn = document.getElementById('article-dropdown');
    const articleList = document.getElementById('article-list');

    if (!dropdownBtn.contains(event.target) && !articleList.contains(event.target)) {
      this.closeDropdown();
    }
  }

  highlightArticle(articleId, isHovered) {
    // console.log(`highlightArticle appelé pour article ID ${articleId}, isHovered: ${isHovered}`);
    if (!articleId) return; // Ignorer si l'articleId est vide ou nul
    const articleCircle = window.canvas.getObjects().find(obj => obj.articleId === articleId);
    // Trouver l'élément de l'article dans la liste
    const articleItem = document.querySelector(`[data-article-id="${articleId}"]`);

    if (articleItem) {
      if (isHovered) {
        // Agrandir et mettre en gras lors du survol
        articleItem.style.fontWeight = 'normal';  // Met en gras
        articleItem.style.transform = 'scale(1.02)';  // Agrandit légèrement l'article
        articleItem.style.transition = 'transform 0.3s ease, font-weight 0.3s ease';  // Ajoute une transition
      } else {
        // Rétablir la taille et le poids normaux après le survol
        articleItem.style.fontWeight = 'normal';  // Revenir à la police normale
        articleItem.style.transform = 'scale(1)';  // Revenir à la taille normale
      }
    }

    if (articleCircle) {
      // console.log("Article trouvé sur le canevas :", articleCircle);
      if (isHovered) {
        // Agrandit le cercle sur le survol
        articleCircle.set({
          strokeWidth: 5,
          scaleX: 1.5,
          scaleY: 1.5,
          fill: 'rgba(0, 0, 0, 0.6)',  // Change la couleur de remplissage à une teinte plus foncée
          stroke: '#000'  // Change la couleur du contour
        });
      } else {
        // Restaure la taille normale du cercle après le survol
        articleCircle.set({
          strokeWidth: 2,
          scaleX: 1,
          scaleY: 1,
          fill: 'rgba(128, 128, 128, 0.1)',  // Restaure la couleur de remplissage initiale
          stroke: 'rgba(0, 0, 0, 0.2)'  // Restaure la couleur du contour initiale
        });
      }

      window.canvas.renderAll();  // Met à jour le canevas
    } else {
      // console.warn(`Article avec ID ${articleId} non trouvé sur le canevas.`);
    }
  }

  selectArticle(articleId) {
    const objetId = this.objetIdValue || this.data.get('objetId');
    const secteurId = this.secteurIdValue || localStorage.getItem('selectedSectorId');

    // console.log("Article ID:", articleId);
    // console.log("Objet ID:", objetId);
    // console.log("Secteur ID:", secteurId);

    if (articleId && objetId && secteurId) {
      window.location.href = `/objets/${objetId}/secteurs/${secteurId}/articles/${articleId}`;
    } else {
      // console.error("Impossible de rediriger, Article ID, Objet ID ou Secteur ID manquant !");
    }
  }
}
