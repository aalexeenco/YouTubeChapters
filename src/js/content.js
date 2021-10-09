(async () => {
    const { nodeAddedAsync } = await import(
        chrome.runtime.getURL("js/modules/utils.mjs")
    );
    const { YTChannelPlayer, YTMainPlayer } = await import(
        chrome.runtime.getURL("js/modules/player.mjs")
    );
    const containerId = "columns";
    if (!document.getElementById(containerId)) {
        await nodeAddedAsync(document, (node) => node.id === containerId)
    }
    new YTChannelPlayer().initAsync();
    new YTMainPlayer().initAsync();
})();
