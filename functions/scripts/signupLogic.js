window.addEventListener("DOMContentLoaded", () => {
    console.log( "ready!" );

    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.NONE);

    document
    .getElementById("signup")
    .addEventListener("submit", (event) => {
    event.preventDefault();
    const login = event.target.login.value;
    const password = event.target.password.value;

    firebase
        .auth()
        .createUserWithEmailAndPassword(login, password)
        .then(({user}) => {
            console.log("userid: "+ user.uid);
            createNewAccount(user);
            return user.getIdToken().then((idToken) => {
                return fetch("/sessionLogin", {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    "CSRF-Token": Cookies.get("XSRF-TOKEN"),
                },
                body: JSON.stringify({ idToken }),
                });
            });
        })
        .then(() => {
          return firebase.auth().signOut();
        })
        .then(() => {
        window.location.assign("/profile");
        });
    return false;
    });

    function createNewAccount(user) {
        console.log("Ajax userid: "+ user.uid);
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

});
