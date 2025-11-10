// script.js (Updated for Email Input and Firebase Auth)

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

let userEmail = null; // Ab userId ki jagah email use karenge
let startTime = 0;
let timerInterval;
const REQUIRED_TIME_SECONDS = 30; // Example: 30 seconds
let timeSpent = 0;
let isTaskCompleted = false;
let userActivityTimer;
const INACTIVITY_TIMEOUT_MS = 10000;

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

    // Optional: Agar tum Firebase Auth se user existence check karna chahte ho (advanced)
    // For now, hum assume karenge ki entered email sahi hai aur database mein save karenge
    // Later, you could integrate with Firebase Auth to check if this email is registered.
    // Example (Requires Firebase Auth rules and potentially a cloud function):
    /*
    try {
        const methods = await auth.fetchSignInMethodsForEmail(email);
        if (methods && methods.length > 0) {
            // Email found in Firebase Auth
            emailStatusElem.textContent = `Welcome ${email}! Starting your task...`;
            emailStatusElem.className = "status-message success";
            startTaskFlow();
        } else {
            emailStatusElem.textContent = "Email not found in GameZone. Please use your registered email.";
            emailStatusElem.className = "status-message error";
        }
    } catch (error) {
        console.error("Error fetching sign-in methods:", error);
        emailStatusElem.textContent = "Error verifying email. Please try again.";
        emailStatusElem.className = "status-message error";
    }
    */

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
        // Document ID mein ab email use karenge
        const docId = `${userEmail.replace(/\./g, '_')}_${taskId}_${Date.now()}`; // Email ko safe banaya for doc ID

        await db.collection("websiteTasks").doc(docId).set({
            userEmail: userEmail, // Email store karenge
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
    // Ab URL parameter se userId nahi le rahe
    // userId = urlParams.get('userId');

    verifyEmailBtn.addEventListener('click', verifyUserEmail);

    // Initial display update
    updateTimerDisplay();
});

returnToAppBtn.addEventListener('click', () => {
    // Ab userEmail ko bhejenge app ko
    if (userEmail) {
        window.location.href = `gamezoneapp://taskCompleted?userEmail=${userEmail}&taskId=${"website_task_gamezone"}`;
    } else {
        alert("Could not return to app. User email missing.");
    }
});