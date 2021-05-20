// gets all the info regarding a particular tree using the recordID from opendata
// returns null if tree not able to be retrieved 
function getInfoOnTreeByID(recordID) {
  return new Promise((resolve) => {
    let url = "https://opendata.vancouver.ca/api/v2/catalog/datasets/street-trees/records/" + recordID + "?select=*&pretty=false&timezone=UTC"
    $.ajax({
      type: "GET",
      dataType: "json",
      url: url,
      success: function (result, status, xhr) {
        if (status == 'success') {
          resolve(result.record.fields);
        } else {
          resolve("Record not avalible :(");
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.log("ERROR:", jqXHR, textStatus, errorThrown);
        resolve("Record not avalible :(");
      }
    });
  });
}

// getWikipediaExtract(genus_name.toLowerCase() + "_" + species_name.toLowerCase())
// given a genus and species name (the way wikipedia indexes their pages) you can retrieve the extract
// returns the extract or "record not found" which can be put directly into element with element.text(extract)
function getWikipediaExtract(genus_species) {
  return new Promise((resolve) => {
    let url = "https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&titles=" + genus_species + "&exintro=1&explaintext=1&callback=?";
    $.ajax({
      type: "GET",
      dataType: "json",
      url: url,
      success: function (result, status, xhr) {
        console.log(result);
        let pageid = Object.keys(result.query.pages)[0];
        if (pageid != -1) {
          let extract = JSON.stringify(result.query.pages[pageid].extract);
          resolve(extract);
        } else {
          resolve("Extract not avalible :(");
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.log("ERROR:", jqXHR, textStatus, errorThrown);
        resolve("Extract not avalible :(");
      }
    });
  });
}

function getWikipediaExtractPhoto(genus_species) {
  return new Promise((resolve) => {
    $.ajax({
      type: "GET",
      dataType: "jsonp",
      url: "https://en.wikipedia.org/w/api.php?action=query&titles=" + genus_species + "&prop=pageimages&format=json&pithumbsize=100&callback=?",
      success: function(result, status, xhr){
          console.log("received: ", result);
          resolve(result);
      },
      error: function(jqXHR, textStatus, errorThrown) {
          console.log("ERROR:", jqXHR, textStatus, errorThrown);
      }
    });
  });
}


// example function, add extract to element
async function addWikiExtractToElement(element, genus_species) {
  let extract = await getWikipediaExtract(genus_species);
  element.text(extract);
}

