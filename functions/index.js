'use strict'

const functions = require('firebase-functions');
const express = require('express');

const urlencodedParser = express.urlencoded({
  extended: false
})

// FIREBASE
var admin = require("firebase-admin");
var serviceAccount = require("./serviceAccountKey.json");
const { firestore} = require('firebase-admin');
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
app.use(express.static("img"));
app.use(express.json());

// basic GET requests
app.get("/", function (req, res) {
  res.render("home.html");
});

app.get('/timestamp', function (req, res) {
  res.send("Timestamp from the server: " + Date.now());
});

app.get("/locationMap", function (req, res) {
  res.render("locationMap.html");
});

app.get("/searchMap", function (req, res) {
  res.render("searchMap.html");
});

app.get("/match", function (req, res) {
  res.render("match.html");
});

app.get("/profile", function (req, res) {
  res.render("profile.html");
});

app.get("/home", function (req, res) {
  res.render("home.html");
});

app.get("/aboutUs", function (req, res) {
  res.render("aboutus.html");
});


/**
 * get the users profile information
 * @author Stirling
 */
app.post('/profile', urlencodedParser, (req, res) => {
  const idToken = req.body.idToken.toString();
  admin
    .auth()
    .verifyIdToken(idToken)
    .then((decodedToken) => {
      const uid = decodedToken.uid;
      db.collection("Users").doc(uid).get().then(function (doc) {
        res.send({
          status: "success",
          uid: uid,
          name: doc.data().name,
          email: doc.data().email
        });
      }).catch((error) => {
        console.log(error);
        res.status(418).send("Could not get User!");
      });
    }).catch((error) => {
      console.log(error);
      res.status(401).send("UNAUTHORIZED REQUEST!");
    });
});


/**
 * add a new user to the database
 * @author Stirling
 */
app.post('/ajax-add-user', urlencodedParser, (req, res) => {
  // res.setHeader('Content-Type', 'application/json');
  let user = req.body;
  const idToken = req.body.idToken.toString();
  admin
    .auth()
    .verifyIdToken(idToken)
    .then((decodedToken) => {
      const uid = decodedToken.uid;
      db.collection("Users").doc(uid).set({
        name: user.name,
        email: user.email,
        created: Date.now(),
      }).then(function () { //if successful
        res.send({
          status: "success"
        });
      }).catch((error) => {
        console.log(error);
        res.status(418).send("Could not get favourites!");
      });
    }).catch((error) => {
      console.log(error);
      res.status(401).send("UNAUTHORIZED REQUEST!");
    });
});

/**
 * adds a tree to user favourites
 * @author Stirling
 */
app.post('/addTreeFav', urlencodedParser, (req, res) => {
  const idToken = req.body.idToken.toString();
  const recordID = req.body.recordID;
  admin
    .auth()
    .verifyIdToken(idToken)
    .then((decodedToken) => {
      const uid = decodedToken.uid;

      const batchFav = db.batch();
      const docRef = db.collection("Favourite").doc(uid + "_" + recordID);
      const statsRef = db.collection('FavouriteStats').doc(recordID);

      batchFav.create(docRef, {
        userID: uid,
        recordID: recordID,
        timestamp: firestore.Timestamp.now(),
      });
      batchFav.set(statsRef, {
        favCount: increment
      }, {
        merge: true
      });
      batchFav.commit()
        .then(function () { //if successful
          res.send({
            status: "success"
          });
        }).catch((error) => {
          res.send({
            status: "error"
          });
        });

    }).catch((error) => {
      res.status(401).send("UNAUTHORIZED REQUEST!");
    });
});

/**
 * removes a tree from user favourites
 * @author Stirling
 */
app.post('/removeTreeFav', urlencodedParser, (req, res) => {
  const idToken = req.body.idToken.toString();
  const recordID = req.body.recordID;

  admin
    .auth()
    .verifyIdToken(idToken)
    .then((decodedToken) => {
      const uid = decodedToken.uid;

      const docRef = db.collection("Favourite").doc(uid + "_" + recordID);
      const statsRef = db.collection('FavouriteStats').doc(recordID);
      const batchFav = db.batch();
      batchFav.delete(docRef, {exists: true});
      batchFav.set(statsRef, {favCount: decrement}, {merge: true});
      batchFav.commit()
        .then(function () { //if successful
          res.send({
            status: "success"
          });
        }).catch((error) => {
          res.send({
            status: "error"
          });
        });

      //End idtoken verified
    }).catch((error) => {
      res.status(401).send("UNAUTHORIZED REQUEST!");
    });
});

