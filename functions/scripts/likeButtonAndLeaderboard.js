/**
 * Listens if the user login/logout to gray out or fill in the button
 * @author Stirling
 */
$(() => {
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      refreshLikeButtons();
    } else {
      refreshLikeButtons();
    }
  });
});

/**
 * appends a like button to an element, if either count or liked are null, function will lookup
 * @param {string} parentElement element for heart to be appended to
 * @param {string} recordID  recordID of the tree
 * @param {boolean} liked  Whether the user liked the tree
 * @param {number} count  The type of query (species, etc)
 * @author Stirling
 */
async function addLikeButton(parentElement, recordID, liked, count) {
  let heartIcon = "<i class='fas fa-heart fa-lg' style='color: red;'></i>";
  let heartIconEmpty = "<i class='far fa-heart fa-lg' style='color: red;'></i>";
  let heartIconGray = "<i class='far fa-heart fa-lg' style='color: gray;'></i>";
  let loadingIcon = "<i class='fas fa-spinner fa-sm fa-pulse'></i>";

  let likeButton = $("<button></button>").addClass("likeButton");
  let likeCount = $("<span class='likeCount' style='margin-left: 10px;'></span>");
  let likeButtonID = recordID + "_likeButton";
  likeButton.attr("id", likeButtonID);

  likeButton.css({"display": "flex", "flex-direction": "row", "justify-content": "center", "align-items": "center"});
  parentElement.html("<button style='display: flex; flex-direction: row; justify-content: center; align-items: center'>" + heartIconGray + "<span class='likeCount' style='margin-left: 10px;'>" + loadingIcon + "</span></button>");

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

  parentElement.empty();
  parentElement.append(likeButton);

  likeButton.on('click', function () {
    let recordID = $(this).attr('id').split("_")[0];
    var user = firebase.auth().currentUser;
    if (user) {
      if ($(this).hasClass("liked")) {
        let count = parseInt($(this).attr("data-count")) - 1;
        $(this).empty();
        $(this).append(heartIconEmpty + "<span class='likeCount' style='margin-left: 10px;'>" + count + "</span>");
        $(this).removeClass("liked");
        $(this).attr("data-count", count);
        removeFavFromTree(recordID);
      } else {
        let count = parseInt($(this).attr("data-count")) + 1;
        $(this).empty();
        $(this).append(heartIcon + "<span class='likeCount' style='margin-left: 10px;'>" + count + "</span>");
        $(this).addClass("liked");
        $(this).attr("data-count", count);
        addFavToTree(recordID);
      }
    } else {
    }
  });
}

/**
 * Refreshing the like button by removing it and adding it again.
 * @author Stirling
 */
function refreshLikeButtons(){
  $('.likeButton').each(function(index, element) {
    let recordID = $(this).attr('id').split("_")[0];
    addLikeButton($(this).parent(), recordID, null, null);
  });
}

/**
 * Gets if a logged in user liked a tree.
 * @param {string} recordID  recordID of the tree
 * @author Amrit
 */
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

/**
 * add a tree to the users favourites.
 * @param {string} recordID  recordID of the tree
 * @author Stirling
 */
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
        },
        error: function (jqXHR, textStatus, errorThrown) {
          console.log("ERROR:", jqXHR, textStatus, errorThrown);
        }
      });
    });
  } else {
  }
}

/**
 * remove a tree to the users favourites.
 * @param {string} recordID  recordID of the tree
 * @author Stirling
 */
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
        },
        error: function (jqXHR, textStatus, errorThrown) {
          console.log("ERROR:", jqXHR, textStatus, errorThrown);
        }
      });
    });
  } else {
  }

}

/**
 * get fav count by recordID.
 * @param {string} recordID  recordID of the tree
 * @author Stirling
 */
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
        resolve(result.count);
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.log("ERROR:", jqXHR, textStatus, errorThrown);
        resolve(0);
      }
    });
  });
}

/**
 * get list of records user liked.
 * @author Stirling
 */
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
      resolve(null);
    }
  });
}

/**
 * get leaderboard of liked records.
 * @author Stirling
 */
function getFavCountLeaderboard() {
  return new Promise((resolve) => {
    $.ajax({
      url: "/getFavCountLeaderboard",
      dataType: "json",
      type: "POST",
      success: function (result, status, xhr) {
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