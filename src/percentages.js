/**
 * @desc Adds a blank new column to the markbook for displaying percentages
 */
const addPercentages = () => {
    const insertLocation = `td:nth-child(${parseInt(settings.percentagePosition) - 1})`;
    
    // add percent header
    $('<td class="mwTABLE_CELL_HEADER tdAchievement" style="font-weight: bold;" align="center">Percent</td>')
        .insertAfter(`#markbookTable tr:first ${insertLocation}`);
    
    // set width of percentage column if better table layout is enabled
    if (settings.betterTableLayout) {
        const percentageHeader = $(`#markbookTable td:first ${selectors.percentage}`);
        percentageHeader.css('width', '10%');
    }

    // copy end column (to keep row style) and paste it in the selected insert location
    $('#markbookTable tr:not(:first)').each(function () {
        const copy = $(this).find('td:last').clone();
        copy.html('');
        copy.insertAfter($(this).find(insertLocation));
    });
};

/**
 * @desc Iterates through the markbook and calculates the percentage for each row
 */
const calculatePercentages = () => {
    $('#markbookTable tr:not(:first)').each(function () {
        const mark = parseFloat($(this).find(selectors.mark).val());
        const denominator = parseFloat($(this).find(selectors.denominator).val());

        const percentage = +(mark / denominator * 100).toFixed(2);
        const percentageCell = $(this).find(selectors.percentage);

        // change the percentage cell's value if the percentage is valid, otherwise clear it
        if (!isNaN(percentage)) {
            percentageCell.text(percentage + '%');
        } else {
            percentageCell.text('');
        }
    });
};
