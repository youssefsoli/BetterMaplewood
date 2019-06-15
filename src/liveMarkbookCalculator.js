class Markbook {
    constructor(className) {
        this.className = className;
        this.categories = [];
    }

    addCategory(category) {
        this.categories.push(category);
    }

    getCategory(categoryName) {

    }

    update() {
        /* Refresh markbook */
    }
}

class Category {
    constructor(categoryName) {

    }
}

let markbooks = [];

const calculateMark = mark => {

    console.log(mark.attr('style'));
}

const makeMarkbookEditable = () => {
    $('#markbookTable table').prepend('<style type="text/css">input[type="number"]::-webkit-outer-spin-button,input[type="number"]::-webkit-inner-spin-button {-webkit-appearance: none;margin: 0;} input[type="number"] {-moz-appearance: textfield;}</style>');
    $('#markbookTable table tbody td:nth-child(2)').each(function () {
        if($(this).css('background-color') === 'rgb(253, 253, 251)') {
            const mark = $(this).text();
            const css = '-webkit-appearance: none; margin: 0; border: none; display: inline; font-family: Monaco, Courier, monospace; font-size: inherit; padding: none; text-align: center; width: 30pt;';
            $(this).html(`<input style="${css}" min="0" type="number" value="${mark}" />`);
            const input = $(this).children('input');
            $(input).bind('input', function() {
                calculateMark($(this));
            });
        }
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