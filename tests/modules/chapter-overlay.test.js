import { YTPlayerChapterOverlay } from "js/modules/chapter-overlay.mjs";

test("Chapter overlay element contains empty overlay container when chapter title is not set", () => {
    const element = new YTPlayerChapterOverlay().element;
    expect(element.innerHTML).toMatchSnapshot();
});

test("Chapter overlay element contains empty overlay container when chapter title is set to ''", () => {
    const overlay = new YTPlayerChapterOverlay();
    overlay.chapterTitle = "";
    expect(overlay.element.innerHTML).toMatchSnapshot();
});

test("Chapter overlay element with chapter title 'Hello, World!'", () => {
    const overlay = new YTPlayerChapterOverlay();
    overlay.chapterTitle = "Hello, World!";
    expect(overlay.element.innerHTML).toMatchSnapshot();
});

test.each(["Chapter1", "Chapter2", "ChapterTitle", ""])(
    "Setting chapter title to '%s' removes overlay node to trigger css animation",
    (newChapterTitleText, done) => {
        const overlay = new YTPlayerChapterOverlay();
        const chapterTitleText = "ChapterTitle";
        overlay.chapterTitle = chapterTitleText;

        const observer = new MutationObserver((mutations, thisObserver) => {
            if (mutations[0].removedNodes[0]?.textContent === chapterTitleText) {
                thisObserver.disconnect();
                done();
            }
        });
        observer.observe(overlay.element, { childList: true, subtree: true });

        overlay.chapterTitle = newChapterTitleText;
    }
);
