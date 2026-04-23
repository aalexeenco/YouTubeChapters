import { YTPlayerChapterOverlay } from "./chapter-overlay.mjs";
import { nodeAddedAsync } from "./utils.mjs";

export class YTPlayer {
    #id;

    constructor(playerId) {
        this.#id = playerId;
    }

    get element() {
        return document.getElementById(this.#id);
    }

    get chapterTitleElement() {
        return this.element?.querySelector(
            "button.ytp-chapter-title:not(.ytp-chapter-button) > .ytp-chapter-title-content",
        );
    }

    get chapterTitle() {
        return this.chapterTitleElement?.textContent;
    }

    get videoElement() {
        return this.element?.querySelector("video.html5-main-video");
    }

    get videoTitle() {
        return this.element?.querySelector(".ytp-title")?.textContent;
    }

    async initAsync() {
        console.debug("%s: #%s | initializing...", YTPlayer.name, this.#id);
        if (!this.element) {
            console.debug("%s: #%s | waiting for the player node...", YTPlayer.name, this.#id);
            await nodeAddedAsync(document, (n) => n.id === this.#id);
            console.debug("%s: #%s | player node added", YTPlayer.name, this.#id);
        }
        this.#observe();
        console.debug("%s: #%s | initialized", YTPlayer.name, this.#id);
    }

    #observe() {
        new MutationObserver((mutations) => {
            let newValue = "";
            let oldValue = "";
            for (const mutation of mutations) {
                for (const addedNode of mutation.addedNodes) {
                    if (addedNode.textContent) {
                        newValue = addedNode.textContent;
                    }
                }
                for (const removedNode of mutation.removedNodes) {
                    if (removedNode.textContent) {
                        oldValue = removedNode.textContent;
                    }
                }
            }

            // prettier-ignore
            console.debug("%s: #%s | chapter title changed '%s' -> '%s'", YTPlayer.name, this.#id, oldValue, newValue);
            if (oldValue || newValue) {
                this.onChapterTitleChanged({
                    oldValue,
                    newValue,
                });
            }
        }).observe(this.chapterTitleElement, { childList: true });
    }

    onChapterTitleChanged(event) {
        if (!event.newValue) {
            return;
        }
        // prettier-ignore
        console.debug("%s: #%s | send runtime message ('%s', '%s')", YTPlayer.name, this.element?.id, this.videoTitle, event.newValue);
        chrome.runtime.sendMessage({
            type: "chapter",
            title: this.videoTitle,
            text: event.newValue,
        });
    }
}

export const withChapterOverlay = (Player) =>
    class extends Player {
        get overlayContainerElement() {
            return this.element?.querySelector(".ytp-overlay-bottom-left");
        }

        onChapterTitleChanged(event) {
            super.onChapterTitleChanged(event);
            if (event.newValue) {
                this.displayOverlay(event.newValue);
            } else {
                this.removeOverlay();
            }
        }

        displayOverlay(chapterTitleText) {
            // prettier-ignore
            console.debug("%s: #%s | display overlay '%s'", withChapterOverlay.name, this.element?.id, chapterTitleText);
            if (!this.overlay) {
                this.overlay = new YTPlayerChapterOverlay();
                this.overlayContainerElement.appendChild(this.overlay.element);
            }
            this.overlay.chapterTitle = chapterTitleText;
        }

        removeOverlay() {
            // prettier-ignore
            console.debug("%s: #%s | remove overlay", withChapterOverlay.name, this.element?.id);
            this.overlay?.element.remove();
            this.overlay = null;
        }
    };

export const withChapterNavigation = (Player) =>
    class extends Player {
        static PREV_CHAPTER_TITLE = "Previous chapter";
        static NEXT_CHAPTER_TITLE = "Next chapter";

        static PANELS_ID = "panels";
        static TAGNAME = "ytd-engagement-panel-section-list-renderer";
        static TARGET_ID = "engagement-panel-macro-markers-description-chapters";
        static VISIBILITY = "ENGAGEMENT_PANEL_VISIBILITY_HIDDEN";
        static CHAPTER_ITEM_TAGNAME = "ytd-macro-markers-list-item-renderer";
        static CHAPTER_ITEM_QS = `${this.CHAPTER_ITEM_TAGNAME}`;
        static TAG_VISIBILITY_QS = `${this.TAGNAME}[visibility="${this.VISIBILITY}"]`;
        static QS = `${this.TAGNAME}[target-id="${this.TARGET_ID}"][visibility="${this.VISIBILITY}"]`;

        get panelsContainer() {
            return document.getElementById(this.constructor.PANELS_ID);
        }

        get chapterControls() {
            return this.element?.querySelectorAll("div.ytp-chapter-control");
        }

        get prevChapterButton() {
            return document.getElementById("chapter-button-prev");
        }

        get nextChapterButton() {
            return document.getElementById("chapter-button-next");
        }

        async initAsync() {
            await super.initAsync();
            // prettier-ignore
            console.debug("%s: #%s | initializing...", withChapterNavigation.name, this.element?.id);
            this.addChapterControls();
            if (!this.panelsContainer) {
                // prettier-ignore
                console.debug("%s: #%s | waiting for the panels container node...", withChapterNavigation.name, this.element?.id);
                await nodeAddedAsync(
                    document.body,
                    (n) => n.nodeType === 1 && n.id === this.constructor.PANELS_ID,
                );
                // prettier-ignore
                console.debug("%s: #%s | panels container node added", withChapterNavigation.name, this.element?.id);
            }
            this.#observe();
            console.debug("%s: #%s | initialized", withChapterNavigation.name, this.element?.id);
        }

        addChapterControls() {
            // prettier-ignore
            console.debug("%s: #%s | add chapter controls", withChapterNavigation.name, this.element?.id);
            const titleContainer = this.chapterTitleElement.closest(".ytp-chapter-container");
            titleContainer.insertAdjacentHTML(
                "beforebegin",
                `
                <div class="ytp-chapter-container ytp-chapter-control">
                    <button id="chapter-button-prev" disabled class="ytp-chapter-title ytp-button ytp-chapter-button"
                        data-seek-chapter="previous"
                        title="${this.constructor.PREV_CHAPTER_TITLE}" 
                        aria-label="${this.constructor.PREV_CHAPTER_TITLE}"
                        data-tooltip-title="${this.constructor.PREV_CHAPTER_TITLE}">
                        <div class="ytp-chapter-title-chevron">
                            <svg height="100%" viewBox="0 0 24 24" width="100%">
                                <path d="M14.29 18.71 l1.42-1.42 -5.3-5.29 5.3-5.29 -1.42-1.42 -6.7 6.71 z" fill="#fff"></path>
                            </svg>
                        </div>
                        <div class="ytp-chapter-title-content">Prev</div>
                    </button>
                </div>
                `,
            );
            titleContainer.insertAdjacentHTML(
                "beforebegin",
                `
                <div class="ytp-chapter-container ytp-chapter-control">
                    <button id="chapter-button-next" disabled class="ytp-chapter-title ytp-button ytp-chapter-button" 
                        data-seek-chapter="next"
                        title="${this.constructor.NEXT_CHAPTER_TITLE}"
                        aria-label="${this.constructor.NEXT_CHAPTER_TITLE}"
                        data-tooltip-title="${this.constructor.NEXT_CHAPTER_TITLE}">
                        <div class="ytp-chapter-title-content">Next</div>
                        <div class="ytp-chapter-title-chevron">
                            <svg height="100%" viewBox="0 0 24 24" width="100%">
                                <path d="M9.71 18.71l-1.42-1.42 5.3-5.29-5.3-5.29 1.42-1.42 6.7 6.71z" fill="#fff"></path>
                            </svg>
                        </div>
                    </button>
                </div>
                `,
            );

            this.element.querySelectorAll("button.ytp-chapter-button").forEach((btn) =>
                btn.addEventListener("click", (event) => {
                    const direction = event.currentTarget.dataset.seekChapter;
                    // prettier-ignore
                    console.debug("%s: #%s | button(%s) clicked", withChapterNavigation.name, this.element?.id, direction);
                    this.#seekChapter(direction);
                }),
            );
        }

        #seekChapter(direction) {
            let keyEvent;
            if (direction === "previous") {
                keyEvent = new KeyboardEvent("keydown", {
                    key: "ArrowLeft",
                    code: "ArrowLeft",
                    keyCode: 37,
                    which: 37,
                    ctrlKey: true,
                    bubbles: true,
                    cancelable: true,
                    composed: true,
                });
            } else if (direction === "next") {
                keyEvent = new KeyboardEvent("keyup", {
                    key: "ArrowRight",
                    code: "ArrowRight",
                    keyCode: 39,
                    which: 39,
                    ctrlKey: true,
                    bubbles: true,
                    cancelable: true,
                    composed: true,
                });
            }
            document.body.dispatchEvent(keyEvent);
        }

        #observe() {
            new MutationObserver((mutations) => {
                let active;
                for (const mutation of mutations) {
                    if (
                        !(
                            mutation.target.closest(this.constructor.QS) &&
                            mutation.target.matches(this.constructor.CHAPTER_ITEM_QS)
                        )
                    ) {
                        continue;
                    }

                    if (mutation.target.hasAttribute(mutation.attributeName)) {
                        active = mutation.target;
                        break;
                    }

                    active = null;
                }
                if (active !== undefined) {
                    this.onActiveChapterChanged(active);
                }
            }).observe(this.panelsContainer, {
                attributeFilter: ["active"],
                subtree: true,
            });

            new MutationObserver((mutations) => {
                for (const mutation of mutations) {
                    if (
                        mutation.oldValue === this.constructor.TARGET_ID &&
                        mutation.target.matches(this.constructor.TAG_VISIBILITY_QS)
                    ) {
                        // prettier-ignore
                        console.debug("%s: #%s | panel attr '%s' reset", withChapterNavigation.name, this.element?.id, mutation.attributeName);
                        this.deactivateChapterControls();
                        return;
                    }
                }
            }).observe(this.panelsContainer, {
                attributeFilter: ["target-id"],
                attributeOldValue: true,
                subtree: true,
            });
        }

        onChapterTitleChanged(event) {
            super.onChapterTitleChanged(event);
            if (!event.oldValue || !event.newValue) {
                // prettier-ignore
                console.debug("%s: #%s | chapter controls | toggle 'visible'", withChapterNavigation.name, this.element?.id);
                this.chapterControls.forEach((el) => el.classList.toggle("visible"));
            }
        }

        onActiveChapterChanged(active) {
            // prettier-ignore
            console.debug("%s: #%s | active chapter changed", withChapterNavigation.name, this.element?.id);
            if (!active) {
                this.deactivateChapterControls();
                return;
            }

            this.chapterControls.forEach((el) => el.classList.add("activated"));
            const prevButton = this.prevChapterButton;
            const nextButton = this.nextChapterButton;
            const { firstElementChild, lastElementChild } = active.parentElement;
            prevButton.disabled = firstElementChild === active;
            nextButton.disabled = lastElementChild === active;
            // prettier-ignore
            console.debug("%s: #%s | prev=%s, next=%s", withChapterNavigation.name, this.element?.id, !prevButton.disabled, !nextButton.disabled);
        }

        deactivateChapterControls() {
            // prettier-ignore
            console.debug("%s: #%s | chapter controls | deactivate", withChapterNavigation.name, this.element?.id);
            this.chapterControls.forEach((el) => el.classList.remove("activated"));
        }
    };

export class YTChannelPlayer extends withChapterOverlay(YTPlayer) {
    constructor() {
        super("c4-player");
    }
}

export class YTMainPlayer extends withChapterNavigation(withChapterOverlay(YTPlayer)) {
    constructor() {
        super("movie_player");
    }
}
