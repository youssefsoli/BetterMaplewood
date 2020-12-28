let initialFinalMark; // Stores the initial final grade
let initialMarkbook; // Stores the initial markbook

/**
 * @desc Takes in a mark layer and calculates the total mark based off weights and raw score
 * @param {Array} layer Mark layer to be calculated
 * @returns {Number} Overall mark of the current layer
 */
const calculateLayer = layer => {
    let sum = 0;
    let denominator = 0;
    for (let i = 0; i < layer.length; i++) {
        let mark = parseFloat(layer[i].mark);
        let weight = parseFloat(layer[i].weight);
        let markDenom = parseFloat(layer[i].denominator);

        if (isNaN(mark) || isNaN(weight) || isNaN(markDenom)) // EXC, ABS, and blanks are ignored
            continue;

        if (mark < 0) // Treat negative marks as 0
            mark = 0;
        if (weight < 0) // Treat negative weights as 0
            weight = 0;
        if (markDenom <= 0) // If the denominator does not make sense, ignore whole grade
            continue;
        denominator += weight;
        sum += (mark / markDenom) * weight;

        /* Update the mark display */
        let row = layer[i].row;
        if (row) {
            row.find(selectors.mark).val(+mark.toFixed(2));
            row.find(selectors.weight).val(weight);
            row.find(selectors.denominator).val(markDenom);
        }
    }

    return parseFloat(sum / denominator); // Return the new mark as a decimal
};

/**
 * @desc Runs the whole markbook through the layer calculator and modifies the displayed markbook
 */
const calculateMarks = () => {
    let markbook = parseMarkbook();

    for (let i = 0; i < markbook.length; i++) {
        let middle = markbook[i].children;

        if ((isNaN(parseFloat(markbook[i].mark)) && markbook[i].mark !== '') || markbook[i].row.find(selectors.mark).is(':hidden')) // Make sure top isn't already invalid or hidden
            continue;

        if (middle && middle.length) { // Make sure there is a middle layer to handle
            for (let j = 0; j < middle.length; j++) {
                if ((isNaN(parseFloat(middle[j].mark)) && middle[j].mark !== '') || middle[j].row.find(selectors.mark).is(':hidden')) // Make sure middle isn't already invalid or hidden
                    continue;

                let bottom = middle[j].children;

                if (bottom && bottom.length) { // Make sure there is a bottom layer to handle
                    markbook[i].children[j].mark = calculateLayer(bottom) * markbook[i].children[j].denominator; // Set the new mark
                }
            }

            markbook[i].mark = calculateLayer(markbook[i].children) * markbook[i].denominator; // Set the new mark
        }
    }

    let finalMark = +(calculateLayer(markbook) * 100).toFixed(3);
    let finalMarkSelector = $('#markbookTable > div > div');

    // if there is no mark change, don't display the final mark
    if (initialFinalMark == finalMark) {
        finalMarkSelector.text(`Term Mark: ${initialFinalMark}`);
        return;
    }

    // Display the final grade with the initial grade faded
    finalMarkSelector.text('Term Mark: ');
    finalMarkSelector.append(`<span style="opacity: 0.7;">${initialFinalMark} →</span> ${finalMark}`);

    if (!isNaN(initialFinalMark) && initialFinalMark !== finalMark) {
        let difference = +parseFloat(finalMark - initialFinalMark).toFixed(3);

        if (difference > 0)
            finalMarkSelector.append(` <span style="color: #00c100;">+${difference}</span>`);
        else
            finalMarkSelector.append(` <span style="color: #c10000;">${difference}</span>`);
    }
};

/**
 * @desc Iterates over the current markbook and parses the mark information into an array
 * @returns {Array} Holds the values of the current markbook
 */
const parseMarkbook = () => {
    let markbook = [];
    $('#markbookTable table tbody > tr:gt(0)').each(function () { // Loop through each row except the first
        const row = $(this);
        const margin = row.find('td:first > span:first')[0].style['margin-left'];

        switch (margin) {
            case '0px': {
                markbook.push({
                    mark: row.find(selectors.mark).val(),
                    weight: row.find(selectors.weight).val(),
                    denominator: row.find(selectors.denominator).val(),
                    children: [],
                    row: row
                });
                break;
            }
            case '20px': {
                markbook[markbook.length - 1].children.push({ // Push a middle row into the latest top level
                    mark: row.find(selectors.mark).val(),
                    weight: row.find(selectors.weight).val(),
                    denominator: row.find(selectors.denominator).val(),
                    children: [],
                    row: row
                });
                break;
            }
            case '40px': {
                let top = markbook[markbook.length - 1].children;
                let middle = !top[top.length - 1] ? top : top[top.length - 1].children;

                if (!middle) {
                    middle = top;
                }

                middle.push({
                    mark: row.find(selectors.mark).val(),
                    weight: row.find(selectors.weight).val(),
                    denominator: row.find(selectors.denominator).val(),
                    row: row
                });
                break;
            }
            default: {
                throw new Error('Unknown margin', margin);
            }
        }
    });
    return markbook;
};

