window.addEventListener("DOMContentLoaded", () => {
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

  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      getUserInfo();
    } else {
      $("#userNameArea").children().text("");
      $("#emailArea").text("");
    }
  });

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
              if(!result.name) {
                $("#userNameArea").children().text("Set username here");
              } else {
                $("#userNameArea").children().text(result.name);
              }
              
              $("#emailArea").text(result.email);
            } else {
              console.log("unable to retrieve");
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
});