import { withChapterOverlay, YTPlayer } from "js/modules/player.mjs";
import { screen } from "./../testing-library-dom.mjs";

const chapterTitleOverlay = () => document.querySelector(".ytp-chapter-title-overlay");
const chapterTitleOverlayWithRevealEffectAndText = (chapterTitleText) =>
    screen.queryByText(chapterTitleText, {
        selector: ".ytp-chapter-title-overlay.ytp-overlay-reveal",
    });

class TestPlayer extends withChapterOverlay(YTPlayer) {}

describe("Chapter overlay mixin tests", () => {
    let player;
    beforeEach(async () => {
        document.body.innerHTML = `
        <div>
            <div id="foo" data-testid="player">
                <video class="html5-main-video" />
                <button>
                    <div class="ytp-chapter-title-content"></div>
                </button>
            </div>
        </div>
        `;
        player = new TestPlayer("foo");
    });

    test("Given empty chapter title, then overlay is not displayed on init", async () => {
        await player.initAsync();

        expect(chapterTitleOverlay()).not.toBeInTheDocument();
    });

    test("Given non-empty chapter title, then overlay is displayed on init", async () => {
        player.chapterTitleElement.textContent = "New Chapter";
        await player.initAsync();

        expect(player.element).toContainElement(chapterTitleOverlay());
    });

    describe("Chapter title is changed to a non-empty value", () => {
        beforeEach(() => {
            player.chapterTitleElement.textContent = "Hello, World!";
            player.onChapterChanged();
        });

        test("Chapter overlay is added to the player", () => {
            expect(chapterTitleOverlay()).toBeDefined();
            expect(player.element).toContainElement(chapterTitleOverlay());
        });

        test("Chapter title is revealed", () => {
            expect(chapterTitleOverlay()).toContainElement(
                chapterTitleOverlayWithRevealEffectAndText(player.chapterTitleElement.textContent)
            );
        });

        test("When chapter title is changed to another non-empty value, then overlay is changed", () => {
            const newChapterTitleText = "New Chapter";
            player.chapterTitleElement.textContent = newChapterTitleText;

            player.onChapterChanged();

            expect(player.element).toContainElement(
                chapterTitleOverlayWithRevealEffectAndText(newChapterTitleText)
            );
        });

        test("When chapter title is cleared afterwards, then overlay is removed", () => {
            player.chapterTitleElement.textContent = "";

            player.onChapterChanged();

            expect(chapterTitleOverlay()).not.toBeInTheDocument();
        });
    });
});
