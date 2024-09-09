let intervals = {};

// Connect to WebSocket (Ensure your server supports WebSocket)
const ws = new WebSocket(`wss://${window.location.host}`);

ws.onmessage = function(event) {
    const pcState = JSON.parse(event.data);
    updateUI(pcState);
};

function updateUI(pcState) {
    ['chuckle', 'giggle'].forEach(pc => {
        const { user, status, endTime } = pcState[pc];
        const remainingTime = endTime ? Math.max(0, Math.floor((endTime - Date.now()) / 1000)) : 0;
        const statusText = user ? `Status: ${user} is using this PC` : 'Status: Free';
        
        document.getElementById(`${pc}-user`).value = user;
        document.getElementById(`${pc}-status`).textContent = statusText;
        
        if (user) {
            startTimer(pc, remainingTime, endTime);
            document.getElementById(`${pc}-pc`).classList.add('selected');
        } else {
            clearInterval(intervals[pc]);
            document.getElementById(`${pc}-pc`).classList.remove('selected');
            document.getElementById(`${pc}-timer`).textContent = '';
        }
    });
}


function selectPC(pc) {
    const otherPc = pc === 'chuckle' ? 'giggle' : 'chuckle';
    const userName = document.getElementById(`${pc}-user`).value;
    const selectedTime = parseInt(document.getElementById(`${pc}-time`).value);
    const statusElement = document.getElementById(`${pc}-status`);

    if (!userName) {
        alert('Please enter your name before selecting a PC.');
        return;
    }

    const remainingTime = selectedTime; // Time in seconds
    const endTime = Date.now() + remainingTime * 1000; // End time in milliseconds

    // Update the server with the new PC state
    fetch('/update', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ pc, user: userName, status: 'In Use', remainingTime, endTime })
    });

    statusElement.textContent = `Status: ${userName} is using this PC`;
    document.getElementById(`${pc}-pc`).classList.add('selected');
    document.getElementById(`${otherPc}-pc`).classList.remove('selected');
}

function startTimer(pc, remainingTime, endTime) {
    const timerElement = document.getElementById(`${pc}-timer`);

    intervals[pc] = setInterval(() => {
        const timeLeft = Math.max(0, Math.floor((endTime - Date.now()) / 1000));

        if (timeLeft > 0) {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timerElement.textContent = `Time left: ${minutes}m ${seconds}s`;
        } else {
            clearInterval(intervals[pc]);
            fetch('/clear', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ pc })
            });
        }
    }, 1000);
}

function clearPC(pc) {
    if (confirm(`Are you sure you want to clear the ${pc.charAt(0).toUpperCase() + pc.slice(1)} PC?`)) {
        clearInterval(intervals[pc]);
        fetch('/clear', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ pc })
        });
    }
}

// Initial load from server
function loadFromServer() {
    fetch('/status')
        .then(response => response.json())
        .then(pcState => {
            updateUI(pcState);
        });
}

// Load data from server when the page is loaded
window.onload = loadFromServer;
