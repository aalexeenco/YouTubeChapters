import { jest } from "@jest/globals";
import { withChapterNavigation, YTPlayer } from "js/modules/player.mjs";
import * as html from "../test-html.mjs";
import { screen } from "../testing-library-dom.mjs";

const nextChapterButton = () => screen.queryByTitle("Next Chapter");
const prevChapterButton = () => screen.queryByTitle("Previous Chapter");

const PLAYER_ID = "player-id";
const CHAPTERS_CONTAINER_ID = "chapters-container-id";

describe("Player chapter navigation mixin unit tests", () => {
    const chapterListMock = {
        initAsync: jest.fn(),
        nextFrom: jest.fn(),
        previousFrom: jest.fn(),
    };
    const TestChapterList = jest.fn().mockImplementation(() => {
        return chapterListMock;
    });

    class TestPlayer extends withChapterNavigation(YTPlayer, TestChapterList) {
        constructor() {
            super(PLAYER_ID, CHAPTERS_CONTAINER_ID);
        }
    }

    const chromeRuntimeOnMessageAddListenerSpy = jest
        .spyOn(chrome.runtime.onMessage, chrome.runtime.onMessage.addListener.name)
        .mockImplementation(() => {});
    const chromeRuntimeOnMessageRemoveListenerSpy = jest
        .spyOn(chrome.runtime.onMessage, chrome.runtime.onMessage.removeListener.name)
        .mockImplementation(() => {});

    let videoClientHeightSpy;
    let videoCurrentTimeSpy;

    let player;
    let invalidateChapterControlsSpy;
    let navigateToChapterSpy;

    beforeEach(() => {
        document.body.innerHTML = `<div>${html.ytPlayerHtml({ playerId: PLAYER_ID })}</div>`;

        player = new TestPlayer();

        videoClientHeightSpy = jest.spyOn(player.videoElement, "clientHeight", "get");
        videoCurrentTimeSpy = jest.spyOn(player.videoElement, "currentTime", "get");

        invalidateChapterControlsSpy = jest.spyOn(player, player.invalidateChapterControls.name);
        navigateToChapterSpy = jest.spyOn(player, player.navigateToChapter.name);
    });

    afterEach(() => {
        jest.clearAllMocks();
        chrome.runtime.onMessage.clearListeners();
    });

    test("Chapter list is instantiated with the given container id and callback", () => {
        expect(TestChapterList).toHaveBeenCalledWith(CHAPTERS_CONTAINER_ID, expect.any(Function));
        expect(TestChapterList.mock.instances.length).toBe(1);
    });

    test("Chapter list callback invalidates chapter controls", () => {
        TestChapterList.mock.calls[0][1]();

        expect(invalidateChapterControlsSpy).toHaveBeenCalledTimes(1);
    });

    test("When the player is initialized, only then chapter list is initialized too", async () => {
        expect(chapterListMock.initAsync).not.toHaveBeenCalled();

        await player.initAsync();

        expect(chapterListMock.initAsync).toHaveBeenCalledTimes(1);
    });

    test("Next chapter link is found in the chapter list by the current time of the video element", () => {
        const videoTime = 42;
        videoCurrentTimeSpy.mockReturnValueOnce(videoTime);
        const expectedAnchor = {};
        chapterListMock.nextFrom.mockReturnValueOnce({ anchor: expectedAnchor });

        const actualAnchor = player.nextChapterLink;

        expect(chapterListMock.nextFrom).toHaveBeenCalledWith(videoTime);
        expect(actualAnchor).toBe(expectedAnchor);
    });

    test("Previous chapter link is found in the chapter list by the current time of the video element", () => {
        const videoTime = 52;
        videoCurrentTimeSpy.mockReturnValueOnce(videoTime);
        const expectedAnchor = {};
        chapterListMock.previousFrom.mockReturnValueOnce({ anchor: expectedAnchor });

        const actualAnchor = player.prevChapterLink;

        expect(chapterListMock.previousFrom).toHaveBeenCalledWith(videoTime);
        expect(actualAnchor).toBe(expectedAnchor);
    });

    test.each([
        ["next", "next", { linkPropName: "nextChapterLink", dir: "next" }],
        ["previous", "previous", { linkPropName: "prevChapterLink", dir: "previous" }],
    ])(
        "To navigate to the %s chapter is to click on the %s chapter link from the list",
        (s1, s2, { linkPropName, dir }) => {
            const chapterLinkMock = { click: jest.fn() };
            jest.spyOn(player, linkPropName, "get").mockImplementationOnce(() => {
                return chapterLinkMock;
            });

            player.navigateToChapter(dir);

            expect(chapterLinkMock.click).toHaveBeenCalled();
        }
    );

    test.each(["", null, "Next", -1, 1, 0, "Previous", "prev", true, false])(
        "Navigation direction '%s' is ignored",
        (navigationDirection) => {
            const nextChapterLinkSpy = jest
                .spyOn(player, "nextChapterLink", "get")
                .mockImplementationOnce(() => {});
            const prevChapterLinkSpy = jest
                .spyOn(player, "prevChapterLink", "get")
                .mockImplementationOnce(() => {});

            player.navigateToChapter(navigationDirection);

            expect(nextChapterLinkSpy).not.toHaveBeenCalled();
            expect(prevChapterLinkSpy).not.toHaveBeenCalled();
        }
    );

    test("Runtime message is ignored if player video is not visible on screen", () => {
        videoClientHeightSpy.mockReturnValueOnce(0);

        player.onRuntimeMessage({});

        expect(navigateToChapterSpy).not.toHaveBeenCalled();
    });

    test("Runtime message request must have navigation direction property to invoke chapter navigation", () => {
        videoClientHeightSpy.mockReturnValueOnce(100);

        const request1 = { test: "next" };
        player.onRuntimeMessage(request1);

        expect(navigateToChapterSpy).toHaveBeenCalledWith(undefined);

        videoClientHeightSpy.mockReturnValueOnce(100);

        const request2 = { navigationDirection: "property value is irrelevant in this test" };
        player.onRuntimeMessage(request2);

        expect(navigateToChapterSpy).toHaveBeenNthCalledWith(2, request2.navigationDirection);
    });

    describe("Add chapter navigation controls", () => {
        beforeEach(() => {
            player.addChapterControls();
        });

        test("Player element contains initially disabled 'Next Chapter' and 'Previous Chapter' buttons", () => {
            expect(player.element).toContainElement(prevChapterButton());
            expect(player.element).toContainElement(nextChapterButton());

            expect(prevChapterButton()).toBeDisabled();
            expect(nextChapterButton()).toBeDisabled();
        });

        test("Clicking on the 'Next Chapter'/'Previous Chapter' buttons will navigate to the next/previous chapter respectively", () => {
            prevChapterButton().disabled = false;
            prevChapterButton().click();

            expect(navigateToChapterSpy).toHaveBeenCalledWith("previous");

            nextChapterButton().disabled = false;
            nextChapterButton().click();

            expect(navigateToChapterSpy).toHaveBeenCalledWith("next");
        });

        test("Chrome runtime message listener is added to handle navigation messages", () => {
            expect(chromeRuntimeOnMessageAddListenerSpy).toHaveBeenLastCalledWith(
                expect.any(Function)
            );

            const onRuntimeMessageSpy = jest
                .spyOn(player, player.onRuntimeMessage.name)
                .mockImplementationOnce(() => {});
            const onMessageListener = chromeRuntimeOnMessageAddListenerSpy.mock.calls[0][0];
            const request = {};
            onMessageListener(request);

            expect(onRuntimeMessageSpy).toHaveBeenCalledWith(request);
        });

        test("Invalidating chapter controls will enable 'Previous Chapter' button if previous chapter link exists", () => {
            jest.spyOn(player, "prevChapterLink", "get").mockImplementationOnce(() => {
                return {};
            });

            player.invalidateChapterControls();

            expect(prevChapterButton()).toBeEnabled();
        });

        test("Invalidating chapter controls will disable 'Previous Chapter' button if previous chapter link is undefined", () => {
            jest.spyOn(player, "prevChapterLink", "get").mockImplementationOnce(() => undefined);

            player.invalidateChapterControls();

            expect(prevChapterButton()).toBeDisabled();
        });

        test("Invalidating chapter controls will enable 'Next Chapter' button if next chapter link exists", () => {
            jest.spyOn(player, "nextChapterLink", "get").mockImplementationOnce(() => {
                return {};
            });

            player.invalidateChapterControls();

            expect(nextChapterButton()).toBeEnabled();
        });

        test("Invalidating chapter controls will disable 'Next Chapter' button if next chapter link is undefined", () => {
            jest.spyOn(player, "nextChapterLink", "get").mockImplementationOnce(() => undefined);

            player.invalidateChapterControls();

            expect(nextChapterButton()).toBeDisabled();
        });

        describe("Remove chapter navigation controls", () => {
            beforeEach(() => {
                player.removeChapterControls();
            });

            test("'Next Chapter' and 'Previous Chapter' buttons are removed from the DOM", () => {
                expect(player.element).not.toContainElement(prevChapterButton());
                expect(player.element).not.toContainElement(nextChapterButton());
            });

            test("Chrome runtime message listener is removed", () => {
                const previouslyAddedListener =
                    chromeRuntimeOnMessageAddListenerSpy.mock.calls[0][0];
                expect(chromeRuntimeOnMessageRemoveListenerSpy).toHaveBeenLastCalledWith(
                    previouslyAddedListener
                );
            });
        });
    });
});
