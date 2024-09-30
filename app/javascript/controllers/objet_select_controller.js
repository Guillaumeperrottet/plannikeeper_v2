import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  filterTasks(event) {
    const selectedObjectId = event.target.value;
    window.location.href = `/home?selected_objet_id=${selectedObjectId}`;
  }
}
