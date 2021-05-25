/**
 * SearchMap
 * Uses the opendata 'Street Trees' database and Google Maps API to find trees via various queries in Vancouver.
 * Built from treefind.js
 * @author Amrit Manhas apsm100
 * @see Aidan, Stirling, Steven, stackoverflow
 */
"use strict";
let currentLocation;
let markers = [];
let mapIdVar = 'c79c5bedf4efc001';
let locationMarker;
let map;
let panorama;
let selectedTreeLocation;
let selectedTreeId;
let greenTreeIcon = "https://firebasestorage.googleapis.com/v0/b/tree-hugger-c60ff.appspot.com/o/treeeee1.png?alt=media&token=1edb09b2-d15f-4a92-bdb2-c76b61de7f18";
let selectedTreeIcon = "https://firebasestorage.googleapis.com/v0/b/tree-hugger-c60ff.appspot.com/o/treeeee12.png?alt=media&token=aa102c04-5925-4f53-82fc-f4c7d49ee889";
let locationIcon = "https://firebasestorage.googleapis.com/v0/b/tree-hugger-c60ff.appspot.com/o/loc2.png?alt=media&token=18248c0d-f07c-4a9e-9c3e-a7cd2a2e5e97";
let page = 0;
let zoomVal;
let markerIndexCount = 0;
let searchHistory = [];
let allSearchHistory = [];
let mouseClickDelay = 250;
let mouseClickTimer;
/**
 * QUERY SETTINGS
 */
/* Number of queries returned */
let rows = 40;
currentLocation = { lat: 49.279430, lng: -123.117276 };
/**
 * Drives the application on load.
 * @author Amrit
 */
$(document).ready(function () {
  $("#outer-search").css('height', '175px');
  $("#content").text("");
  showSearchType('common_name-tag');
  addInputListeners();
  addMainScrollListener();
  checkUrlParams(getUrlParams());
});
/**
 * Checks URL params and executes appropriate action.
 * @param {*} params URL params.
 * @author Amrit, Stirling
 */
function checkUrlParams(params) {
  if (params.q && params.type) {
    let _callback;
    if (params.id) {
      // This call back simulates a mouse click on the selected treeId from the params.
      _callback = function () {selectedTreeId = null;$("#" + params.id).click();};
    } 
    if (params.type == "location") {
      var splitLatLng = params.q.split(" ");
      let latlng = new google.maps.LatLng(splitLatLng[0], splitLatLng[1]);
      currentLocation = {"lat": splitLatLng[0], "lng": splitLatLng[1]};
      addLocationMarker(latlng, "");
      getContent(_callback);
      $("#content").scrollTop(0);
    } else {
      showSearchType(params.type + '-tag');
      $("#query").val(params.q);
      $("#content").text("");
      queueSearch(_callback);
    }
  } else if (params.id && params.id.length > 10) {
    searchWithRecordID(params.id);
  } else if (params.id && params.id.length < 10) {
    searchWithID(params.id);
  } else if (params.leaderboard) {
    searchWithLeaderboard(params.id);
  }
  firebase.auth().onAuthStateChanged(function (user) {
    if (user && params.favourites) {
      searchWithFavourites();
    } 
  });
}

function searchWithID(id) {
  showSearchType('tree_id-tag');
  $("#query").val(id);
  $("#content").text("");
  queueSearch();
}

function clearSearch() {
  removeUrlParam("id");
  removeUrlParam("type");
  removeUrlParam("q");
  searchHistory = [];
  updateSearchHistoryBtn();
  selectedTreeId = null;
  clearMarkers();
  clearLocationMarker();
  panorama.setVisible(false);
  $("#content").text("");
  $(".search-container").hide();
  updateSearchMapBtn();
  $(".tree-overlay-container").hide();
  $(".content-container").show();
}

function searchWithRecordID(id) {
  clearSearch();
  $("#content-title").text("TREE");
  getRecordAndDisplay(id, null, true);
}

async function searchWithFavourites() {
  clearSearch();
  $("#content-title").text("FAVOURITE TREES");
  let favList = await getFavByUser();

  // console.log("favlist ", favList)

  if (favList) {
    favList.forEach((record, index) => {
      getRecordAndDisplay(record.recordID, index + 1, false);
    });
  } else {
    showDialogue("noFavouites");
  }
}

async function searchWithLeaderboard() {
  clearSearch();

  $("#content-title").text("LEADERBOARD");
  let favList = await getFavCountLeaderboard();

  // console.log("favlist ", favList)

  if (favList) {
    favList.forEach((record, index) => {
      // console.log(record);
      // console.log(record.recordID);
      getRecordAndDisplay(record.recordID, index + 1, false);
    });
  } 
}

async function getRecordAndDisplay(recordID, order, zoomOnTree) {
  let entry = await getInfoOnTreeByID(recordID);
  if (entry.fields.geom) {
    entry.fields.geom = entry.fields.geom.geometry;
    entry.recordid = entry.id;
    if (order) {
      entry.order = order;
    }
    updateContent(entry, false);
    if (zoomOnTree) {
      zoom(entry);
    }
    searchZoom();
  } else {
      showDialogue("treeNotAvailable");
  }
}

/**
 * Uses URL to get URL parameters.
 * @returns params
 * @author https://stackoverflow.com/questions/7722683/how-to-get-all-query-string-values-using-javascript, Amrit
 */
function getUrlParams() {
  let urlParams = (new URL(document.location)).searchParams;
  let params = {};
  for(let param of urlParams.keys()) {
    params[param] = urlParams.get(param);
  }
  return params;
}
/**
 * Sets a url parameter.
 * @param {string} key 
 * @param {string} value 
 * @author https://stackoverflow.com/questions/10970078/modifying-a-query-string-without-reloading-the-page, Amrit
 */
function setUrlParam(key, value) {
  if (history.replaceState) {
    let searchParams = new URLSearchParams(window.location.search);
    searchParams.set(key, value);
    let newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?' + searchParams.toString();
    window.history.replaceState({path: newurl}, '', newurl);
}
}
/**
 * Removes a url paramater with key.
 * @param {string} key 
 * @author Amrit, https://stackoverflow.com/questions/10970078/modifying-a-query-string-without-reloading-the-page
 */
function removeUrlParam(key) {
  if (history.replaceState) {
    let searchParams = new URLSearchParams(window.location.search);
    searchParams.delete(key);
    let newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?' + searchParams.toString();
    window.history.replaceState({path: newurl}, '', newurl);
  }
}
/**
 * Adds listeners for enter key for query inputs for search, and search-date.
 * @author Amrit
 */
function addInputListeners() {
  $("#query").on("keyup", function (event) {
    if (event.keyCode === 13) {
      searchBtnClick();
      // iOS; hides the keyboard.
      document.activeElement.blur();
    }
  });
  $("#query-year").on("keyup", function (event) {
    if (event.keyCode === 13) {
      dateSearchBtnClick();
      document.activeElement.blur();
    }
  });
  $("#query-month").on("keyup", function (event) {
    if (event.keyCode === 13) {
      dateSearchBtnClick();
      document.activeElement.blur();
    }
  });
  $("#query-day").on("keyup", function (event) {
    if (event.keyCode === 13) {
      dateSearchBtnClick();
      document.activeElement.blur();
    }
  });
}
/**
 * Shows the correct div or loads the correct data for each search type.
 * @param {string} type Search type.
 */
