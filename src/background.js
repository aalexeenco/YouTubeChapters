chrome.commands.onCommand.addListener(function (command) {
    const navigationDirection =
        command === "next-chapter" ? "next" : command === "prev-chapter" ? "previous" : null;
    if (navigationDirection) {
        chrome.tabs.query({ active: true, currentWindow: true }, function (activeTabs) {
            chrome.tabs.sendMessage(activeTabs[0].id, { navigationDirection: navigationDirection });
        });
    }
});

chrome.runtime.onMessage.addListener(function (message) {
    if (message.type === "chapter") {
        chrome.notifications.create(
            "",
            {
                iconUrl: chrome.runtime.getURL("images/icon48.png"),
                title: message.title,
                message: message.text,
                type: "basic"
            }
        );
    }
});
