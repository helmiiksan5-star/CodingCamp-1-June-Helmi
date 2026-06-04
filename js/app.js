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
  const customGreeting = localStorage.getItem("customGreeting");
  
  if (customGreeting) {
    document.getElementById("greeting-text").textContent = customGreeting;
  } else {
    document.getElementById("greeting-text").textContent = getGreetingMessage(now.getHours());
  }
  
  document.getElementById("time-display").textContent  = formatTime(now);
  document.getElementById("date-display").textContent  = formatDate(now);
}

/**
 * Toggle custom greeting input visibility
 */
function toggleGreetingInput() {
  const greetingInput = document.getElementById("greeting-input");
  const isHidden = greetingInput.classList.contains("hidden");
  
  if (isHidden) {
    greetingInput.classList.remove("hidden");
    greetingInput.value = localStorage.getItem("customGreeting") || "";
    greetingInput.focus();
  } else {
    saveCustomGreeting();
  }
}

/**
 * Save custom greeting to localStorage
 */
function saveCustomGreeting() {
  const greetingInput = document.getElementById("greeting-input");
  const customGreeting = greetingInput.value.trim();
  
  if (customGreeting) {
    localStorage.setItem("customGreeting", customGreeting);
  } else {
    localStorage.removeItem("customGreeting");
  }
  
  greetingInput.classList.add("hidden");
  updateGreeting();
}

// =============================================================================
// Section 2: Focus Timer
// =============================================================================

let timerInterval = null;
let remainingSeconds = 25 * 60; // 25 minutes in seconds

/**
 * Renders the current timer value to the display element.
 */
function renderTimerDisplay() {
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const display = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  
  const timerDisplay = document.getElementById("timer-display");
  timerDisplay.textContent = display;
  
  // Add complete class if timer is at 0
  if (remainingSeconds === 0) {
    timerDisplay.classList.add("timer-complete");
  } else {
    timerDisplay.classList.remove("timer-complete");
  }
}

/**
 * Sets the enabled/disabled state of timer control buttons.
 */
function setTimerButtonState(isRunning) {
  document.getElementById("timer-start-btn").disabled = isRunning;
  document.getElementById("timer-stop-btn").disabled = !isRunning;
  document.getElementById("timer-reset-btn").disabled = isRunning;
}

/**
 * Starts the countdown timer.
 */
function startTimer() {
  if (timerInterval) return; // Already running
  
  timerInterval = setInterval(() => {
    if (remainingSeconds > 0) {
      remainingSeconds--;
      renderTimerDisplay();
    } else {
      stopTimer();
    }
  }, 1000);
  
  setTimerButtonState(true);
}

/**
 * Stops the countdown timer.
 */
function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  setTimerButtonState(false);
}

/**
 * Resets the timer to 25 minutes.
 */
function resetTimer() {
  stopTimer();
  remainingSeconds = 25 * 60;
  renderTimerDisplay();
}

// =============================================================================
// Section 3: Task Manager
// =============================================================================

let tasks = []; // Array of {id, text, completed}

/**
 * Load tasks from localStorage.
 */
function loadTasks() {
  const stored = localStorage.getItem("tasks");
  if (stored) {
    try {
      tasks = JSON.parse(stored);
    } catch {
      tasks = [];
    }
  }
}

/**
 * Save tasks to localStorage.
 */
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

/**
 * Render the task list to the DOM.
 */
