/**
 * @desc Waits for the main table to load, invokes callback once loaded
 * @param {function} cb Callback, gets called after completion
 */
const waitForLoad = (cb) => {
    try {
        if ($('#TableSecondaryClasses').length) { // Checks if the table exists
            cb(); // Invoke callback once found
        } else {
            setTimeout(() => { // Calls itself after a second
                waitForLoad(cb);
            }, 1000);
        }
    } catch (e) {
        console.log(e); // Catch errors
    }
};

/**
 * @desc Extracts classes into array, with weights
 * @param {Array} markBooks Array to hold the class info with multiplier
 */
const grabMarkBooks = markBooks => {
    try {
      $('table a[onclick][title=Mark]').each(function () {
            const $row = $(this).closest('tr'); // Store the jQuery row as a variable
            const className = $row.find('td:first').text(); // Grab the class name from the first column
            let multiplier = $row.find('td:nth-child(3) > input').val(); // Grab the weight from the third column
            markBooks.push({ // Adds class to array with a multiplier and its info
                name: className,
                classInfo: $(this).attr('onclick'), // Holds class information
                multiplier: parseFloat(multiplier), // Holds multiplier/weight of class
                row: $row // Holds the jQuery selector for the mark row
            });
        });
    } catch (e) {
        console.log(e);
    }
};

/**
 * @desc Formats each class into its own array
 * @param {Array} markBooks Array to hold the parsed class info with multiplier
 */
const cleanseValues = markBooks => {
    try {
        markBooks.forEach((book, i, bookArray) => { // Loop through each markbook
            /* Modify the class info by trimming and splitting into array by comma */
            bookArray[i].classInfo = book.classInfo.slice(13, -2).split(',');
        });
    } catch (e) {
        console.log(e);
    }
};

/**
 * @desc Appends a column after a specified column index
 * @param {Number} i Index of column to append to
 * @param {String} name Name to give the column header
 * @param {String} html Custom HTML to be injected
 */
const addColumnAfter = (i, name, html) => {
    $(`#TableSecondaryClasses tr:first td:nth-child(${i}):first`).after(`<td class="mwTABLE_CELL_HEADER" align="center" rowspan="2">${name}</td>`);
    $(`#TableSecondaryClasses > tbody > tr > td:not(.mwTABLE_CELL_HEADER):nth-child(${i})`).each(function () {
        $(this).after($(this).clone().html(html));
    });
};

/**
 * @desc Prepends a column before a specified column index
 * @param {Number} i Index of column to prepend to
 * @param {String} name Name to give the column header
 * @param {String} html Custom HTML to be injected
 */
const addColumnBefore = (i, name, html) => {
    $(`#TableSecondaryClasses tr:first td:nth-child(${i}):first`).before(`<td class="mwTABLE_CELL_HEADER" align="center" rowspan="2">${name}</td>`);
    $(`#TableSecondaryClasses > tbody > tr > td:not(.mwTABLE_CELL_HEADER):nth-child(${i})`).each(function () {
        $(this).before($(this).clone().html(html));
    });
};

/**
 * @desc Loops through the markbooks and adds an editable grade input
 */
const addMarksToClassRows = () => {
    window.markBooks.forEach(function (markbook) {
        const markCell = markbook.row.find('td:nth-child(2)');

        if (window.settings.liveModification) {
            markCell.html(`<input class="grade" min="0" type="number" value="${markbook.grade}" />`);
            const input = markCell.children('input');
            $(input).bind('input', function () {
                let mark = parseFloat($(this).val());
                if (!isNaN(mark))
                    markbook.grade = mark;
                calculateAverage();
                $(this).parent().css('background-color', '#ffe499'); // Change color of cell to indicate it was modified
            });
        } else {
            markCell.html(`${markbook.grade}`);
        }
    });
};

/**
 * @desc Calculates and updates the averages on the page
 */
const calculateAverage = () => {
    let totalGrades = 0;
    let totalWeightedGrades = 0;
    let totalClasses = 0;
    let totalWeights = 0;
    let average, weightedAverage;
    let markBooks = window.markBooks;

    markBooks.forEach(function (markbook) {
        if (isNaN(parseFloat(markbook.multiplier)) || markbook.multiplier <= 0) // If the class is given a <= 0 or no weighting
            return;

        if (isNaN(parseFloat(markbook.grade))) // If the class has no grade
            return;

        totalGrades += markbook.grade;
        totalWeightedGrades += markbook.multiplier * markbook.grade;
        totalClasses++;
        totalWeights += markbook.multiplier;
    });

    if (totalClasses <= 0 || totalWeights <= 0) // Don't accept zero and negative denominators
        return;

    average = Math.round(totalGrades / totalClasses * 100) / 100;
    weightedAverage = Math.round(totalWeightedGrades / totalWeights * 100) / 100;

    $('#avg').text(average);
    $('#weightedAvg').text(weightedAverage);
};

