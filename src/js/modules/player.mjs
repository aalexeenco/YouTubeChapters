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
        return this.element?.querySelector("button.ytp-chapter-title:not(.ytp-chapter-button) > .ytp-chapter-title-content");
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
            console.debug("%s: #%s | start observing for the node...", YTPlayer.name, this.#id);
            await nodeAddedAsync(document, (n) => n.id === this.#id);
            console.debug("%s: #%s | node added", YTPlayer.name, this.#id);
        }
        const observer = new MutationObserver((mutations) => this.onChapterChanged(mutations));
        observer.observe(this.chapterTitleElement, { childList: true });
        console.debug("%s: #%s | initialized", YTPlayer.name, this.#id);
    }

    onChapterChanged() {
        console.debug("%s: #%s | send runtime message", YTPlayer.name, this.element?.id);
        chrome.runtime.sendMessage(
            { 
                type: "chapter",
                title: this.videoTitle,
                text: this.chapterTitle
            }
        );
    }
}

export const withChapterOverlay = (YTPlayer) =>
    class extends YTPlayer {
        get overlayContainerElement() {
            return this.element?.querySelector(".ytp-overlay-bottom-left");
        }

        async initAsync() {
            await super.initAsync();
            console.debug("%s: #%s | initializing...", withChapterOverlay.name, this.element?.id);
            const titleText = this.chapterTitle;
            if (titleText) {
                this.displayOverlay(titleText);
            }
            console.debug("%s: #%s | initialized", withChapterOverlay.name, this.element?.id);
        }

        displayOverlay(chapterTitleText) {
            console.debug("%s: #%s | display overlay '%s'", withChapterOverlay.name, this.element?.id, chapterTitleText);
            if (!this.overlay) {
                this.overlay = new YTPlayerChapterOverlay();
                this.overlayContainerElement.appendChild(this.overlay.element);
            }

            this.overlay.chapterTitle = chapterTitleText;
        }

        onChapterChanged(mutations) {
            super.onChapterChanged(mutations);
            const titleText = this.chapterTitle;
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
            if (this.chapterTitle) {
                this.addChapterControls();
            }
            this.#chapters.initAsync();
            console.debug("%s: #%s | initialized", withChapterNavigation.name, this.element?.id);
        }

        onChapterChanged(mutations) {
            super.onChapterChanged(mutations);
            console.debug("%s: #%s | chapter changed", withChapterNavigation.name, this.element?.id);
            if (this.chapterTitle === "") {
                this.removeChapterControls();
                return;
            }

            const chapterTitleAdded = 
                mutations.length <= 1 ||
                (mutations[0].removedNodes[0] ?? mutations[1].removedNodes[0]).textContent === "";
            if (chapterTitleAdded) {
                this.addChapterControls();
            }

            this.invalidateChapterControls();
        }

        addChapterControls() {
            console.debug("%s: #%s | add chapter controls", withChapterNavigation.name, this.element.id);
            const chapterTitleContainer = this.chapterTitleElement.closest(
                ".ytp-chapter-container"
            );
            chapterTitleContainer.insertAdjacentHTML(
                "beforebegin",
                `
                <div class="ytp-chapter-container ytp-chapter-control">
                    <button class="ytp-chapter-title ytp-button ytp-chapter-button ytp-chapter-button-prev" 
                        title="Previous Chapter" aria-label="Previous Chapter" data-controltype="previous" disabled>
                        <div class="ytp-chapter-title-chevron">
                            <svg height="100%" viewBox="0 0 24 24" width="100%">
                                <path d="M14.29 18.71 l1.42-1.42 -5.3-5.29 5.3-5.29 -1.42-1.42 -6.7 6.71 z" fill="#fff"></path>
                            </svg>
                        </div>
                        <div class="ytp-chapter-title-content">Prev</div>
                    </button>
                </div>
                `
            );
            chapterTitleContainer.insertAdjacentHTML(
                "beforebegin",
                `
                <div class="ytp-chapter-container ytp-chapter-control">
                    <button class="ytp-chapter-title ytp-button ytp-chapter-button ytp-chapter-button-next" 
                        title="Next Chapter" aria-label="Next Chapter" data-controltype="next" disabled>
                        <div class="ytp-chapter-title-content">Next</div>
                        <div class="ytp-chapter-title-chevron">
                            <svg height="100%" viewBox="0 0 24 24" width="100%">
                                <path d="M9.71 18.71l-1.42-1.42 5.3-5.29-5.3-5.29 1.42-1.42 6.7 6.71z" fill="#fff"></path>
                            </svg>
                        </div>
                    </button>
                </div>
                `
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
                .querySelectorAll("div.ytp-chapter-control")
                .forEach((btn) => btn.remove());

            chrome.runtime.onMessage.removeListener(this.#onRuntimeMessageCallback);
        }

        onChapterControlButtonClick(target) {
            const button = target.closest("button");
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
            const playerVideo = this.videoElement;
            if (playerVideo.paused) {
                console.debug("%s: #%s | update chapter controls on 'seek'", withChapterNavigation.name, this.element.id);
                this.listenForEventOnce(playerVideo, "seeked", () => { this.updateChapterControls(); });
            } else if (playerVideo.currentTime > 0) {
                this.updateChapterControls();
            } else {
                console.debug("%s: #%s | invalidate chapter controls on 'timeupdate'", withChapterNavigation.name, this.element.id);
                this.listenForEventOnce(playerVideo, "timeupdate", () => {
                    console.debug("%s: #%s | timeupdate | currentTime=%d", withChapterNavigation.name, this.element.id, this.videoElement.currentTime);
                    this.invalidateChapterControls();
                });
            }
            console.debug("%s: #%s | invalidated chapter controls", withChapterNavigation.name, this.element.id);
        }

        listenForEventOnce(element, eventName, callback) {
            element.addEventListener(
                eventName,
                () => { 
                    console.debug("%s: #%s | eventName", withChapterNavigation.name, this.element.id);
                    callback(); 
                },
                { once: true }
            );
        }

        updateChapterControls() {
            console.debug("%s: #%s | updating chapter controls...", withChapterNavigation.name, this.element.id);
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
            console.debug("%s: #%s | updated chapter controls", withChapterNavigation.name, this.element.id);
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
        super(
            "movie_player", 
            { 
                tagName: "ytd-macro-markers-list-renderer",
                attrName: "panel-target-id",
                attrValue: "engagement-panel-macro-markers-description-chapters",
                containerId: "contents"
            }
        );
    }
}
