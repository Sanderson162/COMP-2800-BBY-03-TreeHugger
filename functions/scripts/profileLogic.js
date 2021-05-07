window.addEventListener("DOMContentLoaded", () => {
    $("#userNameArea").on('click', 'span', function() {
        let td = $(this).parent();
        let spanText = td.children().text();
        let input = $("<input type='text' value='" + spanText + "'>");
        td.html(input);
        $(input).keyup(function(e) {
            if(e.which == 13) {
              let val = null;
              let span = null;
              let nameData = td.children().val();
              if (nameData) {
                val = $(input).val();
                span = $("<span>" + val + "</span>");
                td.html(span);
                
                let dataToSend = {
                    name: val
                            };
    
                updateRecord(dataToSend);
              } else {
                confirm("Make sure all columns are filled out.");
              }
            }
          });
    });

    firebase.auth().onAuthStateChanged(function (user) {
        console.log("UID test " + firebase.auth().currentUser);
        if (user){
           console.log("UID: " + user.uid);
        } else {
            console.log("No user");
        }
    })

    function updateRecord(newData) {
        $.ajax({
          url: "/update-username",
          dataType: "json",
          type: "POST",
          headers: {'CSRF-Token': Cookies.get("XSRF-TOKEN")},
          data: newData,
          success: function(data) {
            console.log("Username updated: ");
          },
          error: function(jqXHR, textStatus, errorThrown) {
            console.log("ERROR:", jqXHR, textStatus, errorThrown);
          }
    
        });
      }
});