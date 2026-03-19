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

    beforeEach(() => {
        document.body.innerHTML = `<div><div id="anotherPlayer"><video /></div></div>`;

        player = new TestPlayer();
        addChapterControlsSpy = jest.spyOn(player, player.addChapterControls.name);
        removeChapterControlsSpy = jest.spyOn(player, player.removeChapterControls.name);
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
            by(timeoutWhile(waitingFor(addChapterControls)), toHaveBeenCalled)
        );

        describe("Player node is added to the DOM afterwards", () => {
            beforeEach(async () => {
                document.body.insertAdjacentHTML(
                    "afterbegin",
                    html.ytPlayerHtml({ playerId: PLAYER_ID, chapterTitle: "" })
                );

                await playerInitialization;
            });

            test(
                "Chapter title is empty initially",
                by(expecting(playerChapterTitleElement), toBeEmptyDOMElement)
            );

            test(
                "Player has no navigation controls yet",
                by(expecting(addChapterControls), not(toHaveBeenCalled))
            );

            describe("Chapter title text content is then changed to a non-empty value", () => {
                beforeEach(async () => {
                    addChapterControlsSpy.mockClear();
                    await changeChapterTitle(player.chapterTitleElement, "Chapter Title");
                });

                test(
                    "Chapter navigation controls are added to the player",
                    by(expecting(addChapterControls), toHaveBeenCalled)
                );

                describe("Given controls are added", () => {
                    beforeEach(async () => {
                        await waitingFor(addChapterControls)(toHaveBeenCalled);
                        addChapterControlsSpy.mockClear();
                    });

                    test("When chapter title content is cleared, then chapter navigation controls are removed", async () => {
                        await changeChapterTitle(player.chapterTitleElement, null);

                        expect(removeChapterControlsSpy).toHaveBeenCalled();
                        expect(addChapterControlsSpy).not.toHaveBeenCalled();
                    });
                });
            });
        });
    });

    describe("Player node is in the DOM already when the player is initialized", () => {
        beforeEach(async () => {
            // prettier-ignore
            document.body.innerHTML = `<div>${html.ytPlayerHtml({ playerId: PLAYER_ID, chapterTitle: "" })}</div>`;

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
            beforeEach(async () => {
                await changeChapterTitle(player.chapterTitleElement, "Chapter Title");
            });

            test(
                "Chapter navigation controls are added to the player",
                by(expecting(addChapterControls), toHaveBeenCalled)
            );

            describe("Given controls are added", () => {
                beforeEach(async () => {
                    await waitingFor(addChapterControls)(toHaveBeenCalled);
                    addChapterControlsSpy.mockClear();
                });

                test("When chapter title content is cleared afterwards, then chapter navigation controls are removed", async () => {
                    await changeChapterTitle(player.chapterTitleElement, null);

                    expect(removeChapterControlsSpy).toHaveBeenCalled();
                    expect(addChapterControlsSpy).not.toHaveBeenCalled();
                });
            });
        });
    });
});
