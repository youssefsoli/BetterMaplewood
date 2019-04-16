 const loadPatchedMarkbook = event => {
    studentID = event.data[0];
    classID = event.data[1];
    termID = event.data[2];
    topicID = event.data[3];
    title = event.data[4];

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

$('table a[onclick]').not(':last').each(function () {
    const markbookData = $(this).attr('onclick').slice(13, -2).split(',');
    $(this).removeAttr('onclick');
    $(this).bind('click', [
        markbookData[0],
        markbookData[1],
        markbookData[2],
        markbookData[3],
        markbookData[4]
    ], loadPatchedMarkbook);
});