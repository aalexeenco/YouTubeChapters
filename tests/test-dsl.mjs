export const changeChapterTitle = (titleElement, titleText) => {
    const chapterTitleChangedPromise = chapterTitleChanged(titleElement);
    titleElement.childNodes.forEach((x) => x.remove());
    if (titleText !== null) {
        titleElement.appendChild(document.createTextNode(titleText));
    }
    return chapterTitleChangedPromise;
};

export const chapterTitleChanged = (titleElement) =>
    new Promise((resolve) => {
        observeChapterTitle(titleElement, resolve, (mutations) => mutations.length > 0);
    });
export const observeChapterTitle = (titleElement, done, check) => {
    new MutationObserver((mutations, thisObserver) => {
        if (check(mutations)) {
            thisObserver.disconnect();
            done();
        }
    }).observe(titleElement, { childList: true });
};
