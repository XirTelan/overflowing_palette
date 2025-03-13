export class OptionFolder {
  container: HTMLElement;
  content: HTMLDivElement;

  constructor(title: string) {
    const container = document.createElement("section");
    container.classList.add("option-folder");

    const titleElement = document.createElement("h2");
    titleElement.classList.add("option-folder__title");
    titleElement.textContent = title;

    const contentContainer = document.createElement("div");
    contentContainer.classList.add("option-folder__content");
    this.content = contentContainer;

    container.appendChild(titleElement);
    container.appendChild(contentContainer);
    this.container = container;
  }

  add(elemnt: Node) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("folder-content__item");
    wrapper.appendChild(elemnt);
    this.content.appendChild(wrapper);
  }
}
