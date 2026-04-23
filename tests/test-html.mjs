export const VideoPageURI = "http://youtube.com/watch?v=ABCx0011xZZ";

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
