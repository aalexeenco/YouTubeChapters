import { YTPlayerChapterOverlay } from "./chapter-overlay.mjs";
import { YTChapterList } from "./chapters.mjs";
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
        return this.element?.querySelector(".ytp-chapter-title-content");
    }

    async initAsync() {
        console.debug("%s: #%s | initializing...", YTPlayer.name, this.#id);
        if (!this.element) {
            console.debug("%s: #%s | start observing for the node...", YTPlayer.name, this.#id);
            await nodeAddedAsync(document, (n) => n.id === this.#id);
            console.debug("%s: #%s | node added", YTPlayer.name, this.#id);
        }
        const observer = new MutationObserver((mutations) => this.onChapterChanged(mutations));
        observer.observe(this.chapterTitleElement, { childList: true });
        console.debug("%s: #%s | initialized", YTPlayer.name, this.#id);
    }

    onChapterChanged() {}
}

export const withChapterOverlay = (YTPlayer) =>
    class extends YTPlayer {
        async initAsync() {
            await super.initAsync();
            console.debug("%s: #%s | initializing...", withChapterOverlay.name, this.element?.id);
            const titleText = this.chapterTitleElement.textContent;
            if (titleText) {
                this.displayOverlay(titleText);
            }
            console.debug("%s: #%s | initialized", withChapterOverlay.name, this.element?.id);
        }

        displayOverlay(chapterTitleText) {
            console.debug("%s: #%s | display overlay '%s'", withChapterOverlay.name, this.element?.id, chapterTitleText);
            if (!this.overlay) {
                this.overlay = new YTPlayerChapterOverlay();
                this.element.appendChild(this.overlay.element);
            }

            this.overlay.chapterTitle = chapterTitleText;
        }

        onChapterChanged() {
            const titleText = this.chapterTitleElement.textContent;
            console.debug("%s: #%s | chapter changed '%s'", withChapterOverlay.name, this.element?.id, titleText);
            if (titleText) {
                this.displayOverlay(titleText);
            } else {
                this.overlay?.element.remove();
                this.overlay = null;
            }
        }
    };

export const withChapterNavigation = (YTPlayer, ChapterList) =>
    class extends YTPlayer {
        #chapters;
        #onRuntimeMessageCallback;

        constructor(playerId, chapterContainerParams) {
            super(playerId);
            this.#chapters = new ChapterList(chapterContainerParams, () =>
                this.invalidateChapterControls()
            );
        }

        async initAsync() {
            await super.initAsync();
            console.debug("%s: #%s | initializing...", withChapterNavigation.name, this.element?.id);
            if (this.chapterTitleElement.textContent) {
                this.addChapterControls();
            }
            this.#chapters.initAsync();
            console.debug("%s: #%s | initialized", withChapterNavigation.name, this.element?.id);
        }

        get videoElement() {
            return this.element?.querySelector("video.html5-main-video");
        }

        onChapterChanged(mutations) {
            super.onChapterChanged(mutations);
            console.debug("%s: #%s | chapter changed", withChapterNavigation.name, this.element?.id);
            if (this.chapterTitleElement.textContent === "") {
                this.removeChapterControls();
                return;
            }

            if (
                mutations.length <= 1 ||
                (mutations[0].removedNodes[0] ?? mutations[1].removedNodes[0]).textContent === ""
            ) {
                this.addChapterControls();
            }

            const playerVideo = this.videoElement;
            if (playerVideo.paused) {
                playerVideo.addEventListener("seeked", () => this.invalidateChapterControls(), {
                    once: true,
                });
            } else {
                this.invalidateChapterControls();
            }
        }

        addChapterControls() {
            console.debug("%s: #%s | add chapter controls", withChapterNavigation.name, this.element.id);
            const chapterTitleContainer = this.chapterTitleElement.closest(
                ".ytp-chapter-container"
            );
            chapterTitleContainer.insertAdjacentHTML(
                "beforebegin",
                `<span>
                <button class="ytp-button ytp-chapter-button ytp-chapter-button-prev" 
                    title="Previous Chapter" aria-label="Previous Chapter" data-controltype="previous" disabled>
                    <svg height="100%" version="1.1" viewBox="0 0 36 36" width="100%">
                        <use class="ytp-svg-shadow" xlink:href="#yt_id_01"></use>
                        <path class="ytp-svg-fill" d="M 24,24 16,18 24,12 V 24 z" 
                            id="yt_id_01">
                        </path>
                    </svg>
                </button>
            </span>`
            );
            chapterTitleContainer.insertAdjacentHTML(
                "beforebegin",
                `<span>
                <button class="ytp-button ytp-chapter-button ytp-chapter-button-next" 
                    title="Next Chapter" aria-label="Next Chapter" data-controltype="next" disabled>
                    <svg height="100%" version="1.1" viewBox="0 0 36 36" width="100%">
                        <use class="ytp-svg-shadow" xlink:href="#yt_id_02"></use>
                        <path class="ytp-svg-fill" d="M 12,24 20,18 12,12 V 22 z" 
                            id="yt_id_02">
                        </path>
                    </svg>
                </button>
            </span>`
            );

            this.element
                .querySelectorAll("button.ytp-chapter-button")
                .forEach((btn) =>
                    btn.addEventListener("click", (event) =>
                        this.onChapterControlButtonClick(event.target)
                    )
                );

            this.#onRuntimeMessageCallback = (request) => this.onRuntimeMessage(request);
            chrome.runtime.onMessage.addListener(this.#onRuntimeMessageCallback);
        }

        removeChapterControls() {
            console.debug("%s: #%s | remove chapter controls", withChapterNavigation.name, this.element.id);
            this.element
                .querySelectorAll("button.ytp-chapter-button")
                .forEach((btn) => btn.remove());

            chrome.runtime.onMessage.removeListener(this.#onRuntimeMessageCallback);
        }

        onChapterControlButtonClick(button) {
            const navigationDirection = button.attributes["data-controltype"].value;
            console.debug("%s: #%s | button(%s) clicked", withChapterNavigation.name, this.element.id, navigationDirection);
            this.navigateToChapter(navigationDirection);
        }

        navigateToChapter(navigationDirection) {
            if (navigationDirection === "next") {
                this.nextChapterLink?.click();
            } else if (navigationDirection === "previous") {
                this.prevChapterLink?.click();
            }
        }

        get nextChapterLink() {
            return this.#chapters.nextFrom(this.videoElement.currentTime)?.anchor;
        }

        get prevChapterLink() {
            return this.#chapters.previousFrom(this.videoElement.currentTime)?.anchor;
        }

        invalidateChapterControls() {
            console.debug("%s: #%s | invalidating chapter controls...", withChapterNavigation.name, this.element.id);
            const prevButton = this.element.querySelector(".ytp-chapter-button-prev");
            if (prevButton) {
                prevButton.disabled = !this.prevChapterLink;
                console.debug("%s: #%s | prev=%s", withChapterNavigation.name, this.element.id, !prevButton.disabled);
            }
            const nextButton = this.element.querySelector(".ytp-chapter-button-next");
            if (nextButton) {
                nextButton.disabled = !this.nextChapterLink;
                console.debug("%s: #%s | next=%s", withChapterNavigation.name, this.element.id, !nextButton.disabled);
            }
            console.debug("%s: #%s | invalidated chapter controls", withChapterNavigation.name, this.element.id);
        }

        onRuntimeMessage(request) {
            console.debug("%s: #%s | runtime msg(%s)", withChapterNavigation.name, this.element.id, request.navigationDirection);
            if (this.videoElement.clientHeight > 0) {
                this.navigateToChapter(request.navigationDirection);
            }
        }
    };

export class YTChannelPlayer extends withChapterOverlay(YTPlayer) {
    constructor() {
        super("c4-player");
    }
}

export class YTMainPlayer extends withChapterNavigation(withChapterOverlay(YTPlayer), YTChapterList) {
    constructor() {
        super("movie_player", { tagName: "ytd-watch-flexy", containerId: "panels" });
    }
}
