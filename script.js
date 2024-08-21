let intervals = {};

function selectPC(pc) {
    const otherPc = pc === 'chuckle' ? 'giggle' : 'chuckle';
    const selectedPcBox = document.getElementById(`${pc}-pc`);
    const otherPcBox = document.getElementById(`${otherPc}-pc`);

    const userName = document.getElementById(`${pc}-user`).value;
    const selectedTime = document.getElementById(`${pc}-time`).value;
    const statusElement = document.getElementById(`${pc}-status`);
    const timerElement = document.getElementById(`${pc}-timer`);

    if (!userName) {
        alert('Please enter your name before selecting a PC.');
        return;
    }

    clearInterval(intervals[pc]);  // Clear any existing interval for this PC

    const remainingTime = parseInt(selectedTime);
    const endTime = Date.now() + remainingTime * 1000;

    // Save the details to localStorage
    localStorage.setItem(`${pc}-user`, userName);
    localStorage.setItem(`${pc}-endTime`, endTime);

    selectedPcBox.classList.add('selected');
    otherPcBox.classList.remove('selected');

    statusElement.textContent = `Status: ${userName} is using this PC`;

    startTimer(pc, remainingTime, endTime);

    // Alert others to use the other PC
    alert(`Please use the ${otherPc.charAt(0).toUpperCase() + otherPc.slice(1)} PC if ${pc.charAt(0).toUpperCase() + pc.slice(1)} PC is in use.`);
}

function startTimer(pc, remainingTime, endTime) {
    const statusElement = document.getElementById(`${pc}-status`);
    const timerElement = document.getElementById(`${pc}-timer`);

    intervals[pc] = setInterval(() => {
        const timeLeft = Math.max(0, Math.floor((endTime - Date.now()) / 1000));

        if (timeLeft > 0) {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timerElement.textContent = `Time left: ${minutes}m ${seconds}s`;
        } else {
            clearInterval(intervals[pc]);
            localStorage.removeItem(`${pc}-user`);
            localStorage.removeItem(`${pc}-endTime`);
            statusElement.textContent = 'Status: Free';
            document.getElementById(`${pc}-pc`).classList.remove('selected');
            timerElement.textContent = '';
            document.getElementById(`${pc}-user`).value = '';
        }
    }, 1000);
}

function clearPC(pc) {
    if (confirm(`Are you sure you want to clear the ${pc.charAt(0).toUpperCase() + pc.slice(1)} PC?`)) {
        clearInterval(intervals[pc]);

        // Clear the data from localStorage
        localStorage.removeItem(`${pc}-user`);
        localStorage.removeItem(`${pc}-endTime`);

        const pcBox = document.getElementById(`${pc}-pc`);
        const statusElement = document.getElementById(`${pc}-status`);
        const timerElement = document.getElementById(`${pc}-timer`);
        
        pcBox.classList.remove('selected');
        statusElement.textContent = 'Status: Free';
        timerElement.textContent = '';
        document.getElementById(`${pc}-user`).value = '';
    }
}

function loadFromStorage() {
    ['chuckle', 'giggle'].forEach(pc => {
        const userName = localStorage.getItem(`${pc}-user`);
        const endTime = parseInt(localStorage.getItem(`${pc}-endTime`), 10);
        
        if (userName && endTime && endTime > Date.now()) {
            const remainingTime = Math.floor((endTime - Date.now()) / 1000);
            document.getElementById(`${pc}-user`).value = userName;
            document.getElementById(`${pc}-pc`).classList.add('selected');
            document.getElementById(`${pc}-status`).textContent = `Status: ${userName} is using this PC`;
            startTimer(pc, remainingTime, endTime);
        }
    });
}

// Load data from localStorage when the page is loaded
window.onload = loadFromStorage;
