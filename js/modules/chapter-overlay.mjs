export default class YTPlayerChapterOverlayElement extends HTMLElement {
    constructor() {
        super();

        const overlayContainer = document.createElement("div");
        overlayContainer.setAttribute(
            "class",
            "ytp-player-content ytp-chapter-title-overlay-container"
        );

        this.appendChild(overlayContainer);
    }

    set chapterTitle(chapterTitleText) {
        const overlayContainer = this.firstChild;
        overlayContainer.firstChild?.remove();

        if (chapterTitleText) {
            const overlay = document.createElement("span");
            overlay.setAttribute("class", "ytp-chapter-title-overlay ytp-overlay-reveal");
            overlay.textContent = chapterTitleText;
    
            overlayContainer.appendChild(overlay);
        }
    }
}

customElements.define("ytp-chapter-overlay", YTPlayerChapterOverlayElement);
