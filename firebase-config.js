const firebaseConfig = {
  apiKey: "AIzaSyB0LyEnsmI7JJ7F2AkpB-MXhQ2KwOqFXCc",
  authDomain: "comilla-plumbing.firebaseapp.com",
  projectId: "comilla-plumbing",
  storageBucket: "comilla-plumbing.firebasestorage.app",
  messagingSenderId: "1053898678955",
  appId: "1:1053898678955:web:4c47c976863f25c5210dee"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