function showSearchType(type) {
  let searchType = type.slice(0, -4);
  resetTagSelection();
  selectTag($("#" + type));
  $("#query").val("");
  resetDateSearchBar();
  resetSearchBarOptions();
  if (searchType == "date_planted") {
    $("#date-search-bar").show();
    $("#search-bar").hide();
    if ($(".search-container").css('display') != 'none') {
      loadDateSearchBarOptions("y");
      $("#date-search-bar>#query-year").focus();
    }
  } else {
    $("#search-bar").show();
    $("#date-search-bar").hide();
    if ($(".search-container").css('display') != 'none') {
      if (searchType != "all") {
        loadSearchBarOptions(searchType);
      }
      $("#search-bar>input").focus();
    }
    let queryTag = $("#search-tags>div.tag-selected").text();
    if (queryTag == "Name") {
      queryTag = "Common Name";
    }
    $("#query").attr("placeholder", queryTag);
  }
}
/**
 * Tree name search for treeOverlay.
 * @author Amrit
 */
function treeNameClickSearch() {
  showSearchType('common_name-tag');
  $("#query").val($("#species-name").text());
  $("#content").text("");
  queueSearch();
}
/**
 * Tree Height click search for treeOverlay.
 * @author Amrit
 */
function treeHeightClickSearch() {
  showSearchType('height_range_id-tag');
  $("#query").val($("#tree-card-height").text().substring(0, 1));
  $("#content").text("");
  queueSearch();
}
/**
 * Date click search for treeOverlay.
 * @author Amrit
 */
function treeDateClickSearch() {
  if ($("#tree-card-date").text() != "N/A") {
    showSearchType('date_planted-tag');
    $("#query").val($("#tree-card-date").text());
    $("#content").text("");
    queueSearch();
  }
}
/**
 * Age click search for treeOverlay.
 * @author Amrit
 */
function treeDateAgeClickSearch() {
  if ($("#tree-card-date").text() != "N/A") {
    showSearchType('date_planted-tag');
    $("#query").val($("#tree-card-date").text().substring(0, 7));
    $("#content").text("");
    queueSearch();
  }
}
/**
 * Street click search for treeOverlay.
 * @author Amrit
 */
function treeStreetClickSearch() {
  showSearchType('on_street-tag');
  $("#query").val($("#body").text());
  $("#content").text("");
  queueSearch();
}
/**
 * Queues search for treeOverlay tap searches.
 * @param {obj} _callback Function to be passed to search on completion (optional).
 * @author Amrit
 */
function queueSearch(_callback) {
  clearMarkers();
  clearLocationMarker();
  updateSearchHistorySelectedId();
  search(true, _callback);
}
/**
 * Updates the current search history item with the selectedTreeId for stepping back zoom.
 */
function updateSearchHistorySelectedId() {
  if (searchHistory.length > 0) {
    searchHistory[searchHistory.length - 1].selected = selectedTreeId;
  }
}
/**
 * Search button click that queries a new search.
 * @author Amrit
 */
function searchBtnClick() {
  if ($("#query").val() == "CANIS OVUM") { // EASTER EGG!
    greenTreeIcon = "https://firebasestorage.googleapis.com/v0/b/tree-hugger-c60ff.appspot.com/o/dogGreen.png?alt=media&token=982e67d0-8895-41c8-a69c-852624333c31";
    selectedTreeIcon = "https://firebasestorage.googleapis.com/v0/b/tree-hugger-c60ff.appspot.com/o/dogBlack.png?alt=media&token=684083da-d1ea-41de-85fd-af44246dd200";
    mapIdVar = "36b4aed7bf6f2a28"
    showSearchType('common_name-tag');
    $("*").css("background-color", "#cae4f1");
    $("*").css("color", "BLACK");
    $(".search-container").css("background-color", "transparent");
    $(".content-container").css("background-color", "transparent");
    $(".tree-overlay-container").css("background-color", "transparent");
    $("#trees-near-header").text("PUPPY VISION ENGAGED");
    $(".highlight").css("filter", "none");
    $("input").css("border-color", "black");
    $("#search-btn").css("border-color", "black");
    $("#details-arrow-container").css("background-color", "transparent")
    initMap();
    return;
  }
  if ($("#query").val() != "") {
    removeUrlParam("id");
    selectedTreeId = null;
    clearMarkers();
    clearLocationMarker();
    $("#content").text("");
    search(true);
  }
}
/**
 * Handles the dateSearch button click.
 * @author Amrit
 */
function dateSearchBtnClick() {
  if ($("#query-year").val().length == 4) {
    removeUrlParam("id");
    selectedTreeId = null;
    clearMarkers();
    clearLocationMarker();
    $("#content").text("");
    let y = $("#query-year").val();
    let m = addFirstZero($("#query-month").val());
    let d = addFirstZero($("#query-day").val());
    let q = createDateQuery(y, m, d);
    $("#query").val(q);
    search(true);
  }
}
/**
 * Returns a y-m-d string for querys.
 * @param {string} y 
 * @param {string} m 
 * @param {string} d 
 * @returns y-m-d string
 * @author Amrit
 */
function createDateQuery(y, m, d) {
  let q;
  if (m != "" && d != "") {
    q = y + "-" + m + "-" + d;
  } else if (m != "") {
    q = y + "-" + m;
  } else {
    q = y;
  }
  return q;
}
/**
 * Adds a zero infront of a number.
 * @param {string} num 
 * @returns number with a zero added.
 * @author Amrit
 */
function addFirstZero(num) {
  if (parseInt(num) < 10 && num.length == 1) {
    return "0" + num;
  } else {
    return num;
  }
}
/**
 * Search function for app.
 * @param {bool} reset Resets the page count (optional).
 * @param {obj} _callback Function to be called back after completion (optional).
 * @author Amrit, Aidan
 */
