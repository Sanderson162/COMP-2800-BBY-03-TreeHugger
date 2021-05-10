const functions = require('firebase-functions');
const express = require('express');

const urlencodedParser = express.urlencoded({ extended: false })  

// FIREBASE
var admin = require("firebase-admin");
var serviceAccount = require("./serviceAccountKey.json");
//const { user } = require('firebase-functions/lib/providers/auth');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

const PORT = process.env.PORT || 5000;
const app = express();

app.engine("html", require("ejs").renderFile);
app.use(express.static("scripts"));
app.use(express.static("styles"));

//more testing with cookies
app.use(express.json());

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

app.get('/profile', (req, res) => {
    const idToken = req.body.idToken.toString();
    admin
    .auth()
    .verifyIdToken(idToken)
    .then((decodedToken) => {
      const uid = decodedToken.uid;
      db.collection("Users").doc(uid).get().then(function (doc) { //if successful
        console.log("accessing user: " + doc.data().name);
        console.log("UID accessing profile: " + uid);
        res.render('profile.html', {username: doc.data().name, email: doc.data().email});
    });
    }).catch((error) => {
        console.log(error);
        res.status(401).send("UNAUTHORIZED REQUEST!");
    });    
});


app.get("/findtree", function (req, res) {
    res.render("findtree.html");
});

app.get("/viewIndividualTree", function (req, res) {
    res.render("viewIndividualTree.html");
});

app.get("/search", function (req, res) {
    res.render("search.html");
});


app.get("/searchDate", function (req, res) {
    res.render("searchDate.html");
});

app.post('/ajax-add-user', urlencodedParser, (req, res) => {
    // res.setHeader('Content-Type', 'application/json');
    let user = req.body;
    const idToken = req.body.idToken.toString();
    admin
    .auth()
    .verifyIdToken(idToken)
    .then((decodedToken) => {
      const uid = decodedToken.uid;
      console.log("User: " + uid + " is a new user")
      db.collection("Users").doc(uid).set({
        name: user.name,
        email: user.email
        }).then(function () { //if successful
            console.log("New user added to firestore");
            res.send({ status: "success"});
        })
    }).catch((error) => {
        console.log(error);
        res.status(401).send("UNAUTHORIZED REQUEST!");
    });
});

app.post("/sessionLogin", (req, res) => {
    const idToken = req.body.idToken.toString();
    console.log("id token signing in" + idToken);

    admin
    .auth()
    .verifyIdToken(idToken)
    .then((decodedToken) => {
      const uid = decodedToken.uid;
      console.log("User: " + uid + " signed in")
      res.end(JSON.stringify({ status: "success" }));
    }).catch((error) => {
        console.log(error);
        res.status(401).send("UNAUTHORIZED REQUEST!");
    });
});

// https://firebase.google.com/docs/auth/admin/manage-cookies
app.get('/sessionLogout', (req, res) => {
    const sessionCookie = req.cookies.session || '';
    res.clearCookie('session');
    admin
    .auth()
    .verifySessionCookie(sessionCookie)
    .then((decodedClaims) => {
       return admin.auth().revokeRefreshTokens(decodedClaims.sub);
    })
    .then(() => {
       res.redirect('/');
    })
    .catch((error) => {
       res.redirect('/');
    });
});


app.post('/update-username', urlencodedParser,  (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    const idToken = req.body.idToken.toString();

    admin
    .auth()
    .verifyIdToken(idToken)
    .then((decodedToken) => {
      const uid = decodedToken.uid;
      db.collection("Users").doc(uid).update({
        name: req.body.name
        }).then(function () { //if successful
            console.log("Username updated");
            res.send({ status: "success"});
        })
    }).catch((error) => {
        console.log(error);
        res.status(401).send("UNAUTHORIZED REQUEST!");
    });
    
  
  });


app.get('/timestamp', function (req, res) {
    res.send("hello from firebase" + Date.now());
});


app.listen(PORT, () => {
    console.log(`Listening on http://localhost:${PORT}`);
 });

 console.log("app loaded");
 exports.app = functions.https.onRequest(app);

