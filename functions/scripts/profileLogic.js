/**
 * Loads click events for changing username and email when page loads.
 * @author Stirling 
 * @author Aidan
 */
window.addEventListener("DOMContentLoaded", () => {
  //username change
  $("#userNameArea").on('click', 'span', function () {
    console.log("clicked on username");
    let td = $(this).parent();
    let spanText = td.children().text();
    let input = $("<input type='text' value='" + spanText + "'>");
    td.html(input);
    $(input).keyup(function (e) {
      if (e.which == 13) {
        let val = null;
        let span = null;
        let nameData = td.children().val();
        if (nameData) {
          val = $(input).val();
          span = $("<span>" + val + "</span>");
          td.html(span);
          updateUsername(nameData);
        } else {
          //confirm("Make sure all columns are filled out.");
        }
      }
    });
  });
  //email change function
  $("#emailArea").on('click', 'span', function () {
    console.log("clicked on email");
    let td = $(this).parent();
    let spanText = td.children().text();
    let input = $("<input type='text' value='" + spanText + "'>");
    td.html(input);
    $(input).keyup(function (e) {
      if (e.which == 13) {
        let val = null;
        let span = null;
        let nameData = td.children().val();
        if (nameData) {
          val = $(input).val();
          span = $("<span>" + val + "</span>");
          td.html(span);
          updateEmail(nameData);
        } else {
          //confirm("Make sure all columns are filled out.");
        }
      }
    });
  });
  
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      getUserInfo();
    } else {
      $("#userNameArea").children().text("");
      $("#emailArea").children().text("");
    }
  });
});

/**
 * Loads user info into page
 * @author Stirling
 */
function getUserInfo() {
  var user = firebase.auth().currentUser;
  if (user) {
    firebase.auth().currentUser.getIdToken(true).then(function (idToken) {
      $.ajax({
        url: "/profile",
        dataType: "json",
        type: "POST",
        data: {
          idToken: idToken
        },
        success: function (result, status, xhr) {
          if (status == 'success') {
            console.log("Profile retrieved");
            if (!result.name) {
              $("#userNameArea").children().text("Set username here");
            } else {
              $("#userNameArea").children().text(result.name);
            }

            $("#emailArea").children().text(result.email);
          } else {
            console.log("unable to retrieve");
          }
        },
        error: function (jqXHR, textStatus, errorThrown) {
          $("#emailArea").children().text(user.email);
          console.log("ERROR:", jqXHR, textStatus, errorThrown);
        }

      });
    });
  } else {
    console.log("Not signed in");
  }
}

/**
 * Helper funtion to change the username
 * @param {string} newUsername 
 * @author Stirling
 */
function updateUsername(newUsername) {
  var user = firebase.auth().currentUser;
  if (user) {
    firebase.auth().currentUser.getIdToken(true).then(function (idToken) {
      $.ajax({
        url: "/update-username",
        dataType: "json",
        type: "POST",
        data: {
          name: newUsername,
          idToken: idToken
        },
        success: function (result, status, xhr) {
          if (status == 'success') {
            console.log("Username updated");
          } else {
            console.log("Username couldnt be updated");
          }
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

/**
 * Helper funtion to change email. 
 * @param {String} newEmail 
 * @author Aidan
 */
function updateEmail(newEmail) {
  var user = firebase.auth().currentUser;
  if (user) {
    firebase.auth().currentUser.getIdToken(true).then(function (idToken) {
      $.ajax({
        url: "/update-email",
        dataType: "json",
        type: "POST",
        data: {
          email: newEmail,
          idToken: idToken
        },
        success: function (result, status, xhr) {
          firebase.auth().signOut().then(() => {
            $(".login-container").show();
            $("#login_email").val(newEmail);
          })
          if (status == 'success') {
            console.log("Email updated");
          } else {
            console.log("Email couldnt be updated");
          }
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