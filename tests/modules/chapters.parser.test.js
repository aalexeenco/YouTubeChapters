import { parseChapters } from "js/modules/chapters.mjs";
import { ytDescriptionChapterLinkHtml } from "./../test-html.mjs";
import { within } from "./../testing-library-dom.mjs";

const videoPageURI = "http://youtube.com/watch?v=test"

describe("Chapters are parsed from the video description", () => {
    let container;
    let actualChapters;
    
    beforeAll(() => {
        document.head.innerHTML = `<base>${videoPageURI}&ch=a&from=ie</base>`;
        container = document.createElement("div");
        container.innerHTML = `
        <p><span> Header <b>text</b> </span>
        <div>
            New <a href="http://youtube.com?watch?v=abc&=34" />video</a> is out!

            ${ytDescriptionChapterLinkHtml(10, "18:00", "I'm not a chapter!", videoPageURI)}
    
            Timecodes:
            ${ytDescriptionChapterLinkHtml(0, "00:00", "Chapter 1.", videoPageURI)}
            ${ytDescriptionChapterLinkHtml(60, "01:00", "Chapter 11.", videoPageURI)}
            ${ytDescriptionChapterLinkHtml(125, "02:05", "Chapter 2.", videoPageURI)}
            ${ytDescriptionChapterLinkHtml(366, "03:06", "Chapter 3.", videoPageURI)}
            ${ytDescriptionChapterLinkHtml(3612, "01:00:12", "Chapter 4.", videoPageURI)}
            ${ytDescriptionChapterLinkHtml(3735, "01:02:05", "Chapter 5.", videoPageURI)}

            <a href="${videoPageURI}&t=4800" class="yt-simple-endpoint" />Chapter I am not.</a>
            <a href="${videoPageURI}&t=5800" class="yt-formatted-string" />Neither am I.</a>

            Please, subscribe to my channel!
            <a href="http://youtube.com?search?q=peace" />
        </div>
        `;
        
        actualChapters = parseChapters(container);
    });

    test("All chapters are parsed", () => {
        expect(actualChapters).toHaveLength(6);

        const { getByText } = within(container);
        expect(actualChapters[0].t).toEqual(0);
        expect(actualChapters[0].anchor).toBe(getByText("00:00"));
        expect(actualChapters[1].t).toEqual(60);
        expect(actualChapters[1].anchor).toBe(getByText("01:00"));
        expect(actualChapters[2].t).toEqual(125);
        expect(actualChapters[2].anchor).toBe(getByText("02:05"));
        expect(actualChapters[3].t).toEqual(366);
        expect(actualChapters[3].anchor).toBe(getByText("03:06"));
        expect(actualChapters[4].t).toEqual(3612);
        expect(actualChapters[4].anchor).toBe(getByText("01:00:12"));
        expect(actualChapters[5].t).toEqual(3735);
        expect(actualChapters[5].anchor).toBe(getByText("01:02:05"));
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
