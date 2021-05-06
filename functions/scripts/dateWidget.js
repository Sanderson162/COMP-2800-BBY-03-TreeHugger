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

$(document).ready(function () {
    updateDateBlock(new Date());
});

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
            results.html("<i>No results found...</i>");
        }
        $.each(data.records, function (i, entry) {
            searchResults(entry);
        });
    });
    updateDateBlock(date);
}

$(function () {
    $('#datepicker').datepicker({
        inline: true,
        showOtherMonths: true,
        dayNamesMin: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
        altField: "#date",
        onSelect: function (dateText, inst) {
            changeDate($(this).datepicker("getDate"));
        }
    });
});