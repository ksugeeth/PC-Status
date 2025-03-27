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

// Toggle Selection and Update Firebase
function toggleSelection(benchName, element, nameInput) {
    const isSelected = element.classList.contains("selected");
    const name = nameInput.value.trim();

    if (!isSelected && !name) {
        alert("Please enter your name before selecting a bench!");
        return;
    }

    if (isSelected) {
        if (confirm(`Deselect ${benchName.replace("Bench", " Bench")}?`)) {
            set(ref(database, "benches/" + benchName), { selected: false, name: "" })
                .then(() => {
                    nameInput.value = "";
                    location.reload();
                })
                .catch((error) => console.error("Error updating Firebase:", error));
        }
    } else {
        set(ref(database, "benches/" + benchName), { selected: true, name: name })
            .then(() => location.reload())
            .catch((error) => console.error("Error updating Firebase:", error));
    }
}

// Click Listeners for Selection
civicBench.addEventListener("click", function() {
    toggleSelection("civicBench", civicBench, civicNameInput);
});

doctorsBench.addEventListener("click", function() {
    toggleSelection("doctorsBench", doctorsBench, doctorsNameInput);
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
