let selectors = {};

/**
 * @desc Get correct jQuery selectors depending on the table layout
 */
const getSelectors = () => {
    const initialPosition = {
        mark: 2,
        weight: settings.betterTableLayout ? 3 : 4,
        denominator: settings.betterTableLayout ? 2 : 5
    };
    const percentagePosition = parseInt(settings.percentagePosition);

    // get base selector with position
    Object.keys(initialPosition).map(key => {
        let position = initialPosition[key];
        if (settings.percentages && percentagePosition <= position)
            position++;
        selectors[key] = `td:nth-child(${position})`;
    });

    // add input to selector
    if (settings.liveModification || settings.betterTableLayout)
        Object.keys(selectors).forEach(key => selectors[key] += ' > input');

    // add first or last to selector
    if (settings.betterTableLayout) {
        selectors.mark += ':first';
        selectors.denominator += ':last';
    }

    // add percentage selector
    if (settings.percentages)
        selectors.percentage = `td:nth-child(${settings.percentagePosition})`;
};