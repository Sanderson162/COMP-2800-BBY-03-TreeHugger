window.addEventListener("DOMContentLoaded", () => {
    console.log("DOM content loaded");
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.NONE);

    document
      .getElementById("login")
      .addEventListener("submit", (event) => {
        event.preventDefault();
        const login = event.target.login.value;
        const password = event.target.password.value;

        firebase
          .auth()
          .signInWithEmailAndPassword(login, password)
          .then(({ user }) => {
            console.log(user.uid);
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
      
  });