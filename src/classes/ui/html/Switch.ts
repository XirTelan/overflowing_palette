type SwitchOptionProp = {
  text: string;
  value: string;
};

export class Switch {
  container: HTMLElement;
  radios: HTMLInputElement[] = [];

  constructor(
    leftProps: SwitchOptionProp,
    rightProps: SwitchOptionProp,
    onChange: (state: string) => void
  ) {
    const container = document.createElement("div");
    container.className = "switch-container";

    const left = this.createOption(leftProps.text, leftProps.value, onChange);
    const right = this.createOption(
      rightProps.text,
      rightProps.value,
      onChange
    );
    this.radios.push(left.radio, right.radio);
    this.radios[0].checked = true;

    container.appendChild(left.label);
    container.appendChild(right.label);
    this.container = container;
  }

  createOption(text: string, value: string, onChange: (state: string) => void) {
    const label = document.createElement("label");
    label.className = "switch__option";
    const radio = document.createElement("input");
    radio.setAttribute("type", "radio");
    radio.setAttribute("name", "radio-export");
    radio.setAttribute("value", value);
    radio.checked = false;
    label.textContent = text;
    label.prepend(radio);
    radio.addEventListener("change", function () {
      if (this.checked) onChange(this.value);
    });
    return { label, radio };
  }
}
