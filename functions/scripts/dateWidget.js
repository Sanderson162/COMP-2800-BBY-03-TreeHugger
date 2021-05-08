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

//https://stackoverflow.com/questions/2385332/highlight-dates-in-specific-range-with-jquerys-datepicker

$(function () {
    updateDateBlock(new Date());

    let dates = [];
    let query = "https://opendata.vancouver.ca/api/v2/catalog/datasets/street-trees/facets?facet=date_planted&refine=date_planted%3A2019%2F03&timezone=UTC";
    $.getJSON(query, (data) => {
        dates = data.facets[0].facets[0].facets[0].facets;
    });

    dates = ["2021/05/20", "2021/05/21"];

    $('#datepicker').datepicker({
        inline: true,
        showOtherMonths: true,
        dayNamesMin: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
        altField: "#date",
        beforeShowDay: highlightDays,
        // onChangeMonthYear: highlightDays,
        onSelect: function (dateText, inst) {
            changeDate($(this).datepicker("getDate"));
            $( "#datepicker" ).datepicker("refresh");
        }
    });

    function highlightDays(date) {
        for (var i = 0; i < dates.length; i++) {
            if (new Date(dates[i]).toString() == date.toString()) {
                return [true, 'event', "Trees planted on this date!"];
            }
        }
        return [true, ''];
     }
});