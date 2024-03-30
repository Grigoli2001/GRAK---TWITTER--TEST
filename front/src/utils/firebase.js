import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCDWgVxJzkZVhqn7UEMOTVtN9UcEDkYoOs",
  authDomain: "grak-twitter-166d0.firebaseapp.com",
  projectId: "grak-twitter-166d0",
  storageBucket: "grak-twitter-166d0.appspot.com",
  messagingSenderId: "293186400885",
  appId: "1:293186400885:web:73aabd52046df73dacbe3c",
  measurementId: "G-98ZLP3Q94J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);