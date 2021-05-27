'use strict'

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


/**
 * Searching wikipedia articles and picking first result. Idea came from stack overflow.
 * @see https://stackoverflow.com/questions/27457977/searching-wikipedia-using-api
 * @author octosquidopus https://stackoverflow.com/users/908703/octosquidopus
 * @see https://www.mediawiki.org/wiki/API:Opensearch
 * @param {*} genus_species
 * @returns extract from wikipedia opensearch result
 */
function getWikipediaArticleName(genus_species) {
  return new Promise((resolve) => {
    let extractUrl = "https://en.wikipedia.org/w/api.php?action=opensearch&search=" + genus_species.split('_')[0] + "+" + genus_species.split('_')[1] + "&limit=1&namespace=0&format=json&callback=?";
    $.ajax({
      type: "GET",
      dataType: "json",
      url: extractUrl,
      success: function (result, status, xhr) {
        resolve(result);
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.log("ERROR:", jqXHR, textStatus, errorThrown);
        resolve("");
      }
    });
  });
}

/**
 * Returns an extract from a wikipedia page corresponding to a search of the genus and species name.
 * Can change sentence limit of extract --> adding "&exsentences=value" directly after "&prop=extracts" --> value = 1 - 10
 * @param {*} genus_species
 * @returns text extract
 */
function getWikipediaExtract(genus_species) {
  return new Promise((resolve) => {
    let extractUrl = "https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&titles=" + genus_species + "&exintro=1&explaintext=1&callback=?&redirects=";
    $.ajax({
      type: "GET",
      dataType: "json",
      url: extractUrl,
      success: function (result, status, xhr) {
        let pageId = Object.keys(result.query.pages)[0];
        if (pageId != -1) {
          let extract = JSON.stringify(result.query.pages[pageId].extract);
          resolve(extract);
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

function getWikipediaThumbnail(genus_species) {
  return new Promise((resolve) => {
    let thumbnailUrl = "https://en.wikipedia.org/w/api.php?action=query&titles=" + genus_species + "&prop=pageimages&format=json&pithumbsize=400&callback=?&redirects=";
    $.ajax({
      type: "GET",
      dataType: "jsonp",
      url: thumbnailUrl,
      success: function (result, status, xhr) {
        let pageIdThumbnail = Object.keys(result.query.pages)[0];
        if (pageIdThumbnail != -1) {
          let thumbnail = result.query.pages[pageIdThumbnail].thumbnail;
          resolve(thumbnail);
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

/**
 * Displays wikipedia thumbnail retrieved from query in details division.
 * @param {*} result
 */
async function displayWikipediaInformation(element, genus_species, arrowElement) {

  let newExtract = await getWikipediaArticleName(genus_species);
  if (newExtract[1][0]) {
    genus_species = newExtract[1][0];
    genus_species = genus_species.split(" ").join("_");
  }

  let extract = await getWikipediaExtract(genus_species);

  if (extract == "") {
    extract = await getWikipediaExtract(genus_species.split('_')[0]);
    genus_species = genus_species.split('_')[0];
  }

  // replace regex from https://stackoverflow.com/questions/14948223/how-to-convert-n-to-html-line-break/23736554
  // see TheLazyHatGuy -> https://stackoverflow.com/users/11219881/thelazyhatguy
  extract = extract.replace(/\\n|\\r\\n|\\n\\r|\\r/g, '');
  extract = extract.replace(/\\"/g, '\"');
  element.text(extract);

  if (extract) {
    let thumbnail = await getWikipediaThumbnail(genus_species);
    let link = "https://en.wikipedia.org/wiki/" + genus_species;
    element.append('<br><a href="' + link + '" onclick="event.preventDefault();window.open(\'' + link + '\');"><img style="display:block;margin:auto;padding:1em;width:35px;height:auto;"src="https://upload.wikimedia.org/wikipedia/commons/7/77/Wikipedia_svg_logo.svg"></img></a>');
    element.prepend('<img style="width:100%;max-height:125px;object-fit: cover;"id="thumbnail" src=' + thumbnail.source + ' alt=""><br>');
    isDetails(true, arrowElement);
  } else {
    isDetails(false, arrowElement);
  }
}

function isDetails(detailExists, arrowElement) {
  if (detailExists) {
    arrowElement.fadeIn();
  } else {
    arrowElement.fadeOut();
  }
}