// =============================================================================
// Section 1: Greeting Widget
// =============================================================================

/**
 * Returns a time-based greeting string for the given hour.
 * @param {number} hour - Integer in [0, 23]
 * @returns {"Good Morning"|"Good Afternoon"|"Good Evening"|"Good Night"}
 */
function getGreetingMessage(hour) {
  if (hour >= 5 && hour <= 11) return "Good Morning";
  if (hour >= 12 && hour <= 17) return "Good Afternoon";
  if (hour >= 18 && hour <= 21) return "Good Evening";
  return "Good Night"; // 22–23 and 0–4
}

/**
 * Formats a Date object as a zero-padded "HH:MM" string.
 * @param {Date} date
 * @returns {string} e.g. "09:05"
 */
function formatTime(date) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

/**
 * Formats a Date object as "Weekday, D Month YYYY" (day without leading zero).
 * @param {Date} date
 * @returns {string} e.g. "Monday, 2 June 2025"
 */
function formatDate(date) {
  const weekdays = [
    "Sunday", "Monday", "Tuesday", "Wednesday",
    "Thursday", "Friday", "Saturday"
  ];
  const months = [
    "January", "February", "March", "April",
    "May", "June", "July", "August",
    "September", "October", "November", "December"
  ];

  const weekday = weekdays[date.getDay()];
  const day = date.getDate(); // no leading zero — getDate() returns a number
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${weekday}, ${day} ${month} ${year}`;
}

/**
 * Reads the current time, updates the greeting, time, and date DOM elements.
 * Called once on load and then on every 60-second interval tick.
 */
function updateGreeting() {
  const now = new Date();
  document.getElementById("greeting-text").textContent = getGreetingMessage(now.getHours());
  document.getElementById("time-display").textContent  = formatTime(now);
  document.getElementById("date-display").textContent  = formatDate(now);
}

// =============================================================================
// Section 5: Initialization
// =============================================================================

document.addEventListener("DOMContentLoaded", () => {
  // --- Greeting ---
  updateGreeting();
  setInterval(updateGreeting, 60_000);

  // --- Timer (renderTimerDisplay, setTimerButtonState, event listeners) ---
  // TODO: timer initialization will be added in task 3.4

  // --- Tasks (loadTasks, renderTasks, event listeners) ---
  // TODO: task initialization will be added in task 5.10

  // --- Quick Links (loadLinks, renderLinks, event listeners) ---
  // TODO: links initialization will be added in task 6.9
});
