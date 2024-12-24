// Variables for game state
let currentLevel = 0;
let score = 0;
let totalQuestions = 10; // Example number of questions
let timeTaken = 0; // Time taken in milliseconds
let timer;
let timeLeft = 30;
let usedMoreTime = false;
let answeredQuestions = 0; // Track answered questions (skipped ones don't count)

// List of levels and answers
const levels = [
    { number: 0, value: "0", name: "The Lobby", alternate: "Tutorial Level" },
    { number: 1, value: "1", name: "Habitable Zone", alternate: "Lurking Danger" },
    { number: 2, value: "2", name: "Pipe Dreams" },
    { number: 3, value: "3", name: "Electrical Station", alternate: "The Electrical Station" },
    { number: 4, value: "4", name: "Abandoned Office" },
    { number: 5, value: "5", name: "Terror Hotel" },
    { number: 6, value: "6", name: "Lights Out" },
    { number: 7, value: "7", name: "Thalassophobia" },
    { number: 8, value: "8", name: "Cave System" },
    { number: 9, value: "9", name: "Darkened Suburbans", alternate: "The Suburbs" },
    { number: 10, value: "10", name: "Field of Wheat", alternate: "The Bumper Crop" },
    { number: 11, value: "11", name: "Endless City", alternate: "Infinite City" },
    { number: 12, value: "12", name: "Matrix" },
    { number: 13, value: "13", name: "The Infinite Apartments" },
    { number: 14, value: "14 [DELETED]", name: "Military Hospital", alternate: "The Military Hospital" },
    { number: 15, value: "14", name: "Paradise" },
    { number: 16, value: "15", name: "Futuristic Halls" },
    { number: 17, value: "16", name: "Altered Topography" },
    { number: 18, value: "17", name: "The Carrier" },
    { number: 19, value: "18", name: "Memories" },
    { number: 20, value: "!", name: "Run for Your Life" },
    { number: 21, value: "Fun", name: "False Joy", alternate: "Falsum Gaudium" },
    { number: 22, value: "-!", name: "The Reversed Hospital" },
    { number: 23, value: "19", name: "Attic Floorboards" },
    { number: 24, value: "20", name: "Warehouse" },
    { number: 25, value: "21", name: "Numbered Doors" },
    { number: 26, value: "22", name: "Ruins Left Behind" },
    { number: 27, value: "23", name: "The Petrified Garden" },
    { number: 28, value: "24", name: "The Moon" },
    { number: 29, value: "25", name: "The Quarter Hub" },
    { number: 30, value: "26", name: "Otherworldly" },
    { number: 31, value: "27", name: "The Bunker Springs" },
    { number: 32, value: "28", name: "Stormstone Keep" },
    { number: 33, value: "29", name: "Hyperian" },
    { number: 34, value: "0.1", name: "Zenith Station" },
    { number: 35, value: "0.2", name: "Remodeled Mess" },
    { number: 36, value: "0.3", name: "The Icy Rooms" },
    { number: 37, value: "1.1", name: "Corrupt Corridor" },
    { number: 38, value: "1.5", name: "Inverted" },
    { number: 39, value: "2.1", name: "Concrete Caverns", alternate: "The Concrete Caverns" },
    { number: 40, value: "2.2", name: "Constant Buzz" },
    { number: 41, value: "3.1", name: "Space Complex" },
    { number: 42, value: "4.1", name: "Whispering Halls" },
    { number: 43, value: "4.2", name: "Parking Lot of Fog" },
    { number: 44, value: "4.3", name: "Decayed" },
    { number: 45, value: "4.4", name: "Crazed State" },
    { number: 46, value: "5.1", name: "GRAND OPENING OF THE TERROR HOTEL CASINO" },
    { number: 47, value: "6.1", name: "The Snackrooms" },
    { number: 48, value: "6.2", name: "The Neon Maze" },
    { number: 49, value: "6.3", name: "Vantablack" },
    { number: 50, value: "7.2", name: "The Titanic Titanic" },
    { number: 51, value: "7.9", name: "Surface Caves" },
    { number: 52, value: "8.1", name: "The Dead Caverns" },
    { number: 53, value: "9.1", name: "Can we pretend that a meteor destroyed the Crimison Forest?" },
    { number: 54, value: "9.2", name: "Black Market" },
    { number: 55, value: "10.1", name: "Corpse Lake" },
    { number: 56, value: "/ Asset 11.1", name: "Private Enterprise" },
    { number: 57, value: "11.3", name: "The Red Light District" },
    { number: 58, value: "12.1", name: "The Light Switch" },
    { number: 59, value: "36.1", name: "The Plane" },
    { number: 60, value: "30", name: "Shifted Beyond Reality" },
    { number: 61, value: "31", name: "Roller Rink" },
    { number: 62, value: "32", name: "Forest of the Skeleton Queen" },
    { number: 63, value: "33", name: "The Infinite Mall" },
    { number: 64, value: "34", name: "Sewer System" },
    { number: 65, value: "35", name: "An Empty Car Park" },
    { number: 66, value: "36", name: "Airport" },
    { number: 67, value: "37", name: "Welcome To The Jungle" },
    // Add more levels as needed
];

