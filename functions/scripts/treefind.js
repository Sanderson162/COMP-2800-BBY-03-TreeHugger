/**
 * TreeFind
 * Uses the opendata 'Street Trees' database and Google Maps to find trees near a users location in Vancouver.
 * @author Amrit Manhas apsm100
*/
"use strict";
let currentLocation;
let markers = [];
let locationMarker;
let map;
let panorama;
let selectedTreeLocation;
let selectedTreeId;
let lastPullLocation;
let lastCalcLocation;
let iconBase = 'https://maps.google.com/mapfiles/kml/shapes/';
let greenTreeIcon = iconBase + "parks.png";
let selectedTreeIcon = "https://i.imgur.com/GE8YWSy.png";
let locationIcon = "https://i.imgur.com/WRzZWTj.png";
let locationInterval;
/**
 * QUERY SETTINGS */
/** Number of queries returned */
let rows = 20;
/** Meters, how far the user travels before a refresh. */
let distanceRefresh = 50;
currentLocation = { lat: 49.239593, lng: -123.024645 };
/** 
 * TESTING SETTINGS */
let testing = true;
/** pace: 20 is crazy driver pace, 10 is safe driver pace, 1 is walking pace. */
let pace = 20;
let testLocationInterval;
/**
 * Moves the location point to the west for testing purposes. */
function testGPS() {
  currentLocation = { lat: 49.239593, lng: currentLocation.lng - (pace / 10000000) };
  updateLocationMarker(currentLocation);
}
/**
 * After document load, start the location intervals. */
$(document).ready(function () {
  getLocation(true);
  if (testing) {
    testLocationInterval = setInterval(testGPS, 30);
  }
  locationInterval = setInterval("getLocation(false)", 3000);
});
/**
 * @see https://developers.google.com/maps/documentation/javascript/geolocation
 * Gets location, pulls content, and shows error dialogues if any occur. */
function getLocation(center) {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        let location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        if (!testing) {
          currentLocation = location;
          updateLocationMarker(currentLocation);
        }
        contentPullLocation();
        if (center) {
          map.setCenter(currentLocation);
          centerMap();
        }
      },
      () => {
        showDialogue("locationError");
        clearLocationMarker();
      }
    );
  } else {
    showDialogue("locationErrorNS");
    clearLocationMarker();
  }
}
/**
 * Only gets new content after x (distanceRefresh) meters distance from last get. Updates distance only between gets. */
function contentPullLocation() {
  if (!lastPullLocation) {
    getContent();
    lastPullLocation = currentLocation;
  } else {
    if (lastPullLocation.lat != currentLocation.lat || lastPullLocation.lng != currentLocation.lng) {
      if (Math.round(distance(lastPullLocation.lat, lastPullLocation.lng, currentLocation.lat, currentLocation.lng, "M")) > distanceRefresh) {
        getContent();
        lastPullLocation = currentLocation;
      }
      if (!lastCalcLocation) {
        updateDistances();
        lastCalcLocation = currentLocation;
      } else {
        if (lastCalcLocation.lat != currentLocation.lat || lastCalcLocation.lng != currentLocation.lng) {
          updateDistances();
          lastCalcLocation = currentLocation;
        }
      }
    }
  }
}
/**
 * @see https://www.w3schools.com/jquery/ajax_getjson.asp
 * Gets entries from opendatabase API. */
function getContent() {
  $.getJSON('https://opendata.vancouver.ca/api/records/1.0/search/?dataset=street-trees&q=&geofilter.distance=' + currentLocation.lat + '%2C' + currentLocation.lng + '%2C1000&rows=' + rows, function (data) {
    $("#content").text("");
    clearMarkers();
    $.each(data.records, function (i, entry) {
      updateContent(entry);
    });
    isContent();
  });
}
/**
 * Checks if content is empty. */
function isContent() {
  if ($("#content").text() == "") {
    showDialogue("nullContent");
  }
}
/**
 * Uses the content div to show a dialogue. */
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
    let title = $("<div></div>").addClass("title").text("No trees near you");
    let body = $("<div></div>").addClass("body").text("There are no trees from the database in your area.");
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
 * Updates and appends content with entry. */
