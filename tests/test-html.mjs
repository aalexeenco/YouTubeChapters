export const VideoPageURI = "http://youtube.com/watch?v=ABCx0011xZZ";

export function ytChapterLinkHtml(
    t,
    formattedTime,
    chapterTitle,
    videoPageUri = VideoPageURI, 
    styleClass = "ytd-macro-markers-list-renderer"
) {
    let timestr = t > 0 ? `&t=${t}s` : "";
    return `
    <ytd-macro-markers-list-item-renderer class="style-scope ${styleClass}">
    <a id="endpoint" class="yt-simple-endpoint style-scope ytd-macro-markers-list-item-renderer" draggable="false" 
        href="${videoPageUri}${timestr}">
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
    <div id="details" class="style-scope ytd-macro-markers-list-item-renderer" hidden>
        <a id="endpoint" class="yt-simple-endpoint style-scope ytd-macro-markers-list-item-renderer" draggable="false" hidden href="${videoPageUri}${timestr}">
            <h4 class="problem-walkthroughs style-scope ytd-macro-markers-list-item-renderer" title="2D">
                ${chapterTitle}
            </h4>
        </a>
        <div id="time" class="style-scope ytd-macro-markers-list-item-renderer">${formattedTime}</div>
    </div>
    </ytd-macro-markers-list-item-renderer>
`;
}

export function ytPlayerHtml({ playerId, videoTitle, chapterTitle, testId }) {
    return `
<div id="${playerId}" data-testid="${testId ?? playerId}">
    <div class="html5-video-container" data-layer="0" draggable="true">
        <video tabindex="-1" class="video-stream html5-main-video">
        </video>
    </div>
    <div class="ytp-chrome-top">
        <div class="ytp-title">${videoTitle ?? ""}</div>
    </div>
    <div class="ytp-chrome-bottom">
        <div class="ytp-chrome-controls"
            <div class="ytp-left-controls">
                <div class="ytp-chapter-container">
                    <button class="ytp-chapter-title ytp-button">
                        <div class="ytp-chapter-title-content">${chapterTitle ?? ""}</div>
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>
`;
}
