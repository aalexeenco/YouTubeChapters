export class YTPlayerChapterOverlay {
    #root;

    get element() {
        return this.#root;
    }

    constructor() {
        this.#root = document.createElement("div");
        this.#root.setAttribute(
            "class",
            "ytp-chapter-overlay"
        );

        const overlayContainer = document.createElement("div");
        overlayContainer.setAttribute(
            "class",
            "ytp-player-content ytp-chapter-title-overlay-container"
        );

        this.element.appendChild(overlayContainer);
    }

    set chapterTitle(chapterTitleText) {
        const overlayContainer = this.element.firstChild;
        overlayContainer.firstChild?.remove();

        if (chapterTitleText) {
            const overlay = document.createElement("span");
            overlay.setAttribute("class", "ytp-chapter-title-overlay ytp-overlay-reveal");
            overlay.textContent = chapterTitleText;
    
            overlayContainer.appendChild(overlay);
        }
    }
}
