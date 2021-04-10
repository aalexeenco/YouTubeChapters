(async () => {
    const { YTChannelPlayer, YTMainPlayer } = await import(
        chrome.runtime.getURL("js/modules/player.mjs")
    );
    new YTChannelPlayer().initAsync();
    new YTMainPlayer().initAsync();
})();
