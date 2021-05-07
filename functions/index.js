const functions = require('firebase-functions');
const express = require('express');

//testing with cookies
const cookieParser = require("cookie-parser");
const csrf = require("csurf");
const csrfMiddleware = csrf({ cookie: true });
//end testing with cookies

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
app.use(cookieParser());
app.use(csrfMiddleware);


// request cookie
app.all("*", (req, res, next) => {
    res.cookie("XSRF-TOKEN", req.csrfToken());
    next();
});


app.get("/", function (req, res) {
    res.render("index.html");
});

app.get("/login", function (req, res) {
    res.render("login.html");
});

app.get("/signup", function (req, res) {
    res.render("signup.html");
});

app.get('/profile', checkCookieMiddleware, (req, res) => {
    let uid =  req.decodedClaims.uid;
    db.collection("Users").doc(uid).get().then(function (doc) { //if successful
        console.log("accessing user: " + doc.data().name);
        console.log("UID accessing profile: " + uid);
        res.render('profile.html', {username: doc.data().name, email: doc.data().email});
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

app.post('/ajax-add-user', urlencodedParser, checkCookieMiddleware, (req, res) => {
    // res.setHeader('Content-Type', 'application/json');
    let user = req.body;
    let uidFromAuth =  req.decodedClaims.uid;
    if (user.uid == uidFromAuth) {
        db.collection("Users").doc(uidFromAuth).set({
            name: user.name,
            email: user.email
        }).then(function () { //if successful
            console.log("New user added to firestore");
            res.send({ status: "success"});
        })
    } else {
        console.log("userId from client and Auth dont match");
        res.send({ status: "error"});
    }
});


//deal with cookies
// https://medium.com/novasemita/auth-using-firebaseui-firebase-functions-session-cookies-f2447bf42201
function checkCookieMiddleware(req, res, next) {

	const sessionCookie = req.cookies.session || '';

	admin.auth().verifySessionCookie(
		sessionCookie, true).then((decodedClaims) => {
			req.decodedClaims = decodedClaims;
			next();
		})
		.catch(error => {
			// Session cookie is unavailable or invalid. Force user to login.
			res.redirect('/login');
		});
}



// https://firebase.google.com/docs/auth/admin/manage-cookies
app.post("/sessionLogin", (req, res) => {
    const idToken = req.body.idToken.toString();
    console.log("id token signing in" + idToken);

    const expiresIn = 60 * 60 * 24 * 5 * 1000;

    admin
      .auth()
      .createSessionCookie(idToken, { expiresIn })
      .then(
        (sessionCookie) => {
          const options = { maxAge: expiresIn, httpOnly: true };
          res.cookie("session", sessionCookie, options);
          res.end(JSON.stringify({ status: "success" }));
        },
        (error) => {
          res.status(401).send("UNAUTHORIZED REQUEST!");
        }
      );
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


app.post('/update-username', urlencodedParser, checkCookieMiddleware, (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    let uidFromAuth =  req.decodedClaims.uid;
  
    db.collection("Users").doc(uidFromAuth).update({
        name: req.body.name
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

 console.log("app loaded");
 exports.app = functions.https.onRequest(app);

