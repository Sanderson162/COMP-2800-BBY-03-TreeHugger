window.addEventListener("DOMContentLoaded", () => {
       

    firebase.auth().onAuthStateChanged(function (user) {
        console.log("UID test " + firebase.auth().currentUser);
        if (user){
           console.log("UID: " + user.uid);
        } else {
            console.log("No user");
        }
    })
});