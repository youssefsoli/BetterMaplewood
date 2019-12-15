let initialFinalMark; // Stores the initial final grade

const calculateLayer = layer => {
    let sum = 0;
    let denominator = 0;
    for (let i = 0; i < layer.length; i++) {
        let mark = parseFloat(layer[i].mark);
        let weight = parseFloat(layer[i].weight);
        let markDenom = parseFloat(layer[i].denominator);
        if (isNaN(mark) || isNaN(weight) || isNaN(markDenom)) // Todo: Fix to interpret EXC, ABS, and NHI
            continue;
        denominator += weight;
        sum += ((mark / markDenom) * 100) * weight;

        /* Update the mark display */
        let row = layer[i].row;
        if (row) {
            row.find("td:nth-child(2) > input").val(+mark.toFixed(2));
            row.find("td:nth-child(4)").text(weight);
            row.find("td:nth-child(5)").text(markDenom);
        }
    }

    return parseFloat(sum / denominator); // Return the new mark
}

const calculateMarks = () => {
    let markbook = parseMarkbook();

    for (let i = 0; i < markbook.length; i++) {
        let middle = markbook[i].children;

        if (isNaN(parseFloat(markbook[i].mark))) // Make sure top isn't already invalid
            continue;

        if (middle && middle.length) { // Make sure there is a middle layer to handle
            for (let j = 0; j < middle.length; j++) {
                if (isNaN(parseFloat(middle[j].mark))) // Make sure middle isn't already invalid
                    continue;

                let bottom = middle[j].children;

                if (bottom && bottom.length) { // Make sure there is a bottom layer to handle
                    markbook[i].children[j].mark = calculateLayer(bottom); // Set the new mark
                }
            }

            markbook[i].mark = calculateLayer(markbook[i].children); // Set the new mark
        }
    }

    let finalMark = +calculateLayer(markbook).toFixed(3);

    $('#markbookTable > div > div').text(`Term Mark: ${finalMark}`); // Display the final grade
    if(!isNaN(initialFinalMark) && initialFinalMark != finalMark) {
        difference = +parseFloat(finalMark - initialFinalMark).toFixed(3);

        if(difference > 0)
            $('#markbookTable > div > div').append(` <span style="color: #00c100;">+${difference}</span>`);
        else
            $('#markbookTable > div > div').append(` <span style="color: #c10000;">${difference}</span>`);
    }
}

const parseMarkbook = () => {
    markbook = [];
    $('#markbookTable table tbody > tr:gt(0)').each(function () { // Loop through each row except the first
        const row = $(this);
        const margin = row.find("td:first > span:first")[0].style["margin-left"];

        switch (margin) {
            case "0px": {
                markbook.push({
                    mark: row.find("td:nth-child(2) > input").val(),
                    weight: row.find("td:nth-child(4)").text(),
                    denominator: row.find("td:nth-child(5)").text(),
                    children: [],
                    row: row
                });
                break;
            }
            case "20px": {
                markbook[markbook.length - 1].children.push({ // Push a middle row into the latest top level
                    mark: row.find("td:nth-child(2) > input").val(),
                    weight: row.find("td:nth-child(4)").text(),
                    denominator: row.find("td:nth-child(5)").text(),
                    children: [],
                    row: row
                });
                break;
            }
            case "40px": {
                let top = markbook[markbook.length - 1].children;
                let middle = !top[top.length - 1] ? top : top[top.length - 1].children;

                if (!middle) {
                    middle = top;
                }

                middle.push({
                    mark: row.find("td:nth-child(2) > input").val(),
                    weight: row.find("td:nth-child(4)").text(),
                    denominator: row.find("td:nth-child(5)").text(),
                    row: row
                });
                break;
            }
            default: {
                throw new Error("Unknown margin", margin);
            }
        }
    });
    return markbook;
}

const makeMarkbookEditable = () => {
    $('#markbookTable table').prepend('<style type="text/css">input[type="number"]::-webkit-outer-spin-button,input[type="number"]::-webkit-inner-spin-button {-webkit-appearance: none;margin: 0;} input[type="number"] {-moz-appearance: textfield; margin: 0; border: none; display: inline; font-family: Monaco, Courier, monospace; font-size: inherit; padding: 0px; text-align: center; width: 30pt; background-color: inherit;}</style>');
    initialFinalMark = parseFloat($('#markbookTable > div > div').text().substr(11)); // Grab everything after 'Term Mark: '
    $('#markbookTable table tbody td:nth-child(2)').each(function () {
        const mark = $(this).text();
        if (isNaN(parseFloat(mark)) && mark !== '')
            return;
        $(this).html(`<input min="0" type="number" value="${mark}" />`);
        const input = $(this).children('input');
        $(input).bind('input', function () {
            calculateMarks();
            $(this).parent().css("background-color", "#ffe499"); // Change color of cell to indicate it was modified
        });
    });
}

/* Load Markbook Override */
loadMarkbook = function (studentID, classID, termID, topicID, title, refresh) {

    if (refresh) {
        studentID = studentID_;
        classID = classID_;
        topicID = topicID_;
        termID = termID_;
        title = title_;
    } else {
        studentID_ = studentID;
        classID_ = classID;
        topicID_ = topicID;
        title_ = title;
        termID_ = termID;
    }

    $("#MarkbookDialog").dialog("option", "title", title);
    $("#markbookTable").html('<div><img alt="Loading...." src="' + mwMrkBookDialogRootPath + 'viewer/clsmgr/images/ajax-loader2.gif" />&nbsp;Loading...</div>');
    $("#MarkbookDialog").dialog("option", "height", "auto").dialog("open");

    var fromDate = '';
    var toDate = '';

    fromDate = $("#mrkbkFromDate").datepicker().val();
    toDate = $("#mrkbkToDate").datepicker().val();

    $.ajax({
        type: "POST",
        url: mwMrkBookDialogRootPath + "viewer/Achieve/TopicBas/StuMrks.aspx/GetMarkbook",
        data: "{studentID: " + studentID + ", classID: " + classID + ", termID: " + termID + ", topicID: " + topicID + ", fromDate: '" + fromDate + "', toDate: '" + toDate + "', relPath: '" + mwMrkBookDialogRootPath + "'}",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (msg) {
            $("#MarkbookDialog").dialog("close");
            $("#markbookTable").html(msg.d);
            $("#MarkbookDialog").dialog("option", "height", "auto").dialog("open");
            $("#markbookTable td[mrkTble!='1']").addClass("tdAchievement");
            makeMarkbookEditable();
        },
        error: function (e) {
            $("#markbookTable").html("(error loading marbook)");
            $("#MarkbookDialog").dialog("option", "height", "auto").dialog("open");
        }
    });
}