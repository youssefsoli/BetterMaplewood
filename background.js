// This is called whenever the extension is first installed or updated
chrome.runtime.onInstalled.addListener(() => {
    const defaultSettings = {
        quickview: true,
        calculation: true,
        liveModification: true,
        percentages: true,
        betterTableLayout: true,
        percentagePosition: '3',
    };

    chrome.storage.sync.get(null, settings => {
        // Set setting to default if it's not found
        Object.keys(defaultSettings).map(key => {
            if (!settings.hasOwnProperty(key))
                settings[key] = defaultSettings[key];
        });

        chrome.storage.sync.set(settings);
    });
});

// Reload the extension when there is a new update
chrome.runtime.onUpdateAvailable.addListener(() => {
    chrome.runtime.reload();
});
