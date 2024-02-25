// Variables
let timer;
let display = document.getElementById('timerDisplay');
let max_milliseconds = 3 * 60 * 1000; // Default time: 3 minutes
let milliseconds = 0;
let isRunning = false;
let lastUpdateTime = performance.now();
let currentThemeIndex = 0;
const themes = ['yellow-black', 'white-red', 'white-blue', 'yellow-green'];
const houses = ['GREYJOY','BOLTON','ARRYN','TYRELL'];

// Load audio files
let penaltySound = new Audio('sounds/buzzer.mp3');
let gameOverSound = new Audio('sounds/game over.mp3');
let beepSound = new Audio('sounds/beep.mp3');
let correctSound = new Audio('sounds/correct.mp3');

// Initialize the color theme to the first one
switchTheme(0);

// Display the initial time
updateDisplay();

// Keydown event listener
document.addEventListener('keydown', function(event) {
    if (event.code === 'Space') {
        toggleTimer();
    } else if (event.key === 'p' || event.key === 'P') {
        pulseRed(1000);
        adjustTime(5000); // Add 5 seconds
        penaltySound.play();
    } else if (event.key === 's' || event.key === 'S') {
        openCustomTimeModal();
    } else if (event.key === 'r' || event.key === 'R') {
        resetTimer();
    } else if (event.key === 'ArrowLeft') {
        switchTheme(-1); // Switch to the previous theme
    } else if (event.key === 'ArrowRight') {
        switchTheme(1); // Switch to the next theme
    }
});

// Function to add the pulse-red class to the timer display
function pulseRed(duration) {
    display.classList.add('pulse-red');

    // Remove the pulse-red class after 1 second
    setTimeout(() => {
        display.classList.remove('pulse-red');
    }, duration);
}

function toggleTimer() {
    isRunning = !isRunning; // Toggle the isRunning variable
    if (isRunning) {
        lastUpdateTime = performance.now();
        updateTime(); // Start the timer
    }
    else {
        correctSound.play();
        console.log(`${new Date().toLocaleTimeString()} - ${houses[currentThemeIndex]} ANSWERED at ${display.textContent}`)
    }
}

// Function to update the time dynamically
function updateTime() {
    let now = performance.now();
    let deltaTime = now - lastUpdateTime;
    lastUpdateTime = now;

    if (isRunning) {
        milliseconds += deltaTime;
        if (milliseconds >= max_milliseconds) {
            milliseconds = max_milliseconds; // Limit to 3 minutes
            isRunning = false; // Stop the timer
            pulseRed(3000);
            gameOverSound.play();
            console.log(`${new Date().toLocaleTimeString()} - ${houses[currentThemeIndex]} UNABLE TO ANSWER`)
        }
    }

    updateDisplay();

    if (isRunning) {
        requestAnimationFrame(updateTime);

        // Play beep sound if a second has passed
        if (Math.floor(milliseconds / 1000) !== Math.floor((milliseconds - deltaTime) / 1000)) {
            beepSound.play();
        }
    }
}

// Function to update the display
function updateDisplay() {
    let minutes = Math.floor(milliseconds / (60 * 1000));
    let seconds = Math.floor((milliseconds % (60 * 1000)) / 1000);
    let millisecondsRemainder = milliseconds % 1000;
    let millisecondsDisplay = String(Math.trunc(millisecondsRemainder)).padStart(3, '0').slice(0, 2);

    display.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${millisecondsDisplay}`;
}

// Function to adjust the time by a specified number of milliseconds
function adjustTime(amount) {
    milliseconds += amount;
    if (milliseconds > max_milliseconds) {
        milliseconds = max_milliseconds;
    }
    updateDisplay();
}

// Function to reset the timer
function resetTimer() {
    clearInterval(timer);
    isRunning = false;
    milliseconds = 0; // Reset to 0
    updateDisplay();
}

// Function to open the custom time modal
function openCustomTimeModal() {
    let modal = document.getElementById('customTimeModal');
    let minutesInput = document.getElementById('customMinutes');
    let secondsInput = document.getElementById('customSeconds');

    modal.style.display = 'block';

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };

    // Close modal when close button is clicked
    let closeBtn = document.querySelector('.close');
    closeBtn.onclick = function() {
        modal.style.display = 'none';
    };

    // Set custom time when "Set Time" button is clicked
    let setCustomTimeBtn = document.getElementById('setCustomTime');
    setCustomTimeBtn.onclick = function() {
        let customMinutes = parseInt(minutesInput.value) || 0;
        let customSeconds = parseInt(secondsInput.value) || 0;
        max_milliseconds = (customMinutes * 60 + customSeconds) * 1000;
        resetTimer();
        updateDisplay();
        modal.style.display = 'none';
    };

    // Close modal when Escape key is pressed
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            modal.style.display = 'none';
        }
    });
}

// Function to switch the color theme
function switchTheme(direction) {
    currentThemeIndex = (currentThemeIndex + direction + themes.length) % themes.length;
    document.body.className = themes[currentThemeIndex];
    document.getElementById("houseNameDisplay").innerHTML = `HOUSE OF ${houses[currentThemeIndex]}`;
}