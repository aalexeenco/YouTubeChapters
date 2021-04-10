import { jest } from "@jest/globals";
import { YTChapterList } from "js/modules/chapters.mjs";
import { expectTimeout } from "./../test-utils.mjs";
import { screen, waitFor } from "./../testing-library-dom.mjs";
import {
    by,
    expecting,
    not,
    toBeInTheDocument,
    toHaveBeenCalled,
    toHaveBeenCalledWith,
} from "../jest-enfluenter.mjs";

const CHAPTERS_CONTAINER_ID = "container-id";
const CHAPTERS_CONTAINER_TEST_ID = "container-test-id";

describe("YTChapterList unit tests", () => {
    let parseChaptersSpy = jest.spyOn(YTChapterList, YTChapterList.parseChapters.name);
    let callbackMock = jest.fn();
    let chapterList;

    const chapterListContainerElement = () => chapterList.containerElement;
    const staticParseChapters = () => parseChaptersSpy;
    const callback = () => callbackMock;

    beforeEach(() => {
        document.body.innerHTML = "<div></div>";
        parseChaptersSpy.mockReturnValue([]);
        chapterList = new YTChapterList(CHAPTERS_CONTAINER_ID, callbackMock);
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe("Videо description node is not in the DOM yet", () => {
        test(
            "Chapter container element is null",
            by(expecting(chapterListContainerElement), not(toBeInTheDocument))
        );

        test.each([0, 1, 2, 50, 102, 283, 384])(
            "Neither chapter index, nor next/previous chapters can be found for t=%ss",
            (t) => {
                expect(chapterList.findIndexByVideoTime(t)).toBe(-1);
                expect(chapterList.nextFrom(t)).toBeUndefined();
                expect(chapterList.previousFrom(t)).toBeUndefined();
            }
        );

        describe("Chapter list is initialized", () => {
            let chapterListInitialization;
            beforeEach(() => {
                chapterListInitialization = chapterList.initAsync();
            });

            test(
                "Chapters are not parsed yet",
                by(expecting(staticParseChapters), not(toHaveBeenCalled))
            );

            test(
                "Chapter list changed callback hasn't been called yet",
                by(expecting(callback), not(toHaveBeenCalled))
            );

            test("Initialization is not complete", async () => {
                await expectTimeout(chapterListInitialization);
            });

            describe("Video description node is added to the DOM afterwards and initialization is complete", () => {
                const parsedChapters = [
                    { t: 0, anchor: { id: "link1" } },
                    { t: 10, anchor: { id: "link2" } },
                    { t: 20, anchor: { id: "link3" } },
                    { t: 30, anchor: { id: "link4" } },
                    { t: 100, anchor: { id: "link5" } },
                ];
                beforeEach(async () => {
                    parseChaptersSpy.mockReturnValue(parsedChapters);
                    document.body.insertAdjacentHTML(
                        "afterbegin",
                        `<div id="${CHAPTERS_CONTAINER_ID}" data-testid="${CHAPTERS_CONTAINER_TEST_ID}">
                        Content is irrelevant in test because chapters parsing is mocked!
                        </div>
                        `
                    );
                    await chapterListInitialization;
                });

                test(
                    "Chapters are parsed from the container element",
                    by(
                        expecting(staticParseChapters),
                        toHaveBeenCalledWith(chapterListContainerElement)
                    )
                );

                test(
                    "Chapter list changed callback has been called",
                    by(expecting(callback), toHaveBeenCalled)
                );

                test.each([
                    [0, 0, parsedChapters[1], undefined],
                    [6, 0, parsedChapters[1], undefined],
                    [11, 1, parsedChapters[2], parsedChapters[0]],
                    [20, 2, parsedChapters[3], parsedChapters[1]],
                    [21, 2, parsedChapters[3], parsedChapters[1]],
                    [91, 3, parsedChapters[4], parsedChapters[2]],
                    [101, 4, undefined, parsedChapters[3]],
                    [200, 4, undefined, parsedChapters[3]],
                ])(
                    "Chapter index, next and previous chapters can be found for t=%ss now",
                    (t, index, nextChapter, previousChapter) => {
                        expect(chapterList.findIndexByVideoTime(t)).toBe(index);
                        expect(chapterList.nextFrom(t)).toBe(nextChapter);
                        expect(chapterList.previousFrom(t)).toBe(previousChapter);
                    }
                );

                test("When container node content is changed later, then chapters are re-parsed and callback is called eventually", async () => {
                    callbackMock.mockClear();
                    parseChaptersSpy.mockClear();

                    chapterList.containerElement.textContent = "New chapter links to be parsed";

                    await waitFor(() => {
                        expect(parseChaptersSpy).toHaveBeenCalledWith(chapterList.containerElement);
                        expect(callbackMock).toHaveBeenCalled();
                    });
                });
            });
        });
    });

    describe("Video description node is in the DOM already", () => {
        beforeEach(() => {
            document.body.insertAdjacentHTML(
                "afterbegin",
                `<div id="${CHAPTERS_CONTAINER_ID}" data-testid="${CHAPTERS_CONTAINER_TEST_ID}">
                Content is irrelevant in test because chapters parsing is mocked!
                </div>
                `
            );
        });

        test("Chapter container element is the DOM element with the given id", () => {
            expect(chapterList.containerElement).toBeDefined();
            expect(chapterList.containerElement.id).toBe(CHAPTERS_CONTAINER_ID);
            expect(chapterList.containerElement).toBe(
                screen.getByTestId(CHAPTERS_CONTAINER_TEST_ID)
            );
        });

        test.each([0, 1, 2, 50, 102, 283, 384])(
            "Neither chapter index, nor next/previous chapters can be found for t=%ss yet",
            (t) => {
                expect(chapterList.findIndexByVideoTime(t)).toBe(-1);
                expect(chapterList.nextFrom(t)).toBeUndefined();
                expect(chapterList.previousFrom(t)).toBeUndefined();
            }
        );

        describe("Chapter list is initialized and the initialization is complete", () => {
            const parsedChapters = [
                { t: 0, anchor: { id: "link1" } },
                { t: 10, anchor: { id: "link2" } },
                { t: 20, anchor: { id: "link3" } },
                { t: 30, anchor: { id: "link4" } },
                { t: 100, anchor: { id: "link5" } },
            ];
            beforeEach(async () => {
                parseChaptersSpy.mockReturnValue(parsedChapters);
                await chapterList.initAsync();
            });

            test(
                "Chapters are parsed from the container element",
                // prettier-ignore
                by(expecting(staticParseChapters), toHaveBeenCalledWith(chapterListContainerElement))
            );

            test(
                "Chapter list changed callback has been called",
                by(expecting(callback), toHaveBeenCalled)
            );

            test.each([
                [0, 0, parsedChapters[1], undefined],
                [6, 0, parsedChapters[1], undefined],
                [11, 1, parsedChapters[2], parsedChapters[0]],
                [20, 2, parsedChapters[3], parsedChapters[1]],
                [21, 2, parsedChapters[3], parsedChapters[1]],
                [91, 3, parsedChapters[4], parsedChapters[2]],
                [101, 4, undefined, parsedChapters[3]],
                [200, 4, undefined, parsedChapters[3]],
            ])(
                "Chapter index, next and previous chapters can be found for t=%ss now",
                (t, index, nextChapter, previousChapter) => {
                    expect(chapterList.findIndexByVideoTime(t)).toBe(index);
                    expect(chapterList.nextFrom(t)).toBe(nextChapter);
                    expect(chapterList.previousFrom(t)).toBe(previousChapter);
                }
            );

            test("When container node content is changed later, then chapters are re-parsed and callback is called eventually", async () => {
                callbackMock.mockClear();
                parseChaptersSpy.mockClear();

                chapterList.containerElement.textContent = "New chapter links to be parsed";

                await waitFor(() => {
                    expect(parseChaptersSpy).toHaveBeenCalledWith(chapterList.containerElement);
                    expect(callbackMock).toHaveBeenCalled();
                });
            });
        });
    });
});