function renderTasks() {
  const taskList = document.getElementById("task-list");
  taskList.innerHTML = "";
  
  tasks.forEach((task) => {
    const li = document.createElement("li");
    li.className = "task-item" + (task.completed ? " task-complete" : "");
    li.dataset.id = task.id;
    
    // Checkbox
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-checkbox";
    checkbox.checked = task.completed;
    checkbox.addEventListener("change", () => toggleTaskComplete(task.id));
    
    // Task text or edit input
    if (task.editing) {
      li.classList.add("editing");
      
      const input = document.createElement("input");
      input.type = "text";
      input.className = "task-edit-input";
      input.value = task.text;
      input.maxLength = 500;
      
      const saveBtn = document.createElement("button");
      saveBtn.className = "task-save-btn";
      saveBtn.textContent = "Save";
      saveBtn.addEventListener("click", () => saveTaskEdit(task.id, input.value));
      
      const cancelBtn = document.createElement("button");
      cancelBtn.className = "task-cancel-btn";
      cancelBtn.textContent = "Cancel";
      cancelBtn.addEventListener("click", () => cancelTaskEdit(task.id));
      
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") saveTaskEdit(task.id, input.value);
        if (e.key === "Escape") cancelTaskEdit(task.id);
      });
      
      li.append(checkbox, input, saveBtn, cancelBtn);
      setTimeout(() => input.focus(), 0);
    } else {
      const span = document.createElement("span");
      span.className = "task-text";
      span.textContent = task.text;
      
      const editBtn = document.createElement("button");
      editBtn.className = "task-edit-btn";
      editBtn.textContent = "Edit";
      editBtn.addEventListener("click", () => startTaskEdit(task.id));
      
      const deleteBtn = document.createElement("button");
      deleteBtn.className = "task-delete-btn";
      deleteBtn.textContent = "Delete";
      deleteBtn.addEventListener("click", () => deleteTask(task.id));
      
      li.append(checkbox, span, editBtn, deleteBtn);
    }
    
    taskList.appendChild(li);
  });
}

/**
 * Add a new task.
 */
function addTask() {
  const input = document.getElementById("task-input");
  const text = input.value.trim();
  
  if (!text) return;
  
  // Check for duplicate
  const duplicate = tasks.find(t => t.text.toLowerCase() === text.toLowerCase());
  if (duplicate) {
    alert("This task already exists!");
    input.focus();
    return;
  }
  
  const newTask = {
    id: Date.now(),
    text: text,
    completed: false,
    editing: false
  };
  
  tasks.push(newTask);
  saveTasks();
  renderTasks();
  
  input.value = "";
  input.focus();
}

/**
 * Toggle task completion status.
 */
function toggleTaskComplete(id) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.completed = !task.completed;
    saveTasks();
    renderTasks();
  }
}

/**
 * Start editing a task.
 */
function startTaskEdit(id) {
  tasks.forEach(t => t.editing = false);
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.editing = true;
    renderTasks();
  }
}

/**
 * Save task edit.
 */
function saveTaskEdit(id, newText) {
  const text = newText.trim();
  if (!text) return;
  
  // Check for duplicate (excluding current task)
  const duplicate = tasks.find(t => t.id !== id && t.text.toLowerCase() === text.toLowerCase());
  if (duplicate) {
    alert("This task already exists!");
    return;
  }
  
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.text = text;
    task.editing = false;
    saveTasks();
    renderTasks();
  }
}

/**
 * Cancel task edit.
 */
function cancelTaskEdit(id) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.editing = false;
    renderTasks();
  }
}

/**
 * Delete a task.
 */
function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks();
}

// =============================================================================
// Section 4: Quick Links
// =============================================================================

let quickLinks = []; // Array of {id, label, url}

/**
 * Load quick links from localStorage.
 */
function loadLinks() {
  const stored = localStorage.getItem("quickLinks");
  if (stored) {
    try {
      quickLinks = JSON.parse(stored);
    } catch {
      quickLinks = [];
    }
  }
}

/**
 * Save quick links to localStorage.
 */
function saveLinks() {
  localStorage.setItem("quickLinks", JSON.stringify(quickLinks));
}

/**
 * Validate URL format.
 */
function isValidUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Render quick links to the DOM.
 */
