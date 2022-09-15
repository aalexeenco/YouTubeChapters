chrome.commands.onCommand.addListener(function (command) {
    const navigationDirection =
        command === "next-chapter" ? "next" : command === "prev-chapter" ? "previous" : null;
    if (navigationDirection) {
        chrome.tabs.query({ active: true, currentWindow: true }, function (activeTabs) {
            chrome.tabs.sendMessage(activeTabs[0].id, { navigationDirection: navigationDirection });
        });
    }
});

chrome.runtime.onMessage.addListener(function (message, sender) {
    if (message.type === "chapter") {
        chrome.storage.local.get(
            { options: { notificationsEnable: false, notificationsSingle: false } },
            (items) => {
            if (items.options.notificationsEnable) {
                let notificationId = items.options.notificationsSingle ? "tab:" + sender.tab?.id : "";
                if (notificationId) {
                    chrome.notifications.clear(notificationId);
                }
                chrome.notifications.create(
                    notificationId,
                    {
                        iconUrl: chrome.runtime.getURL("images/icon48.png"),
                        title: message.title,
                        message: message.text,
                        type: "basic"
                    }
                );
            }
        });
    }
});
