// Import and Initialize Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, onValue, push, onChildAdded } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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

// Get Elements (Existing)
const civicTestBench1 = document.getElementById("civicTestBench1");
const doctorsBench = document.getElementById("doctorsBench");
const sovdDomainBench = document.getElementById("sovdDomainBench");
const civicTestBench2 = document.getElementById("civicTestBench2");

const civicTest1NameInput = document.getElementById("civicTest1Name");
const doctorsNameInput = document.getElementById("doctorsName");
const sovdDomainNameInput = document.getElementById("sovdDomainName");
const civicTest2NameInput = document.getElementById("civicTest2Name");

const civicTest1CodeDisplay = document.getElementById("civicTest1Code");
const doctorsCodeDisplay = document.getElementById("doctorsCode");
const sovdDomainCodeDisplay = document.getElementById("sovdDomainCode");
const civicTest2CodeDisplay = document.getElementById("civicTest2Code");

const civicTest1Reset = document.getElementById("civicTest1Reset");
const doctorsReset = document.getElementById("doctorsReset");
const sovdDomainReset = document.getElementById("sovdDomainReset");
const civicTest2Reset = document.getElementById("civicTest2Reset");

const adminPopup = document.getElementById("adminPopup");
const adminIdInput = document.getElementById("adminId");
const adminPassInput = document.getElementById("adminPass");
const submitAdmin = document.getElementById("submitAdmin");
const closePopup = document.getElementById("closePopup");

const historyBtn = document.getElementById("historyBtn");
const historyPopup = document.getElementById("historyPopup");
const historyTableBody = document.querySelector("#historyTable tbody");
const closeHistoryPopup = document.getElementById("closeHistoryPopup");

// Chat Elements
const chatPopup = document.getElementById("chatPopup");
const chatBenchName = document.getElementById("chatBenchName");
const chatMessages = document.getElementById("chatMessages");
const typingIndicator = document.getElementById("typingIndicator");
const chatInput = document.getElementById("chatInput");
const sendChat = document.getElementById("sendChat");
const closeChatPopup = document.getElementById("closeChatPopup");

// Store secret codes locally (Existing)
let civicTest1SecretCode = localStorage.getItem("civicTest1SecretCode") || null;
let doctorsSecretCode = localStorage.getItem("doctorsSecretCode") || null;
let sovdDomainSecretCode = localStorage.getItem("sovdDomainSecretCode") || null;
let civicTest2SecretCode = localStorage.getItem("civicTest2SecretCode") || null;

// Generate a random 6-digit code (Existing)
function generateSecretCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Display secret code for the user (Existing)
function displaySecretCode(codeDisplay, code, benchName) {
    codeDisplay.style.display = "block";
    codeDisplay.textContent = `Your Secret Code: ${code}`;
    // Add chat button to secret code display
    const chatBtn = document.createElement("button");
    chatBtn.textContent = "Chat";
    chatBtn.className = "chat-btn";
    chatBtn.onclick = () => openChat(benchName, code);
    codeDisplay.appendChild(chatBtn);
}

// Format timestamp to readable date/time (Existing)
function formatDateTime(timestamp) {
    return new Date(timestamp).toLocaleString();
}

// Calculate usage time in minutes (Existing)
function calculateUsageTime(loginTime, logoutTime) {
    const diffMs = new Date(logoutTime) - new Date(loginTime);
    Chconst minutes = Math.round(diffMs / 60000);
    return `${minutes} minutes`;
}

// Save usage history to Firebase (Existing)
function saveUsageHistory(benchName, userName, loginTime, logoutTime) {
    const historyRef = ref(database, "usageHistory");
    const newEntry = {
        userName,
        benchName,
        loginTime: loginTime,
        logoutTime: logoutTime,
        dateTime: new Date(loginTime).toISOString()
    };
    push(historyRef, newEntry);
}

