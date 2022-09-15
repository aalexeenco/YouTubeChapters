import { jest } from "@jest/globals";
import { YTPlayer } from "js/modules/player.mjs";
import { ytPlayerHtml } from "./../test-html.mjs";
import { screen, waitFor } from "./../testing-library-dom.mjs";

const PLAYER_ID = "foo";
const PLAYER_VIDEO_TITLE = "Video Title";
const PLAYER_TEST_ID = "player-test-id";

describe("YTPlayer unit and chapter changed callback tests", () => {
    let player;
    let onChapterChangedSpy;

    beforeEach(() => {
        document.body.innerHTML = "<div></div>";
        player = new YTPlayer(PLAYER_ID);
        onChapterChangedSpy = jest.spyOn(player, player.onChapterChanged.name);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("Player node is in the DOM already when the player is initialized", () => {
        beforeEach(async () => {
            document.body.innerHTML = `
            <div>
                ${ytPlayerHtml(
                    { 
                        playerId: PLAYER_ID,
                        videoTitle: PLAYER_VIDEO_TITLE,
                        chapterTitle: "Chapter",
                        testId: PLAYER_TEST_ID
                    }
                )}
            </div>
            `;
            await player.initAsync();
        });

        test("Player element is the DOM element with the given id", () => {
            expect(player.element).toBeDefined();
            expect(player.element.id).toEqual(PLAYER_ID);
            expect(player.element).toBe(screen.getByTestId(PLAYER_TEST_ID));
        });

        test("Player element contains chapter title element", () => {
            expect(player.chapterTitleElement).toBeDefined();
            expect(player.element).toContainElement(player.chapterTitleElement);
        });

        test("Player video element is in the DOM", () => {
            expect(player.videoElement).toBeDefined();
        });

        test("Video title is available", () => {
            expect(player.videoTitle).toEqual(PLAYER_VIDEO_TITLE);
        });

        test("Chapter title element is not empty", () => {
            expect(player.chapterTitleElement).not.toBeEmptyDOMElement();
        });

        test("Chapter title is equal to chapter title element text content", () => {
            expect(player.chapterTitle).toEqual(player.chapterTitleElement.textContent);
        });

        test("Chapter changed callback has not been called on init", () => {
            expect(onChapterChangedSpy).not.toHaveBeenCalled();
        });

        test("Message containing video and chapter titles has not been send", () => {
            expect(chrome.runtime.sendMessage).not.toHaveBeenCalled();
        });

        describe("Chapter title is changed afterwards", () => {
            beforeEach(() => {
                onChapterChangedSpy.mockClear();
                player.chapterTitleElement.textContent = "Hello, World!";
            });

            test("Chapter changed callback has been called eventually", async () => {
                await waitFor(() => {
                    expect(onChapterChangedSpy).toHaveBeenCalledWith([expect.any(MutationRecord)]);
                    const mutationsArg = onChapterChangedSpy.mock.calls[0][0];
                    expect(mutationsArg[0].addedNodes.length).toEqual(1);
                });
            });

            test("Message containing video and chapter titles is send eventually", async () => {
                await waitFor(() => {
                    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
                        type: "chapter",
                        title: player.videoTitle,
                        text: player.chapterTitle
                    });
                });
            });

            test.each(["New Chapter", "Next Chapter", "The End", "", null])(
                "When chapter title is changed to '%s', then chapter changed callback is called",
                async (newChapterTitle) => {
                    player.chapterTitleElement.textContent = newChapterTitle;
                    await waitFor(() => expect(onChapterChangedSpy).toHaveBeenCalled());
                }
            );
        });
    });

    describe("Player node is not in the DOM yet when the player is initialized", () => {
        let playerInitialization;
        beforeEach(() => {
            playerInitialization = player.initAsync();
        });

        test("Player element is null", () => {
            expect(player.element).toBeNull();
        });

        test("Player video element is undefined", () => {
            expect(player.videoElement).toBeUndefined();
        });

        test("Video title is undefined", () => {
            expect(player.videoTitle).toBeUndefined();
        });

        test("Chapter title element is undefined", () => {
            expect(player.chapterTitleElement).toBeUndefined();
        });

        test("Chapter title is undefined", () => {
            expect(player.chapterTitleElement).toBeUndefined();
        });

        test("Chapter changed callback has not been called on init", () => {
            expect(onChapterChangedSpy).not.toHaveBeenCalled();
        });

        test("Message containing video and chapter titles has not been send", () => {
            expect(chrome.runtime.sendMessage).not.toHaveBeenCalled();
        });

        describe("Player node is added to the DOM afterwards", () => {
            beforeEach(() => {
                document.body.querySelector("div").innerHTML = `
                ${ytPlayerHtml(
                    { 
                        playerId: PLAYER_ID,
                        videoTitle: PLAYER_VIDEO_TITLE,
                        chapterTitle: "",
                        testId: PLAYER_TEST_ID
                    }
                )}
                `;
            });

            test("Player async initialization is complete", async () => {
                await playerInitialization;
            });

            test("Player element is the DOM element with the given id", () => {
                expect(player.element).toBeDefined();
                expect(player.element).toBe(screen.getByTestId(PLAYER_TEST_ID));
            });

            test("Player element contains chapter title element", () => {
                expect(player.chapterTitleElement).toBeDefined();
                expect(player.element).toContainElement(player.chapterTitleElement);
            });

            test("Video title is available", () => {
                expect(player.videoTitle).toEqual(PLAYER_VIDEO_TITLE);
            });

            test("Chapter title element is empty", () => {
                expect(player.chapterTitleElement).toBeEmptyDOMElement();
            });

            test("Chapter title is empty string", () => {
                expect(player.chapterTitle).toEqual("");
            });

            describe("Player initialization has eventually completed", () => {
                beforeEach(async () => {
                    await playerInitialization;
                });

                test("Chapter changed callback hasn't been called yet", () => {
                    expect(onChapterChangedSpy).not.toHaveBeenCalled();
                });

                describe("Chapter title is set afterwards", () => {
                    beforeEach(() => {
                        player.chapterTitleElement.textContent = "Hello, World!";
                    });

                    test("Chapter changed callback has been called eventually", async () => {
                        await waitFor(() => {
                            expect(onChapterChangedSpy).toHaveBeenCalledWith([
                                expect.any(MutationRecord),
                            ]);
                            const mutationsArg = onChapterChangedSpy.mock.calls[0][0];
                            expect(mutationsArg[0].addedNodes.length).toEqual(1);
                        });
                    });

                    test.each(["New Chapter", "Next Chapter", "The End", "", null])(
                        "When chapter title is changed to '%s' afterwards, then chapter changed callback is called",
                        async (newChapterTitle) => {
                            player.chapterTitleElement.textContent = newChapterTitle;
                            await waitFor(() => expect(onChapterChangedSpy).toHaveBeenCalled());
                        }
                    );
                });
            });
        });
    });
});
