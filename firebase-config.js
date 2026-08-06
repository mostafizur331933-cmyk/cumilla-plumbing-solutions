/**
 * Firebase কনফিগারেশন
 * ----------------------------------------------------
 * এই ফাইলটি এডমিন প্যানেল ও পাবলিক ওয়েবসাইট — দুই জায়গাতেই ব্যবহৃত হয়।
 *
 * নিচের মানগুলো আপনার নিজের Firebase প্রজেক্ট থেকে বসাতে হবে:
 * Firebase Console > প্রজেক্ট সেটিংস (⚙️) > General > "Your apps" >
 * Web app (</>) > SDK setup and configuration
 *
 * বিস্তারিত ধাপ README-FIREBASE-SETUP.md ফাইলে দেওয়া আছে।
 */

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Firebase অ্যাপ চালু করুন (একবার লোড হলেই পুরো সাইটে কাজ করবে)
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