function search(reset, _callback) {
  if (reset) {
    page = 0;
  }
  let q = $("#query").val().toUpperCase();
  let searchType = $("#search-tags>div.tag-selected").attr('id').slice(0, -4);
  setUrlParam("q", q);
  setUrlParam("type", searchType);
  removeUrlParam("favourites");
  removeUrlParam("leaderboard");
  let qString = responsiveSearchTitle(heightRangeToFeet(q, searchType));
  $("#content-title").text(qString);
  $(".search-container").hide();
  $(".tree-overlay-container").hide();
  $(".content-container").show();
  panorama.setVisible(false);
  $("#loadmore").remove();
  let query;
  if (searchType == "all") {
    query = "https://opendata.vancouver.ca/api/records/1.0/search/?dataset=street-trees&q=" + q + "&rows=" + (rows) + "&start=" + page * rows + "&sort=-date_planted";
  } else {
    query = "https://opendata.vancouver.ca/api/records/1.0/search/?dataset=street-trees&q=&facet=genus_name&facet=species_name&facet=common_name&facet=assigned&facet=root_barrier&facet=plant_area&facet=on_street&facet=neighbourhood_name&facet=street_side_name&facet=height_range_id&facet=curb&facet=date_planted&sort=-date_planted&refine." + searchType + "=" + q + "&rows=" + (rows) + "&start=" + page * rows;
  }
  $.getJSON(query, function (data) {
    $.each(data.records, function (i, entry) {
      if (entry.fields.hasOwnProperty('geom')) {
        updateContent(entry, false);
      }
    });
    searchZoom();
    if (_callback) {
      _callback();
    }
    let count = $(".post").length;
    if (count == 1) {
      zoom(data.records[0]);
    }
    let countSpan = $('<span></span>').addClass("light");
    countSpan.text(" (" + (count) + " / " + data.nhits + ")");
    $("#content-title").append(countSpan);
    isContent("search");
    if (data.records.length == rows) {
      $("#content").append(loadMoreButton());
    }
  });
  addSearchHistory(q, searchType);
}
/**
 * Add a search history item to list.
 * @param {string} query The query
 * @param {string} type  The type of query (species, etc)
 * @author Amrit
 */
function addSearchHistory(query, type) {
  $("#outer-search").css('height', '100%');
  updateSearchHistoryBtn();
  updateSearchMapBtn();
  let searchItem = { q: query, searchType: type, selected: selectedTreeId };
  searchHistory.push(searchItem);
  checkSearchHistory(query, type);
  allSearchHistory.push(searchItem);
}
/**
 * Checks for duplicates in the search history and removes them.
 * @param {string} query The query to be checked.
 * @param {string} type The type to be checked.
 * @author Amrit
 */
function checkSearchHistory(query, type) {
  for (let i = allSearchHistory.length - 1; i >= 0; i--) {
    if (allSearchHistory[i].q == query && allSearchHistory[i].searchType == type) {
      allSearchHistory.splice(i, 1);
    }
  }
}
/**
 * Updates search history button on the map to enabled or disabled.
 * @author Amrit
 */
function updateSearchHistoryBtn() {
  if (searchHistory.length < 1) {
    $("#search-history-btn").css("backgroundColor", "gainsboro");
    $("#search-history-btn").html('<svg class="svg-btn width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M38 40L18 24L38 8V40Z" stroke="#111111" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 38V10" stroke="#111111" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>');
  } else {
    $("#search-history-btn").css("backgroundColor", "white");
    $("#search-history-btn").html('<svg class="svg-btn width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M38 40L18 24L38 8V40Z" stroke="#007ACC" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 38V10" stroke="#007ACC" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>');
  }
}
/**
 * Updates the search overlay toggle button on the map to enabled or disabled.
 * @author Amrit
 */
function updateSearchMapBtn() {
  if ($(".search-container").css('display') == 'none') {
    $("#search-map-btn").css("backgroundColor", "gainsboro");
    $("#search-map-btn").html('<svg class="svg-btn" width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M37 13L1 13M25.125 30.125L22.4063 27.4062M37 5V33C37 35.2091 35.2091 37 33 37H5C2.79086 37 1 35.2091 1 33L1 5C1 2.79086 2.79086 1 5 1L33 1C35.2091 1 37 2.79086 37 5ZM23.875 23.875C23.875 26.6364 21.6364 28.875 18.875 28.875C16.1136 28.875 13.875 26.6364 13.875 23.875C13.875 21.1136 16.1136 18.875 18.875 18.875C21.6364 18.875 23.875 21.1136 23.875 23.875Z" stroke="#111111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>');
  } else {
    $("#search-map-btn").css("backgroundColor", "white");
    $("#search-map-btn").html('<svg class="svg-btn" width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M37 13L1 13M25.125 30.125L22.4063 27.4062M37 5V33C37 35.2091 35.2091 37 33 37H5C2.79086 37 1 35.2091 1 33L1 5C1 2.79086 2.79086 1 5 1L33 1C35.2091 1 37 2.79086 37 5ZM23.875 23.875C23.875 26.6364 21.6364 28.875 18.875 28.875C16.1136 28.875 13.875 26.6364 13.875 23.875C13.875 21.1136 16.1136 18.875 18.875 18.875C21.6364 18.875 23.875 21.1136 23.875 23.875Z" stroke="#007ACC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>');
  }
}
/**
 * Checks if the search type is a height range and convers the q to feet.
 * @param {string} q The query. 
 * @param {string} searchType The type.
 * @returns query multipled by 10 if a height.
 * @author Amrit
 */
function heightRangeToFeet(q, searchType) {
  if (searchType == "height_range_id") {
    return (parseInt(q) * 10) + " ft";
  } else {
    return q;
  }
}
/**
 * Adds a ... to the search query result title.
 * @param {string} query Query of search.
 * @returns qString to be used in content title.
 * @author Amrit
 */
function responsiveSearchTitle(query) {
  let q = query;
  let qString = q;
  if ($(window).width() < 321 && $(window).width() < 375) {
    if (q.length > 13) {
      qString = q.slice(0, 10) + "..."
    }
  } else if ($(window).width() > 374 && $(window).width() < 600) {
    if (q.length > 18) {
      qString = q.slice(0, 15) + "..."
    }
  }
  return qString;
}
/**
 * Zooms to fit the markers bounds in map view.
 * @author https://stackoverflow.com/questions/15719951/auto-center-map-with-multiple-markers-in-google-maps-api-v3, Amrit
 */
function searchZoom() {
  if (markers.length != 0) {
    var bounds = new google.maps.LatLngBounds();
    for (let i = 0; i < markers.length; i++) {
      bounds.extend(markers[i].position);
    }
    map.fitBounds(bounds, 0);
    centerMap();
  }
}
/**
 * Creates load more button for search in content view.
 * @returns loadMoreButton
 * @author Aidan, Amrit
 */
function loadMoreButton() {
  let b = $('<button type="button" id="loadmore"><svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.75 16.25L15 22.5L21.25 16.25" stroke="#A9A9A9" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M8.75 7.5L15 13.75L21.25 7.5" stroke="#A9A9A9" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button>');
  b.click(() => {
    page += 1;
    let count = $(".post").length;
    $(".post:nth-child(-n + " + count + ")").css("background-color", "whitesmoke");
    search();
  });
  return b;
}
/**
 * Resets searchbar autofill data.
 * @author Amrit
 */
function resetSearchBarOptions() {
  $("#data").html("");
}
/**
 * Loads search bar autofill data.
 * @param {string} searchType The type of search to be done (genus, species, etc)
 * @author Aidan, Amrit
 */
function loadSearchBarOptions(searchType) {
  let query = "https://opendata.vancouver.ca/api/v2/catalog/datasets/street-trees/facets?facet=" + searchType + "&timezone=UTC"
  $.getJSON(query, (data) => {
    $.each(data.facets[0].facets, function (i, entry) {
      let optionalString = createOptionalString(entry, searchType);
      $("#data").append($("<option>" + optionalString + " </option>").val(entry.name));
    });
  })
}
/**
 * Driver for loading suggestions in to date search bar inputs.
 * @param {*} searchType 
 * @author Amrit
 */
