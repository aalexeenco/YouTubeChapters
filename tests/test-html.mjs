export const VideoPageURI = "http://youtube.com/watch?v=ABCx0011xZZ";

export const ytDescriptionChapterLinkHtml = (
    t,
    formattedTime,
    chapterTitle,
    videoPageUri = VideoPageURI
) => `
<a href="${videoPageUri}&t=${t}s" class="yt-simple-endpoint yt-formatted-string">${formattedTime}</a>
<span class="style-scope yt-formatted-string"> ${chapterTitle}</span>
`;

export const ytPlayerHtml = ({ playerId, chapterTitle, testId }) => `
<div id="${playerId}" data-testid="${testId ?? playerId}">
    <video class="html5-main-video">
    <div class="ytp-chapter-container">
        <button class="ytp-chapter-title">
            <div class="ytp-chapter-title-content">${chapterTitle ?? ""}</div>
        </button>
    </div>
</div>
`;
