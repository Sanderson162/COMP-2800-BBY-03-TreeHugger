$(document).ready(() => {
  const uiConfig = {
    callbacks: {
      signInSuccessWithAuthResult: function(authResult, redirectUrl) {
        var user = authResult.user;
        if (authResult.additionalUserInfo.isNewUser) {
          createNewAccount(user);
        }
      },
      uiShown: function() {
        $(".firebaseui-form-actions").append("<button class='firebaseui-id-secondary-link firebaseui-button mdl-button mdl-js-button mdl-button--primary' data-upgraded=',MaterialButton'>Cancel</button>")
      }
    },
    // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
    signInFlow: 'popup',
    signInOptions: [{
      provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
      //requireDisplayName: true
    }],
    // Terms of service url.
    //tosUrl: '',
    // Privacy policy url.
    //privacyPolicyUrl: '',
    credentialHelper: 'none',
  };

  
  $('#loginLogoutButton').click(function(e) {
    var user = firebase.auth().currentUser;
    if (user) {
      firebase.auth().signOut().then(() => {
        console.log("Signed out");
      }).catch((error) => {
        console.log("error signing out: " + error);
      });
    } else {
      console.log("Nobody is signed in");
      $("#firebaseui-auth-container").css("display", "block");
      var ui = firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(firebase.auth());
      ui.start('#firebaseui-auth-container', uiConfig);
    }
  });

  firebase.auth().onAuthStateChanged(function (user) {
     if (user) {
      $("#loginLogoutButton").html("logout");
     } else {
      $("#loginLogoutButton").html("Login/Signup");
     }
  });


  //end Document.ready
});

function createNewAccount(user) {
  console.log(JSON.stringify(user));
  console.log("requesting server makes database slot for user " + user.uid);
  //confirm("Creating new user DEBUG");
  firebase.auth().currentUser.getIdToken(/* forceRefresh */ true).then(function(idToken) {
    $.ajax({
      url: "/ajax-add-user",
      dataType: "json",
      type: "POST",
      data: {name: user.displayName, email: user.email, uid: user.uid, idToken: idToken},
      success: ()=>{
        //window.location.assign("timestamp");
      },
      error: ()=>{console.log("ERROR FAILED TO CONNECT")}
    });
  })
}


