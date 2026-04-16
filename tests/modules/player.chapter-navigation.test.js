import { jest } from "@jest/globals";
import { withChapterNavigation, YTPlayer } from "js/modules/player.mjs";
import { screen, waitFor } from "../testing-library-dom.mjs";
import { expectTimeout } from "../test-utils.mjs";
import * as html from "../test-html.mjs";

const PLAYER_ID = "player-id";

class TestPlayer extends withChapterNavigation(YTPlayer) {
    constructor() {
        super(PLAYER_ID);
    }
}

function addPlayerElementTo(target, chapterTitle = "") {
    target.insertAdjacentHTML(
        "beforeend",
        `
        ${html.ytPlayerHtml({ playerId: PLAYER_ID, chapterTitle })}
        `,
    );
}

function addPanelsContainerTo(target) {
    target.insertAdjacentHTML(
        "beforeend",
        `
        <div id="${TestPlayer.PANELS_ID}">
        </div>
        `,
    );
}

function addChaptersPanelTo(target) {
    target.insertAdjacentHTML(
        "beforeend",
        `
        <${TestPlayer.TAGNAME}
            data-testid="chapters"
            target-id="${TestPlayer.TARGET_ID}"
            visibility="${TestPlayer.VISIBILITY}">
            <div>
                <div id="header" data-testid="chapters-header">
                </div>
                <div id="contents">
                    <${TestPlayer.CHAPTER_ITEM_TAGNAME} data-testid="chapter1">
                        Chapter 1
                    </${TestPlayer.CHAPTER_ITEM_TAGNAME}> 
                    <${TestPlayer.CHAPTER_ITEM_TAGNAME} data-testid="chapter2">
                        Chapter 2
                    </${TestPlayer.CHAPTER_ITEM_TAGNAME}>
                    <${TestPlayer.CHAPTER_ITEM_TAGNAME} data-testid="chapter3">
                        Chapter 3
                    </${TestPlayer.CHAPTER_ITEM_TAGNAME}>
                </div>
            </div>
        </${TestPlayer.TAGNAME}>
        `,
    );
}

let superSpy = {
    initAsync: jest.spyOn(YTPlayer.prototype, YTPlayer.prototype.initAsync.name),
    // prettier-ignore
    onChapterTitleChanged: jest.spyOn(YTPlayer.prototype, YTPlayer.prototype.onChapterTitleChanged.name),
};

afterEach(() => {
    document.body.innerHTML = "";
    jest.resetAllMocks();
});

