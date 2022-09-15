export const VideoPageURI = "http://youtube.com/watch?v=ABCx0011xZZ";

export const ytDescriptionChapterLinkHtml = (
    t,
    formattedTime,
    chapterTitle,
    videoPageUri = VideoPageURI
) => `
<a id="endpoint" href="${videoPageUri}&t=${t}s" class="yt-simple-endpoint ytd-macro-markers-list-item-renderer">
    <div id="details" class="style-scope ytd-macro-markers-list-item-renderer">
        <h4 class="style-scope ytd-macro-markers-list-item-renderer">
            ${chapterTitle}
        </h4>
        <div id="time" class="style-scope ytd-macro-markers-list-item-renderer">
            ${formattedTime}
        </div>
    </div>
</a>
`;

export const ytPlayerHtml = ({ playerId, videoTitle, chapterTitle, testId }) => `
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