// Toggle Selection and Update Firebase (Existing)
function toggleSelection(benchName, element, nameInput, codeDisplay, resetBtn, secretKey) {
    const isSelected = element.classList.contains("selected");
    const name = nameInput.value.trim();

    if (!isSelected) {
        if (!name) {
            alert("Please enter your name before selecting a bench!");
            return;
        }
        const secretCode = generateSecretCode();
        const loginTime = new Date().toISOString();
        localStorage.setItem(secretKey, secretCode);
        set(ref(database, "benches/" + benchName), { 
            selected: true, 
            name: name,
            loginTime: loginTime
        })
            .then(() => {
                displaySecretCode(codeDisplay, secretCode, benchName);
                location.reload();
            })
            .catch((error) => console.error("Error updating Firebase:", error));
    } else {
        const storedCode = localStorage.getItem(secretKey);
        const userCode = prompt(`Enter your secret code to deselect ${benchName.replace("Bench", " Bench")}:`);
        if (userCode === storedCode) {
            const logoutTime = new Date().toISOString();
            onValue(ref(database, "benches/" + benchName), (snapshot) => {
                const data = snapshot.val();
                if (data && data.loginTime) {
                    saveUsageHistory(benchName, name, data.loginTime, logoutTime);
                }
            }, { onlyOnce: true });
            
            set(ref(database, "benches/" + benchName), { 
                selected: false, 
                name: "",
                loginTime: null 
            })
                .then(() => {
                    localStorage.removeItem(secretKey);
                    codeDisplay.style.display = "none";
                    nameInput.value = "";
                    location.reload();
                })
                .catch((error) => console.error("Error updating Firebase:", error));
        } else {
            alert("Incorrect code! Use the reset button if you forgot your code.");
            resetBtn.style.display = "block";
        }
    }
}

