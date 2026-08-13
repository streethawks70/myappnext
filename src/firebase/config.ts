import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {

  apiKey: "AIzaSyC8ZenECug7VL-J5Y6-6GULuLbWVkICYS0",

  authDomain: "databasetest-b1a62.firebaseapp.com",

  projectId: "databasetest-b1a62",

  storageBucket: "databasetest-b1a62.firebasestorage.app",

  messagingSenderId: "311131151314",

  appId: "1:311131151314:web:402b25e1f54c399785c60b"

};


const app = initializeApp(firebaseConfig);


export const db = getFirestore(app);