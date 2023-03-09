import { nodeAddedAsync } from "./utils.mjs";

export class YTChapterList {
    #containerParams;
    #containerElementQuerySelector;
    #chapters = [];

    onChapterListChanged;

    constructor(containerParams, onChapterListChanged) {
        this.#containerParams = containerParams
        this.onChapterListChanged = onChapterListChanged;

        this.#containerElementQuerySelector = `${this.#containerParams.tagName}`;
        if (this.#containerParams.attrName) {
            // prettier-ignore
            this.#containerElementQuerySelector += `[${this.#containerParams.attrName}='${this.#containerParams.attrValue}']`;
        }
        this.#containerElementQuerySelector += ` #${this.#containerParams.containerId}`;
    }

    #setChapters(chapters) {
        console.debug(`${YTChapterList.name}: ${this.#containerElementQuerySelector} | set chapters`);
        console.debug(chapters);
        if (chapters.length > 0 || this.#chapters.length > 0) {
            this.#chapters = chapters;
            this.onChapterListChanged?.();
        }
    }

    get containerElement() {
        return document.querySelector(this.#containerElementQuerySelector);
    }

    async initAsync() {
        console.log(`${YTChapterList.name}: ${this.#containerElementQuerySelector} | initializing...`);
        let container = this.containerElement;
        if (!container) {
            // prettier-ignore
            console.debug(`${YTChapterList.name}: ${this.#containerElementQuerySelector} | start observing for the container node...`);
            const tagName = this.#containerParams.tagName.toUpperCase();
            const attrName = this.#containerParams.attrName;
            const attrValue = this.#containerParams.attrValue;
            await nodeAddedAsync(
                document, 
                (node) => node.tagName === tagName && (!attrName || node.attributes[attrName].value === attrValue)
            );
            container = this.containerElement;
            console.debug(`${YTChapterList.name}: ${this.#containerElementQuerySelector} | container node added`);
        }
        this.#setChapters(YTChapterList.parseChapters(container));
        const chaptersParsingObserver = new MutationObserver(() => {
            this.#setChapters(YTChapterList.parseChapters(this.containerElement));
        });
        chaptersParsingObserver.observe(container, { childList: true, subtree: true });
        console.log(`${YTChapterList.name}: ${this.#containerElementQuerySelector} | initialized`);
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
    const extraParamStartIndex = document.baseURI.indexOf("&");
    const videoURI =
        extraParamStartIndex > -1
            ? document.baseURI.substring(0, extraParamStartIndex)
            : document.baseURI;
    const chapters = [...container.querySelectorAll("a.yt-simple-endpoint.ytd-macro-markers-list-item-renderer:not([hidden])")]
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

    return chapters;
}
