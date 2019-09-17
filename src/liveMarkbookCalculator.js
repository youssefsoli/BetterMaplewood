let markbooks = [];
const level1 = 'rgb(240, 255, 240)';
const level2 = 'rgb(248, 255, 248)';
const level3 = 'rgb(253, 253, 251)';

const calculateMark = mark => {
    console.log(mark.attr('style'));
}

const parseMarkbook = () => {
    let topLevel = 0;
    let curLevel = 0;

    $('#markbookTable table tbody > tr').each(function () {
        const markLevel = $(this).children().css("background-color");

        switch (markLevel) {
            case level1:
                curLevel = 1;
                break;
            case level2:
                curLevel = 2;
                break;
            case level3:
                curLevel = 3;
                break;
            default:
                curLevel = 0;
        }

        if (curLevel < topLevel)
            topLevel = curLevel;

        console.log(curLevel);
    });
}

const makeMarkbookEditable = () => {
    $('#markbookTable table').prepend('<style type="text/css">input[type="number"]::-webkit-outer-spin-button,input[type="number"]::-webkit-inner-spin-button {-webkit-appearance: none;margin: 0;} input[type="number"] {-moz-appearance: textfield; margin: 0; border: none; display: inline; font-family: Monaco, Courier, monospace; font-size: inherit; padding: 0px; text-align: center; width: 30pt; background-color: inherit;}</style>');
    $('#markbookTable table tbody td:nth-child(2)').each(function () {
        const mark = $(this).text();
        if (isNaN(parseFloat(mark)) && mark !== '')
            return;
        $(this).html(`<input min="0" type="number" value="${mark}" />`);
        const input = $(this).children('input');
        $(input).bind('input', function () {
            calculateMark($(this));
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
            parseMarkbook();
            makeMarkbookEditable();
        },
        error: function (e) {
            $("#markbookTable").html("(error loading marbook)");
            $("#MarkbookDialog").dialog("option", "height", "auto").dialog("open");
        }
    });
}