// script.js (Updated for Email Input and Firebase Auth, with Ads and Social Buttons)

// Global Firebase objects from firebaseConfig.js
// const db = app.firestore(); // db is available globally
// const auth = app.auth(); // auth is available globally

// DOM Elements
const emailInputSection = document.getElementById('email-input-section');
const userEmailInput = document.getElementById('user-email');
const verifyEmailBtn = document.getElementById('verify-email-btn');
const emailStatusElem = document.getElementById('email-status');

const taskSection = document.getElementById('task-section');
const loggedInEmailElem = document.getElementById('logged-in-email');
const userInfoElem = document.getElementById('user-info'); // Still using this for general info, maybe hide later
const timeDisplayElem = document.getElementById('time-display');
const taskStatusElem = document.getElementById('task-status');
const returnToAppBtn = document.getElementById('return-to-app-btn');

// Social Media Buttons
const instagramBtn = document.getElementById('instagram-btn');
const telegramBtn = document.getElementById('telegram-btn');
const youtubeBtn = document.getElementById('youtube-btn');
const twitterBtn = document.getElementById('twitter-btn');

let userEmail = null; // Ab userId ki jagah email use karenge
let startTime = 0;
let timerInterval;
const REQUIRED_TIME_SECONDS = 180; // 3 minutes
let timeSpent = 0;
let isTaskCompleted = false;
let userActivityTimer;
const INACTIVITY_TIMEOUT_MS = (REQUIRED_TIME_SECONDS + 10) * 1000; // 190 seconds (190000ms)

// Adstera Smartlink URL
const ADSTERA_SMARTLINK_URL = "https://www.effectivegatecpm.com/vxwfua8sb?key=5b9770173e5b379779686461d12ed981";

// Social Media URLs
const INSTAGRAM_URL = "https://www.instagram.com/gamezone_play_earn?igsh=Mm1lM3puaXJ3bG5v";
const TELEGRAM_URL = "https://t.me/Gamezoneplay_earn";
const YOUTUBE_URL = "https://youtube.com/@jashansonii5216?si=VfxJ77TWGgH3IizJ";
const TWITTER_URL = "https://x.com/GameZone_Earn?t=Vm6pm3wBlPS--jwkytXavw&s=09";


// --- Helper Functions (Same as before) ---
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function updateTimerDisplay() {
    const remainingTime = Math.max(0, REQUIRED_TIME_SECONDS - Math.floor(timeSpent / 1000));
    timeDisplayElem.textContent = formatTime(remainingTime);
}

function startTimer() {
    startTime = Date.now();
    timerInterval = setInterval(() => {
        if (!isTaskCompleted) {
            timeSpent = Date.now() - startTime;
            updateTimerDisplay();

            if (Math.floor(timeSpent / 1000) >= REQUIRED_TIME_SECONDS) {
                clearInterval(timerInterval);
                isTaskCompleted = true;
                taskStatusElem.textContent = "Task Completed! Great job!";
                taskStatusElem.className = "status-message success";
                returnToAppBtn.style.display = 'block';
                saveTaskCompletionToFirebase();
                resetActivityTimer();
            }
        }
    }, 1000);
}

function resetActivityTimer() {
    clearTimeout(userActivityTimer);
    if (!isTaskCompleted) {
        if (timerInterval === null && timeSpent > 0) {
             startTimer();
             taskStatusElem.textContent = "Activity detected, timer resumed...";
             taskStatusElem.className = "status-message";
        }

        userActivityTimer = setTimeout(() => {
            clearInterval(timerInterval);
            timerInterval = null;
            taskStatusElem.textContent = "Are you still there? Timer paused due to inactivity.";
            taskStatusElem.className = "status-message error";
        }, INACTIVITY_TIMEOUT_MS);
    }
}

