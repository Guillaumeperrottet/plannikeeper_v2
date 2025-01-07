import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["tabContent", "tabLinks"];

  connect() {
    // console.log("Panel Tab Controller connected.");
    // console.log("Tab links targets:", this.tabLinksTargets); // Vérifie si les boutons d'onglet sont trouvés
    // console.log("Tab content targets:", this.tabContentTargets); // Vérifie si le contenu des onglets est trouvé
    this.showTab("todo"); // Par défaut, affiche l'onglet TODO
  }

  // Méthode pour afficher un onglet spécifique
  openTab(event) {
    const tabName = event.currentTarget.dataset.tab;
    // console.log("Tab clicked:", event.currentTarget.dataset.tab); // Ajoute ce log pour vérifier quel onglet est cliqué


    // Cacher tous les contenus des onglets
    this.tabContentTargets.forEach((tabContent) => {
      tabContent.style.display = "none";
    });

    // Enlever la classe 'active' de tous les onglets
    this.tabLinksTargets.forEach((tabLink) => {
      tabLink.classList.remove("active");
    });

    // Afficher le contenu de l'onglet sélectionné et ajouter la classe 'active' au lien
    const selectedTab = this.tabContentTargets.find(
      (content) => content.dataset.tabContent === tabName
    );
    if (selectedTab) {
      selectedTab.style.display = "block";
      // console.log("Displaying tab content:", tabName); // Ajout d'un log pour voir si le contenu s'affiche correctement
    } else {
      console.error("Selected tab content not found:", tabName); // Message d'erreur si l'onglet n'est pas trouvé
    }

    event.currentTarget.classList.add("active");
  }

  // Méthode pour afficher un onglet par défaut
  showTab(tabName) {
    const selectedTab = this.tabContentTargets.find(
      (content) => content.dataset.tabContent === tabName
    );
    if (selectedTab) {
      selectedTab.style.display = "block";
      this.tabLinksTargets.forEach((tabLink) => {
        if (tabLink.dataset.tab === tabName) {
          tabLink.classList.add("active");
        }
      });
    }
  }
}
