export class OptionTab {
  key: string;
  private btn: HTMLButtonElement;
  protected tab: HTMLDivElement;
  constructor(
    key: string,
    isActive: boolean,
    btnText: string,
    btnContainer: HTMLDivElement,
    tabsContainer: HTMLDivElement,
    callback: (key: string) => void,
    context: object
  ) {
    this.key = key;
    const btn = this.createButton(btnText, callback, context);
    const tab = this.createTab(key);
    btnContainer.appendChild(btn);
    tabsContainer.append(tab);
    this.btn = btn;
    this.tab = tab;
    if (isActive) this.activate();
  }
  private createButton(
    text: string,
    callback: (key: string) => void,
    context: object
  ) {
    const btn = document.createElement("button");
    btn.textContent = text;
    btn.classList.add("option-tab__button");
    btn.addEventListener("click", () => {
      callback.call(context, this.key);
    });
    return btn;
  }
  private createTab(key: string) {
    const tab = document.createElement("div");
    tab.classList.add("option-tab");
    tab.setAttribute("data-id", key);
    return tab;
  }

  disable() {
    this.btn.classList.remove("active");
    this.tab.classList.remove("active");
  }
  activate(): void {
    this.btn.classList.add("active");
    this.tab.classList.add("active");
  }
}
