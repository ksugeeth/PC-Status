import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyC1J_Vpdgg797e9V8WNEyP7uAuUPlWs0mc",
    authDomain: "bench-tracker-s.firebaseapp.com",
    databaseURL: "https://bench-tracker-s-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "bench-tracker-s",
    storageBucket: "bench-tracker-s.firebasestorage.app",
    messagingSenderId: "701367291259",
    appId: "1:701367291259:web:cc980155f7dc31eed681de"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const civicBench = document.getElementById("civicBench");
const doctorsBench = document.getElementById("doctorsBench");
const civicNameInput = document.getElementById("civicName");
const doctorsNameInput = document.getElementById("doctorsName");
const toast = document.getElementById("toast");

function showToast(message) {
    toast.textContent = message;
    toast.style.opacity = 1;
    toast.style.animation = "toastShow 3s forwards";
    setTimeout(() => {
        toast.style.opacity = 0;
        toast.style.animation = "";
    }, 3000);
}

function toggleSelection(benchName, element, nameInput) {
    const isSelected = element.classList.contains("selected");

    if (isSelected) {
        if (confirm(`Deselect ${benchName.replace("Bench", " Bench")}?`)) {
            set(ref(database, "benches/" + benchName), { selected: false, name: "" })
                .then(() => {
                    nameInput.value = "";
                    showToast(`${benchName.replace("Bench", " Bench")} deselected`);
                    setTimeout(() => location.reload(), 500);
                })
                .catch((error) => {
                    console.error("Error updating Firebase:", error);
                    showToast("Error occurred!");
                });
        }
    } else {
        if (!nameInput.value.trim()) {
            showToast("Please enter a name!");
            return;
        }
        set(ref(database, "benches/" + benchName), { selected: true, name: nameInput.value })
            .then(() => {
                showToast(`${benchName.replace("Bench", " Bench")} selected by ${nameInput.value}`);
                setTimeout(() => location.reload(), 500);
            })
            .catch((error) => {
                console.error("Error updating Firebase:", error);
                showToast("Error occurred!");
            });
    }
}

civicBench.addEventListener("click", () => toggleSelection("civicBench", civicBench, civicNameInput));
doctorsBench.addEventListener("click", () => toggleSelection("doctorsBench", doctorsBench, doctorsNameInput));

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
