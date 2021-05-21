window.addEventListener("DOMContentLoaded", () => {
  console.log("Script Ready!");

  $("#addFavButton").click(function (e) {
    let recordID = $("#inputTreeId").children().val();
    addFavToTree(recordID);
  });
  $("#removeFavButton").click(function (e) {
    let recordID = $("#inputTreeId").children().val();
    removeFavFromTree(recordID);
  });
  $("#userFavButton").click(async function (e) {
    let userFavs = await getFavByUser();
    displayUserFavs(userFavs);
  });
  $("#treeFavButton").click(function (e) {
    let recordID = $("#inputTreeId").children().val();
    getFavByTree(recordID);
  });
  $("#getFavCountByTree").click(function (e) {
    let recordID = $("#inputTreeId").children().val();
    getFavCountByTree(recordID);
  });

  $("#getFavCountLeaderboard").click(async function (e) {
    let leaderboard = await getFavCountLeaderboard();
    displayLeaderboard(leaderboard);
  });


});

/*
async function addLikeButton(parentElement, recordID, liked, count) {
  let heartIcon = "<i class='fas fa-heart fa-2x'></i>";
  let heartIconEmpty = "<i class='far fa-heart fa-2x'></i>";
  let heartIconGray = "<i class='far fa-heart fa-2x' style='color: gray;'></i>";

  let likeButton = $("<span></span>").addClass("likeButton");
  let likeCount = $("<span></span>");
  let likeButtonID = recordID + "_likeButton";
  likeButton.attr("id", likeButtonID);
  

  if (count == null) {
    count = await getFavCountByTree(recordID);
  }
  likeCount.text(count);

  if (liked == null) {
    liked = await getIfUserLiked(recordID);
  }

  if(liked == "N/A") {
    likeButton.prepend(heartIconGray);
  } else if (liked) {
    likeButton.prepend(heartIcon);
    likeButton.addClass('liked');
  } else {
    likeButton.prepend(heartIconEmpty);
  }

  likeButton.append(likeCount);
  likeButton.attr("data-count", count);
  parentElement.append(likeButton);

  likeButton.on('click', '', function () {
    let heartIcon = "<i class='fas fa-heart fa-2x'></i>";
    let heartIconEmpty = "<i class='far fa-heart fa-2x'></i>";
    //let recordID = $(this).parent().attr('id').split("_")[0];
    let recordID = $(this).attr('id').split("_")[0];
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
}

function getIfUserLiked(recordID) {
  return new Promise((resolve) => {
    var user = firebase.auth().currentUser;
    if (user) {
      firebase.auth().currentUser.getIdToken(true).then(function (idToken) {
        $.ajax({
          url: "/getIfUserLiked",
          dataType: "json",
          type: "POST",
          data: {
            recordID: recordID,
            idToken: idToken
          },
          success: function (result, status, xhr) {
            if (status == 'success') {
              resolve(result.liked);
            } else {
              resolve("N/A");
            }
          },
          error: function (jqXHR, textStatus, errorThrown) {
            console.log("ERROR:", jqXHR, textStatus, errorThrown);
            resolve("N/A");
          }
        });
      });
    } else {
      resolve("N/A")
    }
  });
}


function addFavToTree(recordID) {
  var user = firebase.auth().currentUser;
  if (user) {
    firebase.auth().currentUser.getIdToken(true).then(function (idToken) {
      $.ajax({
        url: "/addTreeFav",
        dataType: "json",
        type: "POST",
        data: {
          recordID: recordID,
          idToken: idToken
        },
        success: function (result, status, xhr) {
          console.log("recieved: " + status);
        },
        error: function (jqXHR, textStatus, errorThrown) {
          console.log("ERROR:", jqXHR, textStatus, errorThrown);
        }
      });
    });
  } else {
    console.log("Not signed in");
  }
}

function removeFavFromTree(recordID) {
  var user = firebase.auth().currentUser;
  if (user) {
    firebase.auth().currentUser.getIdToken(true).then(function (idToken) {
      $.ajax({
        url: "/removeTreeFav",
        dataType: "json",
        type: "POST",
        data: {
          recordID: recordID,
          idToken: idToken
        },
        success: function (result, status, xhr) {
          console.log("recieved: " + status);
        },
        error: function (jqXHR, textStatus, errorThrown) {
          console.log("ERROR:", jqXHR, textStatus, errorThrown);
        }
      });
    });
  } else {
    console.log("Not signed in");
  }

}

function getFavByTree(recordID) {
  $.ajax({
    url: "/getFavByTree",
    dataType: "json",
    type: "POST",
    data: {
      recordID: recordID
    },
    success: function (result, status, xhr) {
      console.log("recieved: " + status);
      console.log(result);
      console.log(result.data);
      displayResults(result.data);
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.log("ERROR:", jqXHR, textStatus, errorThrown);
    }
  });
}

function getFavCountByTree(recordID) {
  return new Promise((resolve) => {
    $.ajax({
      url: "/getFavCountByTree",
      dataType: "json",
      type: "POST",
      data: {
        recordID: recordID
      },
      success: function (result, status, xhr) {
        console.log("recieved: " + status);
        console.log(result);
        resolve(result.count);
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.log("ERROR:", jqXHR, textStatus, errorThrown);
        resolve(0);
      }
    });
  });
}

function getFavCountLeaderboard(recordID) {
  $.ajax({
    url: "/getFavCountLeaderboard",
    dataType: "json",
    type: "POST",
    success: function (result, status, xhr) {
      console.log("recieved: " + status);
      console.log(result);
      console.log(result.data);
      displayLeaderboard(result.data);
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.log("ERROR:", jqXHR, textStatus, errorThrown);
    }
  });
}

function getFavCountLeaderboardSignedIn(idToken) {
  $.ajax({
    url: "/getFavCountLeaderboardSignedIn",
    dataType: "json",
    type: "POST",
    data: {
      idToken: idToken
    },
    success: function (result, status, xhr) {
      console.log("recieved: " + status);
      console.log(result);
      console.log(result.data);
      displayLeaderboard(result.data);
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.log("ERROR:", jqXHR, textStatus, errorThrown);
    }
  });
}

function getFavByUser() {
  var user = firebase.auth().currentUser;
  if (user) {
    firebase.auth().currentUser.getIdToken(true).then(function (idToken) {
      $.ajax({
        url: "/getFavByUser",
        dataType: "json",
        type: "POST",
        data: {
          idToken: idToken
        },
        success: function (result, status, xhr) {
          console.log("recieved: " + status);
          console.log(result);
          console.log(result.data);
          displayResults(result.data);
        },
        error: function (jqXHR, textStatus, errorThrown) {
          console.log("ERROR:", jqXHR, textStatus, errorThrown);
        }
      });
    });
  } else {
    console.log("Not signed in");
  }
}
*/