function updateContent(entry) {
  var dist = Math.round(distance(entry.fields.geom.coordinates[1], entry.fields.geom.coordinates[0], currentLocation.lat, currentLocation.lng, "M"));
  var dateString = "";
  var post = $("<div></div>").addClass("post");
  post.attr('id', entry.recordid);
  var title = $("<div></div>").addClass("title").text(entry.fields.common_name);
  var dis = $("<div></div>").addClass("distance").text(dist + " meters");
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
/**
 * Zooms on entry, shows overlay and updates various variables. */
function zoom(entry) {
  selectedTreeId = entry.recordid;
  colorMarker(entry.recordid);
  map.setOptions({ gestureHandling: "none" });
  var treeLocation = { lat: entry.fields.geom.coordinates[1], lng: entry.fields.geom.coordinates[0] }
  selectedTreeLocation = treeLocation;
  map.setCenter(
    treeLocation
  );
  map.setZoom(40);
  centerMap();
  showTreeOverlay(entry);
  addStreetViewBtnListener(entry);
}
/**
 * @see https://stackoverflow.com/questions/32064302/google-street-view-js-calculate-heading-to-face-marker
 * Sets the position and direction of StreetView to face the treeLocation, if it is visible. */
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
        pitch: 0,
        zoom: 0
      });
    }, 200);
  }
}
/**
 * Sets a TreeMarker color to 'selected', by id. */
function colorMarker(id) {
  for (let i = 0; i < markers.length; i++) {
    if (markers[i].get('id') == id) {
      markers[i].setIcon(selectedTreeIcon);
    }
  }
}
/**
 * Resets all TreeMarker colors to default. */
function resetMarkerColor() {
  for (let i = 0; i < markers.length; i++) {
    markers[i].setIcon(iconBase + "parks.png");
  }
}
/**
 * Shows the TreeOverlay. */
function showTreeOverlay(entry) {
  $(".content-container").fadeOut(300);
  $(".tree-overlay-container").fadeIn(500);
  updateTreeOverlayContent(entry);
  showMapButtons(false);
}
/**
 * Updates the TreeOverlay view with data from entry. */
