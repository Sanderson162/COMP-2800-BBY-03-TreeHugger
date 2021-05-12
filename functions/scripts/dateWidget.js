'use strict'

//Add a disable for the arrow until JSON returns from switching months.
//CSS pointer events: none
//Add a disable tag for class with pointer events none --> color grey
//Change selector color.
//What do we want on each card?
//Move date block below calendar.
//Title?
//Fix calendar position so it does not scroll.

/**
 * This script creates and performs various functions for a datepicker interface from JQuery UI.
 * searchDate.html contains div layouts
 * search.css contains style requirements
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

function searchResults(entry) {
    let newEntry = "<div class='card'>";
    newEntry += "<p>" + entry.fields.genus_name + " " + entry.fields.species_name + "</p>";
    newEntry += "<p>" + entry.fields.common_name + "</p>";
    newEntry += "<p>" + entry.fields.on_street + " in " + entry.fields.neighbourhood_name + "</p>";
    newEntry += "</div>";
    $("#main").append(newEntry);
}

function formatDate(date) {
    return date.getFullYear().toString() + "-" +
        ("0" + (date.getMonth() + 1).toString()).slice(-2) +
        "-" + ("0" + date.getDate().toString()).slice(-2);
}

function loadMoreButton(queryResultsArray) {
    let button = $("<button type='button' id='loadButton'>Load more</button>");
    button.click(() => {
        searchAction(queryResultsArray);
        $("#loadButton").remove();
    });
    return button;
}

function searchAction(queryResultsArray) {
    let resultsPerPage = 10;

    if (totalHits - recordsArrayPosition < resultsPerPage) {
        resultsPerPage = totalHits - recordsArrayPosition;
    }

    if (totalHits - recordsArrayPosition > resultsPerPage) {
        $("#pageButton").append(loadMoreButton(queryResultsArray));
    }

    for (let i = 0; i < resultsPerPage; i++) {
        searchResults(queryResultsArray.records[recordsArrayPosition]);
        recordsArrayPosition++;
    }
}

function changeDate(date) {
    let queryResultsArray = [];
    let newDate = formatDate(date);
    let query = "https://opendata.vancouver.ca/api/records/1.0/search/?dataset=street-trees&q=date_planted+%3D+" +
        newDate + "&rows=500&start=0&facet=date_planted";

    $.getJSON(query, (data) => {
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

$(function () {
    let newDate = new Date();
    updateDateBlock(newDate);
    let dates = [];

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
     */

    $("#datepicker").datepicker("setDate", newDate);
    $(".ui-datepicker-current-day").click();

    // =========================================END============================================

});