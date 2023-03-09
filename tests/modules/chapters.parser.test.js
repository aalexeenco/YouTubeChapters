import { parseChapters } from "js/modules/chapters.mjs";
import { ytChapterLinkHtml } from "./../test-html.mjs";
import "@testing-library/jest-dom";

const videoPageURI = "http://youtube.com/watch?v=test"

describe("Chapters are parsed from the chapters panel", () => {
    let container;
    let actualChapters;
    
    beforeAll(() => {
        document.head.innerHTML = `<base>${videoPageURI}&ch=a&from=ie</base>`;
        container = document.createElement("div");
        container.innerHTML = `
        <p><span> Header <b>text</b> </span>
        <div>
            New <a href="http://youtube.com?watch?v=abc&=34" />video</a> is out!

            ${ytChapterLinkHtml(0, "00:00", "Chapter 1.", videoPageURI)}
            ${ytChapterLinkHtml(60, "01:00", "Chapter 11.", videoPageURI)}
            ${ytChapterLinkHtml(125, "02:05", "Chapter 4.", videoPageURI)}
            ${ytChapterLinkHtml(366, "03:06", "Chapter 2.", videoPageURI)}
            ${ytChapterLinkHtml(3612, "01:00:12", "Chapter 5.", videoPageURI)}
            ${ytChapterLinkHtml(3735, "01:02:05", "Chapter 3.", videoPageURI)}

            Please, subscribe to my channel!
            <a href="http://youtube.com?search?q=peace" />
        </div>
        `;
        
        actualChapters = parseChapters(container);
    });

    test("All chapters are parsed", () => {
        expect(actualChapters).toHaveLength(6);

        expect(actualChapters[0].t).toEqual(0);
        expect(actualChapters[0].anchor).toHaveTextContent("Chapter 1.");
        expect(actualChapters[1].t).toEqual(60);
        expect(actualChapters[1].anchor).toHaveTextContent("Chapter 11.");
        expect(actualChapters[2].t).toEqual(125);
        expect(actualChapters[2].anchor).toHaveTextContent("Chapter 4");
        expect(actualChapters[3].t).toEqual(366);
        expect(actualChapters[3].anchor).toHaveTextContent("Chapter 2.");
        expect(actualChapters[4].t).toEqual(3612);
        expect(actualChapters[4].anchor).toHaveTextContent("Chapter 5.");
        expect(actualChapters[5].t).toEqual(3735);
        expect(actualChapters[5].anchor).toHaveTextContent("Chapter 3.");
    });
});

test("When there are no chapter links in the container, then empty array is returned", () => {
    document.head.innerHTML = `<base>${videoPageURI}&ch=a&from=ie</base>`;
    const container = document.createElement("div");
    container.innerHTML = `
    <p><span> Header <b>text</b> </span>
    <a href="${videoPageURI}&t=0s" />
    <div><a href="http://youtube.com?watch?v=abc&=34" /></div>
    `;
    
    const actualChapters = parseChapters(container);

    expect(actualChapters).toHaveLength(0);
});
