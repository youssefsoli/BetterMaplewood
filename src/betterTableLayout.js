/**
 * @desc Inject styles for input boxes and mark cell
 */
const injectStyles = () => {
    if (!settings.liveModification) {
        $('#markbookTable table').prepend(`
            <style type="text/css">
                .js-mark-cell > input {
                    -moz-appearance: textfield;
                    border: none;
                    display: inline;
                    font-family: inherit;
                    font-size: inherit;
                    padding: 0;
                    width: 30pt;
                    background-color: inherit;
                    cursor: text;
                }

                .js-mark-cell {
                    min-width: 95px;
                }
            </style>`);
    } else {
        $('#markbookTable table').prepend(`
            <style type="text/css">
                .js-mark-cell > input {
                    width: 30pt;
                    padding: 0pt 3pt;
                }

                .js-mark-cell {
                    min-width: 110px;
                }
            </style>`);
    }
};

/**
 * @desc Get the widths of the markbook columns
 * @returns Object with the column as the key and the column width as the value
 */
const getColumnWidths = () => {
    let columnWidths;
    if (settings.percentages) {
        columnWidths = {
            items: 46,
            marks: 18,
            weight: 10,
            date: 16
        };
    }
    else {
        columnWidths = {
            items: 50,
            marks: 18,
            weight: 14,
            date: 18
        };
    }

    if (!settings.liveModification) {
        columnWidths.marks -= 2;
        columnWidths.items += 2;
    }

    // convert numbers to percentage strings
    Object.keys(columnWidths).forEach(function (key) {
        columnWidths[key] = JSON.stringify(columnWidths[key]) + '%';
    });

    return columnWidths;
};

/**
 * @desc Combines mark and denominator into one cell
 */
const betterTableLayout = () => {
    const row = $('#markbookTable tr:first');
    const itemsHeader = row.find('td:nth-child(1)');
    const marksHeader = row.find('td:nth-child(2)');
    const dateHeader = row.find('td:nth-child(3)');
    const weightHeader = row.find('td:nth-child(4)');

    injectStyles();

    // set the widths of the columns to a percentage
    const columnWidths = getColumnWidths();
    itemsHeader.css('width', columnWidths.items);
    marksHeader.css('width', columnWidths.marks);
    weightHeader.css('width', columnWidths.weight);
    dateHeader.css('width', columnWidths.date);

    // reformat table header
    row.empty();
    row.append(itemsHeader, marksHeader, weightHeader, dateHeader);

    // fix table content
    $('#markbookTable tr:not(:first)').each(function () {
        const row = $(this);
        const name = row.find('td:nth-child(1)').clone(true, true);
        const mark = row.find('td:nth-child(2)').clone(true, true);
        const date = row.find('td:nth-child(3)').clone(true, true);
        const weight = row.find('td:nth-child(4)').clone(true, true);
        const denominator = $(this).find('td:nth-child(5)').clone(true, true);

        mark.addClass('js-mark-cell');
        
        // combine mark and denominator
        if (!settings.liveModification) {
            let numerator = mark.text();
            if (!isNaN(parseFloat(numerator)) && numerator !== '') {
                numerator = +parseFloat(numerator).toFixed(2);
            }
            mark.html(
                `<input disabled min="0" value="${numerator}" />` +
                '<b>/</b>' +
                `<input disabled min="0" value="${denominator.text()}" />`
            );
        } else {
            mark.append('<b>/</b>', denominator.find('input'));
        }

        // if a text mark exists, add it's functionality back
        const span = mark.find('span');
        if (span) {
            const input = mark.find('input:first');
            span.css({
                'text-align': 'right',
                'width': '30pt'
            });
            span.bind('click', function () {
                input.show();
                input.focus();
                calculateMarks();
                $(this).remove();
            });
        }

        // style numerator and denominator (styles must be directly added as an attribute in order to override the classes)
        mark.find('input:first').css({
            'text-align': 'right',
            'margin-right': '2pt'
        });
        mark.find('input:last').css({
            'text-align': 'left',
            'margin-left': '2pt'
        });
        
        // create reformatted row
        row.empty();
        row.append(name, mark, weight, date);

    });
};