// --- NEW: Email Verification Logic ---
async function verifyUserEmail() {
    const email = userEmailInput.value.trim();
    if (!email) {
        emailStatusElem.textContent = "Please enter your email address.";
        emailStatusElem.className = "status-message error";
        return;
    }

    userEmail = email; // Store the entered email

    // For simplicity, we proceed directly assuming the user entered the correct email
    emailStatusElem.textContent = `Welcome ${email}! Starting your task...`;
    emailStatusElem.className = "status-message success";
    startTaskFlow();
}

function startTaskFlow() {
    emailInputSection.style.display = 'none'; // Hide email input
    taskSection.style.display = 'block';     // Show task content
    loggedInEmailElem.textContent = userEmail;
    startTimer();
    resetActivityTimer();
    taskStatusElem.textContent = "Task started! Please remain on this page.";
    taskStatusElem.className = "status-message";
}

// --- Updated: Save Task Completion to Firebase ---
async function saveTaskCompletionToFirebase() {
    if (!userEmail) {
        taskStatusElem.textContent = "Error: User email not found. Cannot save task completion.";
        taskStatusElem.className = "status-message error";
        console.error("User email is null. Task completion not saved.");
        return;
    }

    try {
        const taskId = "website_task_gamezone";
        const docId = `${userEmail.replace(/\./g, '_')}_${taskId}_${Date.now()}`;

        await db.collection("websiteTasks").doc(docId).set({
            userEmail: userEmail,
            taskId: taskId,
            timeSpentMs: timeSpent,
            requiredTimeSec: REQUIRED_TIME_SECONDS,
            status: "completed",
            pointsAssigned: false,
            completionTimestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log("Task completion saved to Firebase successfully!");
        taskStatusElem.textContent += "\nData saved to Firebase!";

    } catch (error) {
        console.error("Error saving task completion to Firebase:", error);
        taskStatusElem.textContent = "Error saving task completion. Please try again.";
        taskStatusElem.className = "status-message error";
    }
}

// --- Event Listeners (Same as before + new email button listener) ---
document.addEventListener('mousemove', resetActivityTimer);
document.addEventListener('keydown', resetActivityTimer);
document.addEventListener('scroll', resetActivityTimer);
document.addEventListener('click', resetActivityTimer);

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        clearInterval(timerInterval);
        timerInterval = null;
        clearTimeout(userActivityTimer);
        if (!isTaskCompleted) {
            taskStatusElem.textContent = "You left the page. Timer paused. Please return to resume.";
            taskStatusElem.className = "status-message error";
        }
    } else {
        if (!isTaskCompleted && timerInterval === null) {
            startTimer();
            resetActivityTimer();
            taskStatusElem.textContent = "Welcome back! Timer resumed.";
            taskStatusElem.className = "status-message";
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    verifyEmailBtn.addEventListener('click', verifyUserEmail);
    updateTimerDisplay();

    // Event Listeners for Social Media Buttons
    // Har button click par pehle smartlink khole, phir social link
    instagramBtn.addEventListener('click', () => {
        window.open(ADSTERA_SMARTLINK_URL, '_blank'); // Smartlink
        window.open(INSTAGRAM_URL, '_blank');        // Instagram
    });
    telegramBtn.addEventListener('click', () => {
        window.open(ADSTERA_SMARTLINK_URL, '_blank'); // Smartlink
        window.open(TELEGRAM_URL, '_blank');         // Telegram
    });
    youtubeBtn.addEventListener('click', () => {
        window.open(ADSTERA_SMARTLINK_URL, '_blank'); // Smartlink
        window.open(YOUTUBE_URL, '_blank');          // YouTube
    });
    twitterBtn.addEventListener('click', () => {
        window.open(ADSTERA_SMARTLINK_URL, '_blank'); // Smartlink
        window.open(TWITTER_URL, '_blank');          // Twitter
    });
});

// --- Return to App Button with Smartlink ---
returnToAppBtn.addEventListener('click', () => {
    window.open(ADSTERA_SMARTLINK_URL, '_blank'); // Smartlink
    if (userEmail) {
        window.location.href = `gamezoneapp://taskCompleted?userEmail=${userEmail}&taskId=${"website_task_gamezone"}`;
    } else {
        alert("Could not return to app. User email missing.");
    }
});