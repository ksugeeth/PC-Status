// Import and Initialize Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// Firebase Configuration (Your Provided Details)
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
const database = getDatabase(app);

// Get Bench Elements
const civicBench = document.getElementById("civicBench");
const doctorsBench = document.getElementById("doctorsBench");

// Toggle Selection and Update Firebase
function toggleSelection(benchName, element) {
    const isSelected = element.classList.contains("selected");

    // Update Firebase
    set(ref(database, "benches/" + benchName), { selected: !isSelected })
        .then(() => {
            // Reload the page after Firebase update
            location.reload();
        })
        .catch((error) => console.error("Error updating Firebase:", error));
}

// Click Listeners for Selection
civicBench.addEventListener("click", function() {
    toggleSelection("civicBench", civicBench);
});

doctorsBench.addEventListener("click", function() {
    toggleSelection("doctorsBench", doctorsBench);
});

// Sync with Firebase in Real-Time
onValue(ref(database, "benches/civicBench"), (snapshot) => {
    const data = snapshot.val();
    if (data) civicBench.classList.toggle("selected", data.selected);
});

onValue(ref(database, "benches/doctorsBench"), (snapshot) => {
    const data = snapshot.val();
    if (data) doctorsBench.classList.toggle("selected", data.selected);
});