function loadDateSearchBarOptions(searchType) {
  let queryBase = "https://opendata.vancouver.ca/api/v2/catalog/datasets/street-trees/facets?facet=date_planted";
  if (searchType == "y") {
    let query = queryBase + "&timezone=UTC"
    loadDateDataList($("#year"), query, searchType);
  } else if (searchType == "ys") {
    let y = $("#query-year").val();
    if (y.length == 4) {
      $("#month").html("");
      let query = queryBase + "&refine=date_planted%3A" + y + "&timezone=UTC"
      loadDateDataList($("#month"), query, searchType);
    } else {
      $("#month").html("");
      $("#day").html("");
    }
  } else if (searchType == "ms") {
    let y = $("#query-year").val();
    let m = $("#query-month").val();
    if (m.length > 0 && m.length <= 2 && m > 0) {
      $("#day").html("");
      m = addFirstZero(m);
      let query = queryBase + "&refine=date_planted%3A" + y + "/" + m + "&timezone=UTC"
      loadDateDataList($("#day"), query, searchType);
    } else {
      $("#day").html("");
    }
  }
}
/**
 * Pulls facets from opendatabase to load into suggestion for the date input boxes in search.
 * @param {obj} dataList DOM list object.
 * @param {string} query URL to pull data from.
 * @param {string} searchType Type of search, year, month, or day.
 * @author Amrit
 */
function loadDateDataList(dataList, query, searchType) {
  $.getJSON(query, (data) => {
    if (data) {
      if (searchType == "y") {
        $.each(data.facets[0].facets, function (i, entry) {
          let optionalString = createOptionalString(entry, searchType);
          let day = removeFirstZero(entry.name);
          dataList.append($("<option>" + optionalString + " </option>").val(day));
        });
      } else if (searchType == "ys") {
        if (data?.facets[0]?.facets[0]?.facets) {
          $("#query-month").prop('disabled', false);
          $("#query-month").focus();
          $.each(data.facets[0].facets[0].facets, function (i, entry) {
            let optionalString = createOptionalString(entry, searchType);
            let day = removeFirstZero(entry.name);
            dataList.append($("<option>" + optionalString + " </option>").val(day));
          });
        }
      } else if (searchType == "ms") {
        if (data?.facets[0]?.facets[0]?.facets[0]?.facets) {
          $("#query-day").prop('disabled', false);
          if ($("#query-month").val() > 1) {
            $("#query-day").focus();
          }
          $.each(data.facets[0].facets[0].facets[0].facets, function (i, entry) {
            let optionalString = createOptionalString(entry, searchType);
            let day = removeFirstZero(entry.name);
            dataList.append($("<option>" + optionalString + " </option>").val(day));
          });
        }
      }
    }
  })
}
/**
 * Returns a number with first zero removed.
 * @param {string} num 
 * @returns int Number with first zero removed.
 * @author Amrit
 */
function removeFirstZero(num) {
  if (parseInt(num) < 10 && num.length == 2) {
    let n = parseInt(num, 10);
    return n;
  } else {
    return num;
  }
}
/**
 * Resets the date inputs in the datesearchbar.
 * @author Amrit
 */
function resetDateSearchBar() {
  $("#query-month").val("");
  $("#query-day").val("");
  $("#query-year").val("");
  $("#year").html("");
  $("#query-month").prop('disabled', true);
  $("#query-day").prop('disabled', true);
}
/**
 * Creates optional string for search bar options.
 * @param {obj} entry Entry object from opendata.
 * @param {string} searchType The type.
 * @returns Optional string for search bar options.
 * @author Amrit
 */
function createOptionalString(entry, searchType) {
  let optionalString = "";
  if (searchType == "height_range_id") {
    optionalString = heightRangeToFeet(entry.name, searchType);
    optionalString += " - ";
  }
  optionalString += entry.count + " Trees"
  return optionalString;
}
/**
 * Highlights type search tag.
 * @param {obj} tag Tag DOM
 * @author Amrit
 */
function selectTag(tag) {
  tag.addClass("tag-selected");
}
/**
 * Resets all search tags that are highlighted.
 * @author Amrit
 */
function resetTagSelection() {
  $("#search-tags>div.tag-selected").removeClass("tag-selected");
}
/**
 * Gets entries from opendatabase API. 
 * @param {obj} _callback Function to be called back after completion (optional).
 * @see https://www.w3schools.com/jquery/ajax_getjson.asp
 * @author Amrit
 */
function getContent(_callback) {
  let url = 'https://opendata.vancouver.ca/api/records/1.0/search/?dataset=street-trees&q=&geofilter.distance=' + currentLocation.lat + '%2C' + currentLocation.lng + '%2C1000&rows=' + rows;
  $.getJSON(url, function (data) {
    $("#content").text("");
    clearMarkers();
    $.each(data.records, function (i, entry) {
      updateContent(entry, true);
    });
    searchZoom();
    if (_callback) {
      _callback();
    }
    isContent();
  });
  addSearchHistory(currentLocation, "location");
  setUrlParam("q", currentLocation.lat + " " + currentLocation.lng);
  setUrlParam("type", "location");
  removeUrlParam("favourites");
  removeUrlParam("leaderboard");
}
/**
 * Checks if content list view is empty. 
 * @author Amrit
 */
function isContent(p) {
  if ($("#content").text() == "") {
    if (p == "search") {
      showDialogue("nullSearch");
    } else {
      showDialogue("nullContent");
    }
  }
}
/**
 * Uses the content div to show a dialogue. 
 * @param {string} m Message to show.
 * @author Amrit
 */
