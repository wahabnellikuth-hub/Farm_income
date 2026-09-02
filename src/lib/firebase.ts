import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDSKSTvDXVCbO-R1x1wRa-Dio6Fub8SaXU",
  authDomain: "farm-income-cab92.firebaseapp.com",
  databaseURL: "https://farm-income-cab92-default-rtdb.firebaseio.com",
  projectId: "farm-income-cab92",
  storageBucket: "farm-income-cab92.firebasestorage.app",
  messagingSenderId: "930127700151",
  appId: "1:930127700151:web:d858206d723654c522ed32",
  measurementId: "G-LRJLLWHHJ8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getDatabase(app);
const storage = getStorage(app);

export { app, analytics, auth, db, storage };
