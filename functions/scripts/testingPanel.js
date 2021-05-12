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


function displayResults(data){
  data.forEach(element => {
    console.log("RecordID: " + element.recordID);
    console.log("Timestamp: " + element.timestamp);
  });
}