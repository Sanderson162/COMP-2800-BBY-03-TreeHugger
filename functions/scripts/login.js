// Initialize the FirebaseUI Widget using Firebase.


window.addEventListener("DOMContentLoaded", () => {
    var ui = new firebaseui.auth.AuthUI(firebase.auth());
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
                        "CSRF-Token": Cookies.get("XSRF-TOKEN"),
                        },
                        body: JSON.stringify({ idToken }),
                    });
                }).then(() => {
                    firebase.auth().signOut();
                    if (authResult.additionalUserInfo.isNewUser) {
                        createNewAccount(user);
                    } else {
                        return true;
                    }
                    return false;
                    window.location.assign("profile");
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
            // Leave the lines as is for the providers you want to offer your users.
            //firebase.auth.GoogleAuthProvider.PROVIDER_ID,
            //firebase.auth.FacebookAuthProvider.PROVIDER_ID,
            //firebase.auth.TwitterAuthProvider.PROVIDER_ID,
            //firebase.auth.GithubAuthProvider.PROVIDER_ID,
            firebase.auth.EmailAuthProvider.PROVIDER_ID,
            //firebase.auth.PhoneAuthProvider.PROVIDER_ID
        ],
        // Terms of service url.
        tosUrl: '',
        // Privacy policy url.
        privacyPolicyUrl: '',
        //accountChooserEnabled: false
    };
    // The start method will wait until the DOM is loaded.
    // Inject the login interface into the HTML

    function createNewAccount(user) {
        console.log("requesting server makes database slot for user " + user.uid);
        $.ajax({
            url: "/ajax-add-user",
            dataType: "json",
            type: "POST",
            headers: {'CSRF-Token': Cookies.get("XSRF-TOKEN")},
            data: {name: user.displayName, email: user.email, uid: user.uid},
            success: ()=>{window.location.assign("timestamp");},
            error: ()=>{console.log("ERROR FAILED TO CONNECT")}
        });
    }
    ui.start('#firebaseui-auth-container', uiConfig);
});