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
          resolve(result.record);
        } else {
          resolve("");
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.log("ERROR:", jqXHR, textStatus, errorThrown);
        resolve("");
      }
    });
  });
}

// getWikipediaExtract(genus_name.toLowerCase() + "_" + species_name.toLowerCase())
// given a genus and species name (the way wikipedia indexes their pages) you can retrieve the extract
// returns the extract or "record not found" which can be put directly into element with element.text(extract)
function getWikipediaExtract (genus_species) {
  return new Promise((resolve) => {
    let extractUrl = "https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&titles=" + genus_species + "&exintro=1&explaintext=1&callback=?&redirects=";
    $.ajax({
        type: "GET",
        dataType: "json",
        url: extractUrl,
        success: function(result, status, xhr){
            console.log("received: ", result);
            let pageId = Object.keys(result.query.pages)[0];
            if (pageId != -1) {
              let extract = JSON.stringify(result.query.pages[pageId].extract);
              resolve(extract);
            } else {
              resolve("");
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log("ERROR:", jqXHR, textStatus, errorThrown);
            resolve("");
        }
    });
  });
}

function getWikipediaThumbnail (genus_species) {
  return new Promise((resolve) => {
    let thumbnailUrl = "https://en.wikipedia.org/w/api.php?action=query&titles=" + genus_species + "&prop=pageimages&format=json&pithumbsize=150&callback=?&redirects=";
    $.ajax({
      type: "GET",
      dataType: "jsonp",
      url: thumbnailUrl,
      success: function(result, status, xhr){
          console.log("received: ", result);
          let pageIdThumbnail = Object.keys(result.query.pages)[0];
          if (pageIdThumbnail != -1) {
            let thumbnail = result.query.pages[pageIdThumbnail].thumbnail;
            resolve(thumbnail);
          } else {
            resolve("");
          }
      },
      error: function(jqXHR, textStatus, errorThrown) {
          console.log("ERROR:", jqXHR, textStatus, errorThrown);
          resolve("");
      }
    });
  });
}


/**
 * Displays wikipedia thumbnail retrieved from query in details division.
 * @param {*} result
 */
 async function displayWikipediaInformation(element, genus_species) {
  let extract = await getWikipediaExtract(genus_species);
  // replace regex from https://stackoverflow.com/questions/14948223/how-to-convert-n-to-html-line-break/23736554
  // see TheLazyHatGuy -> https://stackoverflow.com/users/11219881/thelazyhatguy
  extract = extract.replace(/\\n|\\r\\n|\\n\\r|\\r/g, '');
  element.text(extract);
  if (extract) {
    let link = "https://en.wikipedia.org/wiki/" + genus_species;
  element.append('<br><br>Retrieved from <a href="'+ link +'" onclick="window.open(\'' + link + '\')">Wikipedia</a>');

  let thumbnail = await getWikipediaThumbnail(genus_species);
  element.prepend('<img id="thumbnail" src=' + thumbnail.source + ' alt=""><br>');
  }

}

