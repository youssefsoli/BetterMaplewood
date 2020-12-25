// Get correct jQuery selectors depending on the table layout
let selectors;
const getSelectors = () => {
    if (settings.betterTableLayout && settings.liveModification) {
        selectors = {
            mark: 'td:nth-last-child(3) > input:first',
            weight: 'td:nth-last-child(2) > input',
            denominator: 'td:nth-last-child(3) > input:last',
            percentage: 'td:nth-child(2)'
        };
    } else if (settings.liveModification) {
        selectors = {
            mark: 'td:nth-child(2) > input',
            weight: 'td:nth-child(4) > input',
            denominator: 'td:nth-child(5) > input',
            percentage: 'td:nth-child(6)'
        };
    } else if (settings.betterTableLayout) {
        selectors = {
            mark: 'td:nth-last-child(3) > span:first',
            weight: 'td:nth-last-child(2)',
            denominator: 'td:nth-last-child(3) > span:last',
            percentage: 'td:nth-child(2)'
        };
    } else {
        selectors = {
            mark: 'td:nth-child(2)',
            weight: 'td:nth-child(4)',
            denominator: 'td:nth-child(5)',
            percentage: 'td:nth-child(6)'
        };
    }
};