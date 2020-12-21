/**
 * @desc Adds a blank new column to the markbook for displaying percentages
 */
const addPercentageColumn = () => {
    // add percent header
    $('<td class="mwTABLE_CELL_HEADER tdAchievement" style="font-weight: bold" align="center">Percent</td>').insertAfter('#markbookTable tr:first td:last');
    
    // narrow assignment name column width
    $('#markbookTable tr:not(:first)').each(function () {
        $(this).find('td:first').css('width', '250px');
    });

    // copy end column (to keep row style) and paste it after the last column
    $('#markbookTable tr:not(:first)').each(function () {
        const cell = $(this).find('td:nth-last-child(1)');
        $(cell).clone().insertAfter($(this).find('td:last'));
    });

    // clear the column of any text and change the font to the same as input boxes
    $('#markbookTable tr:not(:first) > td:nth-child(6)').each(function () {
        $(this).text('');
        $(this).css({
            'font-family': 'Monaco, Courier, monospace'
        });
    });
};

/**
 * @desc Iterates through the markbook and calculates the percentage for each row
 */
const calculatePercentages = () => {
    $('#markbookTable tr:not(:first)').each(function () {
        const mark = parseFloat($(this).find('td:nth-child(2) > input').val());
        const denominator = parseFloat($(this).find('td:nth-child(5) > input').val());

        const percentage = +(mark / denominator * 100).toFixed(2);
        const percentageCell = $(this).find('td:nth-child(6)');

        // change the percentage cell's value if the percentage is valid, otherwise clear it
        if (!isNaN(percentage)) {
            percentageCell.text(percentage + '%');
        } else {
            percentageCell.text('');
        }
    });
};
