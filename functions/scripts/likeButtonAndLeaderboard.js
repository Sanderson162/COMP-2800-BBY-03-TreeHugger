async function addLikeButton(parentElement, recordID, liked, count) {
  let heartIcon = "<i class='fas fa-heart fa-2x' style='color: red;'></i>";
  let heartIconEmpty = "<i class='far fa-heart fa-2x' style='color: red;'></i>";
  let heartIconGray = "<i class='far fa-heart fa-2x' style='color: gray;'></i>";

  let likeButton = $("<button></button>").addClass("likeButton");
  let likeCount = $("<span class='likeCount'></span>");
  let likeButtonID = recordID + "_likeButton";
  likeButton.attr("id", likeButtonID);

  parentElement.empty();


  if (count == null) {
    count = await getFavCountByTree(recordID);
  }
  likeCount.text(count);

  if (liked == null) {
    liked = await getIfUserLiked(recordID);
  }

  if (liked == "N/A") {
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

  likeButton.on('click', function () {
    let heartIcon = "<i class='fas fa-heart fa-2x' style='color: red;'></i>";
    let heartIconEmpty = "<i class='far fa-heart fa-2x' style='color: red;'></i>";
    let recordID = $(this).attr('id').split("_")[0];
    var user = firebase.auth().currentUser;
    if (user) {
      if ($(this).hasClass("liked")) {
        let count = parseInt($(this).attr("data-count")) - 1;
        $(this).empty();
        $(this).append(heartIconEmpty + "<span class='likeCount'>" + count + "</span>");
        $(this).removeClass("liked");
        $(this).attr("data-count", count);
        removeFavFromTree(recordID);
      } else {
        let count = parseInt($(this).attr("data-count")) + 1;
        $(this).empty();
        $(this).append(heartIcon + "<span class='likeCount'>" + count + "</span>");
        $(this).addClass("liked");
        $(this).attr("data-count", count);
        addFavToTree(recordID);
      }
    } else {
      console.log("cant like if youre not signed in");
    }
  });
}

$(() => {
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      refreshLikeButtons();
    } else {
      refreshLikeButtons();
    }
  });
});


function refreshLikeButtons(){
  $('.likeButton').each(function(index, element) {
    let recordID = $(this).attr('id').split("_")[0];
    addLikeButton($(this).parent(), recordID, null, null);
  });
}

function getIfUserLiked(recordID) {
  return new Promise((resolve) => {
    var user = firebase.auth().currentUser;
    if (user) {
      firebase.auth().currentUser.getIdToken( /* forceRefresh */ true).then(function (idToken) {
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
    firebase.auth().currentUser.getIdToken( /* forceRefresh */ true).then(function (idToken) {
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
    firebase.auth().currentUser.getIdToken( /* forceRefresh */ true).then(function (idToken) {
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

function getFavByUser() {
  return new Promise((resolve) => {
    var user = firebase.auth().currentUser;
    if (user) {
      firebase.auth().currentUser.getIdToken( /* forceRefresh */ true).then(function (idToken) {
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
            if (status == 'success') {
              resolve(result.data);
            } else {
              resolve(null);
            }
          },
          error: function (jqXHR, textStatus, errorThrown) {
            console.log("ERROR:", jqXHR, textStatus, errorThrown);
            resolve(null);
          }
        });
      });
    } else {
      console.log("Not signed in");
      resolve(null);
    }
  });
}

function getFavCountLeaderboard() {
  return new Promise((resolve) => {
    $.ajax({
      url: "/getFavCountLeaderboard",
      dataType: "json",
      type: "POST",
      success: function (result, status, xhr) {
        console.log("recieved: " + status);
        console.log(result);
        console.log(result.data);
        if (status == 'success') {
          resolve(result.data);
        } else {
          resolve(null);
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.log("ERROR:", jqXHR, textStatus, errorThrown);
        resolve(null);
      }
    });
  });
}