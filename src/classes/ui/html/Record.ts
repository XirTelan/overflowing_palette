export class Record {
  container: HTMLElement;
  value: HTMLElement;

  constructor(
    text: string,
    value: string,
    containerClass: string,
    labelClass: string,
    valueClass: string
  ) {
    const container = document.createElement("div");
    container.classList.add(containerClass);

    const label = document.createElement("label");
    label.classList.add(labelClass);
    label.textContent = text;

    const textValue = document.createElement("p");
    textValue.classList.add(valueClass);
    textValue.textContent = value;

    container.appendChild(label);
    container.appendChild(textValue);

    this.value = textValue;
    this.container = container;
  }
}