//adds a saved tree to the database for user making request.
app.post("/ajax-add-comment", urlencodedParser, (req, res) => {
  const idToken = req.body.idToken.toString();
  let comment = req.body;

  admin
    .auth()
    .verifyIdToken(idToken)
    .then((decodedToken) => {
      const uid = decodedToken.uid;


      db.collection("Comments").add({
        Comment: comment.text,
        Timestamp: firestore.Timestamp.now(),
        User: uid,
        Tree: comment.tree,
        Icon: comment.icon
      }).then((ref) => {
        res.send({
          status: "success"
        });
      }).catch((error) => {
        res.status(418).send("Could not add comment!");
      });


    }).catch((error) => {
      res.status(401).send("UNAUTHORIZED REQUEST!");
    });
});

//adds history to the database for user making request
app.post("/ajax-add-history", urlencodedParser, (req, res) => {
  const idToken = req.body.idToken.toString();
  let comment = req.body;

  admin
    .auth()
    .verifyIdToken(idToken)
    .then((decodedToken) => {
      const uid = decodedToken.uid;


      db.collection("History").doc(uid + "_" + comment.tree).set({
        timestamp: firestore.Timestamp.now(),
        user: uid,
        tree: comment.tree
      }).then((ref) => {
        res.send({
          status: "success"
        });
      }).catch((error) => {
        res.status(418).send("Could not add History!");
      });


    }).catch((error) => {
      res.status(401).send("UNAUTHORIZED REQUEST!");
    });
});

//responds to the ajax request for all saved trees for user making request.
app.post("/ajax-get-comment-user", urlencodedParser, (req, res) => {
  const idToken = req.body.idToken.toString();


  res.setHeader('Content-Type', 'application/json');
  admin
    .auth()
    .verifyIdToken(idToken)
    .then((decodedToken) => {
      const uid = decodedToken.uid;
      db.collection("Comments")
        .where("User", "==", uid)
        .orderBy("Timestamp", "desc")
        .get()
        .then((data) => {
          let response = [];
          data.forEach((entry) => {
            response.push(entry.data());
          });
          res.send(JSON.stringify(response));
        })
        .catch((error) => {
          res.status(418).send("Could not get Comments!");
        });
    }).catch((error) => {
      res.status(401).send("UNAUTHORIZED REQUEST!");
    });
});

//responds to ajax request for user history. 
app.post("/ajax-get-history-user", urlencodedParser, (req, res) => {
  const idToken = req.body.idToken.toString();


  res.setHeader('Content-Type', 'application/json');
  admin
    .auth()
    .verifyIdToken(idToken)
    .then((decodedToken) => {
      const uid = decodedToken.uid;
      db.collection("History")
        .where("user", "==", uid)
        .orderBy("timestamp", "desc")
        .limit(20)
        .get()
        .then((data) => {
          let response = [];
          data.forEach((entry) => {
            let x = {
              tree: entry.data().tree,
              date: entry.data().timestamp.toDate().toDateString()
            }
            response.push(x);
          });
          res.send(JSON.stringify(response));
        })
        .catch((error) => {
          res.status(418).send("Could not get History!");
        });
    }).catch((error) => {
      res.status(401).send("UNAUTHORIZED REQUEST!");
    });
});


/**
 * get list of favourites given a certain user
 * @author Stirling
 */
app.post('/getFavByUser', urlencodedParser, (req, res) => {
  const idToken = req.body.idToken.toString();
  admin
    .auth()
    .verifyIdToken(idToken)
    .then((decodedToken) => {
      const uid = decodedToken.uid;

      db.collection("Favourite")
        .where("userID", "==", uid)
        .orderBy('timestamp')
        .limit(15)
        .get()
        .then(querySnapshot => {
          let resultArray = [];
          querySnapshot.forEach((doc) => {
            resultArray.push({
              recordID: doc.data().recordID,
              timestamp: doc.data().timestamp
            });
          });
          res.send({
            status: "success",
            data: resultArray
          });
        })
        .catch(function (error) {
          res.send({
            status: "error"
          });
        });
    }).catch((error) => {
      res.status(401).send("UNAUTHORIZED REQUEST!");
    });
});


