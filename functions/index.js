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

//increment decrement
const increment = admin.firestore.FieldValue.increment(1);
const decrement = admin.firestore.FieldValue.increment(-1);

// PORT for testing in node
const PORT = process.env.PORT || 5000;

// express app
const app = express();


// app setup and other files
app.engine("html", require("ejs").renderFile);
app.use(express.static("scripts"));
app.use(express.static("styles"));
app.use(express.json());


// basic GET requests
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

app.get("/whoami", function (req, res) {
    res.send("test");
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

app.post('/profile', urlencodedParser, (req, res) => {
  const idToken = req.body.idToken.toString();
  admin
  .auth()
  .verifyIdToken(idToken)
  .then((decodedToken) => {
    const uid = decodedToken.uid;
    db.collection("Users").doc(uid).get().then(function (doc) { //if successful
      console.log("accessing user: " + doc.data().name);
      console.log("UID accessing profile: " + uid);
      res.send({ status: "success", uid: uid, name: doc.data().name});
  });
  }).catch((error) => {
      console.log(error);
      res.status(401).send("UNAUTHORIZED REQUEST!");
  });    
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
        email: user.email,
        created: Date.now(),
        }).then(function () { //if successful
            console.log("New user added to firestore");
            res.send({ status: "success"});
        })
    }).catch((error) => {
        console.log(error);
        res.status(401).send("UNAUTHORIZED REQUEST!");
    });
});

app.get("/testingPanel", function (req, res) {
  res.render("testingPanel.html");
});

app.post('/addTreeFav', urlencodedParser, (req, res) => {
    // res.setHeader('Content-Type', 'application/json');
    const idToken = req.body.idToken.toString();
    const recordID = req.body.recordID;
    admin
    .auth()
    .verifyIdToken(idToken)
    .then((decodedToken) => {
      const uid = decodedToken.uid;

      const batchFav = db.batch();
      const docRef = db.collection("Favourites").doc(uid + "_" + recordID);
      const statsRef = db.collection('Favourites').doc('--stats-' + recordID);

      batchFav.create(docRef, { 
        userID: uid,
        recordID: recordID,
        timestamp: Date.now(), 
      });
      batchFav.set(statsRef, { favCount: increment }, { merge: true });
      batchFav.commit()
      .then(function () { //if successful
        console.log("new favourite added");
        res.send({ status: "success"});
      }).catch((error) => {
        console.log(error);
        res.send({ status: "error"});
    });

    }).catch((error) => {
        console.log(error);
        res.status(401).send("UNAUTHORIZED REQUEST!");
    });
});

app.post('/removeTreeFav', urlencodedParser, (req, res) => {
    // res.setHeader('Content-Type', 'application/json');
    const idToken = req.body.idToken.toString();
    const recordID = req.body.recordID;

    admin
    .auth()
    .verifyIdToken(idToken)
    .then((decodedToken) => {
      const uid = decodedToken.uid;
      
      
      const docRef = db.collection("Favourites").doc(uid + "_" + recordID);
      const statsRef = db.collection('Favourites').doc('--stats-' + recordID);
      docRef.get().then(function (doc) {
        if (doc.exists) {
          const batchFav = db.batch();
          batchFav.delete(docRef);
          batchFav.set(statsRef, { favCount: decrement }, { merge: true });
          batchFav.commit()
          .then(function () { //if successful
            console.log("fav removed");
            res.send({ status: "success"});
          }).catch((error) => {
            console.log(error);
            res.send({ status: "error"});
          });
        } else {
          console.log('No such document!');
          res.send({ status: "error"});
        }
      });
    
      //End idtoken verified
    });
});

app.post('/getFavByUser', urlencodedParser, (req, res) => {
    // res.setHeader('Content-Type', 'application/json');
    const idToken = req.body.idToken.toString();
    const recordID = req.body.recordID;
    admin
    .auth()
    .verifyIdToken(idToken)
    .then((decodedToken) => {
      const uid = decodedToken.uid;

      db.collection("Favourites")
      .where("userID", "==", uid)
      .get()
      .then(querySnapshot => {
        let resultArray = [];
        querySnapshot.forEach((doc) => {
          resultArray.push({recordID: doc.data().recordID, timestamp: doc.data().timestamp});
        });
        res.send({ status: "success", data: resultArray});
      })
      .catch(function(error) {
        console.log("Error getting documents: ", error);
        res.send({ status: "error"});
      });

      //End idtoken verified
    });
});

app.post('/getFavByTree', urlencodedParser, (req, res) => {
  // res.setHeader('Content-Type', 'application/json');
  const recordID = req.body.recordID;
  db.collection("Favourites")
  .where("recordID", "==", recordID)
  .get()
  .then(querySnapshot => {
    let resultArray = [];
    querySnapshot.forEach((doc) => {
      resultArray.push({recordID: doc.data().recordID, timestamp: doc.data().timestamp});
    });
    res.send({ status: "success", data: resultArray});
  })
  .catch(function(error) {
    console.log("Error getting documents: ", error);
    res.send({ status: "error"});
  });
});

app.post('/getFavCountByTree', urlencodedParser, (req, res) => {
  // res.setHeader('Content-Type', 'application/json');
  const recordID = req.body.recordID;
  db.collection('Favourites').doc('--stats-' + recordID)
  .get()
  .then(function (doc) {
    console.log("FavCount: " + doc.data().favCount);
    res.send({ status: "success", data: doc.data().favCount});
  }).catch(function(error) {
    console.log("Error getting documents: ", error);
    res.send({ status: "error"});
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

/*
app.listen(PORT, () => {
    console.log(`Listening on http://localhost:${PORT}`);
 });
*/
 console.log("app loaded");
 exports.app = functions.https.onRequest(app);

