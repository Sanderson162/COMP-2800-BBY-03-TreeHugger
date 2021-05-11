$(document).ready(() => {
    $('#loginButton').click(function(e) {
        e.preventDefault();

        var ui = firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(firebase.auth());
        var uiConfig = {
        callbacks: {
            signInSuccessWithAuthResult: function (authResult, redirectUrl) {
                // User successfully signed in.
                // Return type determines whether we continue the redirect automatically
                // or whether we leave that to developer to handle.
                //------------------------------------------------------------------------------------------
                // The code below is modified from default snippet provided by the FB documentation.
                //
                // If the user is a "brand new" user, then create a new "user" in your own database.
                // Assign this user with the name and email provided.
                // Before this works, you must enable "Firestore" from the firebase console.
                // The Firestore rules must allow the user to write.
                //------------------------------------------------------------------------------------------
                var user = authResult.user;
                user.getIdToken().then(function(idToken) {
                    return fetch("/sessionLogin", {
                        method: "POST",
                        headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ idToken }),
                    });
                }).then(() => {
                    if (authResult.additionalUserInfo.isNewUser) {
                        createNewAccount(user);
                    }                     
                }).catch(error => {
                    alert(error);
                })
                
            },
            uiShown: function () {
                // The widget is rendered.
                // Hide the loader.
                //document.getElementById('loader').style.display = 'none';
            }
        },
        // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
        signInFlow: 'popup',
        signInSuccessUrl: '/profile',
        signInOptions: [
            firebase.auth.EmailAuthProvider.PROVIDER_ID,
        ],
        // Terms of service url.
        tosUrl: '',
        // Privacy policy url.
        privacyPolicyUrl: '',
        //accountChooserEnabled: false
    };
    ui.start('#firebaseui-auth-container', uiConfig);
    });

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

    $('#logoutButton').click(function(e) {
      var user = firebase.auth().currentUser;
      if (user) {
        firebase.auth().signOut().then(() => {
          console.log("Signed out");
        }).catch((error) => {
          console.log("error signing out: " + error);
        });
      } else {
        console.log("Nobody is signed in");
      }
    });

    

    //end Document.ready
});

function createNewAccount(user) {
  console.log(JSON.stringify(user));
  console.log("requesting server makes database slot for user " + user.uid);
  confirm("Creating new user DEBUG");
  firebase.auth().currentUser.getIdToken(/* forceRefresh */ true).then(function(idToken) {
    $.ajax({
      url: "/ajax-add-user",
      dataType: "json",
      type: "POST",
      data: {name: user.displayName, email: user.email, uid: user.uid, idToken: idToken},
      success: ()=>{window.location.assign("timestamp");},
      error: ()=>{console.log("ERROR FAILED TO CONNECT")}
  });
  })
  
}

function profileOverlayOn() {
  document.getElementById("profileOverlay").style.display = "block";
}

function profileOverlayOff() {
  document.getElementById("profileOverlay").style.display = "none";
}