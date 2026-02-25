
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDKjXBDu3ijm3sGfzMDUcM8HYjyj41aT8s",
  authDomain: "coupons-79d9f.firebaseapp.com",
  databaseURL: "https://coupons-79d9f-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "coupons-79d9f",
  storageBucket: "coupons-79d9f.firebasestorage.app",
  messagingSenderId: "1095594558375",
  appId: "1:1095594558375:web:720959f1182dcb81726c82",
  measurementId: "G-QCNHWQJR71"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
