//---------------------------------------------------------------------
// Your web app's Firebase configuration;
// Specifies which firebase project your application is connected with.
//---------------------------------------------------------------------

const firebaseConfig = {
  apiKey: "AIzaSyATCi7onEF1thX9QwFacO6YoZp-c8K11BU",
  authDomain: "tree-hugger-c60ff.firebaseapp.com",
  projectId: "tree-hugger-c60ff",
  storageBucket: "tree-hugger-c60ff.appspot.com",
  messagingSenderId: "500955301233",
  appId: "1:500955301233:web:8257924d67831302a462d0"
};

window.addEventListener("DOMContentLoaded", () => {
  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();
});
