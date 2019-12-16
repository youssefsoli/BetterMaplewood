let quickview = document.getElementById('quickview');
let calculation = document.getElementById('calculation');
let liveModification = document.getElementById('liveModification');

const updateSettings = () => {
    quickviewToggle = quickview.checked;
    calculationToggle = calculation.checked;
    liveModificationToggle = liveModification.checked;
    let settings = {
        quickview: quickviewToggle,
        calculation: calculationToggle,
        liveModification: liveModificationToggle
    };

    chrome.storage.sync.set(settings, () => {
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, (tab) => {
            const url = new URL(tab[0].url);
            if (url.hostname === 'hosting.maplewood.com')
                chrome.tabs.update(tab[0].id, { // Refresh the page
                    url: tab[0].url
                });
        });
    });
}

/* Set the initial values for the checkboxes */
chrome.storage.sync.get(null, (settings) => {
    if (Object.entries(settings).length === 0 && settings.constructor === Object) { // Enable all functional settings if it hasn't been set yet
        quickview.checked = true;
        calculation.checked = true;
        liveModification.checked = true;
        updateSettings();
    } else {
        quickview.checked = settings.quickview;
        calculation.checked = settings.calculation;
        liveModification.checked = settings.liveModification;
    }
});

quickview.onchange = updateSettings;
calculation.onchange = updateSettings;
liveModification.onchange = updateSettings;