/**
 * @desc Iterates over the current markbook and stores the mark, weight, and denominator value, as well as background colour, in an array
 */
const createInitialMarkbook = () => {
    initialMarkbook = [];

    $('#markbookTable table tbody > tr:gt(0)').each(function () {
        const mark = $(this).find('td:nth-child(2) > input');
        const weight = $(this).find('td:nth-child(4) > input');
        const denominator = $(this).find('td:nth-child(5) > input');

        initialMarkbook.push({
            mark: {
                val: mark.val(),
                bgColor: mark.parent().css('background-color')
            },
            weight: {
                val: weight.val(),
                bgColor: weight.parent().css('background-color')
            },
            denominator: {
                val: denominator.val(),
                bgColor: denominator.parent().css('background-color')
            }
        });
    });
};

/**
 * @desc Iterates over the current markbook and highlights changed cells
 */
const highlightChanges = () => {
    $('#markbookTable table tbody > tr:gt(0)').each(function (i) {
        const row = $(this);

        const currentMark = row.find(selectors.mark);
        if (currentMark.val() !== initialMarkbook[i].mark.val) {
            currentMark.css('background-color', '#ffe499');
        } else {
            currentMark.css('background-color', initialMarkbook[i].mark.bgColor);
        }

        const currentWeight = row.find(selectors.weight);
        if (currentWeight.val() !== initialMarkbook[i].weight.val) {
            currentWeight.css('background-color', '#ffe499');
        } else {
            currentWeight.css('background-color', initialMarkbook[i].weight.bgColor);
        }

        const currentDenominator = row.find(selectors.denominator);
        if (currentDenominator.val() !== initialMarkbook[i].denominator.val) {
            currentDenominator.css('background-color', '#ffe499');
        } else {
            currentDenominator.css('background-color', initialMarkbook[i].denominator.bgColor);
        }
    });
};

/**
 * @desc Converts the current open markbook to an editable format
 */
const makeMarkbookEditable = () => {
    $('#markbookTable table').prepend(`
    <style type="text/css">
        .textMark {
            display: inline-block;
            width: 30pt;
            padding-left: 3pt;
            padding-right: 3pt; 
        }

        input[type="number"]::-webkit-outer-spin-button, input[type="number"]::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
        } 
        
        input[type="number"] {
            -moz-appearance: textfield; 
            margin: 0; 
            border: none; 
            display: inline; 
            font-family: Monaco, Courier, monospace; 
            font-size: inherit; 
            padding: 0; 
            text-align: center; 
            width: 30pt; 
            background-color: inherit;
            border-radius: 3pt;
            padding-left: 3pt;
            padding-right: 3pt;
        }
    </style>`);
    
    initialFinalMark = parseFloat($('#markbookTable > div > div').text().substr(11)); // Grab everything after 'Term Mark: '
    
    $('#markbookTable table tbody td:nth-child(n+2):nth-child(-n+5):not(:nth-child(3))').each(function () {
        let value = $(this).text();

        if (!isNaN(parseFloat(value)) && value !== '') {
            value = +parseFloat(value).toFixed(2);
        }

        let inputHTML = `<input min="0" type="number" value="${value}" />`;

        if (isNaN(parseFloat(value)) && value !== '') {
            if (value === 'NHI' || value === 'INC')
                inputHTML = `<span class="textMark">${value}</span><input min="0" type="number" value="0" style="display: none;" />`;
            else if (value === 'EXC' || value === 'ABS' || value === 'COL') // EXC and ABS
                inputHTML = `<span class="textMark">${value}</span><input min="0" type="number" value="" style="display: none;" />`;
            else
                return; // Ignore other values
        }

        $(this).html(inputHTML);
        const input = $(this).children('input');
        const span = $(this).children('span');

        if (span) {
            $(span).bind('click', function () {
                input.show();
                input.focus();
                calculateMarks();
                $(this).remove();
            });
        }
        
        const margin = $(this).parent().find('td:first > span:first')[0].style['margin-left']; // determines if the row is for an assignment, section, or unit
        const isTargetColumn = $(this).nextAll().length === 3 || $(this).nextAll().length === 0; // the mark column has 3 cells after it and the denominator column has 0
        
        let hasChildren;
        if ($(this).parent().nextAll().length !== 0) { // check if the current row is the last row
            const nextMargin = $(this).parent().next().find('td:first > span:first')[0].style['margin-left'];
            hasChildren = margin !== nextMargin;
        } else {
            hasChildren = false;
        }

        // only assignments and sections/units without children should have their marks and denominators editable 
        // other marks are dependent on the marks of their children so their input fields should be disabled
        if (margin !== '40px' && isTargetColumn && hasChildren) {
            $(input).prop('disabled', true); // to maintain compatibility with other functions, the input is disabled rather than completely removed
            $(input).css('cursor', 'text'); // give the appearance of regular text
        } else {
            $(input).bind('input', function () {
                calculateMarks();
                highlightChanges();
                if (settings.percentages)
                    calculatePercentages();
            });
        }
    });
};
