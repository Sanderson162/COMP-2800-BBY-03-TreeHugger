window.addEventListener("DOMContentLoaded", () => {
  $("#userNameArea").on('click', 'span', function () {
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