function updateTreeOverlayContent(entry) {
  $("#tree-name").text(entry.fields.common_name);
  $("#species-name").text(entry.fields.genus_name + " " + entry.fields.species_name);
  $("#distance").text(Math.round(distance(entry.fields.geom.coordinates[1], entry.fields.geom.coordinates[0], currentLocation.lat, currentLocation.lng, "M")) + " meters away from your location.");
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
 * Adds a click listener to the StreeView button in TreeOverlay. */
function addStreetViewBtnListener(entry) {
  $("#street-btn").off();
  $("#street-btn").on("click", (function () {
    toggleStreetView(entry);
  }));
}
/**
 * Hides the TreeOverlay and resets variables. */
function hideTreeOverlay() {
  $(".tree-overlay-container").fadeOut(300);
  $(".content-container").fadeIn(500);
  map.setZoom(20);
  centerMap();
  map.setOptions({ gestureHandling: "auto" });
  panorama.setVisible(false);
  resetMarkerColor();
  selectedTreeLocation = null;
  selectedTreeId = null;
  showMapButtons(true);
}
/**
 * Shows or hides the center-locate and enable-location buttons. */
function showMapButtons(enabled) {
  if (enabled) {
    if(locationInterval == null) {
      $("#toggle-locate-btn").fadeIn(300);
      $("#toggle-type-btn").fadeIn(300);
    } else {
      $("#toggle-locate-btn").fadeIn(300);
      $("#center-locate-btn").fadeIn(300);
      $("#toggle-type-btn").fadeIn(300);
    }
  } else {
    $("#center-locate-btn").fadeOut(300);
    $("#toggle-locate-btn").fadeOut(300);
    $("#toggle-type-btn").fadeOut(300);
  }
}
/**
 * Updates the location marker, or creates it if it is null. */
function updateLocationMarker(location, lbl) {
  if (locationMarker != null) {
    locationMarker.setPosition(location);
  } else {
    const marker = new google.maps.Marker({
      position: location,
      map: map,
      label: lbl,
      icon: locationIcon,
      id: "location",
    });
    locationMarker = marker;
  }
  updateTreeOverlayDistance();
}
/**
 * Updates the treeContent view distance value, if there is a tree currently selected. */
function updateTreeOverlayDistance() {
  if (selectedTreeLocation) {
    $("#distance").text(Math.round(distance(selectedTreeLocation.lat, selectedTreeLocation.lng, currentLocation.lat, currentLocation.lng, "M")) + " meters away from your location.");
  }
}
/**
 * @see https://developers.google.com/maps/documentation/
 * Initializes Google Maps and sets custom Map and StreetView. */
function initMap() {
  const VANCOUVER_BOUNDS = {
    north: 49.317422,
    south: 49.198387,
    west: -123.224944,
    east: -122.980440,
  };
  map = new google.maps.Map(document.getElementById("map"), {
    center: currentLocation,
    zoom: 20,
    mapId: 'b3163309c37356ea',
    restriction: {
      latLngBounds: VANCOUVER_BOUNDS,
      strictBounds: false,
    },
    mapTypeControl: false,
    rotateControl:false,
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
    minZoom: 18,
  });
  let toggleLocationBtn = createToggleLocationBtn();
  let centerLocationBtn = createCenterLocationBtn();
  let toggleTypeBtn = createToggleTypeBtn();
  map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(toggleLocationBtn);
  map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(centerLocationBtn);
  map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(toggleTypeBtn);
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
}
/**
 * Creates a button that toggles the location service. */
function createToggleLocationBtn() {
  let toggleLocationBtn = document.createElement("button");
  toggleLocationBtn.id = 'toggle-locate-btn';
  let stroke = "#007ACC";
  toggleLocationBtn.style.borderRadius = "4px";
  toggleLocationBtn.style.height = "50px";
  toggleLocationBtn.style.width = "50px";
  toggleLocationBtn.style.margin= "10px";
  toggleLocationBtn.innerHTML = "<svg class='svg-btn' width='48' height='48' viewBox='0 0 48 48' fill='none' xmlns='http://www.w3.org/2000/svg'> <path d='M6 22L44 4L26 42L22 26L6 22Z' stroke='" + stroke +  "'stroke-width='4' stroke-linecap='round' stroke-linejoin='round'/> </svg>";
  toggleLocationBtn.addEventListener("click", function () {
    if(locationInterval == null) {
      toggleLocation(true);
      stroke = "#007ACC";
      this.style.backgroundColor = "white";
      $("#center-locate-btn").css("background-color", "white");
      $("#center-locate-btn").fadeIn(300);
      this.innerHTML = "<svg class='svg-btn' width='48' height='48' viewBox='0 0 48 48' fill='none' xmlns='http://www.w3.org/2000/svg'> <path d='M6 22L44 4L26 42L22 26L6 22Z' stroke='" + stroke +  "'stroke-width='4' stroke-linecap='round' stroke-linejoin='round'/> </svg>";
    } else {
      toggleLocation(false);
      stroke = "#000000";
      this.style.backgroundColor = "gainsboro";
      $("#center-locate-btn").css("background-color", "gainsboro");
      $("#center-locate-btn").fadeOut(300);
      this.innerHTML = "<svg class='svg-btn' width='48' height='48' viewBox='0 0 48 48' fill='none' xmlns='http://www.w3.org/2000/svg'> <path d='M6 22L44 4L26 42L22 26L6 22Z' stroke='" + stroke +  "'stroke-width='4' stroke-linecap='round' stroke-linejoin='round'/> </svg>";
    }
  });
  return toggleLocationBtn;
}
/**
 * Creates a button that centers the map. */
function createCenterLocationBtn() {
  let centerLocationBtn = document.createElement("button");
  centerLocationBtn.id = 'center-locate-btn';
  centerLocationBtn.style.borderRadius = "4px";
  centerLocationBtn.style.height = "50px";
  centerLocationBtn.style.width = "50px";
  centerLocationBtn.style.margin= "10px";
  centerLocationBtn.innerHTML = '<svg class="svg-btn" width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24 44C35.0457 44 44 35.0457 44 24C44 12.9543 35.0457 4 24 4C12.9543 4 4 12.9543 4 24C4 35.0457 12.9543 44 24 44Z" stroke="#111111" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M24 30C27.3137 30 30 27.3137 30 24C30 20.6863 27.3137 18 24 18C20.6863 18 18 20.6863 18 24C18 27.3137 20.6863 30 24 30Z" stroke="#007ACC" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  centerLocationBtn.addEventListener("click", function () {
    if(locationInterval == null) {
    } else {
      map.setCenter(currentLocation);
      centerMap();
    }
  });
  return centerLocationBtn;
}
/**
 * Creates a button that toggles the type of map. */
 function createToggleTypeBtn() {
  let toggleTypeBtn = document.createElement("button");
  toggleTypeBtn.id = 'toggle-type-btn';
  let stroke = "#000000";
  toggleTypeBtn.style.borderRadius = "4px";
  toggleTypeBtn.style.height = "50px";
  toggleTypeBtn.style.width = "50px";
  toggleTypeBtn.style.margin= "10px";
  toggleTypeBtn.style.backgroundColor = "gainsboro";
  toggleTypeBtn.innerHTML = '<svg class="svg-btn" width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 12V44L16 36L32 44L46 36V4L32 12L16 4L2 12Z" stroke="'+ stroke +'" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 4V36" stroke="'+ stroke +'" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M32 12V44" stroke="'+ stroke +'" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  toggleTypeBtn.addEventListener("click", function () {
    let type = map.getMapTypeId();
    if(type == 'satellite') {
      map.setMapTypeId('roadmap');
      let stroke = "#000000";
      this.style.backgroundColor = "gainsboro";
      $("#center-locate-btn").css("background-color", "white");
      $("#center-locate-btn").fadeIn(300);
      this.innerHTML = '<svg class="svg-btn" width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 12V44L16 36L32 44L46 36V4L32 12L16 4L2 12Z" stroke="'+ stroke +'" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 4V36" stroke="'+ stroke +'" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M32 12V44" stroke="'+ stroke +'" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    } else {
      map.setMapTypeId('satellite');
      let stroke = "#007ACC";
      this.style.backgroundColor = "white";
      this.innerHTML = '<svg class="svg-btn" width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 12V44L16 36L32 44L46 36V4L32 12L16 4L2 12Z" stroke="'+ stroke +'" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 4V36" stroke="'+ stroke +'" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M32 12V44" stroke="'+ stroke +'" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    }
  });
  return  toggleTypeBtn;
}
/**
 * Updates distance between GPS/database pulls. 
 * It brings back the data from the markers and puts them into the divs. */
