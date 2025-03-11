// Import and Initialize Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, onValue, remove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// Firebase Configuration
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
const civicTimerSelect = document.getElementById("civicTimer");
const doctorsTimerSelect = document.getElementById("doctorsTimer");
const civicCountdown = document.getElementById("civicCountdown");
const doctorsCountdown = document.getElementById("doctorsCountdown");

let civicInterval, doctorsInterval;

// Function to Start Timer
function startTimer(benchName, displayElement, duration) {
    let timeLeft = duration * 60; // Convert minutes to seconds

    function updateTimer() {
        let minutes = Math.floor(timeLeft / 60);
        let seconds = timeLeft % 60;
        displayElement.innerText = `Timer: ${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
        
        if (timeLeft <= 0) {
            clearInterval(benchName === "civicBench" ? civicInterval : doctorsInterval);
            displayElement.innerText = "Timer: 00:00";
        } else {
            timeLeft--;
        }
    }

    updateTimer();
    return setInterval(updateTimer, 1000);
}

// Toggle Selection and Update Firebase
function toggleSelection(benchName, element, timerSelect, countdownDisplay) {
    const isSelected = element.classList.contains("selected");
    const selectedTime = parseInt(timerSelect.value);

    if (!isSelected) {
        // Start Timer
        const timerRef = ref(database, "benches/" + benchName);
        set(timerRef, { selected: true, timer: selectedTime });
        location.reload();
    } else {
        // Stop and Reset Timer
        remove(ref(database, "benches/" + benchName));
        clearInterval(benchName === "civicBench" ? civicInterval : doctorsInterval);
        countdownDisplay.innerText = "Timer: --:--";
        location.reload();
    }
}

// Click Listeners for Selection
civicBench.addEventListener("click", function() {
    toggleSelection("civicBench", civicBench, civicTimerSelect, civicCountdown);
});

doctorsBench.addEventListener("click", function() {
    toggleSelection("doctorsBench", doctorsBench, doctorsTimerSelect, doctorsCountdown);
});

// Sync with Firebase in Real-Time
onValue(ref(database, "benches/civicBench"), (snapshot) => {
    const data = snapshot.val();
    if (data) {
        civicBench.classList.toggle("selected", data.selected);
        if (data.selected && data.timer) {
            clearInterval(civicInterval);
            civicInterval = startTimer("civicBench", civicCountdown, data.timer);
        }
    }
});

onValue(ref(database, "benches/doctorsBench"), (snapshot) => {
    const data = snapshot.val();
    if (data) {
        doctorsBench.classList.toggle("selected", data.selected);
        if (data.selected && data.timer) {
            clearInterval(doctorsInterval);
            doctorsInterval = startTimer("doctorsBench", doctorsCountdown, data.timer);
        }
    }
});
