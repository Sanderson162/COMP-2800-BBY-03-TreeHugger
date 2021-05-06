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
  treeLocation = { lat: entry.fields.geom.coordinates[1], lng: entry.fields.geom.coordinates[0] }
  map.setCenter(
    treeLocation
  );
  map.setZoom(40);
  centerMap();
  showTreeOverlay(entry);
}

function showTreeOverlay(entry) {
  console.log(entry);
  $(".tree-overlay-container").show();
  $("#tree-name").text(entry.fields.common_name);
  $("#species-name").text(entry.fields.genus_name + " " + entry.fields.species_name);
  $("#distance").text(Math.round(distance(entry.fields.geom.coordinates[1], entry.fields.geom.coordinates[0], currentLocation.lat, currentLocation.lng, "M")) + " meters away from your location.");
  $("#body").text(entry.fields.on_street);
  $("#date").text("Planted on " + entry.fields.date_planted + ". ~" + entry.fields.diameter + " inches in diameter. ~" + entry.fields.height_range_id * 10 + " feet in height. ");
}

function hideTreeOverlay() {
  $(".tree-overlay-container").hide();
  map.setZoom(20);
  centerMap();
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
    zoomControl: true,
    zoomControlOptions: {
      position: google.maps.ControlPosition.RIGHT_BOTTOM,
    },
    scaleControl: false,
    streetViewControl: true,
    streetViewControlOptions: {
      position: google.maps.ControlPosition.RIGHT_BOTTOM,
    },
    fullscreenControl: false,
  });
  // addLocationMarker(currentLocation, "");

  map.addListener("click", (mapsMouseEvent) => {
    clearMarkers();
    currentLocation = mapsMouseEvent.latLng.toJSON();

    addLocationMarker(mapsMouseEvent.latLng, "");

    getContent();
  });
  // centerMap();
}

function centerMap() {
  let height = window.innerHeight;
  map.panBy(0, -height * 0.25);
}

function addTreeMarker(longitude, latitude, entry) {
  treeLocation = { lat: latitude, lng: longitude }
  console.log(treeLocation);

  const marker = new google.maps.Marker({
    position: treeLocation,
    map: map,
    icon: iconBase + "parks.png",
  });
  markers.push(marker);

  var id = entry.recordid;

  console.log(id);
  marker.addListener("click", () => {
    $('#' + id).get(0).scrollIntoView();
    // $('#' + id).css("background-color", "gainsboro");
    // setTimeout(function () {
    //   $('#' + id).css("background-color", "white");
    // }, 250);
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