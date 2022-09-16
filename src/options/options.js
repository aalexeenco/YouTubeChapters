let options = {
    notificationsEnable: false,
    notificationsSingle: false
};

let optionsForm = document.getElementById("optionsForm");

function restoreOptions() {
    chrome.storage.local.get(
        { options: { notificationsEnable: false, notificationsSingle: false } },
        (items) => {
            Object.assign(options, items.options)
            optionsForm.notificationsEnable.checked = options.notificationsEnable;
            optionsForm.notificationsSingle.checked = options.notificationsSingle;
        }
    );
}

document.addEventListener("DOMContentLoaded", restoreOptions);

function saveOptions() {
    chrome.storage.local.set({ options: options });
}

optionsForm.notificationsEnable.addEventListener("change", (event) => {
    options.notificationsEnable = event.target.checked;
    saveOptions();
});
optionsForm.notificationsSingle.addEventListener("click", (event) => {
    options.notificationsSingle = event.target.checked;
    saveOptions();
});
