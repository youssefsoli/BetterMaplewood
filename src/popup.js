let quickview = document.getElementById('quickview');
let calculation = document.getElementById('calculation');
let liveModification = document.getElementById('liveModification');
let percentageColumn = document.getElementById('percentageColumn');
let settings;

const updateSettings = () => {
    let quickviewToggle = quickview.checked;
    let calculationToggle = calculation.checked;
    let liveModificationToggle = liveModification.checked;
    let percentageColumnToggle = percentageColumn.checked;
    settings = {
        quickview: quickviewToggle,
        calculation: calculationToggle,
        liveModification: liveModificationToggle,
        percentageColumn: percentageColumnToggle
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
};

/* Set the initial values for the checkboxes */
chrome.storage.sync.get(null, (settings) => {
    if (Object.entries(settings).length === 0 && settings.constructor === Object) { // Enable all functional settings if it hasn't been set yet
        quickview.checked = true;
        calculation.checked = true;
        liveModification.checked = true;
        percentageColumn.checked = true;
        updateSettings();
    } else {
        quickview.checked = settings.quickview;
        calculation.checked = settings.calculation;
        liveModification.checked = settings.liveModification;
        percentageColumn.checked = settings.percentageColumn;
    }
});

quickview.onchange = updateSettings;
calculation.onchange = updateSettings;
liveModification.onchange = updateSettings;
percentageColumn.onchange = updateSettings;