describe("Player with chapter navigation mixin unit tests", () => {
    let player;

    beforeEach(() => {
        player = new TestPlayer(PLAYER_ID);
    });

    test("chapter controls do not exist", () => {
        expect(player.chapterControls).toBeUndefined();
    });

    test("panelsContainer returns null whens engagement panels container does not exist", () => {
        expect(player.panelsContainer).toBeNull();
    });

    test("panelsContainer returns the engagement panels container node when it exists", () => {
        addPanelsContainerTo(document.body);

        expect(player.panelsContainer).toBe(document.getElementById(TestPlayer.PANELS_ID));
    });

    describe("initAsync", () => {
        it("adds chapter controls after super is initialized", async () => {
            jest.useFakeTimers();

            const addChapterControlsSpy = jest.spyOn(player, player.addChapterControls.name);

            const timeout = expectTimeout(player.initAsync(), 100);
            jest.advanceTimersByTime(100);
            await timeout;

            expect(addChapterControlsSpy).toHaveBeenCalledTimes(1);

            jest.useRealTimers();
        });
    });

    describe("Given player element is in the DOM", () => {
        beforeEach(() => {
            addPlayerElementTo(document.body);
        });

        describe("when chapter controls are added to the player", () => {
            let chapterControls;

            beforeEach(() => {
                player.addChapterControls();
                chapterControls = Array.from(player.chapterControls);
            });

            describe.each([
                {
                    title: TestPlayer.PREV_CHAPTER_TITLE,
                    get_chapterButton: () => player.prevChapterButton,
                    type: "keydown",
                    key: "ArrowLeft",
                    keyCode: 37,
                },
                {
                    title: TestPlayer.NEXT_CHAPTER_TITLE,
                    get_chapterButton: () => player.nextChapterButton,
                    type: "keyup",
                    key: "ArrowRight",
                    keyCode: 39,
                },
            ])("'$title' control", ({ title, get_chapterButton, type, key, keyCode }) => {
                let button, chapterControl;

                beforeEach(() => {
                    button = screen.getByTitle(title);
                    chapterControl = button.parentElement;
                });

                test("exists in the player element", () => {
                    expect(player.element).toContainElement(chapterControl);
                });

                test("is positioned before the chapter title element", () => {
                    expect(chapterControl.compareDocumentPosition(player.chapterTitleElement)).toBe(
                        Node.DOCUMENT_POSITION_FOLLOWING,
                    );
                });

                it("is a YT chapter container", () => {
                    expect(chapterControl).toHaveClass("ytp-chapter-container ytp-chapter-control");
                });

                test("is returned by chapterControls", () => {
                    expect(player.chapterControls).toContain(chapterControl);
                });

                describe(`contains button titled '${title}', which`, () => {
                    it("is returned by the property", () => {
                        expect(get_chapterButton()).toBe(button);
                    });

                    it("is disabled", () => {
                        expect(button).toBeDisabled();
                    });

                    it("has matching aria and tooltip attributes", () => {
                        expect(button).toHaveAttribute("aria-label", button.title);
                        expect(button).toHaveAttribute("data-tooltip-title", button.title);
                    });

                    it("has YT specific styles", () => {
                        expect(button).toHaveClass("ytp-chapter-title ytp-button");
                    });

                    it(`triggers 'Ctrl+${key}' keyboard shortcut on click if it is enabled`, () => {
                        const dispatchSpy = jest.spyOn(document.body, "dispatchEvent");

                        button.disabled = false;
                        button.click();

                        expect(dispatchSpy).toHaveBeenCalledTimes(1);
                        expect(dispatchSpy).toHaveBeenCalledWith(
                            expect.objectOfTypeContaining(KeyboardEvent, {
                                key: key,
                                type: type,
                                keyCode: keyCode,
                                which: keyCode,
                                ctrlKey: true,
                                bubbles: true,
                                cancelable: true,
                                composed: true,
                            }),
                        );
                    });
                });
            });

            describe("onChapterTitleChanged", () => {
                it("calls super", () => {
                    player.onChapterTitleChanged({ oldValue: "", newValue: "Chapter 1" });
                    player.onChapterTitleChanged({ oldValue: "Chapter 1", newValue: "Chapter 2" });
                    player.onChapterTitleChanged({ oldValue: "Chapter 2", newValue: "" });
                    expect(superSpy.onChapterTitleChanged).toHaveBeenCalledTimes(3);
                });

                it("toggles the 'visible' class when chapter title appears or disappears", () => {
                    player.onChapterTitleChanged({ oldValue: "", newValue: "Chapter 1" });

                    chapterControls.forEach((el) => expect(el).toHaveClass("visible"));

                    player.onChapterTitleChanged({ oldValue: "Chapter 1", newValue: "" });

                    chapterControls.forEach((el) => expect(el).not.toHaveClass("visible"));
                });

                it("does not toggle the 'visible' class when title changes between non-empty values", () => {
                    chapterControls.forEach((el) => el.classList.add("visible"));

                    player.onChapterTitleChanged({ oldValue: "Chapter 1", newValue: "Chapter 2" });

                    chapterControls.forEach((el) => expect(el).toHaveClass("visible"));
                });
            });

            describe("onActiveChapterChanged", () => {
                let chapterControls;

                beforeEach(() => {
                    chapterControls = Array.from(player.chapterControls);

                    const chaptersContainer = document.createElement("div");
                    chaptersContainer.innerHTML = `
                        <div class="test-chapter" data-testid="first">Chapter1</div>
                        <div class="test-chapter" data-testid="middle">Chapter2</div>
                        <div class="test-chapter" data-testid="last">Chapter3</div>
                    `;
                    document.body.appendChild(chaptersContainer);
                });

                it("activates chapter controls when active chapter is not null", () => {
                    for (const testId of ["first", "middle", "last"]) {
                        chapterControls.forEach((el) => el.classList.remove("activated"));
                        player.onActiveChapterChanged(screen.getByTestId(testId));
                        chapterControls.forEach((el) => expect(el).toHaveClass("activated"));
                    }
                });

                it("deactivates chapter controls when active chapter is null", () => {
                    chapterControls.forEach((element) => element.classList.add("activated"));

                    player.onActiveChapterChanged(null);

                    chapterControls.forEach((element) =>
                        expect(element).not.toHaveClass("activated"),
                    );
                });

                test("when first chapter is active, then 'Previous chapter' is disabled and 'Next chapter' is enabled", () => {
                    const first = screen.getByTestId("first");
                    player.onActiveChapterChanged(first);
                    expect(player.prevChapterButton).toBeDisabled();
                    expect(player.nextChapterButton).toBeEnabled();
                });

                test("when middle chapter is active, then both 'Previous chapter' and 'Next chapter' are enabled", () => {
                    const middle = screen.getByTestId("middle");
                    player.onActiveChapterChanged(middle);
                    expect(player.prevChapterButton).toBeEnabled();
                    expect(player.nextChapterButton).toBeEnabled();
                });

                test("when last chapter is active, then 'Previous chapter' is enabled and 'Next chapter' is disabled", () => {
                    const first = screen.getByTestId("first");
                    player.onActiveChapterChanged(first);
                    expect(player.prevChapterButton).toBeDisabled();
                    expect(player.nextChapterButton).toBeEnabled();
                });
            });

            test("deactivateChapterControls removes 'activated' class from chapter controls", () => {
                chapterControls.forEach((chapterControl) =>
                    chapterControl.classList.add("activated"),
                );

                player.deactivateChapterControls();

                chapterControls.forEach((element) => expect(element).not.toHaveClass("activated"));
            });
        });

        describe("when player is initialized", () => {
            test("after super initialization completes, then chapter controls are added", async () => {
                jest.useFakeTimers();

                const addChapterControlsSpy = jest.spyOn(player, player.addChapterControls.name);

                const timeout = expectTimeout(player.initAsync(), 100);
                jest.advanceTimersByTime(100);
                await timeout;

                expect(addChapterControlsSpy).toHaveBeenCalledTimes(1);

                jest.useRealTimers();
            });

            test("it completes after panels container is added to the DOM", async () => {
                jest.useFakeTimers();

                const playerInitialization = player.initAsync();
                const timeout = expectTimeout(playerInitialization, 100);
                jest.advanceTimersByTime(100);
                await timeout;

                addPanelsContainerTo(document.body);

                await playerInitialization;

                jest.useRealTimers();
            });

            describe("when panels container is added", () => {
                let onChaptersActiveChangedSpy;
                let deactivateChapterControlsSpy;
                let chaptersPanel;

                beforeEach(async () => {
                    onChaptersActiveChangedSpy = jest
                        .spyOn(player, player.onActiveChapterChanged.name)
                        .mockImplementation(() => {});
                    deactivateChapterControlsSpy = jest
                        .spyOn(player, player.deactivateChapterControls.name)
                        .mockImplementation(() => {});

                    const playerInitialization = player.initAsync();
                    addPanelsContainerTo(document.body);
                    await playerInitialization;

                    addChaptersPanelTo(player.panelsContainer);
                    chaptersPanel = screen.getByTestId("chapters");
                });

                test("changes to the 'active' attribute of the chapters panel items are observered", async () => {
                    const chapter1 = screen.getByTestId("chapter1");
                    const chapter2 = screen.getByTestId("chapter2");

                    chapter1.setAttribute("active", "");
                    await waitFor(() =>
                        expect(onChaptersActiveChangedSpy).toHaveBeenCalledWith(chapter1),
                    );

                    chapter1.removeAttribute("active");
                    chapter2.setAttribute("active", "");
                    await waitFor(() =>
                        expect(onChaptersActiveChangedSpy).toHaveBeenLastCalledWith(chapter2),
                    );
                    expect(onChaptersActiveChangedSpy).not.toHaveBeenCalledWith(null);

                    chapter2.removeAttribute("active");
                    await waitFor(() =>
                        expect(onChaptersActiveChangedSpy).toHaveBeenLastCalledWith(null),
                    );
                });

                test("changes to the 'active' attribute of the chapters panel non-items are ignored", async () => {
                    screen
                        .getByTestId("chapters-header")
                        .insertAdjacentHTML(
                            "beforeend",
                            `<div data-testid="spinner">Spinner</div>`,
                        );

                    const element = screen.getByTestId("spinner");
                    element.setAttribute("active", "");

                    await expectTimeout(
                        waitFor(() =>
                            expect(onChaptersActiveChangedSpy).toHaveBeenCalledWith(element),
                        ),
                        500,
                    );

                    element.removeAttribute("active");

                    await expectTimeout(
                        waitFor(() =>
                            expect(onChaptersActiveChangedSpy).toHaveBeenCalledWith(null),
                        ),
                        500,
                    );
                });

                test("changes to the 'active' attribute of all the other non-chapter panel elements are ignored", async () => {
                    const nonChaptersPanel = document.createElement(TestPlayer.TAGNAME);
                    nonChaptersPanel.setAttribute("target-id", "non-chapters");
                    nonChaptersPanel.setAttribute("visibility", TestPlayer.VISIBILITY);
                    nonChaptersPanel.innerHTML = `
                        <div id="contents">
                            <div data-testid="non-chapter1">00:00 Hello,</div>
                            <div>00:10 This is not a chapter!</div>
                            <div>01:15 The end.</div>
                        </div>
                    `;
                    player.panelsContainer.appendChild(nonChaptersPanel);

                    const element = screen.getByTestId("non-chapter1");
                    element.setAttribute("active", "");

                    await expectTimeout(
                        waitFor(() =>
                            expect(onChaptersActiveChangedSpy).toHaveBeenCalledWith(element),
                        ),
                        500,
                    );

                    element.removeAttribute("active");

                    await expectTimeout(
                        waitFor(() =>
                            expect(onChaptersActiveChangedSpy).toHaveBeenCalledWith(null),
                        ),
                        500,
                    );
                });

                test("chapter controls are deactivated when chapters panel is converted to non-chapters panel", async () => {
                    chaptersPanel.setAttribute("target-id", "new-target-id-value");

                    await waitFor(() => expect(deactivateChapterControlsSpy).toHaveBeenCalled());
                });

                test("changes to the 'target-id' attribute of non-hidden chapters panel are ignored", async () => {
                    chaptersPanel.setAttribute(
                        "visibility",
                        "ENGAGEMENT_PANEL_VISIBILITY_EXPANDED",
                    );
                    chaptersPanel.setAttribute("target-id", "new-target-id-value");

                    await expectTimeout(
                        waitFor(() => expect(deactivateChapterControlsSpy).toHaveBeenCalled()),
                        500,
                    );
                });

                test("changes to the 'target-id' attribute of all the hidden panels other than the chapters panel are ignored", async () => {
                    const nonChaptersPanel = document.createElement(TestPlayer.TAGNAME);
                    nonChaptersPanel.setAttribute("target-id", "non-chapters");
                    nonChaptersPanel.setAttribute("visibility", TestPlayer.VISIBILITY);
                    nonChaptersPanel.innerHTML = `
                        <div id="contents">
                            <div>Chapter1</div>
                            <div>Chapter2</div>
                            <div>Chapter3</div>
                        </div>
                    `;
                    player.panelsContainer.appendChild(nonChaptersPanel);
                    nonChaptersPanel.setAttribute("target-id", "new-target-id-value");

                    await expectTimeout(
                        waitFor(() => expect(deactivateChapterControlsSpy).toHaveBeenCalled()),
                        500,
                    );
                });
            });
        });
    });
});
