import YTPlayerChapterOverlayElement from "./../../js/modules/chapter-overlay.mjs";

test("Chapter overlay element contains empty overlay container when chapter title is not set", () => {
    const element = new YTPlayerChapterOverlayElement();
    expect(element.innerHTML).toMatchSnapshot();
});

test("Chapter overlay element contains empty overlay container when chapter title is set to ''", () => {
    const element = new YTPlayerChapterOverlayElement();
    element.chapterTitle = "";
    expect(element.innerHTML).toMatchSnapshot();
});

test("Chapter overlay element with chapter title 'Hello, World!'", () => {
    const element = new YTPlayerChapterOverlayElement();
    element.chapterTitle = "Hello, World!";
    expect(element.innerHTML).toMatchSnapshot();
});

test.each(["Chapter1", "Chapter2", "ChapterTitle", ""])(
    "Setting chapter title to '%s' removes overlay node to trigger css animation",
    (newChapterTitleText, done) => {
        const element = new YTPlayerChapterOverlayElement();
        const chapterTitleText = "ChapterTitle";
        element.chapterTitle = chapterTitleText;

        const observer = new MutationObserver((mutations, thisObserver) => {
            if (mutations[0].removedNodes[0]?.textContent === chapterTitleText) {
                thisObserver.disconnect();
                done();
            }
        });
        observer.observe(element, { childList: true, subtree: true });

        element.chapterTitle = newChapterTitleText;
    }
);
