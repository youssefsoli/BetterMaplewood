let quickview = document.getElementById('quickview');
let calculation = document.getElementById('calculation');
let liveModification = document.getElementById('liveModification');
let percentages = document.getElementById('percentages');
let betterTableLayout = document.getElementById('betterTableLayout');
let version = document.getElementById('version');

const updateSettings = () => {
    let quickviewToggle = quickview.checked;
    let calculationToggle = calculation.checked;
    let liveModificationToggle = liveModification.checked;
    let percentagesToggle = percentages.checked;
    let betterTableLayoutToggle = betterTableLayout.checked;
    let settings = {
        quickview: quickviewToggle,
        calculation: calculationToggle,
        liveModification: liveModificationToggle,
        percentages: percentagesToggle,
        betterTableLayout: betterTableLayoutToggle
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
        percentages.checked = true;
        betterTableLayout.checked = true;
        updateSettings();
    } else {
        quickview.checked = settings.quickview;
        calculation.checked = settings.calculation;
        liveModification.checked = settings.liveModification;
        percentages.checked = settings.percentages;
        betterTableLayout.checked = settings.betterTableLayout;
    }
});

quickview.onchange = updateSettings;
calculation.onchange = updateSettings;
liveModification.onchange = updateSettings;
percentages.onchange = updateSettings;
betterTableLayout.onchange = updateSettings;
version.innerText = 'v' + (chrome.app ? chrome.app.getDetails().version : browser.runtime.getManifest().version);