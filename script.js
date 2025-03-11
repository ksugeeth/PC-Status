// Import and Initialize Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, onValue, remove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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

// Get Elements
const civicBench = document.getElementById("civicBench");
const doctorsBench = document.getElementById("doctorsBench");

const civicTimerDropdown = document.getElementById("civicTimer");
const doctorsTimerDropdown = document.getElementById("doctorsTimer");

const civicCountdown = document.getElementById("civicCountdown");
const doctorsCountdown = document.getElementById("doctorsCountdown");

let timers = {};  // Store interval timers

// Toggle Selection and Update Firebase
function toggleSelection(benchName, element, timerDropdown) {
    const isSelected = element.classList.contains("selected");
    
    if (isSelected) {
        // If deselected, remove from Firebase and reset timer
        remove(ref(database, "benches/" + benchName));
        clearInterval(timers[benchName]);
        updateCountdownText(benchName, ""); // Clear UI
    } else {
        // If selected, store selected state and timer value
        const timerValue = parseInt(timerDropdown.value, 10) * 60; // Convert minutes to seconds
        const endTime = Date.now() + timerValue * 1000; // Future timestamp

        set(ref(database, "benches/" + benchName), { selected: true, endTime: endTime });
    }

    location.reload(); // Refresh to sync changes
}

// Function to start and update timer
function startTimer(benchName, countdownElement, endTime) {
    clearInterval(timers[benchName]); // Clear any existing timer

    function updateCountdown() {
        const remainingTime = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
        const minutes = Math.floor(remainingTime / 60);
        const seconds = remainingTime % 60;
        countdownElement.textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`;

        if (remainingTime === 0) {
            clearInterval(timers[benchName]); // Stop timer when it reaches 0
            remove(ref(database, "benches/" + benchName)); // Remove from Firebase when expired
            location.reload();
        }
    }

    updateCountdown(); // Initial call
    timers[benchName] = setInterval(updateCountdown, 1000); // Update every second
}

// Click Listeners for Selection
civicBench.addEventListener("click", function() {
    toggleSelection("civicBench", civicBench, civicTimerDropdown);
});

doctorsBench.addEventListener("click", function() {
    toggleSelection("doctorsBench", doctorsBench, doctorsTimerDropdown);
});

// Sync with Firebase in Real-Time
onValue(ref(database, "benches/civicBench"), (snapshot) => {
    const data = snapshot.val();
    if (data) {
        civicBench.classList.add("selected");
        startTimer("civicBench", civicCountdown, data.endTime);
    } else {
        civicBench.classList.remove("selected");
        clearInterval(timers["civicBench"]);
        updateCountdownText("civicBench", "");
    }
});

onValue(ref(database, "benches/doctorsBench"), (snapshot) => {
    const data = snapshot.val();
    if (data) {
        doctorsBench.classList.add("selected");
        startTimer("doctorsBench", doctorsCountdown, data.endTime);
    } else {
        doctorsBench.classList.remove("selected");
        clearInterval(timers["doctorsBench"]);
        updateCountdownText("doctorsBench", "");
    }
});

// Function to clear UI countdown text
function updateCountdownText(benchName, text) {
    if (benchName === "civicBench") civicCountdown.textContent = text;
    if (benchName === "doctorsBench") doctorsCountdown.textContent = text;
}
