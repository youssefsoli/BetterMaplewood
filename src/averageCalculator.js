/**
 * @desc Waits for the main table to load, invokes callback once loaded
 * @param {function} cb Callback, gets called after completion
 */
const waitForLoad = (cb) => {
  try {
    if ($("#TableSecondaryClasses").length) { // Checks if the table exists
      cb(); // Invoke callback once found
    } else {
      setTimeout(() => { // Calls itself after a second
        waitForLoad(cb)
      }, 1000);
    }
  } catch (e) {
    console.log(e) // Catch errors
  }
}

/**
 * @desc Extracts classes into array, with weights
 * @param {Array} markBooks Array to hold the class info with multiplier
 */
const grabMarkBooks = markBooks => {
  try {
    $('table a[onclick]').not(':last').each(function () {
      const className = $(this).parent().parent().children().first().text(); // Holds the first 3 letters of the class
      let currentMultiplier = 1; // Multiplier of current class
      if (className.substr(0, 3) === 'ELA' || className.substr(0, 3) === 'MAT') // ELA and Math are both double weighted courses
        currentMultiplier = 2; // Change weight to double
      markBooks.push({ // Adds class to array with a multiplier and its info
        name: className,
        classInfo: $(this).attr('onclick'), // Holds class information
        multiplier: currentMultiplier // Holds multiplier/weight of class
      });
    });
  } catch (e) {
    console.log(e);
  }
}

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
    console.log(e)
  }
}

/**
 * @desc Loops through courseMarks and sends them to addMarkToClassRow
 * @param {Object} courseMarks Holds key value pairs of className:classScore
 */
const addMarksToClassRows = courseMarks => {
  for (var courseName in courseMarks) { // Loops each courseName in the courseMarks JSON Object
    if (courseMarks.hasOwnProperty(courseName)) { // Checks if the courseName is in courseMarks
      addMarkToClassRow(courseMarks[courseName], courseName); // Passes the mark and courseName to addMarkToClassRow
    }
  }
}

/**
 * @desc Adds the grade/mark to the respective class in the table
 * @param {String} mark Holds the mark of the given class
 * @param {String} className The name of the class with the given mark
 */
const addMarkToClassRow = (mark, className) => {
  $("#TableSecondaryClasses tr").each(function (i, row) { // Loops through each table row
    const $row = $(row); // Get the jQuery object of the row
    if ($row.find("td:first").text() == className) { // Check if the current row is the class we are looking for
      $row.find("td:nth-child(2)").html(`${mark}`); // Append the mark if the class is found
      return; // Stop the loop and exit the function
    }
  });
}

/**
 * @desc Calculates the weighted and normal average, which are returned through the callback
 * @param {Array} markBooks Array that holds the class info and multipliers
 * @param {Function} cb Callback, with params (weightedAverage, average)
 */
const calculateAverage = (markBooks, cb) => {
  try {
    let courseGrades = {};
    let sumWeighted = 0; // Holds the sum of the weighted
    let sum = 0; // Holds the sum of the normal
    let done = 0; // Hold the amount of async requests completed
    let denominator = markBooks.length; // Holds the denominator for the non-weighted calculation
    let weightedDenominator = markBooks.length; // Holds the denominator for the weighted calculation
    const studentID = markBooks[0].classInfo[0]; // To save proccessing, studentID is grabbed once
    /* This absolute URL method is needed since relative paths break in firefox */
    const currentURL = new URL(window.location.href); // Parse the current location as a URL object
    const postURL = currentURL.origin + currentURL.pathname + "/../../../viewer/Achieve/TopicBas/StuMrks.aspx/GetMarkbook"; // Segment and add the parts to a single string
    markBooks.forEach((markbook) => {
      const classID = markbook.classInfo[1]; // Extract the classID from the second element in the markbook's info
      const termID = markbook.classInfo[2]; // Extract the termID from the third element in the markbook's info
      const topicID = markbook.classInfo[3]; // Extract the topicID from the fourth element in the markbook's info
      const toPost = "{studentID: " + studentID + // Holds the message that will be sent to the server via AJAX
        ", classID: " + classID +
        ", termID: " + termID +
        ", topicID: " + topicID +
        ", fromDate: '1/1/2000', toDate: '1/1/3000', relPath: '../../../'}";
      $.ajax({
        type: "POST", // Post request
        url: postURL, // File that holds markbooks
        data: toPost, // Post data is toPost
        contentType: "application/json; charset=utf-8", // Accept json in the utf-8 charset
        dataType: "json", // Parse response automatically as json
        success: response => { // Callback once it recieves a success flag (HTTP 200 OK)
          response = response.d; // Redefine response
          const loc = response.search("Term Mark: "); // Holds the location of the mark
          if (loc === -1) // If term mark isn't found
            return;
          else {
            if (markbook.multiplier === 2) weightedDenominator++; // If the multiplier is 2, add to the denominator
            let tempResp = response.substr(loc); // Grab everything after and including 'Term Mark: '
            tempResp = tempResp.substr(0, tempResp.indexOf('<')); // Grab everything from 'Term Mark: ' to the next '<'
            const classScore = parseFloat(tempResp.substr(11)); // Grab everything after 'Term Mark: ' and parse as float
            if (!classScore) { // If the class does not have a valid score, remove it from the calculation
              weightedDenominator -= markbook.multiplier;
              denominator--;
            } else {
              courseGrades[markbook.name] = classScore;
              sumWeighted += classScore * markbook.multiplier; // Multiply class score by multiplier if weighted and add to sum
              sum += classScore; // Add score to sum
            }
            done++; // Increment 'done' since Ajax request and parsing has completed
            if (done === markBooks.length) { // If its the last to finish
              const weightedAverage = Math.round(sumWeighted / weightedDenominator * 100) / 100; // Calculate weightedAverage
              const average = Math.round(sum / denominator * 100) / 100; // Calculate average
              cb(weightedAverage, average, courseGrades); // Callback the function with new values as params
            }
          }
        },
        error: e => console.log(e.statusText) // Log any ajax errors
      });
    });
  } catch (e) {
    console.log(e)
  }
}

