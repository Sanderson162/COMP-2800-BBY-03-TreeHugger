"use strict";
addNavbarCommon();
/**
 * Displays the nav bar with the correct selected menu item highlighted. 
 * @see Stirling Anderson
 */
function addNavbarCommon() {
	let currentPage = window.location.pathname;
	let directory = String(currentPage.split("/").slice(-1));
	let indexLink = "home";
	let profileLink = "testingpanel";
	let searchLink = "searchMap";
	let treeFindLink = "treefind";

	if (!directory) {
		directory = 'home'
	} else if (directory == "login") {
		directory = 'profile';
	} else if (directory == "aboutUs") {
		directory = 'home';
	} else if (directory == "findtree") {
		directory = 'search';
	} else if (directory == "searchDate") {
		directory = 'search';
	} else if (directory == "testingpanel") {
		directory = 'profile';
	}
	wrapBody();
	$("body").append('    <div class="nav-bar">        <div class="mb1">            <a href="'+ indexLink +'">                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">                    <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="#111111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>                    <path d="M9 22V12H15V22" stroke="#111111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>                </svg>                                                                   </a>        </div>        <div class="mb2">            <a href="'+ treeFindLink +'">                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">                    <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="#111111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>                    <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke="#111111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>                    </svg>                                                  </a>        </div>        <div class="mb3">            <a href="'+ searchLink +'">                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">                    <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="#111111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>                    <path d="M20.9999 21L16.6499 16.65" stroke="#111111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>                    </svg>                                               </a>        </div>        <div class="mb4">            <a id="profileHamburgerMenuButton" href="'+ profileLink +'">                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">                    <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="#111111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>                    <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="#111111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>                    </svg>                                                 </a>        </div>    </div>');
	$("body").append('<div id="loginContainerPopup"> <div class="loginNavBar"> <div id="loginNavButton" class=" selectedNav">Login</div> <div id="signupNavButton" class="">Signup</div> <div id="closeNavButton" class="">Close</div> </div> <div class="loginSignupformContainer"> <div id="signupForm"> <input id="signup_email" type="email" required="required" placeholder="email" /> <input id="signup_username" type="text" required="required" placeholder="username" /> <input id="signup_password" type="password" required="required" placeholder="Password" /><br> <input type="button" value="Signup" id="signupSubmit" /> <p><span id="signupMsg"></span></p> </div> <div id="loginForm"> <input id="login_email" type="email" required="required" placeholder="email" /> <input id="login_password" type="password" required="required" placeholder="Password" /><br> <input type="button" value="Login" id="loginSubmit" /> <p><span id="loginMsg"></span></p> </div> </div></div> <div id="profileHamburgerMenu"> <div id="navbarHamProfileButton">Profile</div> <div id="loginLogoutButton">Login</div> <div id="closeHamburgerMenu" onclick="$(this).parent().hide()">Close</div> </div>');
	$('a[href="' + directory + '"').addClass("highlight")
}

$("#profileHamburgerMenuButton").on('click', (event) => {
	event.preventDefault();
	if ($("#profileHamburgerMenu").is(":hidden")) {
		$("#profileHamburgerMenu").show();
	} else {
		$("#profileHamburgerMenu").hide();
	}
});

$("#navbarHamProfileButton").on('click', (event) => {
	var user = firebase.auth().currentUser;
  if (user) {
    window.location.href = "/profile";
  } else {
    console.log("Not signed in");
  }
});

/** 
 * Wraps the body in a main-container div. 
 * @see https://stackoverflow.com/questions/1577814/wrapping-a-div-around-the-document-body-contents
 */
function wrapBody() {
	let mainContainer = document.createElement("div");
	mainContainer.className = "main-container";
	while (document.body.firstChild)
	{
		mainContainer.appendChild(document.body.firstChild);
	}
	document.body.appendChild(mainContainer);
}

//Login functionality needs to be on every page
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
      $("#navbarHamProfileButton").show();
    } else {
      $("#loginLogoutButton").html("Login/Signup");
      $("#navbarHamProfileButton").hide();
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