/**
 * get list of favourites on a certain tree
 * @author Stirling
 */
app.post('/getFavByTree', urlencodedParser, (req, res) => {
  const recordID = req.body.recordID;
  db.collection("Favourite")
    .where("recordID", "==", recordID)
    .get()
    .then(querySnapshot => {
      let resultArray = [];
      querySnapshot.forEach((doc) => {
        resultArray.push({
          recordID: doc.data().recordID,
          timestamp: doc.data().timestamp
        });
      });
      res.send({
        status: "success",
        data: resultArray
      });
    })
    .catch(function (error) {
      res.send({
        status: "error"
      });
    });
});


/**
 * get fav count by tree
 * @author Stirling
 */
app.post('/getFavCountByTree', urlencodedParser, (req, res) => {
  const recordID = req.body.recordID;
  db.collection('FavouriteStats').doc(recordID)
    .get()
    .then(function (doc) {
      if (doc.exists) {
        res.send({
          status: "success",
          count: doc.data().favCount
        });
      } else {
        res.send({
          status: "success",
          count: 0
        });
      }
    }).catch(function (error) {
      res.send({
        status: "error",
        count: 0
      });
    });
});

/**
 * get fav count leaderboard
 * @author Stirling
 */
app.post('/getFavCountLeaderboard', urlencodedParser, (req, res) => {
  db.collection("FavouriteStats")
  .orderBy("favCount", "desc")
  .limit(15)
  .get()
  .then(querySnapshot => {
      let resultArray = [];
      querySnapshot.forEach((doc) => {
        resultArray.push({
          recordID: doc.id,
          favCount: doc.data().favCount
        });
      });
      res.send({
        status: "success",
        data: resultArray
      });
    }).catch(function (error) {
      res.send({
        status: "error"
      });
    });
});

/**
 * get if a user liked a tree
 * @author Stirling
 */
app.post('/getIfUserLiked', urlencodedParser, (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const idToken = req.body.idToken.toString();
  const recordID = req.body.recordID;

  admin
    .auth()
    .verifyIdToken(idToken)
    .then((decodedToken) => {
      const uid = decodedToken.uid;
      const docRef = db.collection("Favourite").doc(uid + "_" + recordID);
      docRef.get().then(function (doc) {
        res.send({
          status: "success",
          liked: doc.exists
        });
      }).catch((error) => {
        res.status(418).send("Could not get favourites!");
      });
    }).catch((error) => {
      res.status(401).send("UNAUTHORIZED REQUEST!");
    });
});

/**
 * update the users username
 * @author Stirling
 */
app.post('/update-username', urlencodedParser, (req, res) => {
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
        res.send({
          status: "success"
        });
      }).catch((error) => {
        res.status(418).send("Could not change username!");
      });
    }).catch((error) => {
      res.status(401).send("UNAUTHORIZED REQUEST!");
    });
});

/**
 * Changes the users email.
 * @author Aidan
 */
app.post('/update-email', urlencodedParser, (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const idToken = req.body.idToken.toString();

  admin
    .auth()
    .verifyIdToken(idToken)
    .then((decodedToken) => {
      const uid = decodedToken.uid;
      admin
        .auth()
        .updateUser(uid, {
          email: req.body.email
        }).then((userRecord) => {
          db.collection("Users").doc(uid).update({
            email: req.body.email
          }).then(function () { //if successful
            res.send({
              status: "success"
            });
          }).catch((error) => {
            res.status(418).send("could not update database!");
          });
        }).catch((error) => {
          res.status(418).send("Could not change email!");
        });
    }).catch((error) => {
      res.status(401).send("UNAUTHORIZED REQUEST!");
    });
});

function msg404(res) {
  let cryComfy = "https://puu.sh/HGpjx/f048c14998.png";
  let peepoJuice = "https://firebasestorage.googleapis.com/v0/b/tree-hugger-c60ff.appspot.com/o/peepoJuice.gif?alt=media&token=38646805-e677-4b4c-87f6-576603afa182";
  res.status(404).send("<div style='text-align: center;' ><img src='" + peepoJuice + "'><br>404 Page not found <a href='/'>Go home?</a></div>");
}

app.use((req, res, next) => {
  msg404(res);
});

console.log("app loaded");
exports.app = functions.https.onRequest(app);