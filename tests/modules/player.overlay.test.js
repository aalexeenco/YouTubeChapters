import { withChapterOverlay, YTPlayer } from "./../../js/modules/player.mjs";
import { screen } from "./../testing-library-dom.mjs";

export const chapterTitleOverlay = () => document.querySelector(".ytp-chapter-title-overlay");
export const chapterTitleOverlayWithRevealEffectAndText = (chapterTitleText) =>
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

    describe("Chapter title is changed to a non-empty value", () => {
        beforeEach(() => {
            player.chapterTitleElement.textContent = "Hello, World!";
            player.onChapterChanged();
        });

        test("Chapter overlay is added to the player", () => {
            expect(player.chapterOverlayElement).toBeDefined();
            expect(player.element).toContainElement(player.chapterOverlayElement);
        });

        test("Chapter title is revealed", () => {
            expect(player.chapterOverlayElement).toContainElement(
                chapterTitleOverlayWithRevealEffectAndText(player.chapterTitleElement.textContent)
            );
        });

        test("When chapter title is changed to another non-empty value, then overlay is changed", () => {
            const newChapterTitleText = "New Chapter";
            player.chapterTitleElement.textContent = newChapterTitleText;

            player.onChapterChanged();

            expect(player.chapterOverlayElement).toContainElement(
                chapterTitleOverlayWithRevealEffectAndText(newChapterTitleText)
            );
        });

        test("When chapter title is cleared afterwards, then overlay is removed", () => {
            player.chapterTitleElement.textContent = "";

            player.onChapterChanged();

            expect(player.chapterOverlayElement).not.toBeInTheDocument();
        });
    });
});
