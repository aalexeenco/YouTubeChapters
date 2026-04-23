import { jest } from "@jest/globals";
import { withChapterOverlay, YTPlayer } from "js/modules/player.mjs";
import { screen } from "./../testing-library-dom.mjs";

const chapterTitleOverlayContainer = () => screen.queryByTestId("overlay-container");
const chapterTitleOverlay = () =>
    chapterTitleOverlayContainer().querySelector(".ytp-chapter-title-overlay");
const chapterTitleOverlayWithRevealEffectAndText = (chapterTitleText) =>
    screen.queryByText(chapterTitleText, {
        selector: ".ytp-chapter-title-overlay.ytp-overlay-reveal",
    });

class TestPlayer extends withChapterOverlay(YTPlayer) {}

afterEach(() => {
    jest.clearAllMocks();
});

test("Chapter title changed callback calls super", async () => {
    const parentImpl = jest.spyOn(YTPlayer.prototype, YTPlayer.prototype.onChapterTitleChanged.name);
    const event = {};
    new TestPlayer("foo").onChapterTitleChanged(event);

    expect(parentImpl).toHaveBeenCalledWith(event);
});

describe("Chapter title overlay mixin tests", () => {
    let player;

    beforeEach(() => {
        document.body.innerHTML = `
        <div>
            <div id="foo" data-testid="player">
                <div class="ytp-overlay-bottom-left" data-testid="overlay-container">
                </div>
            </div>
        </div>
        `;
        player = new TestPlayer("foo");
    });

    test("Overlay container element is defined", async () => {
        expect(player.overlayContainerElement).toBeDefined();
        expect(player.overlayContainerElement).toBe(chapterTitleOverlayContainer());
    });

    test("Chapter title overlay can be displayed with reveal", async () => {
        const text = "Chapter 1";
        player.displayOverlay(text);

        expect(player.element).toContainElement(chapterTitleOverlayWithRevealEffectAndText(text));
    });

    test("Existing chapter title overlay can be removed", async () => {
        player.displayOverlay("Chapter");
        expect(player.element).toContainElement(chapterTitleOverlay());

        player.removeOverlay();
        expect(player.element).not.toContainElement(chapterTitleOverlay());
    });

    test("Attempt to remove non-existing chapter title overlay is ok", async () => {
        expect(() => player.removeOverlay()).not.toThrow();
        expect(() => player.removeOverlay()).not.toThrow();
        expect(() => player.removeOverlay()).not.toThrow();
    });

    test("Given a empty chapter title, when chapter title is changed to a non empty string, the overlay is displayed", async () => {
        const displayOverlaySpy = jest.spyOn(player, "displayOverlay");
        const event = { oldValue: "", newValue: "New Chapter" };
        player.onChapterTitleChanged(event);

        expect(displayOverlaySpy).toHaveBeenCalledWith(event.newValue);
    });

    test("Given an non-empty chapter title, when chapter title is changed to another non empty string, the overlay is displayed", async () => {
        const displayOverlaySpy = jest.spyOn(player, "displayOverlay");
        const event = { oldValue: "Old Chapter", newValue: "New Chapter" };
        player.onChapterTitleChanged(event);

        expect(displayOverlaySpy).toHaveBeenCalledWith(event.newValue);
    });

    test("Given a non-empty chapter title, when chapter title is changed to an empty string, the overlay is removed", async () => {
        const removeOverlaySpy = jest.spyOn(player, "removeOverlay");
        const event = { oldValue: "Old Chapter", newValue: "" };
        player.onChapterTitleChanged(event);

        expect(removeOverlaySpy).toHaveBeenCalled();
    });

    test("Given an empty chapter title, when chapter title is changed to an empty string, the overlay is removed", async () => {
        const removeOverlaySpy = jest.spyOn(player, "removeOverlay");
        const event = { oldValue: "", newValue: "" };
        player.onChapterTitleChanged(event);

        expect(removeOverlaySpy).toHaveBeenCalled();
    });
});
