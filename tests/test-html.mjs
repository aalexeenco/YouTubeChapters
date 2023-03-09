export const VideoPageURI = "http://youtube.com/watch?v=ABCx0011xZZ";

export function ytChapterLinkHtml(
    t,
    formattedTime,
    chapterTitle,
    videoPageUri = VideoPageURI
) {
    return `
    <a id="endpoint" class="yt-simple-endpoint style-scope ytd-macro-markers-list-item-renderer" draggable="false" 
        href="${videoPageUri}&t=${t}s">
        <div id="thumbnail" class="style-scope ytd-macro-markers-list-item-renderer"></div>
        <div id="details" class="style-scope ytd-macro-markers-list-item-renderer">
            <h4 class="macro-markers style-scope ytd-macro-markers-list-item-renderer" title="${chapterTitle}">
                ${chapterTitle}
            </h4>
            <h4 class="problem-walkthroughs style-scope ytd-macro-markers-list-item-renderer" title="2D" hidden="">
                ${chapterTitle}
            </h4>
            <div id="time" class="style-scope ytd-macro-markers-list-item-renderer">${formattedTime}</div>
        </div>
    </a>
    <div id="details" class="style-scope ytd-macro-markers-list-item-renderer" hidden="">
        <a id="endpoint" class="yt-simple-endpoint style-scope ytd-macro-markers-list-item-renderer" draggable="false" hidden="" href="/watch?v=chXAjMQrcZk&amp;t=277s">
            <h4 class="problem-walkthroughs style-scope ytd-macro-markers-list-item-renderer" title="2D">
                ${chapterTitle}
            </h4>
        </a>
        <div id="time" class="style-scope ytd-macro-markers-list-item-renderer">${formattedTime}</div>
    </div>
`;
}

export function ytPlayerHtml({ playerId, videoTitle, chapterTitle, testId }) {
    return `
<div id="${playerId}" data-testid="${testId ?? playerId}">
    <div class="ytp-chrome-top">
        <div class="ytp-title">${videoTitle ?? ""}</div>
    </div>
    <video class="html5-main-video">
    <div class="ytp-chapter-container">
        <button class="ytp-chapter-title">
            <div class="ytp-chapter-title-content">${chapterTitle ?? ""}</div>
        </button>
    </div>
</div>
`;
}
