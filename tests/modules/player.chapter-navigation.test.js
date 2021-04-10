import { jest } from "@jest/globals";
import { withChapterNavigation, YTPlayer } from "js/modules/player.mjs";
import { changeChapterTitle } from "../test-dsl.mjs";
import * as html from "../test-html.mjs";
import {
    by,
    expecting,
    not,
    waitingFor,
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
            let videoPausedSpy;
            let videoAddEventListenerSpy;

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

                test("Chapter navigation controls are invalidated after video has been seeked if video is paused", async () => {
                    expect(player.videoElement.paused).toBeTruthy();
                    await waitFor(() =>
                        expect(videoAddEventListenerSpy).toHaveBeenCalledWith(
                            "seeked",
                            expect.any(Function),
                            { once: true }
                        )
                    );

                    videoAddEventListenerSpy.mock.calls[0][1]();

                    expect(invalidateChapterControlsSpy).toHaveBeenCalled();
                });

                test("Chapter navigation controls are invalidated if video is not paused", async () => {
                    videoPausedSpy.mockReturnValueOnce(false);
                    await changeChapterTitle(player.chapterTitleElement, "New Chapter");

                    await waitingFor(invalidateChapterControls, toHaveBeenCalled);
                });

                test("When chapter title is changed to another non-empty value, then navigation controls are not re-added", async () => {
                    await waitingFor(addChapterControls, toHaveBeenCalled);

                    addChapterControlsSpy.mockClear();
                    changeChapterTitle(player.chapterTitleElement, "New Chapter");

                    // prettier-ignore
                    await expect(waitingFor(addChapterControls, toHaveBeenCalled)).rejects.toThrow();
                });

                test("When chapter title content is cleared afterwards, then chapter navigation controls are removed", async () => {
                    await waitingFor(addChapterControls, toHaveBeenCalled);
                    addChapterControlsSpy.mockClear();

                    changeChapterTitle(player.chapterTitleElement, null);

                    await waitingFor(removeChapterControls, toHaveBeenCalled);
                    // prettier-ignore
                    await expect(waitingFor(addChapterControls, toHaveBeenCalled)).rejects.toThrow();
                });
            });
        });
    });

    describe("Player node is in the DOM already when the player is initialized", () => {
        let videoPausedSpy;
        let videoAddEventListenerSpy;

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

            test("Chapter navigation controls are invalidated after video has been seeked if video is paused", async () => {
                expect(player.videoElement.paused).toBeTruthy();
                await waitFor(() =>
                    expect(videoAddEventListenerSpy).toHaveBeenCalledWith(
                        "seeked",
                        expect.any(Function),
                        { once: true }
                    )
                );

                videoAddEventListenerSpy.mock.calls[0][1]();

                expect(invalidateChapterControlsSpy).toHaveBeenCalled();
            });

            test("Chapter navigation controls are invalidated if video is not paused", async () => {
                videoPausedSpy.mockReturnValueOnce(false);
                await changeChapterTitle(player.chapterTitleElement, "New Chapter");

                await waitingFor(invalidateChapterControls, toHaveBeenCalled);
            });

            test("When chapter title is changed to another non-empty value, then navigation controls are not re-added", async () => {
                await waitingFor(addChapterControls, toHaveBeenCalled);

                addChapterControlsSpy.mockClear();
                changeChapterTitle(player.chapterTitleElement, "New Chapter");

                // prettier-ignore
                await expect(waitingFor(addChapterControls, toHaveBeenCalled)).rejects.toThrow();
            });

            test("When chapter title content is cleared afterwards, then chapter navigation controls are removed", async () => {
                await waitingFor(addChapterControls, toHaveBeenCalled);
                addChapterControlsSpy.mockClear();

                changeChapterTitle(player.chapterTitleElement, null);

                await waitingFor(removeChapterControls, toHaveBeenCalled);
                // prettier-ignore
                await expect(waitingFor(addChapterControls, toHaveBeenCalled)).rejects.toThrow();
            });
        });
    });
});
