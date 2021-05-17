window.addEventListener("DOMContentLoaded", () => {
  console.log("Script Ready!");
  /*
  <button id="addFavButton">add</button>
  <button id="removeFavButton">remove</button>
  <button id="userFavButton">get by User</button>
  <button id="treeFavButton">get by tree</button>*/

  $("#addFavButton").click(function(e) {
    let recordID = $("#inputTreeId").children().val();
    addFavToTree(recordID);
  });
  $("#removeFavButton").click(function(e) {
    let recordID = $("#inputTreeId").children().val();
    removeFavFromTree(recordID);
  });
  $("#userFavButton").click(function(e) {
    getFavByUser();
  });
  $("#treeFavButton").click(function(e) {
    let recordID = $("#inputTreeId").children().val();
    getFavByTree(recordID);
  });
  $("#getFavCountByTree").click(function(e) {
    let recordID = $("#inputTreeId").children().val();
    getFavCountByTree(recordID);
  });

  /*
  $("#getFavCountLeaderboard").click(function(e) {
    var user = firebase.auth().currentUser;
    if (user) {
      firebase.auth().currentUser.getIdToken(true).then(function(idToken) {    
        getFavCountLeaderboardSignedIn(idToken);
      });
    } else {
      getFavCountLeaderboard();
    }
    
  });
  */
  $("#getFavCountLeaderboard").click(function(e) {
      getFavCountLeaderboard();
  });

  $("#resultsContainer").on('click','.likeButton',function(){
    let heartIcon = "<i class='fas fa-heart fa-2x'></i>";
    let heartIconEmpty = "<i class='far fa-heart fa-2x'></i>";
    let recordID = $(this).parent().attr('id').split("_")[0];
    //confirm("clickedLikeButton: " + recordID);
    if ($(this).hasClass("liked")) {
      let count = parseInt($(this).attr("data-count")) - 1;
      $(this).empty();
      $(this).append(heartIconEmpty + "<span>" + count + "</span>");
      $(this).removeClass("liked");
      $(this).attr("data-count", count);
      removeFavFromTree(recordID);
    } else {
      let count = parseInt($(this).attr("data-count")) + 1;
      $(this).empty();
      $(this).append(heartIcon + "<span>" + count + "</span>");
      $(this).addClass("liked");
      $(this).attr("data-count", count);
      addFavToTree(recordID);
    }
  })
});



function addFavToTree(recordID){
  var user = firebase.auth().currentUser;
  if (user) {
    firebase.auth().currentUser.getIdToken(/* forceRefresh */ true).then(function(idToken) {
      $.ajax({
        url: "/addTreeFav",
        dataType: "json",
        type: "POST",
        data: {recordID: recordID, idToken: idToken},
        success: function(result, status, xhr){ 
            console.log("recieved: " + status);
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log("ERROR:", jqXHR, textStatus, errorThrown);
        }
      });
    });
  } else {
    console.log("Not signed in");
  }
}

function removeFavFromTree(recordID){
  var user = firebase.auth().currentUser;
  if (user) {
    firebase.auth().currentUser.getIdToken(/* forceRefresh */ true).then(function(idToken) {
      $.ajax({
        url: "/removeTreeFav",
        dataType: "json",
        type: "POST",
        data: {recordID: recordID, idToken: idToken},
        success: function(result, status, xhr){ 
            console.log("recieved: " + status);
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log("ERROR:", jqXHR, textStatus, errorThrown);
        }
      });
    });
  } else {
    console.log("Not signed in");
  }
  
}

function getFavByTree(recordID){
  $.ajax({
    url: "/getFavByTree",
    dataType: "json",
    type: "POST",
    data: {recordID: recordID},
    success: function(result, status, xhr){ 
      console.log("recieved: " + status);
      console.log(result);
      console.log(result.data);
      displayResults(result.data);
    },
    error: function(jqXHR, textStatus, errorThrown) {
        console.log("ERROR:", jqXHR, textStatus, errorThrown);
    }
  });
}

function getFavCountByTree(recordID){
  $.ajax({
    url: "/getFavCountByTree",
    dataType: "json",
    type: "POST",
    data: {recordID: recordID},
    success: function(result, status, xhr){ 
      console.log("recieved: " + status);
      console.log(result);
      console.log(result.data);
    },
    error: function(jqXHR, textStatus, errorThrown) {
        console.log("ERROR:", jqXHR, textStatus, errorThrown);
    }
  });
}

function getFavCountLeaderboard(recordID){
  $.ajax({
    url: "/getFavCountLeaderboard",
    dataType: "json",
    type: "POST",
    success: function(result, status, xhr){ 
      console.log("recieved: " + status);
      console.log(result);
      console.log(result.data);
      displayLeaderboard(result.data);
    },
    error: function(jqXHR, textStatus, errorThrown) {
        console.log("ERROR:", jqXHR, textStatus, errorThrown);
    }
  });
}

