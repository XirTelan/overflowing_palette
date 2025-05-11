import { MenuTabProps, TutorialTopics } from "@/types";
import { MenuTab } from "../MenuTab";
import { getLocal } from "@/utils";

export class TutorialsTab extends MenuTab {
  private tutorials: TutorialTopics;

  constructor(props: MenuTabProps) {
    super(props);

    const { tutorials } = getLocal(this.scene);
    this.tutorials = tutorials;

    this.contentContainer.innerHTML = `
      <div class="tutorials" style="display: flex; height: 100%;">
        <div class="topics" style="width: 35%; padding-right: 12px; overflow-y: auto;">
          ${Object.keys(this.tutorials)
            .map(
              (key) => `
              <div class="topic card" data-key="${key}" style="cursor: pointer; padding: 8px; margin-bottom: 4px; border: 1px solid #ccc;">
                ${this.tutorials[key].title}
              </div>`
            )
            .join("")}
        </div>
        <div class="content" style="width: 65%; padding-left: 12px; overflow-y: auto;">
          <h2 id="tutorial-title">Tutorial</h2>
          <div id="tutorial-content">Select a topic to see details.</div>
        </div>
      </div>
    `;
    this.contentContainer.style = `display:flex;height:100%`;

    this.actionBtn.setActive(false);
    this.bindClickHandlers();
  }

  private bindClickHandlers() {
    const topics = this.contentContainer.querySelectorAll(".topic");
    const title = this.contentContainer.querySelector("#tutorial-title")!;
    const content = this.contentContainer.querySelector("#tutorial-content")!;

    topics.forEach((el) =>
      el.addEventListener("click", () => {
        const key = el.getAttribute("data-key")!;
        const data = this.tutorials[key];
        title.textContent = data.title;
        content.innerHTML = data.content;
      })
    );
  }

  override destroy() {
    super.destroy();
  }
}
