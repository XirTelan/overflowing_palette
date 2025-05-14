export class OptionFolder {
  container: HTMLElement;
  content: HTMLDivElement;

  constructor(title: string, icon?: string) {
    const container = document.createElement("section");
    container.classList.add("option-folder");

    const titleElement = document.createElement("div");
    titleElement.className = "option-folder__title folder-title";

    const textElement = document.createElement("h2");
    textElement.classList.add("folder-title__text");
    textElement.textContent = title;

    titleElement.appendChild(textElement);

    if (icon) {
      const iconElement = document.createElement("div");
      iconElement.classList.add("folder-title__icon");
      iconElement.setAttribute("icon", icon);
      titleElement.appendChild(iconElement);
    }

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