/**
 * @desc Adds a row to the end of the table with two columns
 * @param {String} item Value to display
 * @param {String} itemName Name of the value being displayed
 */
const addItemToTable = (item, itemName) => {
  /* Table class contains the letter that corresponds to the next color in the table rows
   * Grabs the table element's last row's block's class, where the letter is extracted
   */
  const tableClass = $('#TableSecondaryClasses tr:last > td').attr('class').substr(13, 1) === 'A' ? 'B' : 'A';

  /* Appends the row to the end of the table */
  $('#TableSecondaryClasses tr:last').after("<tr><td class='mwTABLE_CELL_" + tableClass +
    "'>" + itemName + "</td><td class='mwTABLE_CELL_" + tableClass + "'>" + item + "</td></tr>");
}

const addColumnAfter = (i, name) => {
  $(`#TableSecondaryClasses tr:first td:nth-child(${i}):first`).after(`<td class="mwTABLE_CELL_HEADER" align="center" rowspan="2">${name}</td>`);
  $(`#TableSecondaryClasses tr > td:not(.mwTABLE_CELL_HEADER):nth-child(${i})`).each(function () {
    $(this).after($(this).clone().empty());
  });
}

/**
 * @desc Parses the injection of averages
 */
const injectScores = () => {
  try {
    addMarkCol(1, 'Current Mark'); // Add the column to hold the marks
    if (!sessionStorage.average || !sessionStorage.weightedAverage) { // If one does not exist, refetch the values
      let markBooks = [];
      grabMarkBooks(markBooks); // Grab the markbooks
      cleanseValues(markBooks); // Parse the markbooks
      calculateAverage(markBooks, (weightedAverage, average, courseGrades) => { // Calculate averages of markbooks
        /* Add the averages to sessionStorage which is active as long as window is open */
        sessionStorage.setItem('weightedAverage', weightedAverage);
        sessionStorage.setItem('average', average);
        sessionStorage.setItem('courseGrades', JSON.stringify(courseGrades));

        /* Add the averages to the table */
        if (window.settings.calculation) {
          addItemToTable(sessionStorage.weightedAverage, 'Average (Weighted)');
          addItemToTable(sessionStorage.average, 'Average');
          setTimeout(pollScores, 2000); // First call to pollScores since 'calculateAverage' is asynchronous
        }
        if (window.settings.quickview)
          addMarksToClassRows(JSON.parse(sessionStorage.courseGrades));
      });
    } else {
      /* Add the averages to the table */
      if (window.settings.calculation) {
        addItemToTable(sessionStorage.weightedAverage, 'Average (Weighted)');
        addItemToTable(sessionStorage.average, 'Average');
        setTimeout(pollScores, 2000); // Second call to pollScores since 'calculateAverage' is asynchronous
      }
      if (window.settings.quickview)
        addMarksToClassRows(JSON.parse(sessionStorage.courseGrades));
    }
  } catch (e) {
    console.log(e)
  }
}

/**
 * @desc Polls the page to see if the average rows have been removed
 */
const pollScores = () => {
  if ($('#TableSecondaryClasses tr:last > td:first').text() !== 'Average') { // Checks if the last row is not correct
    injectScores(); // Injects again if that is the case
  } else {
    setTimeout(pollScores, 1000); // Poll once more for 1 second if it is found
  }
}

/**
 * @desc Main function, initializes the average calculation feature
 */
const init = () => {
  try {
    waitForLoad(() => { // Make anonymous function to be called once 'waitForLoad' is finished
      injectScores(); // Call the injection function
    });
  } catch (e) {
    console.log(e)
  };
}

init(); // Call the initialization function