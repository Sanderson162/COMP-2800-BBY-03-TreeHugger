/**
 * SearchMap
 * Uses the opendata 'Street Trees' database and Google Maps to find trees via various queries in Vancouver.
 * @author Amrit Manhas apsm100
 * @see Aidan
 * @see Steven
*/
"use strict";
let currentLocation;
let markers = [];
let locationMarker;
let map;
let panorama;
let selectedTreeLocation;
let selectedTreeId;
let iconBase = 'https://maps.google.com/mapfiles/kml/shapes/';
let greenTreeIcon = "https://i.imgur.com/tGML9lx.png";
let selectedTreeIcon = "https://i.imgur.com/y27h9ul.png";
let locationIcon = "https://i.imgur.com/WRzZWTj.png";
let page = 0;
let zoomVal;
let markerIndexCount = 0;
let searchHistory = [];
let allSearchHistory = [];
/**
 * QUERY SETTINGS 
 */
/* Number of queries returned */
let rows = 10;
currentLocation = { lat: 49.279430, lng: -123.117276 };
/**
 * After document load, init search.
 */
$(document).ready(function () {
  $("#content").text("");
  showSearchType('common_name-tag');
});
/**
 * Shows the correct div or loads the correct data for each search type.
 * @param {string} type Search type.
 */
function showSearchType(type) {
  let searchType = type.slice(0, -4);
  resetTagSelection();
  selectTag($("#" + type));
  $("#query").val("");
  resetSearchBarOptions()
  $("#search-bar").show();
  if ($(".search-container").css('display') != 'none') {
    loadSearchBarOptions(searchType);
    $("#search-bar>input").focus();
  }
  $("#query").attr("placeholder", $("#search-tags>div.tag-selected").text());
}
function treeNameClickSearch() {
  showSearchType('common_name-tag');
    $("#query").val($("#species-name").text());
    $("#content").text("");
    clearMarkers();
    clearLocationMarker();
    map.setZoom(12);
    centerMap();
    search();
}
function searchBtnClick() {
  if ($("#query").val() != "") {
    clearMarkers();
    clearLocationMarker();
    $("#content").text("");
    if (map.getZoom() > 11) {
      map.setZoom(11);
      centerMap();
    }
    search();
  }

}
/**
 * Search function for app.
 * @see Aidan
 */
function search() {
  let q = $("#query").val()
  let searchType = $("#search-tags>div.tag-selected").attr('id').slice(0, -4);
  let qString = responsiveSearchTitle(heightRangeToFeet(q, searchType));
  // $("#content-title").text(searchType.toUpperCase() + ": " + qString);
  $("#content-title").text(qString);
  $(".search-container").hide();
  $(".tree-overlay-container").hide();
  $(".content-container").show();
  panorama.setVisible(false);
  $("#loadmore").remove();
  let query = "https://opendata.vancouver.ca/api/records/1.0/search/?dataset=street-trees&q=&facet=genus_name&facet=species_name&facet=common_name&facet=assigned&facet=root_barrier&facet=plant_area&facet=on_street&facet=neighbourhood_name&facet=street_side_name&facet=height_range_id&facet=curb&facet=date_planted&refine." + searchType + "=" + q + "&rows=" + (rows) + "&start=" + page * rows
  $.getJSON(query, function (data) {
    $.each(data.records, function (i, entry) {
      if (entry.fields.hasOwnProperty('geom')) {
        updateContent(entry, false);
      }
    });
    let count = $(".post").length;
    $("#content-title").text($("#content-title").text() + " (" + (count) + " / " + data.nhits + ")");
    isContent("search");
    if (data.records.length == rows) {
      $("#content").append(loadMoreButton());
    }
  });
  addSearchHistory(q, searchType);
}
function addSearchHistory(query, type) {
  updateSearchHistoryBtn();
  updateSearchMapBtn()
  let searchItem = {q:query, searchType: type, zoom: map.getZoom(), pos: map.getCenter()};
  searchHistory.push(searchItem);
  checkSearchHistory(query, type);
  allSearchHistory.push(searchItem);
}
function checkSearchHistory(query, type) {
 for (let i = allSearchHistory.length - 1; i >= 0; i--) { 
    if (allSearchHistory[i].q == query && allSearchHistory[i].searchType == type) {
      allSearchHistory.splice(i, 1);
      console.log("HELLO");
    }
  }
}
function updateSearchHistoryBtn() {
  if (searchHistory.length < 1) {
    $("#search-history-btn").css("backgroundColor","gainsboro");
    $("#search-history-btn").html('<svg class="svg-btn width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M38 40L18 24L38 8V40Z" stroke="#111111" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 38V10" stroke="#111111" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>');
  } else {
    $("#search-history-btn").css("backgroundColor","white");
    $("#search-history-btn").html('<svg class="svg-btn width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M38 40L18 24L38 8V40Z" stroke="#007ACC" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 38V10" stroke="#007ACC" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>');
  }
}
function updateSearchMapBtn() {
  if ($(".search-container").css('display') == 'none') {
    $("#search-map-btn").css("backgroundColor","gainsboro");
    $("#search-map-btn").html('<svg class="svg-btn" width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M37 13L1 13M25.125 30.125L22.4063 27.4062M37 5V33C37 35.2091 35.2091 37 33 37H5C2.79086 37 1 35.2091 1 33L1 5C1 2.79086 2.79086 1 5 1L33 1C35.2091 1 37 2.79086 37 5ZM23.875 23.875C23.875 26.6364 21.6364 28.875 18.875 28.875C16.1136 28.875 13.875 26.6364 13.875 23.875C13.875 21.1136 16.1136 18.875 18.875 18.875C21.6364 18.875 23.875 21.1136 23.875 23.875Z" stroke="#111111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>');
  } else {
    $("#search-map-btn").css("backgroundColor","white");
    $("#search-map-btn").html('<svg class="svg-btn" width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M37 13L1 13M25.125 30.125L22.4063 27.4062M37 5V33C37 35.2091 35.2091 37 33 37H5C2.79086 37 1 35.2091 1 33L1 5C1 2.79086 2.79086 1 5 1L33 1C35.2091 1 37 2.79086 37 5ZM23.875 23.875C23.875 26.6364 21.6364 28.875 18.875 28.875C16.1136 28.875 13.875 26.6364 13.875 23.875C13.875 21.1136 16.1136 18.875 18.875 18.875C21.6364 18.875 23.875 21.1136 23.875 23.875Z" stroke="#007ACC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>');
  }
}
function heightRangeToFeet(q, searchType) {
  if (searchType == "height_range_id") {
    return (parseInt(q) * 10) +  "ft";
  } else {
    return q;
  }
}
/**
 * Adds a ... to the search query result title.
 * @param {string} query Query of search.
 * @returns qString to be used in content title.
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
//TODO
function searchZoom() {
  var bounds = new google.maps.LatLngBounds();
  for (let i = 0; i < markers.length; i++) {
    bounds.extend(markers[i]);
  }
  map.fitBounds(bounds, 0);
}
/**
 * Creates load more button for search in content view.
 * @returns loadMoreButton
 * @see Aidan
 */
