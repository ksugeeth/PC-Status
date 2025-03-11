// Firebase Configuration (Use your actual Firebase details)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, set, get, onValue } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

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

// Get references to UI elements
const benches = document.querySelectorAll(".bench");
const dropdowns = document.querySelectorAll("select");

// Store timers
let timers = {};

// Function to toggle bench selection
function toggleBench(benchId) {
    const bench = document.getElementById(benchId);
    const selected = bench.classList.contains("selected");

    if (selected) {
        // Deselect & stop blinking
        bench.classList.remove("selected");
        clearInterval(timers[benchId]);
        bench.style.backgroundColor = "#f0f0f0"; // Reset background
        set(ref(database, `benches/${benchId}`), { selected: false, timer: 0 });
    } else {
        // Select & start blinking
        bench.classList.add("selected");
        let isGreen = false;
        timers[benchId] = setInterval(() => {
            isGreen = !isGreen;
            bench.style.backgroundColor = isGreen ? "lightgreen" : "#f0f0f0";
        }, 1000);

        // Get selected time
        const timeDropdown = document.querySelector(`#${benchId}Timer`);
        const selectedTime = parseInt(timeDropdown.value, 10); // Convert minutes to number
        startTimer(benchId, selectedTime * 60); // Convert to seconds
        set(ref(database, `benches/${benchId}`), { selected: true, timer: selectedTime });
    }
}

// Function to start a timer
function startTimer(benchId, duration) {
    const timerDisplay = document.querySelector(`#${benchId} .timer`);
    let timeLeft = duration;

    clearInterval(timers[benchId]); // Clear any existing timer
    timers[benchId] = setInterval(() => {
        let minutes = Math.floor(timeLeft / 60);
        let seconds = timeLeft % 60;
        timerDisplay.textContent = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
        
        if (timeLeft <= 0) {
            clearInterval(timers[benchId]);
            document.getElementById(benchId).classList.remove("selected");
        } else {
            timeLeft--;
        }
    }, 1000);
}

// Attach event listeners to benches
benches.forEach(bench => {
    bench.addEventListener("click", function(event) {
        if (event.target.tagName !== "SELECT") { // Ignore clicks on dropdown
            toggleBench(this.id);
        }
    });
});

// Prevent clicks inside the timer dropdown from triggering selection
dropdowns.forEach(dropdown => {
    dropdown.addEventListener("click", function(event) {
        event.stopPropagation();
    });
});

// Sync with Firebase to update UI when data changes
onValue(ref(database, "benches"), (snapshot) => {
    if (snapshot.exists()) {
        const data = snapshot.val();
        Object.keys(data).forEach(benchId => {
            const bench = document.getElementById(benchId);
            const timerDisplay = document.querySelector(`#${benchId} .timer`);
            if (data[benchId].selected) {
                bench.classList.add("selected");
                startTimer(benchId, data[benchId].timer * 60);
            } else {
                bench.classList.remove("selected");
                timerDisplay.textContent = "0:00";
            }
        });
    }
});
