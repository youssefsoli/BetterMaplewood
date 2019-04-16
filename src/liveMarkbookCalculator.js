loadMarkbook = function(studentID, classID, termID, topicID, title, refresh) {

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

    fromDate = $("#mrkbkFromDate").datepicker("getDate");
    toDate = $("#mrkbkToDate").datepicker("getDate");
    if (fromDate) fromDate = (fromDate.getMonth() + 1).toString() + "/" + fromDate.getDate().toString() + "/" + fromDate.getFullYear().toString(); else fromDate = "";
    if (toDate) toDate = (toDate.getMonth() + 1).toString() + "/" + toDate.getDate().toString() + "/" + toDate.getFullYear().toString(); else fromDate = "";

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
        },
        error: function (e) {
            $("#markbookTable").html("(error loading marbook)");
            $("#MarkbookDialog").dialog("option", "height", "auto").dialog("open");
        }
    });

}