export class OptionSelector {
  container;
  value: number;
  options: string[];
  isCycle: boolean;

  leftBtn: HTMLButtonElement;
  rightBtn: HTMLButtonElement;
  text: HTMLSpanElement;

  constructor(
    text: string,
    defaultValue: number,
    options: string[],
    isCycle: boolean,
    onChange: (value: number) => void
  ) {
    this.container = document.createElement("div");
    this.container.classList.add("value-selector");
    this.value = defaultValue;
    this.options = options;
    this.isCycle = isCycle;

    const label = document.createElement("span");
    label.classList.add("value-selector__label");
    label.textContent = text;

    const inputWrapper = document.createElement("div");
    inputWrapper.classList.add("value-selector__input-wrapper");

    const leftBtn = this.createButton();
    leftBtn.classList.add("value-selector__button--left");

    leftBtn.addEventListener("click", () => {
      this.back();
      this.update();
      onChange(this.value);
    });

    const value = document.createElement("span");
    value.classList.add("value-selector__value");
    value.textContent = String(this.options[defaultValue]);

    const rightBtn = this.createButton();
    rightBtn.addEventListener("click", () => {
      this.forward();
      this.update();
      onChange(this.value);
    });

    this.leftBtn = leftBtn;
    this.rightBtn = rightBtn;
    this.text = value;

    inputWrapper.appendChild(leftBtn);
    inputWrapper.appendChild(value);
    inputWrapper.appendChild(rightBtn);

    this.container.appendChild(label);
    this.container.appendChild(inputWrapper);

    this.update();
  }
  private createButton() {
    const btn = document.createElement("button");
    btn.classList.add("value-selector__button");
    const icon = document.createElement("div");
    icon.classList.add("icon");
    btn.appendChild(icon);
    return btn;
  }

  update() {
    this.rightBtn.disabled =
      !this.isCycle && this.value === this.options.length - 1;

    this.leftBtn.disabled = !this.isCycle && this.value === 0;
    this.text.textContent = this.options[this.value];
  }
  private getValue(value: number) {
    const len = this.options.length - 1;

    if (this.isCycle) return (value + len) % len;
    else return Phaser.Math.Clamp(value, 0, len);
  }
  forward() {
    this.value = this.getValue(this.value + 1);
  }
  back() {
    this.value = this.getValue(this.value - 1);
  }
}
