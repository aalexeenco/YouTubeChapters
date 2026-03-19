import { jest } from "@jest/globals";
import { YTChapterList } from "js/modules/chapters.mjs";
import { ytChapterLinkHtml } from "./../test-html.mjs";
import { expectTimeout } from "./../test-utils.mjs";
import { screen, waitFor } from "./../testing-library-dom.mjs";
import {
    by,
    expecting,
    not,
    toBeInTheDocument,
    toHaveBeenCalled,
} from "../jest-enfluenter.mjs";

const CHAPTERS_CONTAINER_ID = "container-id";
const CHAPTERS_CONTAINER_TEST_ID = "container-test-id";
const CHAPTERS_CONTAINER_PARAMS = { 
    tagName: "chapters-list",
    attrName: "test-attr",
    attrValue: "test-attr-value",
    containerId: CHAPTERS_CONTAINER_ID
 };

describe("YTChapterList chapter navigation", () => {
    let chapterList;

    beforeEach(() => {
        document.body.insertAdjacentHTML(
            "afterbegin",
            `<${CHAPTERS_CONTAINER_PARAMS.tagName} 
                ${CHAPTERS_CONTAINER_PARAMS.attrName}="${CHAPTERS_CONTAINER_PARAMS.attrValue}">
                <div id="${CHAPTERS_CONTAINER_ID}" data-testid="${CHAPTERS_CONTAINER_TEST_ID}">
                ${ytChapterLinkHtml(0, "0:00", "Chapter 1.")}
                ${ytChapterLinkHtml(10, "0:10", "Chapter 2.")}
                ${ytChapterLinkHtml(20, "0:20", "Chapter 3.")}
                </div>
            </${CHAPTERS_CONTAINER_PARAMS.tagName}>
            `
        );
        for (const chapter of screen.getAllByTestId("chapter")) {
            chapter.addEventListener("click", (e) => { e.currentTarget.setAttribute("clicked", "true"); });
        }
        chapterList = new YTChapterList(CHAPTERS_CONTAINER_PARAMS, () => {});
    });

    test("Next chapter navigation", () => {
        const chapters = screen.getAllByTestId("chapter");
        chapters[0].setAttribute("active", "");

        chapterList.navigateToChapter("next");

        expect(chapters[1]).toHaveAttribute("clicked", "true");
    });

    test("Previous chapter navigation", () => {
        const chapters = screen.getAllByTestId("chapter");
        chapters[1].setAttribute("active", "");

        chapterList.navigateToChapter("previous");

        expect(chapters[0]).toHaveAttribute("clicked", "true");
    });

    test("Given the first chapter is active, then previous chapter navigation throws", () => {
        const chapters = screen.getAllByTestId("chapter");
        chapters[0].setAttribute("active", "");

        expect(() => { chapterList.navigateToChapter("previous"); }).toThrow();
    });

    test("Given the last chapter is active, then next chapter navigation throws", () => {
        const chapters = screen.getAllByTestId("chapter");
        chapters[2].setAttribute("active", "");

        expect(() => { chapterList.navigateToChapter("next"); }).toThrow();
    });

    test("Given no chapter is active, then chapter navigation throws", () => {
        expect(() => { chapterList.navigateToChapter("next"); }).toThrow();
        expect(() => { chapterList.navigateToChapter("previous"); }).toThrow();
    });
});