function renderLinks() {
  const linksList = document.getElementById("links-list");
  linksList.innerHTML = "";
  
  quickLinks.forEach((link) => {
    const div = document.createElement("div");
    div.className = "link-item";
    
    const openBtn = document.createElement("button");
    openBtn.className = "link-open-btn";
    openBtn.textContent = link.label;
    openBtn.addEventListener("click", () => window.open(link.url, "_blank"));
    
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "link-delete-btn";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => deleteLink(link.id));
    
    div.append(openBtn, deleteBtn);
    linksList.appendChild(div);
  });
}

/**
 * Add a new quick link.
 */
function addLink() {
  const labelInput = document.getElementById("link-label-input");
  const urlInput = document.getElementById("link-url-input");
  const validationMsg = document.getElementById("link-validation-msg");
  
  const label = labelInput.value.trim();
  const url = urlInput.value.trim();
  
  validationMsg.classList.add("hidden");
  
  if (!label || !url) {
    validationMsg.textContent = "Both label and URL are required.";
    validationMsg.classList.remove("hidden");
    return;
  }
  
  if (!isValidUrl(url)) {
    validationMsg.textContent = "Please enter a valid URL (must start with http:// or https://).";
    validationMsg.classList.remove("hidden");
    urlInput.focus();
    return;
  }
  
  const newLink = {
    id: Date.now(),
    label: label,
    url: url
  };
  
  quickLinks.push(newLink);
  saveLinks();
  renderLinks();
  
  labelInput.value = "";
  urlInput.value = "";
  labelInput.focus();
}

/**
 * Delete a quick link.
 */
function deleteLink(id) {
  quickLinks = quickLinks.filter(l => l.id !== id);
  saveLinks();
  renderLinks();
}

// =============================================================================
// Section 5: Dark Mode
// =============================================================================

/**
 * Toggle dark mode on/off.
 */
function toggleDarkMode() {
  const body = document.body;
  const isDark = body.classList.toggle("dark-mode");
  
  // Update button icon
  const btn = document.getElementById("theme-toggle-btn");
  btn.textContent = isDark ? "☀️" : "🌙";
  
  // Save preference
  localStorage.setItem("darkMode", isDark ? "enabled" : "disabled");
}

/**
 * Load dark mode preference.
 */
function loadDarkMode() {
  const darkMode = localStorage.getItem("darkMode");
  const btn = document.getElementById("theme-toggle-btn");
  
  if (darkMode === "enabled") {
    document.body.classList.add("dark-mode");
    btn.textContent = "☀️";
  } else {
    btn.textContent = "🌙";
  }
}

// =============================================================================
// Section 6: Initialization
// =============================================================================

document.addEventListener("DOMContentLoaded", () => {
  // --- Dark Mode ---
  loadDarkMode();
  document.getElementById("theme-toggle-btn").addEventListener("click", toggleDarkMode);
  
  // --- Greeting ---
  updateGreeting();
  setInterval(updateGreeting, 60_000);
  
  document.getElementById("edit-greeting-btn").addEventListener("click", toggleGreetingInput);
  document.getElementById("greeting-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter") saveCustomGreeting();
    if (e.key === "Escape") {
      document.getElementById("greeting-input").classList.add("hidden");
    }
  });
  document.getElementById("greeting-input").addEventListener("blur", saveCustomGreeting);
  
  // --- Timer ---
  renderTimerDisplay();
  setTimerButtonState(false);
  
  document.getElementById("timer-start-btn").addEventListener("click", startTimer);
  document.getElementById("timer-stop-btn").addEventListener("click", stopTimer);
  document.getElementById("timer-reset-btn").addEventListener("click", resetTimer);
  
  // --- Tasks ---
  loadTasks();
  renderTasks();
  
  document.getElementById("task-add-btn").addEventListener("click", addTask);
  document.getElementById("task-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter") addTask();
  });
  
  // --- Quick Links ---
  loadLinks();
  renderLinks();
  
  document.getElementById("link-add-btn").addEventListener("click", addLink);
  document.getElementById("link-label-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter") document.getElementById("link-url-input").focus();
  });
  document.getElementById("link-url-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter") addLink();
  });
});
