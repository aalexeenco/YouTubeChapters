import { jest } from "@jest/globals";
import { YTPlayer } from "js/modules/player.mjs";
import { ytPlayerHtml } from "./../test-html.mjs";
import { screen, waitFor } from "./../testing-library-dom.mjs";
import { changeChapterTitle } from "../test-dsl.mjs";

const PLAYER_ID = "foo";
const PLAYER_VIDEO_TITLE = "Video Title";
const PLAYER_TEST_ID = "player-test-id";

describe("YTPlayer unit tests", () => {
    let player;

    beforeEach(() => {
        document.body.innerHTML = "<div></div>";
        player = new YTPlayer(PLAYER_ID);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("Non empty chapter title is sent in chrome runtime message", () => {
        player.onChapterTitleChanged({ oldValue: "Old Chapter", newValue: "New Chapter" });
        expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
            expect.objectContaining({
                type: "chapter",
                text: "New Chapter",
            }),
        );
    });

    test("Video title is sent in chrome runtime message", () => {
        jest.spyOn(player, "videoTitle", "get").mockReturnValue(PLAYER_VIDEO_TITLE);

        player.onChapterTitleChanged({ oldValue: "Old Chapter", newValue: "New Chapter" });
        expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
            expect.objectContaining({
                type: "chapter",
                title: PLAYER_VIDEO_TITLE,
            }),
        );
    });

    test("Empty chapter title is ignored", () => {
        player.onChapterTitleChanged({ oldValue: "Old Chapter", newValue: "" });
        expect(chrome.runtime.sendMessage).not.toHaveBeenCalled();
    });

    test("Null chapter title is ignored", () => {
        player.onChapterTitleChanged({ oldValue: "Old Chapter", newValue: null });
        expect(chrome.runtime.sendMessage).not.toHaveBeenCalled();
    });

    describe("Player node is contained in the DOM when the player is initialized", () => {
        let chapterTitleChangedSpy;

        beforeEach(async () => {
            chapterTitleChangedSpy = jest
                .spyOn(player, "onChapterTitleChanged")
                .mockImplementation(jest.fn());

            document.body.innerHTML = `
            <div>
                ${ytPlayerHtml({
                    playerId: PLAYER_ID,
                    videoTitle: PLAYER_VIDEO_TITLE,
                    chapterTitle: "",
                    testId: PLAYER_TEST_ID,
                })}
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

        test("Chapter title element is empty", () => {
            expect(player.chapterTitleElement).toBeEmptyDOMElement();
        });

        test("Chapter title is equal to chapter title element text content", () => {
            expect(player.chapterTitle).toEqual(player.chapterTitleElement.textContent);
        });

        test("When chapter title is empty, then chapter title changed callback is not called", () => {
            expect(chapterTitleChangedSpy).not.toHaveBeenCalled();
        });

        describe("Chapter title is changed", () => {
            beforeEach(async () => {
                chapterTitleChangedSpy.mockClear();
                await changeChapterTitle(player.chapterTitleElement, "Hello, World!");
            });

            test("Chapter title changed callback has been called eventually", async () => {
                await waitFor(() => {
                    expect(chapterTitleChangedSpy).toHaveBeenCalled();
                });
            });

            test("Old and new chapter titles are provided", async () => {
                await waitFor(() => {
                    expect(chapterTitleChangedSpy).toHaveBeenCalledWith({
                        oldValue: "",
                        newValue: "Hello, World!",
                    });
                });
            });

            test.each(["Chapter1", "Chapter2", "Chapter3", ""])(
                "When chapter title is changed to '%s', then chapter changed callback is called",
                async (newChapterTitle) => {
                    player.chapterTitleElement.textContent = newChapterTitle;
                    await waitFor(() =>
                        expect(chapterTitleChangedSpy).toHaveBeenCalledWith({
                            oldValue: "Hello, World!",
                            newValue: newChapterTitle,
                        }),
                    );
                },
            );
        });
    });

    describe("Player node is not in the DOM yet when the player is initialized", () => {
        let playerInitialization;
        let chapterTitleChangedSpy;

        beforeEach(() => {
            chapterTitleChangedSpy = jest
                .spyOn(player, "onChapterTitleChanged")
                .mockImplementation(jest.fn());
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

        test("Chrome runtime message has not been send", () => {
            expect(chrome.runtime.sendMessage).not.toHaveBeenCalled();
        });

        describe("Player node has been added to the DOM", () => {
            beforeEach(() => {
                document.body.querySelector("div").innerHTML = `
                ${ytPlayerHtml({
                    playerId: PLAYER_ID,
                    videoTitle: PLAYER_VIDEO_TITLE,
                    chapterTitle: "",
                    testId: PLAYER_TEST_ID,
                })}
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

            test("When chapter title is reset to the empty value by adding/removing text nodes, then chapter title changed callback is not called", async () => {
                await changeChapterTitle(player.chapterTitleElement, "");

                expect(chapterTitleChangedSpy).not.toHaveBeenCalled();
            });

            describe("Player initialization has eventually completed", () => {
                beforeEach(async () => {
                    await playerInitialization;
                });

                test("Chapter title changed callback has not been called", () => {
                    expect(chapterTitleChangedSpy).not.toHaveBeenCalled();
                });

                describe("Chapter title is set", () => {
                    beforeEach(() => {
                        chapterTitleChangedSpy.mockClear();
                        player.chapterTitleElement.textContent = "Hello, World!";
                    });

                    test("Chapter title changed callback has been called eventually", async () => {
                        await waitFor(() => {
                            expect(chapterTitleChangedSpy).toHaveBeenCalledWith({
                                oldValue: "",
                                newValue: "Hello, World!",
                            });
                        });
                    });

                    test.each(["Chapter1", "Chapter2", "Chapter3", ""])(
                        "When chapter title is changed to '%s' afterwards, then chapter changed callback is called",
                        async (newChapterTitle) => {
                            player.chapterTitleElement.textContent = newChapterTitle;
                            await waitFor(() =>
                                expect(chapterTitleChangedSpy).toHaveBeenCalledWith({
                                    oldValue: "Hello, World!",
                                    newValue: newChapterTitle,
                                }),
                            );
                        },
                    );
                });
            });
        });
    });
});
