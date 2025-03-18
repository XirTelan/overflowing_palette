export class RangeSlider {
  container;
  value: number;

  text: HTMLSpanElement;
  valueText: HTMLElement;
  input: HTMLInputElement;

  constructor(
    text: string,
    defaultValue: number,
    from: number,
    to: number,
    onChange: (value: number) => void
  ) {
    this.container = document.createElement("div");
    this.container.classList.add("value-selector");
    this.value = defaultValue;

    const label = document.createElement("span");
    label.classList.add("value-selector__label");
    label.textContent = text;

    const inputWrapper = document.createElement("div");
    inputWrapper.classList.add("range-slider");

    const value = document.createElement("span");
    value.classList.add("range-slider__value");
    value.textContent = String(defaultValue);

    const input = document.createElement("input");
    input.setAttribute("type", "range");
    input.setAttribute("min", `${from}`);
    input.setAttribute("max", `${to}`);
    input.value = String(defaultValue);
    input.className = "range-slider__input";
    input.addEventListener("input", (e) => {
      const target = e.target as HTMLInputElement;
      this.update(Number(target.value));
      onChange(Number(target.value));
    });
    this.input = input;
    this.text = value;

    inputWrapper.appendChild(input);
    inputWrapper.appendChild(value);

    this.container.appendChild(label);
    this.container.appendChild(inputWrapper);
    this.update(defaultValue);
  }

  update(newValue: number) {
    this.text.textContent = String(newValue);
    console.log();

    this.input.style.background = `linear-gradient(to right, var( --clr-slider) ${newValue}%, #e0e0e0 ${newValue}%)`;
  }
}