function showDialogue(m) {
  if (m == "locationError") {
    if ($("#content").text() != "Location service errorLocation services must be enabled to see nearby trees.") {
      $("#content").text("");
      let post = $("<div></div>").addClass("post");
      post.addClass("dialogue");
      post.addClass("error");
      let title = $("<div></div>").addClass("title").text("Location service error");
      let body = $("<div></div>").addClass("body").text("Location services must be enabled to see nearby trees.");
      post.append(title, body);
      $("#content").append(post);
    }
  } else if (m == "nullContent") {
    let post = $("<div></div>").addClass("post");
    post.addClass("dialogue");
    let title = $("<div></div>").addClass("title").text("No trees near dropped marker");
    let body = $("<div></div>").addClass("body").text("There are no trees from the database in the area of dropped marker.");
    post.append(title, body);
    $("#content").append(post);
  } else if (m == "nullSearch") {
    let post = $("<div></div>").addClass("post");
    post.addClass("dialogue");
    let title = $("<div></div>").addClass("title").text("No trees found");
    let body = $("<div></div>").addClass("body").text("There are no trees from the database matching your query.");
    post.append(title, body);
    $("#content").append(post);
  } else if (m == "locationErrorNS") {
    if ($("#content").text() != "Location is not supported on this browserLocation services must be enabled to see nearby trees.") {
      $("#content").text("");
      let post = $("<div></div>").addClass("post");
      post.addClass("dialogue");
      post.addClass("error");
      let title = $("<div></div>").addClass("title").text("Location is not supported on this browser");
      let body = $("<div></div>").addClass("body").text("Location services must be enabled to see nearby trees.");
      post.append(title, body);
      $("#content").append(post);
    }
  } else if (m == "locationDisabled") {
    if ($("#content").text() != "Location is turned offTap the location icon below to start TreeHugging.") {
      $("#content").text("");
      let post = $("<div></div>").addClass("post");
      post.addClass("dialogue");
      let title = $("<div></div>").addClass("title").text("Location is turned off");
      let body = $("<div></div>").addClass("body").text("Tap the location icon below to start TreeHugging.");
      post.append(title, body);
      $("#content").append(post);
    }
  } else if (m == "noFavourites") {
    let post = $("<div></div>").addClass("post");
    post.addClass("dialogue");
    let title = $("<div></div>").addClass("title").text("No favourites");
    let body = $("<div></div>").addClass("body").text("You have no favourite trees yet; tap the heart button to add one.");
    post.append(title, body);
    $("#content").append(post);
  } else if (m == "treeNotAvailable") {
    let post = $("<div></div>").addClass("post");
    post.addClass("dialogue");
    let title = $("<div></div>").addClass("title").text("Tree not found");
    let body = $("<div></div>").addClass("body").text("A tree with this ID does not exist or is missing its location data. ");
    post.append(title, body);
    $("#content").append(post);
  }
}
/**
 * Updates and appends content with entry. 
 * @param {obj} entry
 * @author Amrit
 */
function updateContent(entry, distanceEnabled) {
  var dist = Math.round(distance(entry.fields.geom.coordinates[1], entry.fields.geom.coordinates[0], currentLocation.lat, currentLocation.lng, "M"));
  var dateString = "";
  var post = $("<div></div>").addClass("post");
  post.attr('id', entry.recordid);
  var title = $("<div></div>").addClass("title").text(entry.fields.common_name);
  var dis;
  if (distanceEnabled) {
    dis = $("<div></div>").addClass("distance").text(dist + " meters");
  } else {
    dis = $("<div></div>").addClass("distance").text(entry.fields.genus_name + " " + entry.fields.species_name);
  }
  var body = $("<div></div>").addClass("body").text(entry.fields.on_street);
  if (entry.fields.date_planted) {
    dateString = "Planted on " + entry.fields.date_planted;
  }
  if (entry.order) {
    post.css("order", entry.order);
  }
  var date = $("<div></div>").addClass("date").text(dateString);
  post.append(title, body, dis, date);
  addTreeMarker(entry.fields.geom.coordinates[0], entry.fields.geom.coordinates[1], entry);
  $("#content").append(post);
  post.on("click", (function () {
    zoom(entry);
  }));
}
/**
 * Gets the search history for search overlay.
 * @author Amrit
 */
function getSearchHistoryView() {
  $("#search-history").text("");
  for (let i = allSearchHistory.length - 1; i >= 0; i--) {
    updateSearchHistoryView(allSearchHistory[i]);
  }
  $("#search-history").scrollTop(0);
}
/**
 * Updates the search history view in the search overlay.
 * @param {obj} entry Search history object.
 * @author Amrit
 */
function updateSearchHistoryView(entry) {
  let item = $("<div></div>").addClass("search-history-item");
  let query = $("<div></div>").addClass("search-query");
  let type = $("<div></div>").addClass("search-type");
  let arrow = $("<div></div>").addClass("arrow-icon");
  arrow.html('<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 18L15 12L9 6" stroke="#D3D3D3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>');
  if (entry.searchType == "location") {
    query.text(entry.q.lat + ", " + entry.q.ln);
  } else {
    query.text(entry.q);
  }
  type.text(parseType(entry.searchType));
  item.append(query, type, arrow);
  item.on("click", function () {
    loadSearchHistoryItem(entry);
    document.activeElement.blur();
  });
  $("#search-history").append(item);
}
/**
 * Parses the search type for the search history view.
 * @param {string} type The type.
 * @returns Parsed string for search history view.
 * @author Amrit
 */
function parseType(type) {
  if (type == "common_name") {
    return "Name";
  } else if (type == "species_name") {
    return "Species";
  } else if (type == "genus_name") {
    return "Genus";
  } else if (type == "height_range_id") {
    return "Height";
  } else if (type == "location") {
    return "Location";
  } else if (type == "on_street") {
    return "Street";
  } else if (type == "date_planted") {
    return "Date";
  } else if (type == "all") {
    return "All";
  } else if (type == "tree_id") {
    return "ID";
  }
}
/**
 * Queries the selected search item from search history.
 * @param {obj} lastSearch Search history object.
 * @author Amrit
 */
function loadSearchHistoryItem(lastSearch) {
  clearMarkers();
  clearLocationMarker();
  selectedTreeId = null;
  if (lastSearch.searchType == "location") {
    currentLocation = lastSearch.q;
    let latlng = new google.maps.LatLng(lastSearch.q.lat, lastSearch.q.lng);
    addLocationMarker(latlng, "");
    getContent();
    $("#content").scrollTop(0);
  } else {
    showSearchType(lastSearch.searchType + "-tag");
    $("#query").val(lastSearch.q);
    $("#content").text("");
    search(true);
  }
}
/**
 * Zooms on entry, shows overlay and updates various variables. 
 * @param {obj} entry
 * @author Amrit
 */
function zoom(entry) {
  setUrlParam("id", entry.recordid);
  resetMarkerColor();
  $('#' + entry.recordid).css("background-color", "whitesmoke");
  let currentZoom = map.getZoom();
  zoomVal = currentZoom;
  selectedTreeId = entry.recordid;
  colorMarker(entry.recordid);
  var treeLocation = { lat: entry.fields.geom.coordinates[1], lng: entry.fields.geom.coordinates[0] }
  selectedTreeLocation = treeLocation;
  map.setCenter(
    treeLocation
  );
  if (currentZoom < 15) {
    map.setZoom(15);
  }
  centerMap();
  showTreeOverlay(entry);
  addStreetViewBtnListener(entry);
}
/**
 * Sets the position and direction of StreetView to face the treeLocation, if it is visible. 
 * @param {obj} entry
 * @author Amrit
 * @see https://stackoverflow.com/questions/32064302/google-street-view-js-calculate-heading-to-face-marker
 */
function setStreetView(entry) {
  /* Preload the StreetView unless it is not initialized */
  if (panorama.getPosition()) {
    var treeLocationLatLng = new google.maps.LatLng(entry.fields.geom.coordinates[1], entry.fields.geom.coordinates[0]);
    var treeLocation = { lat: entry.fields.geom.coordinates[1], lng: entry.fields.geom.coordinates[0] }
    panorama.setPosition(treeLocation);
    /* Setting StreetView position animates, so timeout until the animation to completes. */
    setTimeout(function () {
      var heading = 0;
      /* Supresses an error on fresh launch. */
      try {
        heading = google.maps.geometry.spherical.computeHeading(panorama.getLocation().latLng, treeLocationLatLng);
      }
      catch (err) {
      }
      panorama.setPov({
        heading: heading,
        pitch: 10,
        zoom: 0
      });
    }, 300);
  }
}
/**
 * Sets a TreeMarker color to 'selected', by id, also brings it to the front with zIndex.
 * @param {int} id Tree ID.
 * @author Amrit
 */
