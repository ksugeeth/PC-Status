// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getDatabase, ref, push, onChildAdded } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC1J_Vpdgg797e9V8WNEyP7uAuUPlWs0mc",
    authDomain: "bench-tracker-s.firebaseapp.com",
    databaseURL: "https://bench-tracker-s-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "bench-tracker-s",
    storageBucket: "bench-tracker-s.firebasestorage.app",
    messagingSenderId: "701367291259",
    appId: "1:701367291259:web:cc980155f7dc31eed681de"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const namesRef = ref(db, "names");

// Get input field and list
const nameInput = document.getElementById("nameInput");
const nameList = document.getElementById("nameList");

// Send name to Firebase on Enter key press
nameInput.addEventListener("keypress", function(event) {
    if (event.key === "Enter" && this.value.trim() !== "") {
        push(namesRef, this.value.trim());  // Save to Firebase
        this.value = "";  // Clear input box
    }
});

// Listen for new names in Firebase
onChildAdded(namesRef, (snapshot) => {
    let li = document.createElement("li");
    li.textContent = snapshot.val();
    nameList.appendChild(li);
});
