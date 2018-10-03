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
      } else if (!stop) {
        const className = $(this).parent().parent().children().first().text().substr(0, 3);
        let x = 1;
        if (className === 'ELA' || className === 'MAT')
          x = 2;
        markBooks.push({
          classInfo: $(this).attr('onclick'),
          multiplier: x
        });
      }
    });
    return markBooks;
  } catch (e) {
    console.log(e);
  }
}

const cleanseValues = markBooks => {
  try {
    markBooks.forEach((o, i, a) => {
      a[i].classInfo = o.classInfo.slice(13, -2).split(',');
    });
    return markBooks;
  } catch (e) {
    console.log(e)
  }
}

const calculateAverage = (markBooks, cb) => {
  let sumWeighted = 0;
  let sum = 0;
  let done = 0;
  let denominator = markBooks.length;
  const studentID = markBooks[0].classInfo[0];
  markBooks.forEach((markbook) => {
    const classID = markbook.classInfo[1];
    const termID = markbook.classInfo[2];
    const topicID = markbook.classInfo[3];
    const toPost = "{studentID: " + studentID +
      ", classID: " + classID +
      ", termID: " + termID +
      ", topicID: " + topicID +
      ", fromDate: '1/1/2000', toDate: '1/1/3000', relPath: '../../../'}";
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
          if (markbook.multiplier === 2) denominator++;
          let tempResp = response.substr(loc);
          tempResp = tempResp.substr(0, tempResp.indexOf('<'));
          const classScore = parseFloat(tempResp.substr(11));
          sumWeighted += classScore * markbook.multiplier;
          sum += classScore;
          done++;
          if (done === markBooks.length) {
            const weightedAverage = Math.round(sumWeighted / denominator * 100) / 100;
            const average = Math.round(sum / markBooks.length * 100) / 100;
            cb(weightedAverage, average);
          }
        }
      }
    });
  });
}

const addItemToTable = (item, itemName) => {
  const tableClass = $('#TableSecondaryClasses tr:last > td').attr('class').substr(13, 1) === 'A' ? 'B' : 'A';
  $('#TableSecondaryClasses tr:last').after("<tr><td class='mwTABLE_CELL_" + tableClass +
    "'>" + itemName + "</td><td class='mwTABLE_CELL_" + tableClass + "'>" + item + "</td></tr>");
}

const injectScores = () => {
  try {
    if (!sessionStorage.average || !sessionStorage.weightedAverage) {
      let markBooks = [];
      markBooks = grabMarkBooks(markBooks);
      markBooks = cleanseValues(markBooks);
      calculateAverage(markBooks, (weightedAverage, average) => {
        sessionStorage.setItem('weightedAverage', weightedAverage);
        sessionStorage.setItem('average', average);
        addItemToTable(weightedAverage, 'Average (Weighted)');
        addItemToTable(average, 'Average')
      });
    } else {
      addItemToTable(sessionStorage.weightedAverage, 'Average (Weighted)');
      addItemToTable(sessionStorage.average, 'Average')
    }
    setTimeout(pollScores, 2000);
  } catch (e) {
    console.log(e)
  }
}

const pollScores = () => {
  if($('#TableSecondaryClasses tr:last > td:first').text() !== 'Average') {
    injectScores();
  }
  else {
    setTimeout(pollScores, 1000);
  }
}

// Initializes the extension
const init = () => {
  try {
    waitForLoad(() => {
      console.log('Loaded!');
      injectScores();
    });
  } catch (e) {
    console.log(e)
  };
}

init();