function colorMarker(id) {
  for (let i = 0; i < markers.length; i++) {
    if (markers[i].get('id') == id) {
      markers[i].setIcon(selectedTreeIcon);
      markerIndexCount += 1;
      markers[i].setZIndex(markerIndexCount);
    }
  }
}
/**
 * Resets all TreeMarker colors to default. 
 * @author Amrit
 */
function resetMarkerColor() {
  for (let i = 0; i < markers.length; i++) {
    markers[i].setIcon(greenTreeIcon);
  }
}
/**
 * Shows the TreeOverlay. 
 * @param {obj} entry
 * @author Amrit
 */
function showTreeOverlay(entry) {
  $(".content-container").hide();
  $(".search-container").hide();
  $(".tree-overlay-container").show();
  $("#details-arrow-container").hide();
  updateSearchMapBtn();
  updateHistory(entry);
  updateTreeOverlayContent(entry);
  updateDetails();
  $("#main").scrollTop(0);
}
/**
 * Updates the TreeOverlay view with data from entry. 
 * @param {obj} entry
 * @author Amrit
 */
function updateTreeOverlayContent(entry) {
  $("#species-name").text(entry.fields.common_name);
  $("#tree-name").text(entry.fields.genus_name + " " + entry.fields.species_name);
  if (locationMarker != null) {
    $("#distance").text(Math.round(distance(entry.fields.geom.coordinates[1], entry.fields.geom.coordinates[0], currentLocation.lat, currentLocation.lng, "M")) + " meters away from dropped marker");
  } else {
    $("#distance").text("");
  }
  $("#body").text(entry.fields.on_street);

  let dateString;
  let ageString;
  if (entry.fields.date_planted) {
    dateString = entry.fields.date_planted;
    ageString = getAgeOfTree(dateString);
  } else {
    dateString = "N/A"
    ageString = "N/A";
  }
  $("#tree-card-id").text("Tree ID: " + entry.fields.tree_id);
  $("#tree-card-id").data("id", entry.recordid);
  $("#tree-card-height").text(entry.fields.height_range_id * 10 + " ft");
  $("#tree-card-diameter").text(entry.fields.diameter + " in");
  $("#tree-card-date").text(dateString);
  $("#tree-card-age").text(ageString);
  addLikeButton($("#like-button-container"), entry.recordid, null, null);
}
/**
 * Gets age of tree.
 * @param {string} dateString 
 * @returns age of tree.
 * @author https://stackoverflow.com/questions/4060004/calculate-age-given-the-birth-date-in-the-format-yyyymmdd, Amrit
 */
function getAgeOfTree(dateString) {
  let ageDifMs = Date.now() - dateStringtoDate(dateString).getTime();
  let ageDate = new Date(ageDifMs); // miliseconds from epoch
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}
/**
 * Helper function for getAgeOfTree, converts date string to a date object.
 * @param {string} dateString 
 * @returns date object
 * @author https://stackoverflow.com/questions/10607935/convert-returned-string-yyyymmdd-to-date/10610485, Amrit
 */
function dateStringtoDate(dateString) {
  let year = dateString.substring(0, 4);
  let month = dateString.substring(5, 7);
  let day = dateString.substring(7, 9);
  let date = new Date(year, month - 1, day);
  return date;
}
/**
 * Copys share link.
 * @author Amrit
 */
 function copyShareLink() {
  let url = createShareLink($('#tree-card-id').data('id'));
  copyToClipboard(url);
}
/**
 * Opens a FB share link
 * @auther Amrit
 */
function fbShare() {
  let url = createShareLink($('#tree-card-id').data('id'));
  window.open("https://www.facebook.com/sharer/sharer.php?u=" + url + "&src=sdkpreparse");
}
/**
 * Creates share link with tree id.
 * @param id Tree id.
 * @returns newUrl URL link.
 * @author Amrit
 */
function createShareLink(id) {
  let url = window.location.href;
  let urlBase = url.substring(0, url.lastIndexOf('/') + 1);
  let newUrl = urlBase + "searchMap?id=" + id; 
  return newUrl;
}
/**
 * Copys text to clipboard.
 * TODO SHOW DIALOG!!!!!!!!!
 * @param {string} text 
 * @author Amrit
 */
function copyToClipboard(text) {
  navigator.clipboard.writeText(text);
}
/**
 * Adds a click listener to the StreeView button in TreeOverlay. 
 * @param {obj} entry
 * @author Amrit
 */
function addStreetViewBtnListener(entry) {
  $("#street-btn").off();
  $("#street-btn").on("click", (function () {
    toggleStreetView(entry);
  }));
}
/**
 * Hides the TreeOverlay and resets variables. 
 * @author Amrit
 */
function hideTreeOverlay() {
  removeUrlParam("id");
  $(".tree-overlay-container").hide();
  $(".content-container").show();
  panorama.setVisible(false);
  resetMarkerColor();
  selectedTreeLocation = null;
  selectedTreeId = null;
  let center = false;
  let currentZoom = map.getZoom();
  if (zoomVal != currentZoom) {
    center = true;
  }
  if (currentZoom > 12) {
    map.setZoom(zoomVal);
    if (center) {
      centerMap();
    }
  }
}
/** 
 * Toggles the content overlay visible or hidden
 * @author Amrit
 */
function toggleContentOverlay() {
  if ($("#outer-content").css('height') == '40px') {
    showContentOverlay();
  } else {
    hideContentOverlay();
  }
}
/** 
 * Hides the content overlay
 * @author Amrit
 */
function hideContentOverlay() {
  let height = window.innerHeight;
  $("#outer-content").css('height', '40px');
  rotateChevron($("#hide-content-btn"), -90);
  map.panBy(0, height * 0.25);
}
/**
 * Show the content overlay
 * @author Amrit
 */
function showContentOverlay() {
  let height = window.innerHeight;
  $("#outer-content").css('height', '100%');
  rotateChevron($("#hide-content-btn"), 0);
  map.panBy(0, -height * 0.25);
}
/**
 * Rotates the chevron.
 * @param {int} amount Amount of rotation.
 * @author Amrit
 */
function rotateChevron(chevron, amount) {
  chevron.css({ transition: "transform 0.3s", transform: "rotate(" + amount + "deg)" });
  setTimeout(function () { $("#hide-content-btn").css({ transition: "none" }) }, 300);
}
/** 
 * Toggles the content overlay visible or hidden
 * @author Amrit
 */
function toggleSearchOverlay() {
  if ($("#outer-search").css('height') == '40px') {
    showSearchOverlay();
  } else {
    hideSearchOverlay();
  }
}
/** 
 * Hides the content overlay
 * @author Amrit
 */
