// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries


import { getFirestore } from "firebase/firestore";
import {
  initializeAuth,
  getReactNativePersistence
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Your web app's Firebase configuration

const firebaseConfig = {
  apiKey: "AIzaSyCO6EL6SNX-_2cqDJWN_5ZkqBCL9TZvyS4",
  authDomain: "bus-tracking-17ad1.firebaseapp.com",
  projectId: "bus-tracking-17ad1",
  storageBucket: "bus-tracking-17ad1.firebasestorage.app",
  messagingSenderId: "819778624554",
  appId: "1:819778624554:web:2fb5247d51e76a932cb753"
};

// Initialize Firebase

const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app,{
  persistence: getReactNativePersistence(AsyncStorage)
});

export const db = getFirestore(app);