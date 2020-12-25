/**
 * @desc Adds a blank new column to the markbook for displaying percentages
 */
const addPercentages = () => {
    const insertLocation = settings.betterTableLayout ? 'td:first' : 'td:last';
    
    // add percent header
    $('<td class="mwTABLE_CELL_HEADER tdAchievement" style="font-weight: bold" align="center">Percent</td>').insertAfter(`#markbookTable tr:first ${insertLocation}`);
    
    // narrow assignment name column width
    $('#markbookTable tr:not(:first)').each(function () {
        const newWidth = settings.betterTableLayout ? '280px' : '250px';
        $(this).find('td:first').css('width', newWidth);
    });

    // copy end column (to keep row style) and paste it after the last column or second column depending on whether the better table layout is enabled
    $('#markbookTable tr:not(:first)').each(function () {
        const cell = $(this).find('td:last');
        $(cell).clone().insertAfter($(this).find(insertLocation));
    });

    // clear the column of any text
    $('#markbookTable tr:not(:first)').each(function () {
        $(this).find(selectors.percentage).text('');
    });
};

/**
 * @desc Iterates through the markbook and calculates the percentage for each row
 */
const calculatePercentages = () => {
    $('#markbookTable tr:not(:first)').each(function () {
        let mark, denominator;
        if (settings.liveModification) {
            mark = parseFloat($(this).find(selectors.mark).val());
            denominator = parseFloat($(this).find(selectors.denominator).val());
        } else {
            mark = parseFloat($(this).find(selectors.mark).text());
            denominator = parseFloat($(this).find(selectors.denominator).text());
        }

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
