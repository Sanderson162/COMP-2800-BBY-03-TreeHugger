## TreeHugger

Find your tree, Vancouver!

* [General info](#general-info)
* [Technologies](#technologies)
* [Contents](#content)

## General Info
This browser based web application shows you the details of the trees nearest you, in Vancouver; with social features! 
## Technologies
Technologies used for this project:
* HTML
* CSS
* JavaScript
  * JQuery
  * Node js
  * Express
  * ejs
* Firebase
  * Firestore
  * Firebase Auth
  * Firebase Hosting
  * Firebase Functions
* Street-Trees Database: https://opendata.vancouver.ca/explore/dataset/street-trees/information
* Wikipedia API
* Google Maps API

## Dependencies
* Node v14.15.1
* express v4.17.1
* ejs v3.1.6
* firebase-admin v9.7.0
* firebase-functions v3.14.0

## IDE's
* (optional) Visual Studio Code
* Selenium extention for unit testing

## Team Members
* [Stirling Anderson](https://github.com/Sanderson162)
* [Aidan McReynolds](https://github.com/AidanMcReynolds)
* [Amrit Manhas](https://github.com/apsm100)
* [Steven Reid](https://github.com/StevenR88)

## Content
Content of the project folder:
```
 Top level of project folder:
├── README.md                  # Read Me
├── .firebaserc                # Defines which project firebase looks for
├── firebase.json              # Tells firebase hosting to use functions
├── LICENSE_FOR_GIFT_ICON      # License for gift icon
├── TreeHuggerUnitTests.side   # Unit tests using Selenium

It has the following subfolders:

├── /functions                 # Folder for firebase functions
    ├── index.js               # Node server that is run on Firebase Functions
    ├── package.json           # List of dependencies
    ├── serviceAccountKey.json # Account key for server interactions with firebase
    ├── /scripts               # Client side javascript
    ├── /styles                # Css styling
    ├── /views                 # Static html pages that can be served by node
    ├── /templates             # Html templates for minified html in navbar-common.js
├── /public                    # Folder for firebase Hosting static files
    favicon.ico                # Favicon for all pages
```

## Setup Instructions
1. Clone repository into working directory of your choosing
2. install node ``` https://nodejs.org/en/download/```
3. install dependancies in /functions by running ```cd /functions & npm install & cd ..```
4. install firebase cli using ```npm install -g firebase-tools```
5. Service account key needed for accesing Authentication and database is included in repository
6. test app functions by running ```firebase serve```
