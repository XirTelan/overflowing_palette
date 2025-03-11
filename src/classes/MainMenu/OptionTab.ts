export class OptionTab {
  constructor(
    key,
    btnText,
    btnContainer: HTMLDivElement,
    tabsContainer: HTMLDivElement
  ) {
    const btn = this.createButton(btnText);
    const tab = this.createTab();
    btnContainer.appendChild(btn);
    tabsContainer.append(tab);
  }
  createButton(text: string) {
    const btn = document.createElement("button");
    btn.textContent = text;
    btn.classList.add("option-tab__button");
    return btn;
  }
  createTab() {
    const tab = document.createElement("div");
    tab.classList.add("option-tab");
    return tab;
  }
}
