window.addEventListener("DOMContentLoaded", () => {
    console.log("Script Ready!");

    $("#inputTreeId").keyup(function(e) {
        if(e.which == 13) {
            let recordID = $("#inputTreeId").children().val();
            console.log("Enter pressed! input value: " + recordID);
            $("#debuginputTreeId").children(".info").html(recordID);
            getInfoOnTreeByID(recordID);
        }
    });

    $("#viewIndividualTreeButton").click(function(e) {
        viewIndividualTreeOverlayOn();
    });
});

function getInfoOnTreeByID(recordID){
    console.log("getting tree by record id: " + recordID);
    $.ajax({
        type: "GET",
        dataType: "json",
        url: "https://opendata.vancouver.ca/api/v2/catalog/datasets/street-trees/records/" + recordID + "?select=*&pretty=false&timezone=UTC", 
        success: function(result, status, xhr){ 
            console.log("recieved: " + result);
            console.log(result);
            console.log("xhr: " + xhr);
            console.log(xhr);
            console.log(xhr.getAllResponseHeaders());
            console.log(xhr.getResponseHeader("x-ratelimit-remaining"));
            $("#resultsinputTreeIdRaw").children(".info").html(JSON.stringify(result.record.fields));
            displayTree(result.record.fields);
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log("ERROR:", jqXHR, textStatus, errorThrown);
        }
    });
}

function displayTree (record) {
    console.log("genus_name: " + record.genus_name);
    let elem = $("#resultsinputTreeIdFormatted").children(".info");
    elem.empty();
    elem.append($("<p>Genus, Species: </p>").append($("<span></span>").html(record.genus_name+", "+record.species_name)));
    elem.append($("<p>wikititle: </p>").append($("<span></span>").html(record.genus_name.toLowerCase()+"_"+record.species_name.toLowerCase())));
    elem.append($("<p>Name: </p>").append($("<span></span>").html(record.common_name)));
    elem.append($("<p>Location: </p>").append($("<span></span>").html(record.on_street_block+" "+record.on_street+" "+record.neighbourhood_name)));
    elem.append($("<p>Coords: </p>").append($("<span></span>").html(record.geom ? record.geom.geometry.coordinates[0] + " " + record.geom.geometry.coordinates[1] : "N/A" )));
    //https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&titles=cornus_nuttallii&redirects=1&exintro=1&explaintext=1
    getInfoFromWikipediaBasedOnGenusSpecies(record.genus_name.toLowerCase()+"_"+record.species_name.toLowerCase())
}

function getInfoFromWikipediaBasedOnGenusSpecies (genus_species) {
    console.log("search query: https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&titles=" + genus_species + "&exintro=1&explaintext=1&callback=?");
    $.ajax({
        type: "GET",
        dataType: "json",
        url: "https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&titles=" + genus_species + "&exintro=1&explaintext=1&callback=?", 
        success: function(result, status, xhr){ 
            console.log("recieved: " + result);
            console.log(result);
            console.log("xhr: " + xhr);
            console.log(xhr);
            console.log(xhr.getAllResponseHeaders());
            console.log(xhr.getResponseHeader("x-ratelimit-remaining"));
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

function displayWikipediaInformation (result) {
    let pageid = Object.keys(result.query.pages)[0];
    $("#resultsWikiQuery").children(".info").html(JSON.stringify(result.query.pages[pageid].extract));
}

function viewIndividualTreeOverlayOn() {
    document.getElementById("viewIndividualTreeOverlay").style.display = "block";
  }
  
  function viewIndividualTreeOverlayOff() {
    document.getElementById("viewIndividualTreeOverlay").style.display = "none";
  }