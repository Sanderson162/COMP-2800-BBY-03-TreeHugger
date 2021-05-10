'use strict'

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

function searchResults(entry) {
    let newEntry = "<div class='card'>";
    newEntry += "<p>" + entry.fields.genus_name + " " + entry.fields.species_name + "</p>";
    newEntry += "<p>" + entry.fields.common_name + "</p>";
    newEntry += "<p>" + entry.fields.on_street + " in " + entry.fields.neighbourhood_name + "</p>";
    newEntry += "</div>";
    $("#main").append(newEntry);
}

function changeDate(date) {
    $.getJSON('https://opendata.vancouver.ca/api/records/1.0/search/?dataset=street-trees&q=date_planted+%3D+' + $.datepicker.formatDate("yy-mm-dd", date).toString() + '&lang=en&start=1', function (data) {
        if (data.records.length == 0) {
            $("#main").html("<i>No results found...</i>");
        } else {
            $("#main").html("");
            $.each(data.records, function (i, entry) {
                searchResults(entry);
            });
        }
    });
    updateDateBlock(date);
}

function formatDate(date) {
    return date.getFullYear().toString() + "-" + "0" + (date.getMonth() + 1).toString().slice(-2) + "-" + "0" + (date.getDay() + 1).toString().slice();
}

//https://stackoverflow.com/questions/2385332/highlight-dates-in-specific-range-with-jquerys-datepicker

$(function () {
    let newDate = new Date();
    updateDateBlock(newDate);

    let dates = [];

    function getDatesInCurrentMonth (year, month, inst) {
        let query = "https://opendata.vancouver.ca/api/records/1.0/search/?dataset=street-trees&q=date_planted+%3D+" + year.toString() + "-" + month.toString() + "&rows=500&start=1&facet=date_planted";
        $.getJSON(query, (data) => {
            dates = data.records;
        });
    }

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

    function highlightDays (date) {
        let dateEntryString = "";
        if (dates.length != 0) {
            for (let i = 0; i < dates.length; i++) {
                dateEntryString = dates[i].fields.date_planted
                if (dateEntryString.localeCompare(formatDate(date)) == 0) {
                    console.log("BAD DATE: " + dateEntryString + " WITH: " + formatDate(date));
                    return [true, 'highlight'];
                }
            }
        }
        return [true, ''];
    }
});