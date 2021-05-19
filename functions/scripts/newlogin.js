$(() => {
  //$("#loginContainerPopup").hide();
  $("#signupForm").hide();

  $("#loginNavButton").on('click', (e) => {
    $("#signupForm").hide();
    $("#loginForm").show();
    $("#signupNavButton").removeClass("selectedNav");
    $("#loginNavButton").addClass("selectedNav");
  });

  $("#signupNavButton").on('click', (e) => {
    $("#loginForm").hide();
    $("#signupForm").show();
    $("#loginNavButton").removeClass("selectedNav");
    $("#signupNavButton").addClass("selectedNav");
  });

  $("#closeNavButton").on('click', (e) => {
    e.preventDefault();
    $("#loginContainerPopup").hide();
  });

  $('#loginLogoutButton').click(function (e) {
    var user = firebase.auth().currentUser;
    if (user) {
      firebase.auth().signOut().then(() => {
        console.log("Signed out");
      }).catch((error) => {
        console.log("error signing out: " + error);
      });
    } else {
      console.log("Nobody is signed in");
      $("#loginContainerPopup").show();
    }
  });

  

  $('#loginSubmit').on("click", function (e) {
    e.preventDefault();

    if ($("#login_email").val() && $("#login_password").val()) {
      let formData = {
        email: $("#login_email").val(),
        password: $("#login_password").val(),
      };

      $("#login_password").val("");

      login(formData);
    } else {
      $("#loginMsg").text("Please enter login info.");
    }
  });

  $('#signupSubmit').on("click", function (e) {
    e.preventDefault();

    if ($("#signup_email").val() && $("#signup_username").val() && $("#signup_password").val()) {
      let formData = {
        email: $("#signup_email").val(),
        username: $("#signup_username").val(),
        password: $("#signup_password").val(),
      };

      $("#signup_password").val("");

      signup(formData);
    } else {
      $("#signupMsg").text("Please enter signup info.");
    }
  });

  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      $("#loginLogoutButton").html("logout");
      $("#loginContainerPopup").hide();
    } else {
      $("#loginLogoutButton").html("Login/Signup");
    }
  });

});


function signup(formData) {
  firebase.auth().createUserWithEmailAndPassword(formData.email, formData.password)
    .then((userCredential) => {
      var user = userCredential.user;
      user.displayName = formData.username;
      createNewAccount(user);
      $("#signupMsg").text("Welcome " + user.displayName);
    })
    .catch((error) => {
      var errorCode = error.code;
      var errorMessage = error.message;
      console.log(errorMessage);
      $("#signupMsg").text(errorMessage);
    });
}

function login(formData) {
  firebase.auth().signInWithEmailAndPassword(formData.email, formData.password)
    .then((userCredential) => {
      var user = userCredential.user;
    })
    .catch((error) => {
      var errorCode = error.code;
      var errorMessage = error.message;
      console.log(errorMessage);
      $("#loginMsg").text(errorMessage);
    });
}

function amiloggedin() {
  $.ajax({
    url: "/amiloggedin",
    dataType: "json",
    type: "POST",
    success: function (data) {
      if (data.status == 'success') {
        userLoggedIn(data.username, data.userID);
      } else {
        userLoggedOut();
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.log("ERROR:", jqXHR, textStatus, errorThrown);
    }

  });
}

function createNewAccount(user) {
  console.log(JSON.stringify(user));
  console.log("requesting server makes database slot for user " + user.uid);
  //confirm("Creating new user DEBUG");
  firebase.auth().currentUser.getIdToken( /* forceRefresh */ true).then(function (idToken) {
    $.ajax({
      url: "/ajax-add-user",
      dataType: "json",
      type: "POST",
      data: {
        name: user.displayName,
        email: user.email,
        uid: user.uid,
        idToken: idToken
      },
      success: (status) => {
        console.log("New user created")
      },
      error: () => {
        console.log("ERROR FAILED TO CONNECT")
      }
    });
  })
}