let quickview = document.getElementById('quickview');
let calculation = document.getElementById('calculation');
let liveModification = document.getElementById('liveModification');
let percentages = document.getElementById('percentages');
let betterTableLayout = document.getElementById('betterTableLayout');
let percentagePosition = document.getElementById('percentagePosition');
let version = document.getElementById('version');

const setElementDisplays = () => {
    // hide percentages position select if percentages are disabled
    document.getElementsByClassName('percentagePosition')[0].style.display = percentages.checked ? 'block' : 'none';

    // hide 6th column option if better table layout is disabled
    if (!betterTableLayout.checked && percentagePosition.length === 4) {
        let option = document.createElement('option');
        option.text = '6';
        option.value = '6';
        percentagePosition.add(option);
    }
    if (betterTableLayout.checked && percentagePosition.length === 5) {
        if (percentagePosition.value === '6')
            percentagePosition.value = '5';
        percentagePosition.remove(percentagePosition.length - 1);
    }
};

const updateSettings = () => {
    setElementDisplays();

    let quickviewToggle = quickview.checked;
    let calculationToggle = calculation.checked;
    let liveModificationToggle = liveModification.checked;
    let percentagesToggle = percentages.checked;
    let betterTableLayoutToggle = betterTableLayout.checked;
    let percentagePositionValue = percentagePosition.value;

    let settings = {
        quickview: quickviewToggle,
        calculation: calculationToggle,
        liveModification: liveModificationToggle,
        percentages: percentagesToggle,
        betterTableLayout: betterTableLayoutToggle,
        percentagePosition: percentagePositionValue
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
    quickview.checked = settings.quickview;
    calculation.checked = settings.calculation;
    liveModification.checked = settings.liveModification;
    percentages.checked = settings.percentages;
    betterTableLayout.checked = settings.betterTableLayout;
    percentagePosition.value = settings.percentagePosition;
    
    setElementDisplays();
});

quickview.onchange = updateSettings;
calculation.onchange = updateSettings;
liveModification.onchange = updateSettings;
percentages.onchange = updateSettings;
betterTableLayout.onchange = updateSettings;
percentagePosition.onchange = updateSettings;
version.innerText = 'v' + (chrome.app ? chrome.app.getDetails().version : browser.runtime.getManifest().version);
