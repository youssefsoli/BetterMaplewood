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
            row.find('td:nth-last-child(4) > input').val(+mark.toFixed(2));
            row.find('td:nth-last-child(2) > input').val(weight);
            row.find('td:nth-last-child(1) > input').val(markDenom);
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

        if ((isNaN(parseFloat(markbook[i].mark)) && markbook[i].mark !== '') || markbook[i].row.find('td:nth-last-child(4) > input').is(':hidden')) // Make sure top isn't already invalid or hidden
            continue;

        if (middle && middle.length) { // Make sure there is a middle layer to handle
            for (let j = 0; j < middle.length; j++) {
                if ((isNaN(parseFloat(middle[j].mark)) && middle[j].mark !== '') || middle[j].row.find('td:nth-last-child(4) > input').is(':hidden')) // Make sure middle isn't already invalid or hidden
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
    finalMarkSelector.append(`<span style="opacity: 0.7;">${initialFinalMark} →</span> ${finalMark}`)

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
                    mark: row.find('td:nth-last-child(4) > input').val(),
                    weight: row.find('td:nth-last-child(2) > input').val(),
                    denominator: row.find('td:nth-last-child(1) > input').val(),
                    children: [],
                    row: row
                });
                break;
            }
            case '20px': {
                markbook[markbook.length - 1].children.push({ // Push a middle row into the latest top level
                    mark: row.find('td:nth-last-child(4) > input').val(),
                    weight: row.find('td:nth-last-child(2) > input').val(),
                    denominator: row.find('td:nth-last-child(1) > input').val(),
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
                    mark: row.find('td:nth-last-child(4) > input').val(),
                    weight: row.find('td:nth-last-child(2) > input').val(),
                    denominator: row.find('td:nth-last-child(1) > input').val(),
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
        const mark = $(this).find('td:nth-last-child(4) > input');
        const weight = $(this).find('td:nth-last-child(2) > input');
        const denominator = $(this).find('td:nth-last-child(1) > input');

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

        const currentMark = row.find('td:nth-last-child(4) > input');
        if (currentMark.val() !== initialMarkbook[i].mark.val) {
            currentMark.parent().css('background-color', '#ffe499');
        } else {
            currentMark.parent().css('background-color', initialMarkbook[i].mark.bgColor);
        }

        const currentWeight = row.find('td:nth-last-child(2) > input');
        if (currentWeight.val() !== initialMarkbook[i].weight.val) {
            currentWeight.parent().css('background-color', '#ffe499');
        } else {
            currentWeight.parent().css('background-color', initialMarkbook[i].weight.bgColor);
        }

        const currentDenominator = row.find('td:nth-last-child(1) > input');
        if (currentDenominator.val() !== initialMarkbook[i].denominator.val) {
            currentDenominator.parent().css('background-color', '#ffe499');
        } else {
            currentDenominator.parent().css('background-color', initialMarkbook[i].denominator.bgColor);
        }
    });
};

/**
 * @desc Converts the current open markbook to an editable format
 */
const makeMarkbookEditable = () => {
    $('#markbookTable table').prepend(`
    <style type="text/css">
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
        }
    </style>`);
    
    initialFinalMark = parseFloat($('#markbookTable > div > div').text().substr(11)); // Grab everything after 'Term Mark: '
    
    $('#markbookTable table tbody td:nth-last-child(-n+4):not(:nth-last-child(3))').each(function () {
        let value = $(this).text();

        if (!isNaN(parseFloat(value)) && value !== '') {
            value = +parseFloat(value).toFixed(2);
        }

        let inputHTML = `<input min="0" type="number" value="${value}" />`;

        if (isNaN(parseFloat(value)) && value !== '') {
            if (value === 'NHI' || value === 'INC')
                inputHTML = `<span>${value}</span><input min="0" type="number" value="0" style="display: none;" />`;
            else if (value === 'EXC' || value === 'ABS' || value === 'COL') // EXC and ABS
                inputHTML = `<span>${value}</span><input min="0" type="number" value="" style="display: none;" />`;
            else
                return; // Ignore other values

            // fix background colour styling
            const rowStyle = $(this).parent().find('td:first').css('background-color');
            $(this).css('background-color', rowStyle);
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
        const isMarkColumn = $(this).nextAll().length === 3; // the mark column has 3 cells after it
        
        let hasChildren;
        if ($(this).parent().nextAll().length !== 0) { // check if the current row is the last row
            const nextMargin = $(this).parent().next().find('td:first > span:first')[0].style['margin-left'];
            hasChildren = margin !== nextMargin;
        } else {
            hasChildren = false;
        }

        // only assignments and sections/units without children should have their marks editable 
        // other marks are dependent on the marks of their children so their input fields should be disabled
        if (margin !== '40px' && isMarkColumn && hasChildren) {
            $(input).prop('disabled', true); // to maintain compatibility with other functions, the input is disabled rather than completely removed
            $(input).css('cursor', 'text'); // give the appearance of regular text
        } else {
            $(input).bind('input', function () {
                calculateMarks();
                highlightChanges();
                calculatePercentages();
            });
        }
    });
};

/* Load Markbook Override (Pre-existing function used when a markbook is opened) */
loadMarkbook = function (studentID, classID, termID, topicID, title, refresh, stuLetters, orgId) {

    if (refresh) {
        studentID = studentID_;
        classID = classID_;
        topicID = topicID_;
        termID = termID_;
        title = title_;
        stuLetters = stuLetters_;
        orgId = orgId_;
    } else {
        studentID_ = studentID;
        classID_ = classID;
        topicID_ = topicID;
        title_ = title;
        termID_ = termID;
        stuLetters_ = stuLetters;
        orgId_ = orgId;
    }

    $('#MarkbookDialog').dialog('option', 'title', title);
    $('#markbookTable').html('<div><img alt="Loading...." src="' + mwMrkBookDialogRootPath + 'viewer/clsmgr/images/ajax-loader2.gif" />&nbsp;Loading...</div>');
    $('#MarkbookDialog').dialog('option', 'height', 'auto').dialog('open');

    let fromDate = $('#mrkbkFromDate').datepicker().val();
    let toDate = $('#mrkbkToDate').datepicker().val();

    $.ajax({
        type: 'POST',
        url: mwMrkBookDialogRootPath + 'viewer/Achieve/TopicBas/StuMrks.aspx/GetMarkbook',
        data: JSON.stringify({
            studentID: studentID,
            classID: classID,
            termID: termID,
            topicID: topicID,
            fromDate: fromDate,
            toDate: toDate,
            relPath: mwMrkBookDialogRootPath,
            stuLetters: stuLetters || '',
            orgID: orgId || -1
        }),
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        success: function (msg) {
            $('#MarkbookDialog').dialog('close');
            $('#markbookTable').html(msg.d);
            $('#MarkbookDialog').dialog('option', 'height', 'auto').dialog('open');
            $('#markbookTable td[mrkTble!=\'1\']').addClass('tdAchievement');
            addPercentageColumn();
            makeMarkbookEditable();
            createInitialMarkbook();
            calculatePercentages();
        },
        error: function () {
            $('#markbookTable').html('(error loading marbook)');
            $('#MarkbookDialog').dialog('option', 'height', 'auto').dialog('open');
        }
    });
};