// Reset Functionality with Admin Popup (Existing)
function setupReset(benchName, resetBtn, nameInput, codeDisplay, secretKey) {
    resetBtn.addEventListener("click", () => {
        adminPopup.style.display = "block";
        submitAdmin.onclick = () => {
            const id = adminIdInput.value;
            const pass = adminPassInput.value;
            if (id === "admin" && pass === "123") {
                const logoutTime = new Date().toISOString();
                onValue(ref(database, "benches/" + benchName), (snapshot) => {
                    const data = snapshot.val();
                    if (data && data.loginTime && data.name) {
                        saveUsageHistory(benchName, data.name, data.loginTime, logoutTime);
                    }
                }, { onlyOnce: true });

                set(ref(database, "benches/" + benchName), { 
                    selected: false, 
                    name: "",
                    loginTime: null 
                })
                    .then(() => {
                        localStorage.removeItem(secretKey);
                        codeDisplay.style.display = "none";
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

// Chat Functionality
function openChat(benchName, secretCode) {
    const storedCode = localStorage.getItem(getSecretKey(benchName));
    if (secretCode !== storedCode) {
        alert("You need the active secret code to access this chat!");
        return;
    }

    chatBenchName.textContent = `${benchName.replace("Bench", " Bench")} Chat`;
    chatPopup.style.display = "flex";
    chatMessages.innerHTML = "";
    chatInput.value = "";

    const chatRef = ref(database, `benches/${benchName}/chat`);
    onChildAdded(chatRef, (snapshot) => {
        const message = snapshot.val();
        displayMessage(message.userName, message.text);
    });

    let typingTimeout;
    chatInput.addEventListener("input", () => {
        clearTimeout(typingTimeout);
        typingIndicator.style.display = "block";
        typingTimeout = setTimeout(() => {
            typingIndicator.style.display = "none";
        }, 1000);
    });

    sendChat.onclick = () => sendMessage(benchName, secretCode);
    chatInput.onkeypress = (e) => {
        if (e.key === "Enter") sendMessage(benchName, secretCode);
    };
}

function sendMessage(benchName, secretCode) {
    const text = chatInput.value.trim();
    if (!text) return;

    const nameInput = getNameInput(benchName);
    const userName = nameInput.value.trim();
    const chatRef = ref(database, `benches/${benchName}/chat`);
    push(chatRef, {
        userName,
        text,
        timestamp: new Date().toISOString()
    }).then(() => {
        chatInput.value = "";
    }).catch((error) => console.error("Error sending message:", error));
}

function displayMessage(userName, text) {
    const messageDiv = document.createElement("div");
    messageDiv.className = "chat-message";

    const avatar = document.createElement("img");
    avatar.src = `https://www.gravatar.com/avatar/${md5(userName.toLowerCase())}?d=identicon&s=30`;
    avatar.alt = `${userName}'s avatar`;

    const content = document.createElement("div");
    content.className = "message-content";
    content.textContent = `${userName}: ${text}`;

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Helper Functions for Chat
function getSecretKey(benchName) {
    const map = {
        "civicTestBench1": "civicTest1SecretCode",
        "doctorsBench": "doctorsSecretCode",
        "sovdDomainBench": "sovdDomainSecretCode",
        "civicTestBench2": "civicTest2SecretCode"
    };
    return map[benchName];
}

function getNameInput(benchName) {
    const map = {
        "civicTestBench1": civicTest1NameInput,
        "doctorsBench": doctorsNameInput,
        "sovdDomainBench": sovdDomainNameInput,
        "civicTestBench2": civicTest2NameInput
    };
    return map[benchName];
}

// Click Listeners for Selection (Existing)
civicTestBench1.addEventListener("click", () => toggleSelection("civicTestBench1", civicTestBench1, civicTest1NameInput, civicTest1CodeDisplay, civicTest1Reset, "civicTest1SecretCode"));
doctorsBench.addEventListener("click", () => toggleSelection("doctorsBench", doctorsBench, doctorsNameInput, doctorsCodeDisplay, doctorsReset, "doctorsSecretCode"));
sovdDomainBench.addEventListener("click", () => toggleSelection("sovdDomainBench", sovdDomainBench, sovdDomainNameInput, sovdDomainCodeDisplay, sovdDomainReset, "sovdDomainSecretCode"));
civicTestBench2.addEventListener("click", () => toggleSelection("civicTestBench2", civicTestBench2, civicTest2NameInput, civicTest2CodeDisplay, civicTest2Reset, "civicTest2SecretCode"));

// Setup Reset Buttons (Existing)
setupReset("civicTestBench1", civicTest1Reset, civicTest1NameInput, civicTest1CodeDisplay, "civicTest1SecretCode");
setupReset("doctorsBench", doctorsReset, doctorsNameInput, doctorsCodeDisplay, "doctorsSecretCode");
setupReset("sovdDomainBench", sovdDomainReset, sovdDomainNameInput, sovdDomainCodeDisplay, "sovdDomainSecretCode");
setupReset("civicTestBench2", civicTest2Reset, civicTest2NameInput, civicTest2CodeDisplay, "civicTest2SecretCode");

// Close Popup (Existing)
closePopup.addEventListener("click", () => {
    adminPopup.style.display = "none";
});

// Sync with Firebase and Show Secret Code if Exists (Existing)
onValue(ref(database, "benches/civicTestBench1"), (snapshot) => {
    const data = snapshot.val();
    if (data) {
        civicTestBench1.classList.toggle("selected", data.selected);
        civicTest1NameInput.value = data.name || "";
        if (civicTest1SecretCode && data.selected) {
            displaySecretCode(civicTest1CodeDisplay, civicTest1SecretCode, "civicTestBench1");
        }
    }
});

onValue(ref(database, "benches/doctorsBench"), (snapshot) => {
    const data = snapshot.val();
    if (data) {
        doctorsBench.classList.toggle("selected", data.selected);
        doctorsNameInput.value = data.name || "";
        if (doctorsSecretCode && data.selected) {
            displaySecretCode(doctorsCodeDisplay, doctorsSecretCode, "doctorsBench");
        }
    }
});

onValue(ref(database, "benches/sovdDomainBench"), (snapshot) => {
    const data = snapshot.val();
    if (data) {
        sovdDomainBench.classList.toggle("selected", data.selected);
        sovdDomainNameInput.value = data.name || "";
        if (sovdDomainSecretCode && data.selected) {
            displaySecretCode(sovdDomainCodeDisplay, sovdDomainSecretCode, "sovdDomainBench");
        }
    }
});

onValue(ref(database, "benches/civicTestBench2"), (snapshot) => {
    const data = snapshot.val();
    if (data) {
        civicTestBench2.classList.toggle("selected", data.selected);
        civicTest2NameInput.value = data.name || "";
        if (civicTest2SecretCode && data.selected) {
            displaySecretCode(civicTest2CodeDisplay, civicTest2SecretCode, "civicTestBench2");
        }
    }
});

// History Functionality (Existing)
historyBtn.addEventListener("click", () => {
    historyPopup.style.display = "flex";
    historyTableBody.innerHTML = "";
    
    onValue(ref(database, "usageHistory"), (snapshot) => {
        const data = snapshot.val();
        if (data) {
            Object.values(data).forEach(entry => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${entry.userName}</td>
                    <td>${entry.benchName.replace("Bench", " Bench")}</td>
                    <td>${formatDateTime(entry.loginTime)}</td>
                    <td>${formatDateTime(entry.logoutTime)}</td>
                    <td>${formatDateTime(entry.dateTime)}</td>
                    <td>${calculateUsageTime(entry.loginTime, entry.logoutTime)}</td>
                `;
                historyTableBody.appendChild(row);
            });
        }
    }, { onlyOnce: true });
});

closeHistoryPopup.addEventListener("click", () => {
    historyPopup.style.display = "none";
});

// Close Chat Popup
closeChatPopup.addEventListener("click", () => {
    chatPopup.style.display = "none";
});

// MD5 for Gravatar (Simple Implementation - Include a Library or Use This)
function md5(str) {
    // For simplicity, this is a placeholder. Use a proper MD5 library like md5.js for production.
    return str.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0).toString(16);
}
