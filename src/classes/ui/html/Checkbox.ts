type CheckBoxOptions = {
  id?: string;
  className?: string;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
};

export class CheckBox {
  container: HTMLElement;
  private checkBox: HTMLInputElement;

  constructor(text: string, options: CheckBoxOptions = {}) {
    const { id, className, defaultChecked = false, onChange } = options;

    const divContainer = document.createElement("div");
    divContainer.className = className ?? "checkbox-container";

    const checkBoxId = id ?? `checkbox-${Math.random().toString(36).slice(2)}`;

    const label = document.createElement("label");
    label.textContent = text;
    label.setAttribute("for", checkBoxId);
    label.classList.add("checkbox-label");

    const checkBox = document.createElement("input");
    checkBox.type = "checkbox";
    checkBox.id = checkBoxId;
    checkBox.checked = defaultChecked;

    checkBox.addEventListener("change", () => {
      onChange?.(checkBox.checked);
    });

    divContainer.append(label, checkBox);

    this.container = divContainer;
    this.checkBox = checkBox;
  }

  get checked(): boolean {
    return this.checkBox.checked;
  }

  set checked(value: boolean) {
    this.checkBox.checked = value;
  }
}
