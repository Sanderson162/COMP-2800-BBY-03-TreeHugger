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
        // The widget is rendered.
        // Hide the loader.
        document.getElementById('loader').style.display = 'none';
      }
    },
    // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
    signInFlow: 'popup',
    signInSuccessUrl: '',
    signInOptions: [
      firebase.auth.EmailAuthProvider.PROVIDER_ID,
    ],
    // Terms of service url.
    tosUrl: '',
    // Privacy policy url.
    privacyPolicyUrl: '',
    //accountChooserEnabled: false
  };

  $('#loginButton').click(function(e) {
    e.preventDefault();
    var ui = firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(firebase.auth());
    ui.start('#firebaseui-auth-container', uiConfig);
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