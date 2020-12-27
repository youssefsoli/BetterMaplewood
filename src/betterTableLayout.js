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

    // fix table content
    $('#markbookTable tr:not(:first)').each(function () {
        const row = $(this);
        const name = row.find('td:nth-child(1)').clone(true, true);
        const mark = row.find('td:nth-child(2)').clone(true, true);
        const date = row.find('td:nth-child(3)').clone(true, true);
        const weight = row.find('td:nth-child(4)').clone(true, true);
        const denominator = $(this).find('td:nth-child(5)').clone(true, true);
        
        // combine mark and denominator
        if (!settings.liveModification) {
            let numerator = mark.text();
            if (!isNaN(parseFloat(numerator)) && numerator !== '') {
                numerator = +parseFloat(numerator).toFixed(2);
            }
            mark.html(`<input disabled>${numerator}</input> <b>/</b> <input disabled>${denominator.text()}</input>`);
            
            mark.find('input').css({
                'margin': '0',
                'width': '30pt',
                'font-family': 'inherit',
                'cursor': 'text'
            });
            mark.find('input:first').css('text-align', 'right');
            mark.find('input:last').css('text-align', 'left');

            // set mark column width
            mark.css('width', '100px');
        } else {
            mark.append('<b>/</b>', denominator.find('input'));
            // fix styling
            const span = mark.find('span');
            const input = mark.find('input:first');
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
            mark.find('input:first').css({
                'text-align': 'right',
                'width': '30pt',
                'padding': '0pt 3pt',
                'margin-right': '2pt'
            });
            mark.find('input:last').css({
                'text-align': 'left',
                'width': '30pt',
                'padding': '0pt 3pt',
                'margin-left': '2pt'
            });
            // set mark column width
            mark.css('width', '110px');
        }
        
        // reformat
        row.empty();
        row.append(name, mark, weight, date);

    });
};