// DOM Elements
const levelTitle = document.getElementById("level-title");
const inputDisplay = document.getElementById("input-display");
const timeLeftDisplay = document.getElementById("time-left");
const timerDisplay = document.getElementById("timer");
const scoreDisplay = document.getElementById("score");
const endScreen = document.getElementById("end-screen"); // End screen element

// Set up the first level
function loadLevel() {
    levelTitle.textContent = `Level ${levels[currentLevel].value}:`;
    inputDisplay.innerHTML = ""; // Clear input display
    timeLeft = 30;
    updateTimeLeft();
    startTimer();
}

// Update time left
function updateTimeLeft() {
    const roundedTimeLeft = Math.ceil(timeLeft); // Round up to nearest second
    timeLeftDisplay.textContent = `You have ${roundedTimeLeft} second${roundedTimeLeft !== 1 ? "(s)" : ""} left.`;
}

// Start the countdown timer
function startTimer() {
    clearInterval(timer);
    timer = setInterval(() => {
        timeTaken += 10; // Increment time taken by 10ms
        timeLeft -= 0.01; // Decrement time left by 0.01s
        if (timeLeft <= 0) {
            timeLeft = 0;
            clearInterval(timer);
            skipQuestion();
        }
        updateTimerDisplay();
        updateTimeLeft();
    }, 10);
}

// Update the overall time taken display
function updateTimerDisplay() {
    const seconds = Math.floor(timeTaken / 1000);
    const milliseconds = Math.floor(timeTaken % 1000 / 10); // Keep 2 decimal places
    timerDisplay.textContent = `Time taken: ${seconds}.${milliseconds.toString().padStart(2, "0")}s`;
}

// Skip the current question
function skipQuestion() {
    currentLevel++;
    if (currentLevel < levels.length) {
        loadLevel();
    } else {
        endQuiz();
    }
}

// End the quiz
// End the quiz
function endQuiz() {
    // Hide all game elements
    const gameElements = [
        levelTitle,
        inputDisplay,
        timeLeftDisplay,
        timerDisplay,
        scoreDisplay,
        document.getElementById("skip-button"),
        document.getElementById("done-button"),
        document.getElementById("more-time-button"),
        document.getElementById("give-up-button"),
        document.getElementById("input-wrapper")
    ];

    gameElements.forEach(element => {
        element.style.display = "none"; // Hide the game elements
    });

    // Show the end screen
    endScreen.style.display = "block"; // Show the end screen

    // Display the final score and time on the end screen
    const finalScore = `${score}/${answeredQuestions}`; // Only count answered questions
    const finalTime = (timeTaken / 1000).toFixed(2); // Time in seconds
    document.getElementById("final-score").textContent = `Your score: ${finalScore}`;
    document.getElementById("final-time").textContent = `Time taken: ${finalTime}s`;
}

// Capture keypresses for the custom input
// Capture keypresses for the custom input
document.addEventListener("keydown", (event) => {
    const key = event.key;

    // Handle Backspace
    if (key === "Backspace") {
        // Check if the last character is a non-breaking space
        if (inputDisplay.innerHTML.slice(-6) === "&nbsp;") {
            inputDisplay.innerHTML = inputDisplay.innerHTML.slice(0, -6); // Remove last non-breaking space
        } else {
            inputDisplay.innerHTML = inputDisplay.innerHTML.slice(0, -1); // Remove the last character
        }
    } else if (key === "Enter") {
        // Trigger the "Done" button functionality
        document.getElementById("done-button").click();
    } else if (key.length === 1) {
        // Append characters (convert space to non-breaking space)
        inputDisplay.innerHTML += key === " " ? "&nbsp;" : key;
    }
});

// Event listeners
document.getElementById("skip-button").addEventListener("click", skipQuestion);
document.getElementById("done-button").addEventListener("click", () => {
    const input = inputDisplay.textContent.trim().replace(/\u00A0/g, " "); // Convert non-breaking spaces back to normal spaces
    const level = levels[currentLevel];
    if (input === level.name || input === level.alternate) {
        score++;
    }
    answeredQuestions++; // Count this as an answered question (even if wrong)
    scoreDisplay.textContent = `${score}/${answeredQuestions}`; // Update score display
    skipQuestion();
});

// DOM Element for the More Time button
const moreTimeButton = document.getElementById("more-time-button");

// Event listener for More Time button
moreTimeButton.addEventListener("click", () => {
    // Add 30 seconds to the timeLeft
    if (!usedMoreTime) {  // Check if it's been used before
        timeLeft += 30;
        updateTimeLeft();  // Update time left display
        usedMoreTime = true;  // Mark it as used
        moreTimeButton.disabled = true;  // Disable the button after use
    }
});

// Function to update time left display
function updateTimeLeft() {
    const roundedTimeLeft = Math.ceil(timeLeft); // Round up to nearest second
    timeLeftDisplay.textContent = `You have ${roundedTimeLeft} second${roundedTimeLeft !== 1 ? "s" : ""} left.`;
}

const giveUpButton = document.getElementById("give-up-button");

// Event listener for Give Up button
giveUpButton.addEventListener("click", () => {
    endQuiz();  // End the quiz immediately
});

// Initialize the quiz
loadLevel();