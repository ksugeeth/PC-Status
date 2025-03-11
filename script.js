// Import and Initialize Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// Firebase Configuration (Replace with your details)
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

// Get Timer Elements
const civicTimerSelect = document.getElementById("civicTimer");
const doctorsTimerSelect = document.getElementById("doctorsTimer");

const civicCountdown = document.getElementById("civicCountdown");
const doctorsCountdown = document.getElementById("doctorsCountdown");

let civicInterval, doctorsInterval;

// Function to Start Timer
function startTimer(benchName, duration, countdownElement) {
    let endTime = Date.now() + duration * 60000;

    // Save end time in Firebase
    set(ref(database, `benches/${benchName}/timer`), endTime);

    // Update UI Timer
    function updateTimer() {
        let timeLeft = endTime - Date.now();
        if (timeLeft <= 0) {
            clearInterval(benchName === "civicBench" ? civicInterval : doctorsInterval);
            countdownElement.textContent = "00:00";
            return;
        }
        let minutes = Math.floor(timeLeft / 60000);
        let seconds = Math.floor((timeLeft % 60000) / 1000);
        countdownElement.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    updateTimer();
    return setInterval(updateTimer, 1000);
}

// Toggle Selection and Start/Reset Timer
function toggleSelection(benchName, element, timerSelect, countdownElement) {
    const isSelected = element.classList.contains("selected");

    if (isSelected) {
        // Deselect Bench - Reset Timer
        set(ref(database, "benches/" + benchName), { selected: false, timer: null });
        clearInterval(benchName === "civicBench" ? civicInterval : doctorsInterval);
        countdownElement.textContent = "00:00";
    } else {
        // Select Bench - Start Timer
        const selectedTime = parseInt(timerSelect.value);
        let interval = startTimer(benchName, selectedTime, countdownElement);
        if (benchName === "civicBench") {
            civicInterval = interval;
        } else {
            doctorsInterval = interval;
        }
        set(ref(database, "benches/" + benchName), { selected: true, timer: Date.now() + selectedTime * 60000 });
    }

    // Update Selection State
    element.classList.toggle("selected");
}

// Click Listeners for Selection
civicBench.addEventListener("click", function () {
    toggleSelection("civicBench", civicBench, civicTimerSelect, civicCountdown);
});

doctorsBench.addEventListener("click", function () {
    toggleSelection("doctorsBench", doctorsBench, doctorsTimerSelect, doctorsCountdown);
});

// Sync Selection and Timer in Real-Time
function syncBench(benchName, element, countdownElement) {
    onValue(ref(database, `benches/${benchName}`), (snapshot) => {
        const data = snapshot.val();
        if (data) {
            element.classList.toggle("selected", data.selected);
            if (data.timer) {
                let timeLeft = Math.max(0, Math.floor((data.timer - Date.now()) / 1000));
                countdownElement.textContent = `${String(Math.floor(timeLeft / 60)).padStart(2, '0')}:${String(timeLeft % 60).padStart(2, '0')}`;
                if (timeLeft > 0) {
                    let interval = startTimer(benchName, timeLeft / 60, countdownElement);
                    if (benchName === "civicBench") {
                        civicInterval = interval;
                    } else {
                        doctorsInterval = interval;
                    }
                }
            } else {
                countdownElement.textContent = "00:00";
            }
        }
    });
}

// Sync Data for Both Benches
syncBench("civicBench", civicBench, civicCountdown);
syncBench("doctorsBench", doctorsBench, doctorsCountdown);