/**
 * @desc Sets the initial values for the weights when the page is fresh
 */
const setWeights = () => {
    try {
        if (localStorage.weights) {
            let weights = JSON.parse(localStorage.weights);
            weights.forEach(weight => {
                $('#TableSecondaryClasses tr').each(function (i, row) { // Loops through each table row
                    const $row = $(row); // Get the jQuery object of the row
                    if ($row.find('td:first').text() === weight.name) { // Check if the current row is the class we are looking for
                        $row.find('td:nth-child(3) > input').val(weight.weight); // Set the value of the weight if it exists
                        return; // Stop the loop and exit the function
                    }
                });
            });
        } else {
            const weights = [];

            $('#TableSecondaryClasses tr').each(function (i, row) { // Loops through each table row
                const $row = $(row); // Get the jQuery object of the row
                const name = $row.find('td:first').text();
                const weight = $row.find('td:nth-child(3) > input').val();

                if (!weight)
                    return;

                weights.push({
                    name: name,
                    weight: parseFloat(weight)
                });
            });

            localStorage.setItem('weights', JSON.stringify(weights));
        }
    } catch (e) {
        console.error(e);
    }
};

/**
 * @desc Updates the values of the weights in local storage when a change is detected
 */
const updateWeights = () => {
    const weights = [];
    let markBooks = window.markBooks;

    $('#TableSecondaryClasses tr').each(function (i, row) { // Loops through each table row
        const $row = $(row); // Get the jQuery object of the row
        const name = $row.find('td:first').text();
        const weight = $row.find('td:nth-child(3) > input').val();

        if (!weight)
            return;

        weights.push({
            name: name,
            weight: parseFloat(weight)
        });
    });

    markBooks.forEach((markbook) => {
        weights.forEach((weight) => {
            if (weight.name === markbook.name) {
                markbook.multiplier = weight.weight;
            }
        });
    });

    localStorage.setItem('weights', JSON.stringify(weights));

    window.markBooks = markBooks;

    calculateAverage();
};

/**
 * @desc Fetches the grades for each markbook
 * @param {Array} markBooks Array that holds the class info and multipliers
 * @param {Array} cleanedMarkbooks Array that holds the parsed markbooks
 */
const fetchMarkbooks = async (markBooks, cleanedMarkbooks) => {
    try {
        const requests = [];
        const studentID = markBooks[0].classInfo[0]; // To save proccessing, studentID is grabbed once
        /* This absolute URL method is needed since relative paths break in firefox */
        const currentURL = new URL(window.location.href); // Parse the current location as a URL object
        const postURL = currentURL.origin + currentURL.pathname + '/../../../viewer/Achieve/TopicBas/StuMrks.aspx/GetMarkbook'; // Segment and add the parts to a single string
        markBooks.forEach((markbook) => {
            const classID = markbook.classInfo[1]; // Extract the classID from the second element in the markbook's info
            const termID = markbook.classInfo[2]; // Extract the termID from the third element in the markbook's info
            const topicID = markbook.classInfo[3]; // Extract the topicID from the fourth element in the markbook's info
            const stuLetters = markbook.classInfo[6] || '';
            const orgID = markbook.classInfo[7] || -1;
            const toPost = JSON.stringify({
                studentID,
                classID,
                termID,
                topicID,
                fromDate: '1/1/2000',
                toDate: '1/1/3000',
                relPath: '../../../',
                stuLetters,
                orgID
            });
            requests.push($.ajax({
                type: 'POST', // Post request
                url: postURL, // File that holds markbooks
                data: toPost, // Post data is toPost
                contentType: 'application/json; charset=utf-8', // Accept json in the utf-8 charset
                dataType: 'json', // Parse response automatically as json
                success: response => { // Callback once it recieves a success flag (HTTP 200 OK)
                    response = response.d; // Redefine response
                    const loc = response.search('Term Mark: '); // Holds the location of the mark
                    if (loc !== -1) // If term mark is found
                    {
                        let tempResp = response.substr(loc); // Grab everything after and including 'Term Mark: '
                        tempResp = tempResp.substr(0, tempResp.indexOf('<')); // Grab everything from 'Term Mark: ' to the next '<'
                        const classScore = parseFloat(tempResp.substr(11)); // Grab everything after 'Term Mark: ' and parse as float
                        if (isNaN(classScore))
                            return;
                        markbook.grade = classScore;
                        cleanedMarkbooks.push(markbook);
                    }
                },
                error: e => console.log(e.statusText) // Log any ajax errors
            }));
        });
        await Promise.all(requests); // Await for all the requests to finish
    } catch (e) {
        console.log(e);
    }
};

