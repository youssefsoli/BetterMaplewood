chrome.runtime.onInstalled.addListener(function () {
    let quickview = document.getElementById('quickview');
    let calculation = document.getElementById('calculation');
    let liveModification = document.getElementById('liveModification');
    let percentages = document.getElementById('percentages');
    let betterTableLayout = document.getElementById('betterTableLayout');
    let percentagePosition = document.getElementById('percentagePosition');
    let version = document.getElementById('version');

    const updateSettings = () => {
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

        setElementDisplays();

        /* Set the initial values for the checkboxes */
        chrome.storage.sync.get(null, (settings) => {
            const defaults = {
                quickview: true,
                calculation: true,
                liveModification: true,
                percentages: true,
                betterTableLayout: true,
                percentagePosition: '3'
            };

            // assign saved value if it exist, otherwise value from default object above
            quickview.checked = settings.quickview !== undefined ? settings.quickview : defaults.quickview;
            calculation.checked = settings.calculation !== undefined ? settings.calculation : defaults.calculation;
            liveModification.checked = settings.liveModification !== undefined ? settings.liveModification : defaults.liveModification;
            percentages.checked = settings.percentages !== undefined ? settings.percentages : defaults.percentages;
            betterTableLayout.checked = settings.betterTableLayout !== undefined ? settings.betterTableLayout : defaults.betterTableLayout;
            percentagePosition.value = settings.percentagePosition !== undefined ? settings.percentagePosition : defaults.percentagePosition;

            // eslint-disable-next-line no-prototype-builtins
            if (!Object.keys(defaults).every(key => settings.hasOwnProperty(key))) // Check that settings has all the required keys
                updateSettings();
    
            setElementDisplays();
        });
    };
});

chrome.runtime.onUpdateAvailable.addListener(function () {
    chrome.runtime.reload();
});