import { jest } from "@jest/globals";
import { withChapterNavigation, YTPlayer } from "js/modules/player.mjs";
import { changeChapterTitle } from "../test-dsl.mjs";
import * as html from "../test-html.mjs";
import {
    by,
    expecting,
    not,
    waitingFor,
    timeoutWhile,
    toBeEmptyDOMElement,
    toHaveBeenCalled,
} from "../jest-enfluenter.mjs";
import { waitFor } from "../testing-library-dom.mjs";

const PLAYER_ID = "player-id";
const CHAPTERS_CONTAINER_ID = "chapters-container-id";

describe("Player chapter navigation mixin functional tests", () => {
    const chapterListMock = {
        initAsync: jest.fn(),
        nextFrom: jest.fn(),
        previousFrom: jest.fn(),
    };
    const ChapterList = jest.fn().mockImplementation(() => {
        return chapterListMock;
    });

    class TestPlayer extends withChapterNavigation(YTPlayer, ChapterList) {
        constructor() {
            super(PLAYER_ID, CHAPTERS_CONTAINER_ID);
        }
    }

    let player;
    const playerChapterTitleElement = () => player.chapterTitleElement;
    let addChapterControlsSpy;
    const addChapterControls = () => addChapterControlsSpy;
    let removeChapterControlsSpy;
    const removeChapterControls = () => removeChapterControlsSpy;
    let invalidateChapterControlsSpy;
    const invalidateChapterControls = () => invalidateChapterControlsSpy;

    let videoPausedSpy;
    let videoAddEventListenerSpy;

    const waitForSeekedEventListenerAdded = () =>
        waitFor(() =>
            expect(videoAddEventListenerSpy).toHaveBeenCalledWith(
                "seeked",
                expect.any(Function),
                { once: true }
            )
        );

    beforeEach(() => {
        document.body.innerHTML = `<div><div id="anotherPlayer"><video /></div></div>`;

        player = new TestPlayer();
        addChapterControlsSpy = jest.spyOn(player, player.addChapterControls.name);
        removeChapterControlsSpy = jest.spyOn(player, player.removeChapterControls.name);
        invalidateChapterControlsSpy = jest.spyOn(player, player.invalidateChapterControls.name);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("Player node is not in the DOM yet when the player is initialized", () => {
        let playerInitialization;

        beforeEach(() => {
            playerInitialization = player.initAsync();
        });

        test(
            "Chapter navigation controls are not added yet",
            by(expecting(addChapterControls), not(toHaveBeenCalled))
        );

        describe("Player node is added to the DOM afterwards", () => {
            beforeEach(async () => {
                document.body.insertAdjacentHTML(
                    "afterbegin",
                    html.ytPlayerHtml({ playerId: PLAYER_ID, chapterTitle: "" })
                );

                videoPausedSpy = jest.spyOn(player.videoElement, "paused", "get");
                videoAddEventListenerSpy = jest
                    .spyOn(player.videoElement, "addEventListener")
                    .mockImplementation(() => {});

                await playerInitialization;
            });

            test(
                "Chapter title is empty initially",
                by(expecting(playerChapterTitleElement), toBeEmptyDOMElement)
            );

            test(
                "Chapter navigation controls are not added yet",
                by(expecting(addChapterControls), not(toHaveBeenCalled))
            );

            describe("Chapter title text content is then changed to a non-empty value", () => {
                beforeEach(() => {
                    changeChapterTitle(player.chapterTitleElement, "Chapter Title");
                });

                test(
                    "Chapter navigation controls are eventually added to the player",
                    by(waitingFor(addChapterControls), toHaveBeenCalled)
                );

                test(
                    "Chapter navigation controls are invalidated eventually",
                    by(waitingFor(invalidateChapterControls), toHaveBeenCalled)
                );

                test("When chapter title content is cleared afterwards, then chapter navigation controls are removed", async () => {
                    await waitingFor(addChapterControls, toHaveBeenCalled);
                    addChapterControlsSpy.mockClear();

                    changeChapterTitle(player.chapterTitleElement, null);

                    await waitingFor(removeChapterControls, toHaveBeenCalled);
                    // prettier-ignore
                    await expect(waitingFor(addChapterControls, toHaveBeenCalled)).rejects.toThrow();
                });

                describe("Given controls are added", () => {
                    beforeEach(async () => {
                        await waitingFor(addChapterControls, toHaveBeenCalled);
                        addChapterControlsSpy.mockClear();
                    });

                    describe("Video is paused and chapter title is changed", () => {
                        beforeEach(() => {
                            expect(player.videoElement.paused).toBeTruthy();
                            changeChapterTitle(player.chapterTitleElement, "Chapter 1");
                        });

                        test(
                            "Navigation controls are not re-added",
                            by(timeoutWhile(waitingFor(addChapterControls)), toHaveBeenCalled)
                        );

                        test(
                            "Navigation controls are not invalided",
                            by(timeoutWhile(waitingFor(invalidateChapterControls), toHaveBeenCalled))
                        );

                        test("Chapter navigation controls are invalidated only after video has been seeked", async () => {
                            await waitForSeekedEventListenerAdded();
        
                            videoAddEventListenerSpy.mock.calls[0][1]();
        
                            expect(invalidateChapterControlsSpy).toHaveBeenCalled();
                        });
                    });

                    test("If video is not paused, then chapter navigation controls are invalidated on chapter change", async () => {
                        videoPausedSpy.mockReturnValueOnce(false);
                        await changeChapterTitle(player.chapterTitleElement, "Chapter 2");
    
                        await waitingFor(invalidateChapterControls, toHaveBeenCalled);
                    });
                });
            });
        });
    });

    describe("Player node is in the DOM already when the player is initialized", () => {
        beforeEach(async () => {
            // prettier-ignore
            document.body.innerHTML = `<div>${html.ytPlayerHtml({ playerId: PLAYER_ID, chapterTitle: "" })}</div>`;

            videoPausedSpy = jest.spyOn(player.videoElement, "paused", "get");
            videoAddEventListenerSpy = jest
                .spyOn(player.videoElement, "addEventListener")
                .mockImplementation(() => {});

            await player.initAsync();
        });

        test(
            "Chapter title content is empty",
            by(expecting(playerChapterTitleElement), toBeEmptyDOMElement)
        );

        test(
            "Player has no chapter navigation controls",
            by(expecting(addChapterControls), not(toHaveBeenCalled))
        );

        describe("Chapter title text content is then changed to a non-empty value", () => {
            beforeEach(() => {
                changeChapterTitle(player.chapterTitleElement, "Chapter Title");
            });

            test(
                "Chapter navigation controls are eventually added to the player",
                by(waitingFor(addChapterControls), toHaveBeenCalled)
            );

            test(
                "Chapter navigation controls are invalidated eventually",
                by(waitingFor(invalidateChapterControls), toHaveBeenCalled)
            );

            test("When chapter title content is cleared afterwards, then chapter navigation controls are removed", async () => {
                await waitingFor(addChapterControls, toHaveBeenCalled);
                addChapterControlsSpy.mockClear();

                changeChapterTitle(player.chapterTitleElement, null);

                await waitingFor(removeChapterControls, toHaveBeenCalled);
                // prettier-ignore
                await expect(waitingFor(addChapterControls, toHaveBeenCalled)).rejects.toThrow();
            });

            describe("Given controls are added", () => {
                beforeEach(async () => {
                    await waitingFor(addChapterControls, toHaveBeenCalled);
                    addChapterControlsSpy.mockClear();
                });

                describe("Video is paused and chapter title is changed", () => {
                    beforeEach(() => {
                        expect(player.videoElement.paused).toBeTruthy();
                        changeChapterTitle(player.chapterTitleElement, "Chapter 1");
                    });

                    test(
                        "Navigation controls are not re-added",
                        by(timeoutWhile(waitingFor(addChapterControls)), toHaveBeenCalled)
                    );

                    test(
                        "Navigation controls are not invalided",
                        by(timeoutWhile(waitingFor(invalidateChapterControls), toHaveBeenCalled))
                    );

                    test("Chapter navigation controls are invalidated only after video has been seeked", async () => {
                        await waitForSeekedEventListenerAdded();
    
                        videoAddEventListenerSpy.mock.calls[0][1]();
    
                        expect(invalidateChapterControlsSpy).toHaveBeenCalled();
                    });
                });

                test("If video is not paused, then chapter navigation controls are invalidated on chapter change", async () => {
                    videoPausedSpy.mockReturnValueOnce(false);
                    await changeChapterTitle(player.chapterTitleElement, "Chapter 2");

                    await waitingFor(invalidateChapterControls, toHaveBeenCalled);
                });
            });
        });
    });
});