function hideSearchOverlay() {
  let height = window.innerHeight;
  $("#outer-search").css('height', '40px');
  rotateChevron($("#hide-search-btn"), -90);
  map.panBy(0, height * 0.25);
  $("#search-button-container").hide();
}
/**
 * Show the content overlay
 * @author Amrit
 */
function showSearchOverlay() {
  let height = window.innerHeight;
  $("#outer-search").css('height', '100%');
  rotateChevron($("#hide-search-btn"), 0);
  map.panBy(0, -height * 0.25);
  $("#search-button-container").show();
}
/**
 * Initializes Google Maps and sets custom Map and StreetView.
 * @see https://developers.google.com/maps/documentation/ 
 * @author Amrit
 */
function initMap() {
  const VANCOUVER_BOUNDS = {
    north: 50.229779,
    south: 48.908852,
    west: -123.667157,
    east: -122.345232,
  };
  map = new google.maps.Map(document.getElementById("map"), {
    center: currentLocation,
    zoom: 10,
    mapId: mapIdVar,
    restriction: {
      latLngBounds: VANCOUVER_BOUNDS,
      strictBounds: false,
    },
    mapTypeControl: false,
    rotateControl: false,
    disableDoubleClickZoom: true,
    mapTypeControlOptions: {
      style: google.maps.MapTypeControlStyle.DEFAULT,
      position: google.maps.ControlPosition.LEFT_BOTTOM,
    },
    clickableIcons: false,
    zoomControl: false,
    zoomControlOptions: {
      position: google.maps.ControlPosition.RIGHT_BOTTOM,
    },
    scaleControl: false,
    streetViewControl: false,
    streetViewControlOptions: {
      position: google.maps.ControlPosition.RIGHT_BOTTOM,
    },
    fullscreenControl: false,
  });
  // @see https://stackoverflow.com/questions/27713304/single-click-interfering-with-double-click-how-can-resolve-this
  map.addListener("click", () => {
    mouseClickTimer = setTimeout(function () {
      if (selectedTreeId) {
        hideTreeOverlay();
      }
    }, mouseClickDelay);
  });
  map.addListener("dblclick", (mapsMouseEvent) => {
    clearTimeout(mouseClickTimer); //prevent single-click action
    clearLocationMarker();
    updateSearchHistorySelectedId();
    currentLocation = mapsMouseEvent.latLng.toJSON();
    addLocationMarker(mapsMouseEvent.latLng, "");
    getContent();
    $("#content").scrollTop(0);
  });
  let toggleTypeBtn = createToggleTypeBtn();
  let searchHistoryBtn = createSearchHistoryBtn();
  let searchBtn = createSearchMapBtn();
  map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(toggleTypeBtn);
  map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(searchBtn);
  map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(searchHistoryBtn);
  panorama = map.getStreetView();
  panorama.setPosition(currentLocation);
  panorama.addListener("visible_changed", function () {
    if (panorama.getVisible()) {
      $("#street-btn").text("Map");
    } else {
      $("#street-btn").text("Street");
    }
  });
  let panoOptions = {
    imageDateControl: true,
    addressControlOptions: {
      position: google.maps.ControlPosition.BOTTOM_CENTER
    },
    linksControl: false,
    fullscreenControl: false,
    enableCloseButton: true,
    zoomControl: false,
    clickToGo: false
  };
  panorama.setOptions(panoOptions);
  map.setZoom(11);
  centerMap();
}
/**
 * Adds location marker to map.
 * @param {latlng} location Current location.
 * @param {string} lbl Optional label.
 * @author Amrit
 */
function addLocationMarker(location, lbl) {
  $(".search-container").hide();
  $(".tree-overlay-container").hide();
  $(".content-container").show();
  map.setCenter(location);
  map.setZoom(18);
  centerMap();
  $("#content-title").text("TREES NEAR DROPPED MARKER");
  const marker = new google.maps.Marker({
    position: location,
    map: map,
    label: lbl,
    zIndex: 1000000,
  });
  locationMarker = marker;
}
/**
 * Creates a button that toggles the type of map for map. 
 * @returns button.
 * @author Amrit
 */
function createToggleTypeBtn() {
  let toggleTypeBtn = document.createElement("button");
  toggleTypeBtn.id = 'toggle-type-btn';
  let stroke = "#000000";
  toggleTypeBtn.style.borderRadius = "4px";
  toggleTypeBtn.style.height = "50px";
  toggleTypeBtn.style.width = "50px";
  toggleTypeBtn.style.margin = "10px";
  toggleTypeBtn.style.backgroundColor = "gainsboro";
  toggleTypeBtn.innerHTML = '<svg class="svg-btn" width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 12V44L16 36L32 44L46 36V4L32 12L16 4L2 12Z" stroke="' + stroke + '" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 4V36" stroke="' + stroke + '" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M32 12V44" stroke="' + stroke + '" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  toggleTypeBtn.addEventListener("click", function () {
    let type = map.getMapTypeId();
    if (type == 'satellite') {
      map.setMapTypeId('roadmap');
      let stroke = "#000000";
      this.style.backgroundColor = "gainsboro";
      this.innerHTML = '<svg class="svg-btn" width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 12V44L16 36L32 44L46 36V4L32 12L16 4L2 12Z" stroke="' + stroke + '" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 4V36" stroke="' + stroke + '" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M32 12V44" stroke="' + stroke + '" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    } else {
      map.setMapTypeId('satellite');
      let stroke = "#007ACC";
      this.style.backgroundColor = "white";
      this.innerHTML = '<svg class="svg-btn" width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 12V44L16 36L32 44L46 36V4L32 12L16 4L2 12Z" stroke="' + stroke + '" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 4V36" stroke="' + stroke + '" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M32 12V44" stroke="' + stroke + '" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    }
  });
  return toggleTypeBtn;
}
/**
 * Creates undo button for search history for map.
 * @returns button
 * @author Amrit
 */
function createSearchHistoryBtn() {
  let toggleTypeBtn = document.createElement("button");
  toggleTypeBtn.id = 'search-history-btn';
  toggleTypeBtn.style.borderRadius = "4px";
  toggleTypeBtn.style.height = "50px";
  toggleTypeBtn.style.width = "50px";
  toggleTypeBtn.style.margin = "10px";
  toggleTypeBtn.style.backgroundColor = "gainsboro";
  toggleTypeBtn.innerHTML = '<svg class="svg-btn" width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M38 40L18 24L38 8V40Z" stroke="#111111" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 38V10" stroke="#111111" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  toggleTypeBtn.addEventListener("click", function () {
    stepBackSearchHistory();
  });
  return toggleTypeBtn;
}
/**
 * Creates search toggle button for map.
 * @returns button
 * @author Amrit
 */