describe("YTChapterList unit tests", () => {
    let callbackMock = jest.fn();
    let chapterList;

    const chapterListContainerElement = () => chapterList.containerElement;
    const callback = () => callbackMock;

    beforeEach(() => {
        document.body.innerHTML = "<div></div>";
        chapterList = new YTChapterList(CHAPTERS_CONTAINER_PARAMS, callbackMock);
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe("Chapter list container node is not in the DOM yet", () => {
        test(
            "Chapter list container element is null",
            by(expecting(chapterListContainerElement), not(toBeInTheDocument))
        );

        describe("Chapter list is initialized", () => {
            let chapterListInitialization;
            beforeEach(() => {
                chapterListInitialization = chapterList.initAsync();
            });

            test(
                "Active chapter changed callback hasn't been called yet",
                by(expecting(callback), not(toHaveBeenCalled))
            );

            test("Initialization is not complete", async () => {
                await expectTimeout(chapterListInitialization);
            });

            test("Navigation throws", async () => {
                expect(() => { chapterList.navigateToChapter("next"); }).toThrow();
                expect(() => { chapterList.navigateToChapter("previous"); }).toThrow();
                expect(() => { chapterList.navigateToChapter("first"); }).toThrow();
            });

            describe("Chapter list container node is added to the DOM afterwards and initialization is complete", () => {
                beforeEach(async () => {
                    document.body.insertAdjacentHTML(
                        "afterbegin",
                        `<${CHAPTERS_CONTAINER_PARAMS.tagName} 
                            ${CHAPTERS_CONTAINER_PARAMS.attrName}="${CHAPTERS_CONTAINER_PARAMS.attrValue}">
                            <div id="${CHAPTERS_CONTAINER_ID}" data-testid="${CHAPTERS_CONTAINER_TEST_ID}">
                            <chapter data-testid="c1">One</chapter>
                            <chapter data-testid="c2">Two</chapter>
                            <chapter data-testid="c3">Three</chapter>
                            </div>
                        </${CHAPTERS_CONTAINER_PARAMS.tagName}>
                        `
                    );
                    await chapterListInitialization;
                });

                test(
                    "Active chapter changed callback has not been called",
                    by(expecting(callback), not(toHaveBeenCalled))
                );

                test("When active chapter is changed later, then callback is called eventually", async () => {
                    callbackMock.mockClear();

                    screen.getByTestId("c1").setAttribute("active", "");

                    await waitFor(() => {
                        expect(callbackMock).toHaveBeenCalledWith({ previous: false, next: true });
                    });

                    screen.getByTestId("c1").removeAttribute("active");
                    screen.getByTestId("c2").setAttribute("active", "");

                    await waitFor(() => {
                        expect(callbackMock).toHaveBeenCalledWith({ previous: true, next: true });
                    });

                    screen.getByTestId("c2").removeAttribute("active");
                    screen.getByTestId("c3").setAttribute("active", "");

                    await waitFor(() => {
                        expect(callbackMock).toHaveBeenCalledWith({ previous: true, next: false });
                    });
                });

                test("When active chapter is not set, then navigation throws", async () => {
                    expect(() => { chapterList.navigateToChapter("next"); }).toThrow();
                    expect(() => { chapterList.navigateToChapter("previous"); }).toThrow();
                    expect(() => { chapterList.navigateToChapter("first"); }).toThrow();
                });
            });
        });
    });

    describe("Chapter list container node is in the DOM already", () => {
        beforeEach(() => {
            document.body.insertAdjacentHTML(
                "afterbegin",
                `<${CHAPTERS_CONTAINER_PARAMS.tagName}
                    ${CHAPTERS_CONTAINER_PARAMS.attrName}="${CHAPTERS_CONTAINER_PARAMS.attrValue}">
                    <div id="${CHAPTERS_CONTAINER_ID}" data-testid="${CHAPTERS_CONTAINER_TEST_ID}">
                    <chapter data-testid="c1">One</chapter>
                    <chapter data-testid="c2">Two</chapter>
                    <chapter data-testid="c3">Three</chapter>
                    </div>
                </${CHAPTERS_CONTAINER_PARAMS.tagName}>
                `
            );
        });

        test("Chapter list container element is the DOM element with the given id", () => {
            expect(chapterList.containerElement).toBeDefined();
            expect(chapterList.containerElement.id).toBe(CHAPTERS_CONTAINER_ID);
            expect(chapterList.containerElement).toBe(
                screen.getByTestId(CHAPTERS_CONTAINER_TEST_ID)
            );
        });

        describe("Chapter list is initialized and the initialization is complete", () => {
            beforeEach(async () => {
                await chapterList.initAsync();
            });

            test(
                "Chapter list changed callback has not been called",
                by(expecting(callback), not(toHaveBeenCalled))
            );

            test("When active chapter is changed later, then callback is called eventually", async () => {
                callbackMock.mockClear();

                screen.getByTestId("c1").setAttribute("active", "");

                await waitFor(() => {
                    expect(callbackMock).toHaveBeenCalledWith({ previous: false, next: true });
                });

                screen.getByTestId("c1").removeAttribute("active");
                screen.getByTestId("c2").setAttribute("active", "");

                await waitFor(() => {
                    expect(callbackMock).toHaveBeenCalledWith({ previous: true, next: true });
                });

                screen.getByTestId("c2").removeAttribute("active");
                screen.getByTestId("c3").setAttribute("active", "");

                await waitFor(() => {
                    expect(callbackMock).toHaveBeenCalledWith({ previous: true, next: false });
                });
            });

            test("When active chapter is not set, then navigation throws", async () => {
                expect(() => { chapterList.navigateToChapter("next"); }).toThrow();
                expect(() => { chapterList.navigateToChapter("previous"); }).toThrow();
                expect(() => { chapterList.navigateToChapter("first"); }).toThrow();
            });
        });
    });
});
