/**
 * @desc Ensures that every cell in a row has the same background color as the first cell
 */
const fixBgColor = () => {
    $('#markbookTable tr').each(function () {
        const rowStyle = $(this).find('td:first').css('background-color');
        $(this).find('td:not(:first)').each(function () {
            $(this).css('background-color', rowStyle);
        });
    });
};