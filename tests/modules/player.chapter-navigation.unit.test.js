import { jest } from "@jest/globals";
import { withChapterNavigation, YTPlayer } from "js/modules/player.mjs";
import * as html from "../test-html.mjs";
import { screen } from "../testing-library-dom.mjs";

const nextChapterButton = () => screen.queryByTitle("Next chapter");
const prevChapterButton = () => screen.queryByTitle("Previous chapter");

const PLAYER_ID = "player-id";
const CHAPTERS_CONTAINER_ID = "chapters-container-id";

describe("Player chapter navigation mixin unit tests", () => {
    const chapterListMock = {
        initAsync: jest.fn(),
        navigateToChapter: jest.fn()
    };
    const TestChapterList = jest.fn().mockImplementation(() => {
        return chapterListMock;
    });

    class TestPlayer extends withChapterNavigation(YTPlayer, TestChapterList) {
        constructor() {
            super(PLAYER_ID, CHAPTERS_CONTAINER_ID);
        }
    }

    let player;
    let onActiveChapterChangedSpy;

    beforeEach(() => {
        document.body.innerHTML = `<div>${html.ytPlayerHtml({ playerId: PLAYER_ID })}</div>`;

        player = new TestPlayer();

        onActiveChapterChangedSpy = jest.spyOn(player, player.onActiveChapterChanged.name);
    });

    afterEach(() => {
        jest.clearAllMocks();
        chrome.runtime.onMessage.clearListeners();
    });

    test("Chapter list is instantiated with the given container id and callback", () => {
        expect(TestChapterList).toHaveBeenCalledWith(CHAPTERS_CONTAINER_ID, expect.any(Function));
        expect(TestChapterList.mock.instances.length).toBe(1);
    });

    test("Handler is invoked on active chapter change via a callback", () => {
        const event = {};
        TestChapterList.mock.calls[0][1](event);

        expect(onActiveChapterChangedSpy).toHaveBeenCalledTimes(1);
        expect(onActiveChapterChangedSpy).toHaveBeenCalledWith(event);
    });

    test("Chapter list is initialized on player initialization", async () => {
        expect(chapterListMock.initAsync).not.toHaveBeenCalled();

        await player.initAsync();

        expect(chapterListMock.initAsync).toHaveBeenCalledTimes(1);
    });

    test("Navigation controls are added on player initialization", async () => {
        const addChapterControlsSpy = jest.spyOn(player, player.addChapterControls.name);
        addChapterControlsSpy.mockImplementation(() => {});

        await player.initAsync();

        expect(addChapterControlsSpy).toHaveBeenCalledTimes(1);
    });

    describe("Given chapter navigation controls are added", () => {
        beforeEach(() => {
            player.addChapterControls();
        });

        test("Player element contains initially disabled and hidden 'Next chapter' and 'Previous chapter' buttons", () => {
            expect(player.element).toContainElement(prevChapterButton());
            expect(player.element).toContainElement(nextChapterButton());

            expect(prevChapterButton()).toBeDisabled()
            expect(prevChapterButton()).not.toBeVisible();
            expect(nextChapterButton()).toBeDisabled();
            expect(nextChapterButton()).not.toBeVisible();
        });

        test("Chapter navigation buttons have auto hide class", () => {
            expect(prevChapterButton()).toHaveClass("ytp-autohide-fade-transition");
            expect(nextChapterButton()).toHaveClass("ytp-autohide-fade-transition");
        });

        test("Clicking on the 'Next chapter'/'Previous chapter' buttons will navigate to the next/previous chapter respectively", () => {
            prevChapterButton().disabled = false;
            prevChapterButton().click();

            expect(chapterListMock.navigateToChapter).toHaveBeenCalledWith("previous");

            nextChapterButton().disabled = false;
            nextChapterButton().click();

            expect(chapterListMock.navigateToChapter).toHaveBeenCalledWith("next");
        });

        test("'Previous chapter' button is enabled on active chapter change if previous chapter exists", () => {
            player.onActiveChapterChanged({ previous: true });

            expect(prevChapterButton()).toBeEnabled();
        });

        test("'Previous chapter' button is disabled on active chapter change if previous chapter does not exist", () => {
            player.onActiveChapterChanged({ previous: false });

            expect(prevChapterButton()).toBeDisabled();
        });

        test("'Next chapter' button is enabled on active chapter change if next chapter exists", () => {
            player.onActiveChapterChanged({ next: true });

            expect(nextChapterButton()).toBeEnabled();
        });

        test("'Next chapter' button is disabled on active chapter change if next chapter does not exist", () => {
            player.onActiveChapterChanged({ next: false });

            expect(nextChapterButton()).toBeDisabled();
        });

        test("'Next chapter' and 'Previous chapter' buttons can be shown", () => {
            player.showChapterControls();

            expect(nextChapterButton()).toBeVisible();
            expect(prevChapterButton()).toBeVisible();
        });

        test("'Next chapter' and 'Previous chapter' buttons can be hidden", () => {
            player.showChapterControls();

            player.hideChapterControls();

            expect(nextChapterButton()).not.toBeVisible();
            expect(prevChapterButton()).not.toBeVisible();
        });
    });
});