function loadMoreButton() {
  let b = $("<button type='button' id='loadmore'>LOAD MORE</button>");
  b.click(() => {
    page += 1;
    let count = $(".post").length;
    $(".post:nth-child(-n + "+ count + ")").css("background-color", "whitesmoke");
    search();
  });
  return b;
}
/**
 * Resets searchbar autofill data.
 */
function resetSearchBarOptions() {
  $("#data").html("");
}
/**
 * Loads search bar autofill data.
 * @param {string} searchType The type of search to be done (genus, species, etc)
 * @see Aidan
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
function createOptionalString(entry, searchType){
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
 */
function selectTag(tag) {
  tag.addClass("tag-selected");
}
/**
 * Resets all search tags that are highlighted.
 */
function resetTagSelection() {
  $("#search-tags>div.tag-selected").removeClass("tag-selected");
}
/**
 * Gets entries from opendatabase API. 
 * @see https://www.w3schools.com/jquery/ajax_getjson.asp
 */
function getContent() {
  let url = 'https://opendata.vancouver.ca/api/records/1.0/search/?dataset=street-trees&q=&geofilter.distance=' + currentLocation.lat + '%2C' + currentLocation.lng + '%2C1000&rows=' + rows;
  $.getJSON(url, function (data) {
    $("#content").text("");
    clearMarkers();
    $.each(data.records, function (i, entry) {
      updateContent(entry, true);
    });
    isContent();
  });
  addSearchHistory(currentLocation, "location");
}
/**
 * Checks if content is empty. 
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
  }
}
/**
 * Updates and appends content with entry. 
 * @param {obj} entry
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
  var date = $("<div></div>").addClass("date").text(dateString);
  post.append(title, body, dis, date);
  addTreeMarker(entry.fields.geom.coordinates[0], entry.fields.geom.coordinates[1], entry);
  $("#content").append(post);
  post.on("click", (function () {
    zoom(entry);
  }));
}
function getSearchHistoryView() {
  $("#search-history").text("");
  for (let i = allSearchHistory.length - 1; i >= 0; i--) {
    updateSearchHistoryView(allSearchHistory[i]);
  }
  $("#search-history").scrollTop(0);
}
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
  item.append(query,type,arrow);
  item.on( "click", function() {
    loadSearchHistoryItem(entry);
  });
  $("#search-history").append(item);
}
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
  }
}
function loadSearchHistoryItem(lastSearch) {
  map.setZoom(lastSearch.zoom);
    map.setCenter(lastSearch.pos);
    clearMarkers();
    clearLocationMarker();
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
      search();
    }
}
/**
 * Zooms on entry, shows overlay and updates various variables. 
 * @param {obj} entry
 */
