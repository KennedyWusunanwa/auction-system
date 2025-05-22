import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBycoQR_4WLTKNua7ucIFn3jOzUxYQ6bqg",
  authDomain: "ghanaauction-e52f0.firebaseapp.com",
  projectId: "ghanaauction-e52f0",
  storageBucket: "ghanaauction-e52f0.firebasestorage.app",
  messagingSenderId: "532461964559",
  appId: "1:532461964559:web:a0f4224ed6e057085dc27a",
  measurementId: "G-Z5Q9SR1G1C"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
