import React from "react";
import ReactDOM from "react-dom";
import AppartementCanvas from "./components/AppartementCanvas";

// Fonction pour monter le composant React sur un élément DOM
function renderAppartementCanvas(element, props) {
  ReactDOM.render(<AppartementCanvas {...props} />, element);
}

// Recherchez l'élément DOM où React doit être monté
document.addEventListener("DOMContentLoaded", () => {
  const element = document.getElementById("react-app");
  if (element) {
    const props = JSON.parse(element.dataset.props);
    renderAppartementCanvas(element, props);
  }
});
