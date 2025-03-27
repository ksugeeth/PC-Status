// Import and Initialize Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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

// Get Elements
const civicBench = document.getElementById("civicBench");
const doctorsBench = document.getElementById("doctorsBench");
const civicNameInput = document.getElementById("civicName");
const doctorsNameInput = document.getElementById("doctorsName");
const civicReset = document.getElementById("civicReset");
const doctorsReset = document.getElementById("doctorsReset");
const adminPopup = document.getElementById("adminPopup");
const adminIdInput = document.getElementById("adminId");
const adminPassInput = document.getElementById("adminPass");
const submitAdmin = document.getElementById("submitAdmin");
const closePopup = document.getElementById("closePopup");

// Store secret codes locally
let civicSecretCode = localStorage.getItem("civicSecretCode") || null;
let doctorsSecretCode = localStorage.getItem("doctorsSecretCode") || null;

// Generate a random 6-digit code
function generateSecretCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Toggle Selection and Update Firebase
function toggleSelection(benchName, element, nameInput, resetBtn, secretKey) {
    const isSelected = element.classList.contains("selected");
    const name = nameInput.value.trim();

    if (!isSelected) {
        if (!name) {
            alert("Please enter your name before selecting a bench!");
            return;
        }
        const secretCode = generateSecretCode();
        localStorage.setItem(secretKey, secretCode);
        set(ref(database, "benches/" + benchName), { selected: true, name: name })
            .then(() => {
                alert(`Bench selected! Your secret code is: ${secretCode}. Keep it safe to deselect.`);
                location.reload();
            })
            .catch((error) => console.error("Error updating Firebase:", error));
    } else {
        const storedCode = localStorage.getItem(secretKey);
        const userCode = prompt(`Enter your secret code to deselect ${benchName.replace("Bench", " Bench")}:`);
        if (userCode === storedCode) {
            set(ref(database, "benches/" + benchName), { selected: false, name: "" })
                .then(() => {
                    localStorage.removeItem(secretKey);
                    nameInput.value = "";
                    location.reload();
                })
                .catch((error) => console.error("Error updating Firebase:", error));
        } else {
            alert("Incorrect code! Use the reset button if you forgot your code.");
            resetBtn.style.display = "block"; // Show reset button
        }
    }
}

// Reset Functionality with Admin Popup
function setupReset(benchName, resetBtn, nameInput, secretKey) {
    resetBtn.addEventListener("click", () => {
        adminPopup.style.display = "block";
        submitAdmin.onclick = () => {
            const id = adminIdInput.value;
            const pass = adminPassInput.value;
            if (id === "admin" && pass === "123") {
                set(ref(database, "benches/" + benchName), { selected: false, name: "" })
                    .then(() => {
                        localStorage.removeItem(secretKey);
                        nameInput.value = "";
                        adminPopup.style.display = "none";
                        resetBtn.style.display = "none";
                        location.reload();
                    })
                    .catch((error) => console.error("Error updating Firebase:", error));
            } else {
                alert("Invalid admin credentials!");
            }
        };
    });
}

// Click Listeners for Selection
civicBench.addEventListener("click", () => toggleSelection("civicBench", civicBench, civicNameInput, civicReset, "civicSecretCode"));
doctorsBench.addEventListener("click", () => toggleSelection("doctorsBench", doctorsBench, doctorsNameInput, doctorsReset, "doctorsSecretCode"));

// Setup Reset Buttons
setupReset("civicBench", civicReset, civicNameInput, "civicSecretCode");
setupReset("doctorsBench", doctorsReset, doctorsNameInput, "doctorsSecretCode");

// Close Popup
closePopup.addEventListener("click", () => {
    adminPopup.style.display = "none";
});

// Sync with Firebase in Real-Time
onValue(ref(database, "benches/civicBench"), (snapshot) => {
    const data = snapshot.val();
    if (data) {
        civicBench.classList.toggle("selected", data.selected);
        civicNameInput.value = data.name || "";
    }
});

onValue(ref(database, "benches/doctorsBench"), (snapshot) => {
    const data = snapshot.val();
    if (data) {
        doctorsBench.classList.toggle("selected", data.selected);
        doctorsNameInput.value = data.name || "";
    }
});

