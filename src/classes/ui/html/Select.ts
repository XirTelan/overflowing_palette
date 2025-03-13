export class Select {
  container: HTMLElement;
  constructor(
    text: string,
    defaultValue: string,
    options: string[],
    onChange: (e: Event) => void,
    values?: string[] | undefined
  ) {
    this.container = document.createElement("div");
    this.container.classList.add("select");

    const selectWrapper = document.createElement("div");
    selectWrapper.classList.add("select-wrapper");

    const selectInput = document.createElement("select");

    const label = document.createElement("label");
    label.textContent = text;
    label.classList.add("select__label");

    const icon = document.createElement("div");
    icon.classList.add("icon");

    selectWrapper.appendChild(selectInput);
    selectWrapper.appendChild(icon);

    this.container.appendChild(label);
    this.container.appendChild(selectWrapper);

    options.forEach((name, indx) => {
      const option = document.createElement("option");
      option.value = values ? values[indx] : name.toLowerCase();
      option.textContent = name;
      selectInput.appendChild(option);
    });

    selectInput.value = defaultValue;

    selectInput.addEventListener("change", onChange);
  }
}
