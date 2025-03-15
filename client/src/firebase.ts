
import { initializeApp } from "firebase/app";
import {getStorage} from "firebase/storage"
const firebaseConfig = {
  apiKey: "AIzaSyBD0Ey_zCtaotSsi25EKycoK6Y8XW5_-4o",
  authDomain: "upload-39427.firebaseapp.com",
  projectId: "upload-39427",
  storageBucket: "upload-39427.appspot.com",
  messagingSenderId: "139280622216",
  appId: "1:139280622216:web:d6c28c30f8d31272e2353d",
  measurementId: "G-0PYZRMNC4Q"
};
const app = initializeApp(firebaseConfig);

export const storage = getStorage(app)