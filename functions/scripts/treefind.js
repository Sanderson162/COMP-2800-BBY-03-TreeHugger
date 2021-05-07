var currentLocation = { lat: 49.239593, lng: -123.024645 };
let markers = [];
const iconBase = 'https://maps.google.com/mapfiles/kml/shapes/';

$(document).ready(function () {
  getContent();
  getLocation();

});

function getLocation() {
  //https://developers.google.com/maps/documentation/javascript/geolocation
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        currentLocation = location;
        addLocationMarker(location)
        map.setCenter(location);
        centerMap();
      },
      () => {
        // handleLocationError(true, infoWindow, map.getCenter());
      }
    );
  } else {
    // Browser doesn't support Geolocation
    // handleLocationError(false, infoWindow, map.getCenter());
  }
}

function getContent() {
  $("#content").text("");
  //https://www.w3schools.com/jquery/ajax_getjson.asp
  $.getJSON('https://opendata.vancouver.ca/api/records/1.0/search/?dataset=street-trees&q=&geofilter.distance=' + currentLocation.lat + '%2C' + currentLocation.lng + '%2C1000&rows=10', function (data) {
    $.each(data.records, function (i, entry) {
      updateContent(entry);
    });
  });
}

function updateContent(entry) {
  dist = Math.round(distance(entry.fields.geom.coordinates[1], entry.fields.geom.coordinates[0], currentLocation.lat, currentLocation.lng, "M"));
  dateString = "";
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

function zoom(entry) {
  map.setOptions({ gestureHandling: "none" });
  treeLocation2 = new google.maps.LatLng(entry.fields.geom.coordinates[1], entry.fields.geom.coordinates[0]);
  treeLocation = { lat: entry.fields.geom.coordinates[1], lng: entry.fields.geom.coordinates[0] }
  map.setCenter(
    treeLocation
  );

  //if panorama is loaded
  if (panorama.getPosition()) {
    panorama.setPosition(treeLocation);
    //https://stackoverflow.com/questions/32064302/google-street-view-js-calculate-heading-to-face-marker
    //Setting panorama position animates, so wait for the animation to complete.
    setTimeout(function () {
      var heading = 0;
      //TODO Supresses an error on fresh launch.
      try {
        heading = google.maps.geometry.spherical.computeHeading(panorama.getLocation().latLng, treeLocation2);
      }
      catch(err) {
      }
      panorama.setPov({
        heading: heading,
        pitch: 20,
        zoom: 0
      });
    }, 200);
  }
  map.setZoom(40);
  centerMap();
  showTreeOverlay(entry);
  addStreeMapBtnListener(entry);
}

function showTreeOverlay(entry) {
  $(".tree-overlay-container").show();
  $("#tree-name").text(entry.fields.common_name);
  $("#species-name").text(entry.fields.genus_name + " " + entry.fields.species_name);
  $("#distance").text(Math.round(distance(entry.fields.geom.coordinates[1], entry.fields.geom.coordinates[0], currentLocation.lat, currentLocation.lng, "M")) + " meters away from your location.");
  $("#body").text(entry.fields.on_street);
  dateString;
  if (entry.fields.date_planted) {
    dateString = "Planted on " + entry.fields.date_planted;
  } else {
    dateString = "Date planted unavailable"
  }
  $("#date").text("~" + entry.fields.diameter + " inches in diameter. ~" + entry.fields.height_range_id * 10 + " feet in height. Tree ID: " + entry.fields.tree_id);
  $("#updated").text(dateString);
}

function addStreeMapBtnListener(entry) {
  $("#street-btn").off();
  $("#street-btn").on("click", (function () {
    toggleTreeView(entry);
  }));
}

function hideTreeOverlay() {
  $(".tree-overlay-container").hide();
  map.setZoom(20);
  centerMap();
  map.setOptions({ gestureHandling: "auto" });
  panorama.setVisible(false);
}

function addLocationMarker(location, lbl) {
  const marker = new google.maps.Marker({
    position: location,
    map: map,
    label: lbl,
    icon: iconBase + "cross-hairs.png",
  });
  markers.push(marker);
}

// https://developers.google.com/maps/documentation/
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
    mapTypeControl: true,
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
    minZoom: 15,
  });
  map.addListener("click", (mapsMouseEvent) => {
    clearMarkers();
    currentLocation = mapsMouseEvent.latLng.toJSON();
    addLocationMarker(mapsMouseEvent.latLng, "");
    getContent();
  });

  panorama = map.getStreetView();
  panorama.setPosition(currentLocation);
  panorama.addListener("visible_changed", function () {
    if (panorama.getVisible()) {
      $("#street-btn").text("Show Map");
    } else {
      $("#street-btn").text("Show StreetView");
    }
  });

  var panoOptions = {
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

function toggleTreeView(entry) {
  if ($("#street-btn").html() == "Show Map") {
    panorama.setVisible(false);
  } else {
    panorama.setVisible(true);
    zoom(entry);
  }
}
function centerMap() {
  let height = window.innerHeight;
  map.panBy(0, -height * 0.25);
}

function addTreeMarker(longitude, latitude, entry) {
  treeLocation = { lat: latitude, lng: longitude }
  const marker = new google.maps.Marker({
    position: treeLocation,
    map: map,
    icon: iconBase + "parks.png",
  });
  markers.push(marker);
  var id = entry.recordid;
  marker.addListener("click", () => {
    $('#' + id).get(0).scrollIntoView();
    zoom(entry);
  });
}

// author: https://www.geodatasource.com/developers/javascript
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

//https://developers.google.com/maps/documentation/javascript/examples/marker-remove
// Sets the map on all markers in the array.
function setMapOnAll(map) {
  for (let i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  }
}

//https://developers.google.com/maps/documentation/javascript/examples/marker-remove
// Removes the markers from the map, but keeps them in the array.
function clearMarkers() {
  setMapOnAll(null);
}