function createSearchMapBtn() {
  let toggleTypeBtn = document.createElement("button");
  toggleTypeBtn.id = 'search-map-btn';
  toggleTypeBtn.style.borderRadius = "4px";
  toggleTypeBtn.style.height = "50px";
  toggleTypeBtn.style.width = "50px";
  toggleTypeBtn.style.margin = "10px";
  toggleTypeBtn.style.backgroundColor = "white";
  toggleTypeBtn.innerHTML = '<svg class="svg-btn" width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M37 13L1 13M25.125 30.125L22.4063 27.4062M37 5V33C37 35.2091 35.2091 37 33 37H5C2.79086 37 1 35.2091 1 33L1 5C1 2.79086 2.79086 1 5 1L33 1C35.2091 1 37 2.79086 37 5ZM23.875 23.875C23.875 26.6364 21.6364 28.875 18.875 28.875C16.1136 28.875 13.875 26.6364 13.875 23.875C13.875 21.1136 16.1136 18.875 18.875 18.875C21.6364 18.875 23.875 21.1136 23.875 23.875Z" stroke="#007ACC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  toggleTypeBtn.addEventListener("click", function () {
    if ($(".search-container").css('display') == 'none') {
      $(".search-container").show();
      $(".tree-overlay-container").hide();
      $(".content-container").hide();
      showSearchType($("#search-tags>div.tag-selected").attr('id'));
    } else {
      if ($("#content").text() != "") {
        $(".search-container").hide();
        $(".content-container").show();
      }
    }
    getSearchHistoryView();
    updateSearchMapBtn();
  });
  return toggleTypeBtn;
}
/**
 * Steps back in search history list and queries the search.
 * @author Amrit
 */
function stepBackSearchHistory() {
  let index = searchHistory.length - 2;
  if (index > -1) {
    let selectedTree = searchHistory[index].selected;
    let lastSearch = searchHistory[index];
    clearMarkers();
    clearLocationMarker();
    if (lastSearch.searchType == "location") {
      currentLocation = lastSearch.q;
      let latlng = new google.maps.LatLng(lastSearch.q.lat, lastSearch.q.lng);
      addLocationMarker(latlng, "");
      searchHistory.splice((index + 1), 1);
      searchHistory.splice(index, 1);
      getContent(function () {selectedTreeId = null;$("#" + selectedTree).click()});
      $("#content").scrollTop(0);
    } else {
      showSearchType(lastSearch.searchType + "-tag");
      $("#query").val(lastSearch.q);
      $("#content").text("");
      searchHistory.splice(index + 1, 1);
      searchHistory.splice(index, 1);
      search(true, function () {selectedTreeId = null;$("#" + selectedTree).click()});
    }
    
  }
}
/**
 * Toggles StreetView for a tree. 
 * @author Amrit
 */
function toggleStreetView(entry) {
  if ($("#street-btn").html() == "Map") {
    panorama.setVisible(false);
  } else {
    panorama.setVisible(true);
    setStreetView(entry);
  }
}
/**
 * Centers the map with respect to 50% div overlay.
 * @author Amrit 
 */
function centerMap() {
  let contentHidden = false;
  let treeHidden = false;
  let height = window.innerHeight;
  if ($("#outer-content").css('height') == '40px') {
    contentHidden = true;
  }
  if (!selectedTreeId) {
    treeHidden = true;
  }
  if (contentHidden && treeHidden) {
  } else {
    map.panBy(0, -height * 0.25);
  }
}
/**
 * Adds a tree marker to map given a lnglat.
 * @param {float} longitude 
 * @param {float} latitude 
 * @param {obj} entry 
 * @author Amrit
 */
function addTreeMarker(longitude, latitude, entry) {
  var ids = entry.recordid;
  var treeIcon = greenTreeIcon;
  /* Check if tree selected is being updated and set its color to selected. */
  if (selectedTreeId) {
    if (selectedTreeId == ids) {
      treeIcon = selectedTreeIcon;
    }
  }
  var treeLocation = { lat: latitude, lng: longitude }
  const marker = new google.maps.Marker({
    position: treeLocation,
    map: map,
    icon: treeIcon,
    id: ids,
    zIndex: 0,
  });
  markers.push(marker);
  marker.addListener("click", () => {
    if (ids == selectedTreeId && $(".tree-overlay-container").css('display') != 'none') {
      setStreetView(entry);
      toggleStreetView(entry);
      $(".tree-overlay-container").show();
    } else {
      marker.setIcon(selectedTreeIcon);
      marker.metadata = { id: ids };
      zoom(entry);
      setStreetView(entry);
      panorama.getPosition() // Preload again to fix first launch.
    }
  });
}
/**
 * Returns the distance given two lnglat values.
 * @author https://www.geodatasource.com/developers/javascript 
 */
function distance(lat1, lon1, lat2, lon2, unit) {
  if ((lat1 == lat2) && (lon1 == lon2)) {
    return 0;
  }
  else {
    var radlat1 = Math.PI * lat1 / 180;
    var radlat2 = Math.PI * lat2 / 180;
    var theta = lon1 - lon2;
    var radtheta = Math.PI * theta / 180;
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
      dist = 1;
    }
    dist = Math.acos(dist);
    dist = dist * 180 / Math.PI;
    dist = dist * 60 * 1.1515;
    if (unit == "M") { dist = dist * 1.61 * 1000 }
    return dist;
  }
}
/**
 * Removes all markers from the map and array.
 * @author https://developers.google.com/maps/documentation/javascript/examples/marker-remove, Amrit
 * @see https://love2dev.com/blog/javascript-remove-from-array/
 */
function clearMarkers() {
  for (let i = 0; i < markers.length; i++) {
      markers[i].setMap(null);
      markers.splice(i, 1);
      i--;
  }
}
/**
 * Clears the location marker.
 * @author Amrit
 */
function clearLocationMarker() {
  if (locationMarker != null) {
    locationMarker.setMap(null);
    locationMarker = null;
  }
}
/**
 * Updates the details division with wikipedia information when tree overlay is loaded.
 * @author Steven
 */
function updateDetails() {
  $("#details").html("");
  let textForQuery = $("#tree-name").text();
  textForQuery = (textForQuery.split(' ').slice(0, 2).join('_')).toLowerCase();
  displayWikipediaInformation($("#details"), textForQuery, $("#details-arrow-container"));
}
/**
 * Scroll listener for Wikipedia scroll; details arrow is visible with scrollTop percentage.
 * @author Amrit
 */
function addMainScrollListener() {
  $("#main").scroll(function() {
    $("#details-arrow-container").css("opacity", 100 - $("#main").scrollTop() + "%");
  });
}
/**
 * Saves history to database
 * @author Aidan
 */
 function updateHistory(entry){
  var user = firebase.auth().currentUser;
  var treeID = entry.recordid;
  // console.log(entry);
  if (user) {
      user.getIdToken(/* forceRefresh */ true).then(function(idToken) {
          $.ajax({
              url: "/ajax-add-history",
              dataType: "json",
              type: "POST",
              data: {tree: treeID, idToken: idToken},
              success: ()=>{console.log("Successfully added to history")},
              error: (jqXHR,textStatus,errorThrown )=>{
                  console.log("Error:"+textStatus);
              }
          });
      });
  }
}