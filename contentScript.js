const waitForLoad = (cb) => {
  try {
    if ($("#TableSecondaryClasses").length) {
      cb();
    } else {
      setTimeout(() => {
        waitForLoad(cb)
      }, 1000);
    }
  } catch (e) {
    console.log(e)
  }
}

const grabMarkBooks = markBooks => {
  try {
    var stop = false;
    $('a').each(function () {
      if (!$(this).attr('onclick')) {
        stop = true;
        return;
      } else if (!stop)
        markBooks.push($(this).attr('onclick')); // If not, add to array
    });
    return markBooks;
  } catch (e) {
    console.log(e);
  }
}

const cleanseValues = markBooks => {
  try {
    markBooks.forEach((o, i, a) => {
      a[i] = o.slice(13, -2).split(',');
    });
    return markBooks;
  } catch (e) {
    console.log(e)
  }
}

const calculateAverage = (markBooks, cb) => {
  let sum = 0;
  let done = 0;
  const studentID = markBooks[0][0];
  markBooks.forEach((markbook) => {
    const classID = markbook[1];
    const termID = markbook[2];
    const topicID = markbook[3];
    const toPost = "{studentID: " + studentID + ", classID: " + classID + ", termID: " + termID + ", topicID: " + topicID + ", fromDate: '1/1/2000', toDate: '1/1/3000', relPath: '../../../'}";
    $.ajax({
      type: "POST",
      url: "../../viewer/Achieve/TopicBas/StuMrks.aspx/GetMarkbook",
      data: toPost,
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      success: response => {
        response = response.d;
        const loc = response.search("Term Mark: ");
        if (loc === -1)
          return;
        else {
          let tempResp = response.substr(loc);
          tempResp = tempResp.substr(0, tempResp.indexOf('<'));
          const classScore = parseFloat(tempResp.substr(11));
          sum += classScore;
          done++;
          if (done === markBooks.length)
            cb(Math.round(sum / markBooks.length * 100) / 100);
        }
      }
    });
  });
}

const addAverageToTable = avg => {
  const tableClass = $('#TableSecondaryClasses tr:last > td').attr('class').indexOf('A') === 14 ? 'B' : 'A';
  $('#TableSecondaryClasses tr:last').after("<tr><td title='Average' class='mwTABLE_CELL_" + tableClass +
    "'>Average</td><td class='mwTABLE_CELL_" + tableClass + "'>" + avg + "</td></tr>");
}

// Initializes the extension
const init = () => {
  try {
    let markBooks = [];
    waitForLoad(() => {
      markBooks = grabMarkBooks(markBooks);
      markBooks = cleanseValues(markBooks);
      console.log('Loaded!');
      if(!localStorage.average) {
      calculateAverage(markBooks, avg => {
        localStorage.setItem('average', avg);
      });
    }
    addAverageToTable(localStorage.average);
    });
  } catch (e) {
    console.log(e)
  };
}

init();