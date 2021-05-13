'use strict'

//What do we want on each card?

/**
 * This script creates and performs various functions for a datepicker interface from JQuery UI.
 * searchDate.html contains div layouts
 * searchDate.css contains style requirements
 * @see https://api.jqueryui.com/datepicker/
 *
 * This script also makes calls to the Vancouver Open Data Portal Street Trees Database
 * @see https://opendata.vancouver.ca/explore/dataset/street-trees/information/?disjunctive.species_name&disjunctive.common_name&disjunctive.height_range_id
 */

var recordsArrayPosition = 0;
var totalHits;

/**
 * ========================================START=============================================
 * This code snippet was used with permission from a colleague on the same BCIT COMP 2800 BBY-3 Team.
 * @author Aidan McReynolds
 * @see https://github.com/AidanMcReynolds/1800project
 *
 * This function updates a date block displayed next to the datepicker to show the currently passed date.
 * @param date as a Date
 */
function updateDateBlock(date) {
    $("#date-day").html(date.toLocaleString('en-us', {
        weekday: 'long'
    }));
    $("#date-date").html(date.getDate());
    $("#date-month").html(date.toLocaleString('en-us', {
        month: 'long'
    }));
    $("#date-year").html(date.toLocaleString('en-us', {
        year: 'numeric'
    }));
}

// =========================================END============================================

/**
 * This function formats and appends search query results from a query results array to the #main
 * section in searchDate.html
 * @param entry as a query results array
 */
function searchResults(entry) {
    let newEntry = "<div class='card'>";
    newEntry += "<p>" + entry.fields.genus_name + " " + entry.fields.species_name + "</p>";
    newEntry += "<p>" + entry.fields.common_name + "</p>";
    newEntry += "<p>" + entry.fields.on_street + " in " + entry.fields.neighbourhood_name + "</p>";
    newEntry += "</div>";
    $("#main").append(newEntry);
}

/**
 * This function formats a Date object into compatible formats so they can be used
 * with query results and the datepicker interface.
 * @param date as a Date
 * @returns Date object with the format YYYY-MM-DD
 */
function formatDate(date) {
    return date.getFullYear().toString() + "-" +
        ("0" + (date.getMonth() + 1).toString()).slice(-2) +
        "-" + ("0" + date.getDate().toString()).slice(-2);
}

/**
 * This function appends a "load more" button to the #loadButton division
 * of searchDate.html. This button will add up to 10 more results from the
 * search query to the bottom of the #main division.
 * @param queryResultsArray as an array of street tree records
 * @returns button as a JQuery button object
 */

function loadMoreButton(queryResultsArray) {
    let button = $("<button type='button' id='loadButton'>Load more</button>");
    button.click(() => {
        searchAction(queryResultsArray);
        $("#loadButton").remove();
    });
    return button;
}

/**
 * This function performs a search action of a query results array and calls
 * the searchResults function to append them to a results page.
 * @param queryResultsArray as an array of street tree records
 */
function searchAction(queryResultsArray) {
    let resultsPerPage = 10;

    if (totalHits - recordsArrayPosition < resultsPerPage) {
        resultsPerPage = totalHits - recordsArrayPosition;
    }

    let tempRecordsArrayPosition = recordsArrayPosition;

    for (let i = 0; i < resultsPerPage; i++) {
        searchResults(queryResultsArray.records[recordsArrayPosition]);
        recordsArrayPosition++;
    }

    if (totalHits - tempRecordsArrayPosition > resultsPerPage) {
        $("#main").append(loadMoreButton(queryResultsArray));
    }
}

/**
 * This function is asynchronous. This function performs a search query using the date
 * clicked on in the datepicker interface as the parameters for a query of the Vancouver
 * Street Trees database. It then stores the results to an array and initializes variables
 * needed for the operations of the subsequently called functions.
 * A class toggle is used to ensure that users cannot interrupt a database query
 * before it returns the JSON.
 * @param date as a Date object
 */
async function changeDate(date) {
    $("#datepicker").toggleClass("datepicker-disable");
    let queryResultsArray = [];
    let newDate = formatDate(date);
    let query = "https://opendata.vancouver.ca/api/records/1.0/search/?dataset=street-trees&q=date_planted+%3D+" +
        newDate + "&rows=500&start=0&facet=date_planted";

    await $.getJSON(query, (data) => {
        $("#datepicker").toggleClass("datepicker-disable");
        queryResultsArray = data;
        recordsArrayPosition = 0;
        totalHits = data.nhits;
        $("#main").html("");
        $("#loadButton").remove();

        if (data.nhits == 0) {
            $("#main").html("<i>No results found...</i>");
        } else {
            searchAction(queryResultsArray);
        }
    });

    updateDateBlock(date);
}