function getInfoOnTreeByID(recordID) {
  console.log("getting tree by record id: " + recordID);
  return $.ajax({
    type: "GET",
    dataType: "json",
    url: "https://opendata.vancouver.ca/api/v2/catalog/datasets/street-trees/records/" + recordID + "?select=*&pretty=false&timezone=UTC",
  });
}


function displayUserFavs(data) {
  let resultContainer = $("#resultsContainer");
  resultContainer.empty();
  data.forEach(record => {
    console.log("RecordID: " + record.recordID);
    console.log("Timestamp: " + record.timestamp);

    let card = $("<div></div>").attr("id", record.recordID + "_card");
    card.append($("<div></div>").addClass("title").text("title: " + record.recordID));
    card.append($("<div></div>").addClass("time").text("time: " + record.timestamp));
    getInfoOnTreeByID(record.recordID)
      .then(function (result) {
        if (result.record.fields) {
          let openData = result.record.fields;
          card.append($("<p>Name: </p>").append($("<span></span>").html(openData.common_name)));
          card.append($("<p>Location: </p>").append($("<span></span>").html(openData.on_street_block + " " + openData.on_street + " " + openData.neighbourhood_name)));
          card.append($("<p>Genus, Species: </p>").append($("<span></span>").html(openData.genus_name + ", " + openData.species_name)));
          card.append($("<p>Coords: </p>").append($("<span></span>").html(openData.geom ? openData.geom.geometry.coordinates[0] + " " + openData.geom.geometry.coordinates[1] : "N/A")));
        }
      })

    addLikeButton(card, record.recordID, true, null);
    resultContainer.append(card);
  });
}

function displayLeaderboard(data) {
  let resultContainer = $("#resultsContainer");
  resultContainer.empty();
  data.forEach(record => {
    console.log("RecordID: " + record.recordID);
    console.log("RecordID: " + record.favCount);
    let card = $("<div></div>").attr("id", record.recordID + "_card");
    getInfoOnTreeByID(record.recordID)
      .then(function (result) {
        if (result.record.fields) {
          let openData = result.record.fields;
          card.append($("<p>Name: </p>").append($("<span></span>").html(openData.common_name)));
          card.append($("<p>Location: </p>").append($("<span></span>").html(openData.on_street_block + " " + openData.on_street + " " + openData.neighbourhood_name)));
          card.append($("<p>Genus, Species: </p>").append($("<span></span>").html(openData.genus_name + ", " + openData.species_name)));
          card.append($("<p>Coords: </p>").append($("<span></span>").html(openData.geom ? openData.geom.geometry.coordinates[0] + " " + openData.geom.geometry.coordinates[1] : "N/A")));
        }
      })

    addLikeButton(card, record.recordID, null, record.favCount);
    resultContainer.append(card);
  });
}