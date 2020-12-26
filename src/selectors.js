let selectors;

/**
 * @desc Get correct jQuery selectors depending on the table layout
 * @throws Will throw an error if the percentages position is not 'Last column' or 'Second column'
 */
const getSelectors = () => {
    if (settings.betterTableLayout && settings.liveModification) {
        if (!settings.percentages) {
            selectors = {
                mark: 'td:nth-child(2) > input:first',
                weight: 'td:nth-child(3) > input',
                denominator: 'td:nth-child(2) > input:last'
            };
            return;
        }
        switch (settings.percentagesPosition) {
            case 'Last column': {
                selectors = {
                    mark: 'td:nth-child(2) > input:first',
                    weight: 'td:nth-child(3) > input',
                    denominator: 'td:nth-child(2) > input:last',
                    percentage: 'td:nth-child(5)'
                };
                break;
            }
            case 'Second column': {
                selectors = {
                    mark: 'td:nth-child(3) > input:first',
                    weight: 'td:nth-child(4) > input',
                    denominator: 'td:nth-child(3) > input:last',
                    percentage: 'td:nth-child(2)'
                };
                break;
            }
            default: {
                throw new Error('Unknown percentages position', settings.percentagesPosition);
            }
        }
    } else if (settings.liveModification) {
        if (!settings.percentages) {
            selectors = {
                mark: 'td:nth-child(2) > input',
                weight: 'td:nth-child(4) > input',
                denominator: 'td:nth-child(5) > input'
            };
            return;
        }
        switch (settings.percentagesPosition) {
            case 'Last column': {
                selectors = {
                    mark: 'td:nth-child(2) > input',
                    weight: 'td:nth-child(4) > input',
                    denominator: 'td:nth-child(5) > input',
                    percentage: 'td:nth-child(6)'
                };
                break;
            }
            case 'Second column': {
                selectors = {
                    mark: 'td:nth-child(3) > input',
                    weight: 'td:nth-child(5) > input',
                    denominator: 'td:nth-child(6) > input',
                    percentage: 'td:nth-child(2)'
                };
                break;
            }
            default: {
                throw new Error('Unknown percentages position', settings.percentagesPosition);
            }
        }
    } else if (settings.betterTableLayout) {
        if (!settings.percentages) {
            selectors = {
                mark: 'td:nth-child(2) > span:first',
                weight: 'td:nth-child(3)',
                denominator: 'td:nth-child(2) > span:last'
            };
            return;
        }
        switch (settings.percentagesPosition) {
            case 'Last column': {
                selectors = {
                    mark: 'td:nth-child(2) > span:first',
                    weight: 'td:nth-child(3)',
                    denominator: 'td:nth-child(2) > span:last',
                    percentage: 'td:nth-child(5)'
                };
                break;
            }
            case 'Second column': {
                selectors = {
                    mark: 'td:nth-child(3) > span:first',
                    weight: 'td:nth-child(4)',
                    denominator: 'td:nth-child(3) > span:last',
                    percentage: 'td:nth-child(2)'
                };
                break;
            }
            default: {
                throw new Error('Unknown percentages position', settings.percentagesPosition);
            }
        }  
    } else if (settings.percentages) {
        switch (settings.percentagesPosition) {
            case 'Last column': {
                selectors = {
                    mark: 'td:nth-child(2)',
                    weight: 'td:nth-child(4)',
                    denominator: 'td:nth-child(5)',
                    percentage: 'td:nth-child(6)'
                };
                break;
            }
            case 'Second column': {
                selectors = {
                    mark: 'td:nth-child(3)',
                    weight: 'td:nth-child(5)',
                    denominator: 'td:nth-child(6)',
                    percentage: 'td:nth-child(2)'
                };
                break;
            }
            default: {
                throw new Error('Unknown percentages position', settings.percentagesPosition);
            }
        }
    }
};