function getFavCountLeaderboardSignedIn(idToken){
  $.ajax({
    url: "/getFavCountLeaderboardSignedIn",
    dataType: "json",
    type: "POST",
    data: {idToken: idToken},
    success: function(result, status, xhr){ 
      console.log("recieved: " + status);
      console.log(result);
      console.log(result.data);
      displayLeaderboard(result.data);
    },
    error: function(jqXHR, textStatus, errorThrown) {
        console.log("ERROR:", jqXHR, textStatus, errorThrown);
    }
  });
}

function getFavByUser(){
  var user = firebase.auth().currentUser;
  if (user) {
    firebase.auth().currentUser.getIdToken(/* forceRefresh */ true).then(function(idToken) {
      $.ajax({
        url: "/getFavByUser",
        dataType: "json",
        type: "POST",
        data: {idToken: idToken},
        success: function(result, status, xhr){ 
            console.log("recieved: " + status);
            console.log(result);
            console.log(result.data);
            displayResults(result.data);
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log("ERROR:", jqXHR, textStatus, errorThrown);
        }
      });
    });
  } else {
    console.log("Not signed in");
  }
}

function getInfoOnTreeByID(recordID){
  console.log("getting tree by record id: " + recordID);
  return $.ajax({
      type: "GET",
      dataType: "json",
      url: "https://opendata.vancouver.ca/api/v2/catalog/datasets/street-trees/records/" + recordID + "?select=*&pretty=false&timezone=UTC", 
  });
}


function displayResults(data){
  let heartIcon = "<i class='fas fa-heart fa-2x'></i>";
  let resultContainer = $("#resultsContainer");
  resultContainer.empty();
  data.forEach(record => {
    console.log("RecordID: " + record.recordID);
    console.log("Timestamp: " + record.timestamp);
    
    let card = $("<div></div>").attr("id", record.recordID + "_card");
    card.append($("<div></div>").addClass("title").text("title: " + record.recordID));
    card.append($("<div></div>").addClass("time").text("time: " + record.timestamp));
    getInfoOnTreeByID(record.recordID)
    .then(function(result) {
      if (result.record.fields) {
        let openData = result.record.fields;
        card.append($("<p>Name: </p>").append($("<span></span>").html(openData.common_name)));
        card.append($("<p>Location: </p>").append($("<span></span>").html(openData.on_street_block+" "+openData.on_street+" "+openData.neighbourhood_name)));
        card.append($("<p>Genus, Species: </p>").append($("<span></span>").html(openData.genus_name+", "+openData.species_name)));
        card.append($("<p>Coords: </p>").append($("<span></span>").html(openData.geom ? openData.geom.geometry.coordinates[0] + " " + openData.geom.geometry.coordinates[1] : "N/A" )));
      }
    })
    
    let likeButton = $("<div></div>").addClass("likeButton").addClass("liked");
    likeButton.append(heartIcon);
    let link = $("<a href='/viewIndividualTree?id=" + record.recordID + "'>View Tree</a>");
    card.append(link);
    card.append(likeButton);
    resultContainer.append(card);
  });
}

function displayLeaderboard(data){
  let heartIcon = "<i class='fas fa-heart fa-2x'></i>";
  let heartIconEmpty = "<i class='far fa-heart fa-2x'></i>";
  let resultContainer = $("#resultsContainer");
  resultContainer.empty();
  data.forEach(record => {
    console.log("RecordID: " + record.recordID);
    console.log("RecordID: " + record.favCount);
    let card = $("<div></div>").attr("id", record.recordID + "_card");
    getInfoOnTreeByID(record.recordID)
    .then(function(result) {
      if (result.record.fields) {
        let openData = result.record.fields;
        card.append($("<p>Name: </p>").append($("<span></span>").html(openData.common_name)));
        card.append($("<p>Location: </p>").append($("<span></span>").html(openData.on_street_block+" "+openData.on_street+" "+openData.neighbourhood_name)));
        card.append($("<p>Genus, Species: </p>").append($("<span></span>").html(openData.genus_name+", "+openData.species_name)));
        card.append($("<p>Coords: </p>").append($("<span></span>").html(openData.geom ? openData.geom.geometry.coordinates[0] + " " + openData.geom.geometry.coordinates[1] : "N/A" )));
      }
    })

    let likeButton = $('<div></div>').addClass("likeButton").attr("data-count", record.favCount);

    if (record.liked) {
      likeButton.addClass("liked");
      likeButton.append(heartIcon);
    } else {
      likeButton.append(heartIconEmpty);
    }

    let likeCount = $("<span></span>").text(record.favCount);
    likeButton.append(likeCount);
    
    card.append(likeButton);
    resultContainer.append(card);
  });
}

