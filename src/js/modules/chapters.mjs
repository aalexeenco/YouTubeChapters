import { nodeAddedAsync } from "./utils.mjs";

export class YTChapterList {
    #containerId;
    #chapters = [];

    onChapterListChanged;

    constructor(containerId, onChapterListChanged) {
        this.#containerId = containerId;
        this.onChapterListChanged = onChapterListChanged;
    }

    #setChapters(chapters) {
        this.#chapters = chapters;
        this.onChapterListChanged?.();
    }

    get containerElement() {
        return document.getElementById(this.#containerId);
    }

    async initAsync() {
        console.log(`${YTChapterList.name}: #${this.#containerId} | initializing...`);
        let container = this.containerElement;
        if (!container) {
            // prettier-ignore
            console.debug(`${YTChapterList.name}: #${this.#containerId} | start observing for chapters container node...`);
            await nodeAddedAsync(document, (node) => node.id === this.#containerId);
            container = this.containerElement;
        }
        this.#setChapters(YTChapterList.parseChapters(container));
        const chaptersParsingObserver = new MutationObserver(() => {
            this.#setChapters(YTChapterList.parseChapters(this.containerElement));
        });
        chaptersParsingObserver.observe(container, { childList: true, subtree: true });
        console.log(`${YTChapterList.name}: #${this.#containerId} | initialized`);
    }

    findIndexByVideoTime(videoTime) {
        const index = this.#chapters.findIndex((chapter) => chapter.t > videoTime);
        return index > -1 ? index - 1 : this.#chapters.length - 1;
    }

    nextFrom(videoTime) {
        const index = this.findIndexByVideoTime(videoTime);
        return this.#chapters[index + 1];
    }

    previousFrom(videoTime) {
        const index = this.findIndexByVideoTime(videoTime);
        return this.#chapters[index - 1];
    }

    static parseChapters(container) {
        return parseChapters(container);
    }
}

export function parseChapters(container) {
    console.debug("Parsing chapters...");
    const extraParamStartIndex = document.baseURI.indexOf("&");
    const videoURI =
        extraParamStartIndex > -1
            ? document.baseURI.substring(0, extraParamStartIndex)
            : document.baseURI;
    const chapters = [...container.querySelectorAll("a.yt-simple-endpoint.yt-formatted-string")]
        .filter((a) => a.href.indexOf(videoURI) > -1 && a.href.indexOf("&t=") > -1)
        .map((a) => {
            const chapterStartTime = parseInt(a.href.substring(a.href.indexOf("&t=") + 3));
            return { t: chapterStartTime, anchor: a };
        });
    if (chapters.length > 0) {
        const firstChapterLinkIndex = chapters.findIndex((x) => x.t == 0);
        if (firstChapterLinkIndex > 0) {
            chapters.splice(0, firstChapterLinkIndex);
        }
    }
    console.debug("Parsed chapters");
    console.debug(chapters);

    return chapters;
}