function zoom(entry) {
  zoomVal = map.getZoom();
  selectedTreeId = entry.recordid;
  colorMarker(entry.recordid);
  // map.setOptions({ gestureHandling: "none" });
  var treeLocation = { lat: entry.fields.geom.coordinates[1], lng: entry.fields.geom.coordinates[0] }
  selectedTreeLocation = treeLocation;
  map.setCenter(
    treeLocation
  );
  if (zoomVal < 13) {
    map.setZoom(13);
  }
  centerMap();
  showTreeOverlay(entry);
  addStreetViewBtnListener(entry);
}
/**
 * Sets the position and direction of StreetView to face the treeLocation, if it is visible. 
 * @param {obj} entry
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
 */
function resetMarkerColor() {
  for (let i = 0; i < markers.length; i++) {
    markers[i].setIcon(greenTreeIcon);
  }
}
/**
 * Shows the TreeOverlay. 
 * @param {obj} entry
 */
function showTreeOverlay(entry) {
  $(".content-container").hide();
  $(".search-container").hide();
  $(".tree-overlay-container").show();
  updateTreeOverlayContent(entry);
}
/**
 * Updates the TreeOverlay view with data from entry. 
 * @param {obj} entry
 */
function updateTreeOverlayContent(entry) {
  $("#species-name").text(entry.fields.common_name);
  $("#tree-name").text(entry.fields.genus_name + " " + entry.fields.species_name);
  if (locationMarker != null) {
    $("#distance").text(Math.round(distance(entry.fields.geom.coordinates[1], entry.fields.geom.coordinates[0], currentLocation.lat, currentLocation.lng, "M")) + " meters away from dropped marker");
  }
  $("#body").text(entry.fields.on_street);
  var dateString;
  if (entry.fields.date_planted) {
    dateString = "Planted on " + entry.fields.date_planted;
  } else {
    dateString = "Date planted unavailable"
  }
  $("#date").text("~" + entry.fields.diameter + " inches in diameter. ~" + entry.fields.height_range_id * 10 + " feet in height. Tree ID: " + entry.fields.tree_id);
  $("#updated").text(dateString);
}
/** 
 * Adds a click listener to the StreeView button in TreeOverlay. 
 * @param {obj} entry
 */
function addStreetViewBtnListener(entry) {
  $("#street-btn").off();
  $("#street-btn").on("click", (function () {
    toggleStreetView(entry);
  }));
}
/**
 * Hides the TreeOverlay and resets variables. 
 */
function hideTreeOverlay() {
  $(".tree-overlay-container").hide();
  $(".content-container").show();
  // map.setOptions({ gestureHandling: "auto" });
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
 */
function hideContentOverlay() {
  let height = window.innerHeight;
  $("#outer-content").css('height', '40px');
  rotateChevron($("#hide-content-btn"), -90);
  map.panBy(0, height * 0.25);
}
/**
 * Show the content overlay
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
 */
function rotateChevron(chevron, amount) {
  chevron.css({ transition: "transform 0.3s", transform: "rotate(" + amount + "deg)" });
  setTimeout(function () { $("#hide-content-btn").css({ transition: "none" }) }, 300);
}
/** 
 * Toggles the content overlay visible or hidden
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
    mapId: 'c79c5bedf4efc001',
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
  map.addListener("dblclick", (mapsMouseEvent) => {
    clearLocationMarker();
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
      $("#street-btn").text("StreetView");
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
 * Creates a button that toggles the type of map. 
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
function stepBackSearchHistory() {
  let index = searchHistory.length - 2;
  if (index  > -1) {
    let lastSearch = searchHistory[index];
    map.setZoom(lastSearch.zoom);
    map.setCenter(lastSearch.pos);
    clearMarkers();
    clearLocationMarker();
    if (lastSearch.searchType == "location") {
      currentLocation = lastSearch.q;
      let latlng = new google.maps.LatLng(lastSearch.q.lat, lastSearch.q.lng);
      addLocationMarker(latlng, "");
      searchHistory.splice((index + 1), 1);
      searchHistory.splice(index, 1);
      getContent();
      $("#content").scrollTop(0);
    } else {
      showSearchType(lastSearch.searchType + "-tag");
      $("#query").val(lastSearch.q);
      $("#content").text("");
      searchHistory.splice(index + 1, 1);
      searchHistory.splice(index, 1);
      search();
    }
  }
}
/**
 * Toggles StreetView for a tree. 
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
    resetMarkerColor();
    // $('#' + ids).get(0).scrollIntoView();
    marker.setIcon(selectedTreeIcon);
    marker.metadata = { id: ids };
    zoom(entry);
    /* Preload StreetView */
    setStreetView(entry);
    panorama.getPosition() // Preload again to fix first launch.
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
 * @see https://developers.google.com/maps/documentation/javascript/examples/marker-remove
 * @see https://love2dev.com/blog/javascript-remove-from-array/
 * Removes the markers from the map, but keeps them in the array. */
function clearMarkers() {
  for (let i = 0; i < markers.length; i++) {
    if (markers[i].get('id') != selectedTreeId) {
      markers[i].setMap(null);
      markers.splice(i, 1);
      i--;
    }
  }
}
/**
 * Clears the location marker. 
 */
function clearLocationMarker() {
  if (locationMarker != null) {
    locationMarker.setMap(null);
    locationMarker = null;
  }
}