/**
 * The following functions are required to be performed when the document is ready, and in this
 * order.
 */

$(function () {
    let newDate = new Date();
    updateDateBlock(newDate);
    let dates = [];

    /**
     * This function is asynchronous and will disable user input until the JSON returns from the
     * database query. This function will query the database when a user switches year or month
     * in the datepicker interface. The query results are then passed to the highlightDays
     * function to highlight all days that have trees planted on them.
     * @param year as a Date object
     * @param month as a Date object
     * @param inst as a datepicker object
     */

    async function getDatesInCurrentMonth(year, month, inst) {
        $("#datepicker").toggleClass("datepicker-disable");
        let query = "https://opendata.vancouver.ca/api/records/1.0/search/?dataset=street-trees&q=date_planted+%3D+" +
            year.toString() + "-" + month.toString() + "&rows=500&start=0&facet=date_planted";

        await $.getJSON(query, (data) => {
            dates = data.records;
            $("#datepicker").toggleClass("datepicker-disable");
        });

        /**
         * ======================================START===============================================
         * Code snippet found on https://stackoverflow.com/ and adapted to this datepicker.
         * @author Irvin Dominin https://stackoverflow.com/users/975520/irvin-dominin
         * @see https://stackoverflow.com/questions/18979579/fire-the-datepicker-onselect-event-manually
         *
         * This code was used to set the date to the first of the month that was just switched to by the
         * user.
         */

        let startOfNewMonth = new Date(year.toString() + "/" + month.toString() + "/" + "01");
        $("#datepicker").datepicker("setDate", startOfNewMonth);
        $(".ui-datepicker-current-day").click();

        // =========================================END============================================
    }

    /**
     * ===========================================START==========================================
     * Code was based on a snippet retrieved from https://stackoverflow.com/, and was then adapted to
     * work with this datepicker.
     * @author Spaceghost https://stackoverflow.com/users/188456/spaceghost
     * @see https://stackoverflow.com/questions/2385332/highlight-dates-in-specific-range-with-jquerys-datepicker
     *
     * This function utilizes the datepicker beforeShowDay method to check every day of the current month
     * for dates that exist in the dates array (trees that were planted in that month). It will then append
     * the "highlight" CSS class to any date entries found so they will appear with a green highlight on the
     * datepicker interface.
     */

    function highlightDays(date) {
        let dateEntryString = "";
        if (dates.length != 0) {
            for (let i = 0; i < dates.length; i++) {
                dateEntryString = dates[i].fields.date_planted
                if (dateEntryString.localeCompare(formatDate(date)) == 0) {
                    return [true, "highlight", "Trees were planted on this day!"];
                }
            }
        }
        return [true, ''];
    }

    // ==========================================END===========================================

    /**
     * ==============================================START=======================================
     * This code snippet was used with permission from a colleague on the same BCIT COMP 2800 BBY-3 Team.
     * It was then adapted to work with this datepicker.
     * @author Aidan McReynolds
     * @see https://github.com/AidanMcReynolds/1800project
     *
     * This Query creates a datepicker interface under the #datepicker division. It will
     * then use datepicker UI methods to set up the intended format and the following methods
     * to deal with user input:
     * onChangeMonthYear --> whenever a user changes the year or month --> call getDatesInCurrentMonth
     * beforeShowDay --> when interface is reloaded, before showing it -> call highlightDays
     * onSelect --> each time a user clicks on a valid date on the interface --> calls changeDate
     */
    $('#datepicker').datepicker({
        inline: true,
        showOtherMonths: true,
        dayNamesMin: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
        altField: "#date",
        changeYear: true,
        yearRange: "1988:2022",
        onChangeMonthYear: getDatesInCurrentMonth,
        beforeShowDay: highlightDays,
        onSelect: function (dateText, inst) {
            changeDate($(this).datepicker("getDate"));
        }
    });

    // =======================================END==============================================

    /**
     * ======================================START===============================================
     * Code snippet found on https://stackoverflow.com/ and adapted it to this datepicker.
     * @author Irvin Dominin https://stackoverflow.com/users/975520/irvin-dominin
     * @see https://stackoverflow.com/questions/18979579/fire-the-datepicker-onselect-event-manually
     *
     * This code was used to reset the datepicker to the current day upon page refresh or load.
     */

    $("#datepicker").datepicker("setDate", newDate);
    $(".ui-datepicker-current-day").click();

    // =========================================END============================================

});