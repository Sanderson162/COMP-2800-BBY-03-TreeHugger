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
    accountChooserEnabled: false
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

  $("#loginContainer").on('click', '#cancelLoginButton', function(){
    $("#loginContainer").css("display", "none");
  });

  $("#loginContainer").on('click', '#submitLoginButton', function(){
    firebaseLogin($("#login_email").val(), $("#login_password").val())
    $("#loginContainer").css("display", "none");
  });

  $("#loginContainer").on('click', '#submitLoginButton', function(){
    firebaseSignup($("#login_email").val(), $("#login_password").val())
    $("#loginContainer").css("display", "none");
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

function firebaseLogin(email, password){
  firebase.auth().signInWithEmailAndPassword(email, password)
  .then((userCredential) => {
    // Signed in
    var user = userCredential.user;
    // ...
  })
  .catch((error) => {
    var errorCode = error.code;
    var errorMessage = error.message;
  });
}

function firebaseSignup(email, password){
  firebase.auth().signInWithEmailAndPassword(email, password)
  .then((userCredential) => {
    // Signed in
    var user = userCredential.user;
    // ...
  })
  .catch((error) => {
    var errorCode = error.code;
    var errorMessage = error.message;
  });
}