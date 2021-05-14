$(document).ready(() => {
    
    $('#whoami').click(function(e) {
      var user = firebase.auth().currentUser;
      if (user) {
        user.getIdToken(/* forceRefresh */ true).then(function(idToken) {
          confirm(idToken);
        }).catch(function(error) {
          confirm(error);
        });
      } else {
        console.log("not signed in");
      }
    });

    $('#profileButton').click(function(e) {
      var user = firebase.auth().currentUser;
      if (user) {
        user.getIdToken(/* forceRefresh */ true).then(function(idToken) {
          console.log("id token " + idToken);
          $.ajax({
            url: "/profile",
            dataType: "json",
            type: "POST",
            data: {idToken: idToken},
            success: (data)=>{
              console.log("profile page");
              $("#uidPlaceholder").html(data.uid);
              $("#namePlaceholder").html(data.name);
              profileOverlayOn();
            },
            error: ()=>{console.log("ERROR FAILED TO CONNECT")}
          });
        }).catch(function(error) {
          confirm(error);
        });
      } else {
        console.log("not signed in");
      }
    });
  

    //end Document.ready
});

function profileOverlayOn() {
  document.getElementById("profileOverlay").style.display = "block";
}

function profileOverlayOff() {
  document.getElementById("profileOverlay").style.display = "none";
}