export class CheckBox {
  container: HTMLElement;

  constructor(text: string, key: string) {
    const divContainer = document.createElement("div");
    divContainer.style =
      "display:flex;justify-content:space-between;align-items:center;padding:1rem;";

    const block = document.createElement("p");
    block.textContent = text;
    block.classList.add("checkbox_text");

    divContainer.append(block);

    const checkBox = document.createElement("input");
    const data = localStorage.getItem(key);
    if (data) {
      checkBox.checked = true;
    }
    divContainer.append(checkBox);
    checkBox.setAttribute("type", "checkbox");

    this.container = divContainer;
  }
}
