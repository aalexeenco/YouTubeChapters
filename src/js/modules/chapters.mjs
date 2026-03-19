import { nodeAddedAsync } from "./utils.mjs";

export class YTChapterList {
    #containerParams;
    #containerElementQuerySelector;

    onActiveChapterChanged;

    constructor(containerParams, onActiveChapterChanged) {
        this.#containerParams = containerParams
        this.onActiveChapterChanged = onActiveChapterChanged;

        this.#containerElementQuerySelector = `${this.#containerParams.tagName}`;
        if (this.#containerParams.attrName) {
            // prettier-ignore
            this.#containerElementQuerySelector += `[${this.#containerParams.attrName}^='${this.#containerParams.attrValue}']`;
        }
        this.#containerElementQuerySelector += ` #${this.#containerParams.containerId}`;
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
                (node) => node.tagName === tagName && (!attrName || node.attributes[attrName].value.startsWith(attrValue))
            );
            container = this.containerElement;
            console.debug(`${YTChapterList.name}: ${this.#containerElementQuerySelector} | container node added`);
        }
        const activeChapterObserver = new MutationObserver((mutationsList) => this.observeActiveChapterChange(mutationsList));
        activeChapterObserver.observe(container, { attributes: true, subtree: true });
        console.log(`${YTChapterList.name}: ${this.#containerElementQuerySelector} | initialized`);
    }

    observeActiveChapterChange(mutationsList) {
        for (const mutation of mutationsList) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'active') {
                console.debug(`${YTChapterList.name}: active chapter changed`);
                if (mutation.target.hasAttribute('active')) {
                    console.debug(`${YTChapterList.name}: active set: prev=${!!mutation.target.previousElementSibling}, next=${!!mutation.target.nextElementSibling}`);
                    this.onActiveChapterChanged(
                        {
                            previous: !!mutation.target.previousElementSibling,
                            next: !!mutation.target.nextElementSibling
                        }
                    );
                } else {
                    console.debug(`${YTChapterList.name}: active unset`);
                }
            }
        }
    }

    navigateToChapter(navigationDirection) {
        const activeChapter = this.containerElement.querySelector("ytd-macro-markers-list-item-renderer[active]");
    
        let chapter;
        if (navigationDirection === "next") {
            chapter = activeChapter.nextElementSibling;
        } else if (navigationDirection === "previous") {
            chapter = activeChapter.previousElementSibling;
        }

        chapter.querySelector("a#endpoint").click();
    }
}
