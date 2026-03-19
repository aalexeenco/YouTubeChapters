import { jest } from "@jest/globals";
import { withChapterNavigation, YTPlayer } from "js/modules/player.mjs";
import { changeChapterTitle } from "../test-dsl.mjs";
import * as html from "../test-html.mjs";
import {
    by,
    expecting,
    waitingFor,
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
    let hideChapterControlsSpy;
    let showChapterControlsSpy;
    const showChapterControls = () => showChapterControlsSpy;

    beforeEach(() => {
        document.body.innerHTML = `<div><div id="anotherPlayer"><video /></div></div>`;

        player = new TestPlayer();
        addChapterControlsSpy = jest.spyOn(player, player.addChapterControls.name);
        hideChapterControlsSpy = jest.spyOn(player, player.hideChapterControls.name);
        showChapterControlsSpy = jest.spyOn(player, player.showChapterControls.name);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("Player node is not in the DOM yet when the player is initialized", () => {
        let playerInitialization;

        beforeEach(() => {
            playerInitialization = player.initAsync();
        });

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

            describe("Chapter title text content is then changed to a non-empty value", () => {
                beforeEach(async () => {
                    await changeChapterTitle(player.chapterTitleElement, "Chapter Title");
                });

                test(
                    "Chapter navigation controls are shown",
                    by(expecting(showChapterControls), toHaveBeenCalled)
                );

                describe("Given controls are visible", () => {
                    beforeEach(async () => {
                        await waitingFor(showChapterControls)(toHaveBeenCalled);
                    });

                    test("When chapter title content is cleared, then chapter navigation controls are hidden", async () => {
                        await changeChapterTitle(player.chapterTitleElement, null);

                        expect(hideChapterControlsSpy).toHaveBeenCalled();
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
            "Player has chapter navigation controls added",
            by(expecting(addChapterControls), toHaveBeenCalled)
        );

        describe("Chapter title text content is then changed to a non-empty value", () => {
            beforeEach(async () => {
                await changeChapterTitle(player.chapterTitleElement, "Chapter Title");
            });

            test(
                "Chapter navigation controls are shown",
                by(expecting(showChapterControls), toHaveBeenCalled)
            );

            describe("Given controls are visible", () => {
                beforeEach(async () => {
                    await waitingFor(showChapterControls)(toHaveBeenCalled);
                });

                test("When chapter title content is cleared afterwards, then chapter navigation controls are hidden", async () => {
                    await changeChapterTitle(player.chapterTitleElement, null);

                    expect(hideChapterControlsSpy).toHaveBeenCalled();
                });
            });
        });
    });
});