function updateDistances() {
  var locationObject;
  var locationObjects = [];
  var dis;
  for (let i = 0; i < markers.length; i++) {
    locationObject = {
      "id": markers[i].get('id'), "lat": markers[i].getPosition().lat(), "lng": markers[i].getPosition().lng(),
    }
    locationObjects.push(locationObject);
  }
  /* Add distances to content already in list view. */
  for (let i = 0; i < locationObjects.length; i++) {
    dis = Math.round(distance(locationObjects[i].lat, locationObjects[i].lng, currentLocation.lat, currentLocation.lng, "M"));
    $("#" + locationObjects[i].id).children(".distance").text(dis + " meters");
    $("#" + locationObjects[i].id).data("dist", dis);
  }
  sortContent();
}
/**
 * @see https://stackoverflow.com/questions/13490391/jquery-sort-elements-using-data-id/13490529 
 * Helper function for updateDistances, sorts the final list after getting new distances. */
function sortContent() {
  $('#content').children(".post").sort(function (a, b) {
    var x = $(b).data('dist');
    var y = $(a).data('dist');
    if (y > x) {
      return 1;
    } else if (y < x) {
      return -1;
    } else {
      return 0;
    }
  }).appendTo('#content');
}
/**
 * Toggles StreetView for a tree. */
function toggleStreetView(entry) {
  if ($("#street-btn").html() == "Map") {
    panorama.setVisible(false);
  } else {
    panorama.setVisible(true);
    setStreetView(entry);
  }
}
/**
 * Centers the map with respect to 50% div overlay. */
function centerMap() {
  let height = window.innerHeight;
  map.panBy(0, -height * 0.25);
}
/**
 * Adds a tree marker to map given a lnglat. */
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
  });
  markers.push(marker);
  marker.addListener("click", () => {
    resetMarkerColor();
    /* $('#' + ids).get(0).scrollIntoView(); */
    marker.setIcon(selectedTreeIcon);
    marker.metadata = { id: ids };
    zoom(entry);
    /* Preload StreetView */
    setStreetView(entry);
  });
}
/**
 * @author https://www.geodatasource.com/developers/javascript 
 * Returns the distance given two lnglat values.
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
 * Toggles location service with boolean. */
function toggleLocation(enabled) {
  if (enabled) {
    locationInterval = setInterval("getLocation(false)", 3000);
    if (testing) {
      testLocationInterval = setInterval(testGPS, 30);
    }
    getLocation(true);
  } else {
    clearInterval(locationInterval);
    locationInterval = null;
    if (testing) {
      clearInterval(testLocationInterval);
      testLocationInterval = null;
    }
    clearLocationMarker();
    showDialogue("locationDisabled");
  }
}
/**
 * Clears the location marker and resets lastPull. */
function clearLocationMarker() {
  if (locationMarker != null) {
    locationMarker.setMap(null);
    locationMarker = null;
    lastPullLocation = null;
  }
}