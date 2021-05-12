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

  $("#resultsContainer").on('click','.likeButton',function(){
    let heartIcon = "<i class='fas fa-heart fa-2x'></i>";
    let heartIconEmpty = "<i class='far fa-heart fa-2x'></i>";
    let recordID = $(this).parent().attr('id').split("_")[0];
    //confirm("clickedLikeButton: " + recordID);
    if ($(this).hasClass("liked")) {
      $(this).empty();
      $(this).append(heartIconEmpty);
      $(this).removeClass("liked");
      removeFavFromTree(recordID);
    } else {
      $(this).empty();
      $(this).append(heartIcon);
      $(this).addClass("liked");
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

async function getInfoOnTreeByID(recordID){
  console.log("getting tree by record id: " + recordID);
  $.ajax({
      type: "GET",
      dataType: "json",
      url: "https://opendata.vancouver.ca/api/v2/catalog/datasets/street-trees/records/" + recordID + "?select=*&pretty=false&timezone=UTC", 
      success: function(result, status, xhr){ 
        return result;
      },
      error: function(jqXHR, textStatus, errorThrown) {
          console.log("ERROR:", jqXHR, textStatus, errorThrown);
      }
  });
}


function displayResults(data){
  let heartIcon = "<i class='fas fa-heart fa-2x'></i>";
  let resultContainer = $("#resultsContainer");
  resultContainer.empty();
  data.forEach(element => {
    console.log("RecordID: " + element.recordID);
    console.log("Timestamp: " + element.timestamp);
    let card = $("<div></div>").attr("id", element.recordID + "_card");
    let recordID = $("<div></div>").addClass("title").text("title: " + element.recordID);
    let timestamp = $("<div></div>").addClass("time").text("time: " + element.timestamp);
    let likeButton = $("<div></div>").addClass("likeButton").addClass("liked");
    likeButton.append(heartIcon);
    card.append(recordID, timestamp, likeButton);
    resultContainer.append(card);
  });
}