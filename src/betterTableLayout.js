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
                    width: 100px;
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
                    width: 110px;
                }
            </style>`);
    }
};

/**
 * @desc Combines mark and denominator into one cell
 */
const betterTableLayout = () => {
    // fix table header
    const row = $('#markbookTable tr:first');
    const itemsHeader = row.find('td:nth-child(1)');
    const marksHeader = row.find('td:nth-child(2)');
    const dateHeader = row.find('td:nth-child(3)');
    const weightHeader = row.find('td:nth-child(4)');

    // reformat
    row.empty();
    row.append(itemsHeader, marksHeader, weightHeader, dateHeader);

    injectStyles();

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
            mark.html('');
            mark.append(
                `<input disabled min="0" value="${numerator}" />`,
                '<b>/</b>',
                `<input disabled min="0" value="${denominator.text()}" />`
            );
        } else {
            mark.append('<b>/</b>', denominator.find('input'));
        }

        // if a text mark exists, add it's functionality back
        const span = mark.find('span');
        if (span) {
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

        // style numerator
        mark.find('input:first').css({
            'text-align': 'right',
            'margin-right': '2pt'
        });

        // style denominator
        mark.find('input:last').css({
            'text-align': 'left',
            'margin-left': '2pt'
        });
        
        // create reformatted row
        row.empty();
        row.append(name, mark, weight, date);

    });
};
