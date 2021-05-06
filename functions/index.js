const functions = require('firebase-functions');
const express = require('express');

//testing with cookies
//const cookieParser = require("cookie-parser");
//const csrf = require("csurf");
//const csrfMiddleware = csrf({ cookie: true });
//end testing with cookies

// FIREBASE
var admin = require("firebase-admin");
var serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

const PORT = process.env.PORT || 5000;
const app = express();

app.engine("html", require("ejs").renderFile);
app.use(express.static("scripts"));

//more testing with cookies
//app.use(cookieParser());
//app.use(csrfMiddleware);


app.use(express.json());

// request cookie
/*
app.all("*", (req, res, next) => {
    res.cookie("XSRF-TOKEN", req.csrfToken());
    next();
});
*/

app.get("/", function (req, res) {
    res.render("index.html");
});

app.get("/login", function (req, res) {
    res.render("login.html");
});

app.get("/signup", function (req, res) {
    res.render("signup.html");
});

app.get("/treefind", function (req, res) {
    res.render("treefind.html");
});

app.post('/ajax-add-user', function (req, res) {
    // res.setHeader('Content-Type', 'application/json');
    user = req.body;
    db.collection("Users").doc(user.uid).set({
        name: user.name,
        email: user.email
    }).then(function () { //if successful
        console.log("New user added to firestore");
        res.send({ status: "success"});
    })
});


app.get('/timestamp', function (req, res) {
    res.send("hello from firebase" + Date.now());
});


app.listen(PORT, () => {
    console.log(`Listening on http://localhost:${PORT}`);
 });

 exports.app = functions.https.onRequest(app);

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
