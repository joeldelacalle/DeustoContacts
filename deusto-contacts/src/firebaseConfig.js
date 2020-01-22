import firebase from 'firebase'
import 'firebase/firestore'

// firebase init goes here
const config = {
    apiKey: "AIzaSyBETL6L-YCCWEVlmqVICYPiWaYEuW-IQXY",
  authDomain: "agenda-iw.firebaseapp.com",
  databaseURL: "https://agenda-iw.firebaseio.com",
  projectId: "agenda-iw",
  storageBucket: "agenda-iw.appspot.com",
  messagingSenderId: "639186574253",
  appId: "1:639186574253:web:2ea437b1221d91940f1f24",
  measurementId: "G-F27LG77QDJ"
};

firebase.initializeApp(config)

// firebase utils
const db = firebase.firestore()
const auth = firebase.auth()
const currentUser = auth.currentUser

// date issue fix according to firebase
const settings = {
    timestampsInSnapshots: true
}
db.settings(settings)

// firebase collections
const usersCollection = db.collection('users')
const contactsCollection = db.collection('contacts')
const commentsCollection = db.collection('comments')
const likesCollection = db.collection('likes')

export {
    db,
    auth,
    currentUser,
    usersCollection,
    contactsCollection,
    commentsCollection,
    likesCollection
}
