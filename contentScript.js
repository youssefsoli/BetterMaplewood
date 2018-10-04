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
    var stop = false; // Indicates whether the function should stop adding elements
    $('a').each(function () {
      if (!stop && (!$(this).attr('onclick') || $(this).attr('onclick').substr(0, 13) !== 'loadMarkbook(')) { // Once we find a non loadMarkbook value, we stop adding (we can't check for just undefined because of firefox)
        stop = true; // Stop adding
      } else if (!stop) { // If we aren't told to stop
        const className = $(this).parent().parent().children().first().text().substr(0, 3); // Holds the first 3 letters of the class
        let currentMultiplier = 1; // Multiplier of current class
        if (className === 'ELA' || className === 'MAT') // ELA and Math are both double weighted courses
          currentMultiplier = 2; // Change weight to double
        markBooks.push({ // Adds class to array with a multiplier and its info
          classInfo: $(this).attr('onclick'), // Holds class information
          multiplier: currentMultiplier // Holds multiplier/weight of class
        });
      }
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
 * @desc Calculates the weighted and normal average, which are returned through the callback
 * @param {Array} markBooks Array that holds the class info and multipliers
 * @param {Function} cb Callback, with params (weightedAverage, average)
 */
const calculateAverage = (markBooks, cb) => {
  try {
    let sumWeighted = 0; // Holds the sum of the weighted
    let sum = 0; // Holds the sum of the normal
    let done = 0; // Hold the amount of async requests completed
    let denominator = markBooks.length; // Holds the denominator for the weighted calculation
    const studentID = markBooks[0].classInfo[0]; // To save proccessing, studentID is grabbed once
    /* This absolute URL method is needed since relative paths break in firefox */
    const currentURL = new URL(window.location.href); // Parse the current location as a URL object
    const postURL = currentURL.origin + currentURL.pathname + "/../../../viewer/Achieve/TopicBas/StuMrks.aspx/GetMarkbook"; // Segment and add the parts to a single string
    console.log(postURL);
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
            if (markbook.multiplier === 2) denominator++; // If the multiplier is 2, add to the denominator
            let tempResp = response.substr(loc); // Grab everything after and including 'Term Mark: '
            tempResp = tempResp.substr(0, tempResp.indexOf('<')); // Grab everything from 'Term Mark: ' to the next '<'
            const classScore = parseFloat(tempResp.substr(11)); // Grab everything after 'Term Mark: ' and parse as float
            sumWeighted += classScore * markbook.multiplier; // Multiply class score by multiplier if weighted and add to sum
            sum += classScore; // Add score to sum
            done++; // Increment 'done' since Ajax request and parsing has completed
            if (done === markBooks.length) { // If its the last to finish
              const weightedAverage = Math.round(sumWeighted / denominator * 100) / 100; // Calculate weightedAverage
              const average = Math.round(sum / markBooks.length * 100) / 100; // Calculate average
              cb(weightedAverage, average); // Callback the function with new values as params
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

/**
 * @desc Parses the injection of averages
 */
const injectScores = () => {
  try {
    if (!sessionStorage.average || !sessionStorage.weightedAverage) { // If one does not exist, refetch the values
      let markBooks = [];
      grabMarkBooks(markBooks); // Grab the markbooks
      cleanseValues(markBooks); // Parse the markbooks
      calculateAverage(markBooks, (weightedAverage, average) => { // Calculate averages of markbooks
        /* Add the averages to sessionStorage which is active as long as window is open */
        sessionStorage.setItem('weightedAverage', weightedAverage);
        sessionStorage.setItem('average', average);

        /* Add the averages to the table */
        addItemToTable(weightedAverage, 'Average (Weighted)');
        addItemToTable(average, 'Average');
        setTimeout(pollScores, 2000); // First call to pollScores since 'calculateAverage' is asynchronous
      });
    } else {
      addItemToTable(sessionStorage.weightedAverage, 'Average (Weighted)');
      addItemToTable(sessionStorage.average, 'Average');
      setTimeout(pollScores, 2000); // Second call to pollScores since 'calculateAverage' is asynchronous
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
 * @desc Main function, initializes the whole extension
 */
const init = () => {
  try {
    waitForLoad(() => { // Make anonymous function to be called once 'waitForLoad' is finished
      console.log('Loaded!'); // Verify plugin successfully loaded
      injectScores(); // Call the injection function
    });
  } catch (e) {
    console.log(e)
  };
}

init(); // Call the initialization function