import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBtnuJNgy2Yhs2bgr0GNEI-x_p5gosWcTo",
  authDomain: "mortasa.firebaseapp.com",
  projectId: "mortasa",
  storageBucket: "mortasa.firebasestorage.app",
  messagingSenderId: "884554528405",
  appId: "1:884554528405:web:ecbbb43e14d08cee9e8d9c",
  measurementId: "G-6ZWRBXWYTX"
};

export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
