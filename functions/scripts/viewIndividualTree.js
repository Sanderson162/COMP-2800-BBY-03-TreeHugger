window.addEventListener("DOMContentLoaded", () => {
    console.log("Script Ready!");
    checkUrlParams();
    

    $("#inputTreeId").keyup(function (e) {
        if (e.which == 13) {
            let recordID = $("#inputTreeId").children().val();
            console.log("Enter pressed! input value: " + recordID);
            $("#debuginputTreeId").children(".info").html(recordID);
            getInfoOnTreeByID(recordID);
        }
    });

    $("#viewIndividualTreeButton").click(function (e) {
        viewIndividualTreeOverlayOn();
    });
});

/*
function getInfoOnTreeByID(recordID){
    console.log("getting tree by record id: " + recordID);
    $.ajax({
        type: "GET",
        dataType: "json",
        url: "https://opendata.vancouver.ca/api/v2/catalog/datasets/street-trees/records/" + recordID + "?select=*&pretty=false&timezone=UTC", 
        success: function(result, status, xhr){ 
            console.log("recieved: " + result);
            console.log(result);
            $("#resultsinputTreeIdRaw").children(".info").html(JSON.stringify(result.record.fields));
            displayTree(result.record.fields);
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log("ERROR:", jqXHR, textStatus, errorThrown);
        }
    });
}
*/


/*
function getInfoFromWikipediaBasedOnGenusSpecies (genus_species) {
    console.log("search query: https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&titles=" + genus_species + "&exintro=1&explaintext=1&callback=?");
    $.ajax({
        type: "GET",
        dataType: "json",
        url: "https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&titles=" + genus_species + "&exintro=1&explaintext=1&callback=?", 
        success: function(result, status, xhr){ 
            console.log("recieved: " + result);
            console.log(result);
            $("#resultsWikiQueryRaw").children(".info").html(JSON.stringify(result));
            displayWikipediaInformation(result);
            let link = "https://en.wikipedia.org/wiki/" + genus_species;
            $("#resultsWikiQueryLink").children(".info").html('<a href="'+ link +'">link to wikipedia</a>');
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log("ERROR:", jqXHR, textStatus, errorThrown);
        }
    });
}


function displayTree(record) {
    console.log("genus_name: " + record.genus_name);
    let elem = $("#resultsinputTreeIdFormatted").children(".info");
    elem.empty();
    elem.append($("<p>Genus, Species: </p>").append($("<span></span>").html(record.genus_name + ", " + record.species_name)));
    elem.append($("<p>wikititle: </p>").append($("<span></span>").html(record.genus_name.toLowerCase() + "_" + record.species_name.toLowerCase())));
    elem.append($("<p>Name: </p>").append($("<span></span>").html(record.common_name)));
    elem.append($("<p>Location: </p>").append($("<span></span>").html(record.on_street_block + " " + record.on_street + " " + record.neighbourhood_name)));
    elem.append($("<p>Coords: </p>").append($("<span></span>").html(record.geom ? record.geom.geometry.coordinates[0] + " " + record.geom.geometry.coordinates[1] : "N/A")));
    //https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&titles=cornus_nuttallii&redirects=1&exintro=1&explaintext=1
    getInfoFromWikipediaBasedOnGenusSpecies(record.genus_name.toLowerCase() + "_" + record.species_name.toLowerCase())
}

function displayWikipediaInformation(result) {
    let pageid = Object.keys(result.query.pages)[0];
    $("#resultsWikiQuery").children(".info").html(JSON.stringify(result.query.pages[pageid].extract));
}
*/

async function getInfoOnTreeAndAppend(element, recordID) {
    let openDataElement = $("<div class='openDataElement'></div>");
    let wikipediaElement = $("<div class='wikipediaElement'></div>");

    let openData = await getInfoOnTreeByID(recordID);
    if (openData) {
        openDataElement.append($("<p>Genus, Species: </p>").append($("<span></span>").text(openData.genus_name + ", " + openData.species_name)));
        openDataElement.append($("<p>wikititle: </p>").append($("<span></span>").text(openData.genus_name.toLowerCase() + "_" + openData.species_name.toLowerCase())));
        openDataElement.append($("<p>Name: </p>").append($("<span></span>").text(openData.common_name)));
        openDataElement.append($("<p>Location: </p>").append($("<span></span>").text(openData.on_street_block + " " + openData.on_street + " " + openData.neighbourhood_name)));
        openDataElement.append($("<p>Coords: </p>").append($("<span></span>").text(openData.geom ? openData.geom.geometry.coordinates[0] + " " + openData.geom.geometry.coordinates[1] : "N/A")));
    } else {
        openDataElement.text("record not avalible :(");
    }

    let genus_species = openData.genus_name.toLowerCase() + "_" + openData.species_name.toLowerCase();
    let wikiData = await getWikipediaExtract(genus_species);
    wikipediaElement.text(wikiData);

    let link = "https://en.wikipedia.org/wiki/" + genus_species;
    let wikiLink = $('<a href="' + link + '">link to wikipedia</a>');


    element.append(openDataElement, wikipediaElement, wikiLink);
}



function viewIndividualTreeOverlayOn() {
    document.getElementById("viewIndividualTreeOverlay").style.display = "block";
}

function viewIndividualTreeOverlayOff() {
    document.getElementById("viewIndividualTreeOverlay").style.display = "none";
}


function checkUrlParams() {
    vars = getUrlVars();
    if (vars.id) {
        console.log("recordID: ", vars.id);
        getInfoOnTreeAndAppend($("#newElementForTesting"), vars.id);
    }
}

// Url parsing function. Source: https://html-online.com/articles/get-url-parameters-javascript/
function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
        vars[key] = value;
    });
    return vars;
}