/**
 * @desc Adds a row to the end of the table with two columns
 * @param {String} item Value to display
 * @param {String} itemName Name of the value being displayed
 * @param {String} id The HTML id to be attached to the element
 */
const addItemToTable = (item, itemName, id) => {
    /* Table class contains the letter that corresponds to the next color in the table rows
     * Grabs the table element's last row's block's class, where the letter is extracted
     */
    const tableClass = $('#TableSecondaryClasses tr:last > td').attr('class').substr(13, 1) === 'A' ? 'B' : 'A';

    /* Appends the row to the end of the table */
    $('#TableSecondaryClasses tr:last').after('<tr><td class=\'mwTABLE_CELL_' + tableClass +
        '\'>' + itemName + '</td><td class=\'mwTABLE_CELL_' + tableClass + '\' id=\'' + id + '\'>' + item + '</td></tr>');
};

/**
 * @desc Displays additional markbooks with the title as the link text and on a separate line
 */
const fixMultipleMarkbookDisplay = () => {
    $('table a[onclick][title!=Mark]').not(':last').each(function () {
        // Set the link text to the title
        const title = $(this).attr('title');
        $(this).html(title); 

        // Add the value at the end on a separate line
        $(this).parent().append('<br/>', $(this))
    });
}

/**
 * @desc Parses the injection of averages
 */
const injectScores = async () => {
    try {
        addColumnAfter(1, 'Current Mark', '<span style="color:LightGrey;">n.a.</span>'); // Add the column to hold the marks
        addColumnAfter(2, 'Weight', '<input min="0" oninput="updateWeights()" type="number" value="5" step="any">'); // Add the column to hold the modifiable weights
        setWeights(); // Sets the weightings based on localStorage

        /* Inject css for the inputs */
        $('#TableSecondaryClasses table').prepend('<style type="text/css">input[type="number"]::-webkit-outer-spin-button,input[type="number"]::-webkit-inner-spin-button {-webkit-appearance: none;margin: 0;}input[type="number"].grade{text-align: left}' +
            'input[type="number"] {-moz-appearance: textfield; margin: 0; border: none; display: inline; font-family: Monaco, Courier, monospace; font-size: inherit; padding: 0; text-align: center; width: 30pt; background-color: inherit;}</style>');

        // Fix the display of any additional markbooks
        fixMultipleMarkbookDisplay()

        let markBooks = [];
        window.markBooks = [];
        grabMarkBooks(markBooks); // Grab the markbooks
        cleanseValues(markBooks); // Parse the markbooks
        await fetchMarkbooks(markBooks, window.markBooks); // Await the values of the markbooks

        if (window.settings.calculation) {
            addItemToTable('<span style="color:LightGrey;">n.a.</span>', 'Average (Weighted)', 'weightedAvg');
            addItemToTable('<span style="color:LightGrey;">n.a.</span>', 'Average', 'avg');
            calculateAverage();
            setTimeout(pollScores, 2000); // Second call to pollScores since 'calculateAverage' is asynchronous
        }
        if (window.settings.quickview)
            addMarksToClassRows();
    } catch (e) {
        console.log(e);
    }
};

/**
 * @desc Disables the enter key from submitting the form
 */
const disableEnter = () => {
    $(document).ready(() => {
        $(window).keydown(event => {
            if (event.keyCode === 13) {
                event.preventDefault();
                return false;
            }
        });
    });
};

/**
 * @desc Polls the page to see if the average rows have been removed
 */
const pollScores = () => {
    if ($('#TableSecondaryClasses tr:last > td:first').text() !== 'Average') { // Checks if the last row is not correct
        injectScores(); // Injects again if that is the case
    } else {
        setTimeout(pollScores, 1000); // Poll once more for 1 second if it is found
    }
};

/**
 * @desc Main function, initializes the average calculation feature
 */
const init = () => {
    try {
        disableEnter(); // Disable the enter key to prevent unwanted form submission
        waitForLoad(() => { // Make anonymous function to be called once 'waitForLoad' is finished
            injectScores(); // Call the injection function
        });
    } catch (e) {
        console.log(e);
    }
};

init(); // Call the initialization function