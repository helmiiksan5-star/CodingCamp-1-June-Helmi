// =============================================================================
// Life Dashboard App
// =============================================================================

// Helper untuk mengambil element agar lebih rapi
const $ = (selector) => document.querySelector(selector);

// =============================================================================
// Section 1: Greeting Widget
// =============================================================================

function getGreetingMessage(hour) {
  if (hour >= 5 && hour <= 11) return "Good Morning";
  if (hour >= 12 && hour <= 17) return "Good Afternoon";
  if (hour >= 18 && hour <= 21) return "Good Evening";
  return "Good Night";
}

function formatTime(date) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function formatDate(date) {
  const weekdays = [
    "Sunday", "Monday", "Tuesday", "Wednesday",
    "Thursday", "Friday", "Saturday"
  ];
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return `${weekdays[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function updateGreeting() {
  const now = new Date();
  const greeting = getGreetingMessage(now.getHours());
  const savedName = localStorage.getItem("userName");

  $("#greeting-text").textContent = savedName ? `${greeting}, ${savedName}` : greeting;
  $("#time-display").textContent = formatTime(now);
  $("#date-display").textContent = formatDate(now);
}

function toggleGreetingInput() {
  const greetingInput = $("#greeting-input");
  const isHidden = greetingInput.classList.contains("hidden");

  if (isHidden) {
    greetingInput.classList.remove("hidden");
    greetingInput.value = localStorage.getItem("userName") || "";
    greetingInput.focus();
  } else {
    saveCustomName();
  }
}

function saveCustomName() {
  const greetingInput = $("#greeting-input");
  const name = greetingInput.value.trim();

  if (name) {
    localStorage.setItem("userName", name);
  } else {
    localStorage.removeItem("userName");
  }

  greetingInput.classList.add("hidden");
  updateGreeting();
}

// =============================================================================
// Section 2: Focus Timer
// =============================================================================

let timerInterval = null;
let remainingSeconds = 25 * 60;

function renderTimerDisplay() {
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const display = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const timerDisplay = $("#timer-display");
  timerDisplay.textContent = display;
  timerDisplay.classList.toggle("timer-complete", remainingSeconds === 0);
}

function setTimerButtonState(isRunning) {
  $("#timer-start-btn").disabled = isRunning;
  $("#timer-stop-btn").disabled = !isRunning;
  $("#timer-reset-btn").disabled = false;
}

function startTimer() {
  if (timerInterval !== null) return;

  timerInterval = setInterval(() => {
    if (remainingSeconds > 0) {
      remainingSeconds--;
      renderTimerDisplay();
      return;
    }

    stopTimer();
  }, 1000);

  setTimerButtonState(true);
}

function stopTimer() {
  if (timerInterval !== null) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  setTimerButtonState(false);
}

function resetTimer() {
  stopTimer();
  remainingSeconds = 25 * 60;
  renderTimerDisplay();
}

// =============================================================================
// Section 3: Task Manager
// =============================================================================

let tasks = [];

function loadTasks() {
  const stored = localStorage.getItem("tasks");

  try {
    tasks = stored ? JSON.parse(stored) : [];
  } catch (error) {
    tasks = [];
  }
}

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function renderTasks() {
  const taskList = $("#task-list");
  taskList.innerHTML = "";

  tasks.forEach((task) => {
    const li = document.createElement("li");
    li.className = `task-item${task.completed ? " task-complete" : ""}`;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-checkbox";
    checkbox.checked = task.completed;
    checkbox.addEventListener("change", () => toggleTaskComplete(task.id));

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

      input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") saveTaskEdit(task.id, input.value);
        if (event.key === "Escape") cancelTaskEdit(task.id);
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

function addTask() {
  const input = $("#task-input");
  const text = input.value.trim();

  if (!text) {
    alert("Task tidak boleh kosong.");
    input.focus();
    return;
  }

  const duplicate = tasks.some((task) => task.text.toLowerCase() === text.toLowerCase());
  if (duplicate) {
    alert("Task ini sudah ada.");
    input.focus();
    return;
  }

  tasks.push({
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    text,
    completed: false,
    editing: false
  });

  saveTasks();
  renderTasks();

  input.value = "";
  input.focus();
}

function toggleTaskComplete(id) {
  tasks = tasks.map((task) => {
    if (task.id !== id) return task;
    return { ...task, completed: !task.completed };
  });

  saveTasks();
  renderTasks();
}

function startTaskEdit(id) {
  tasks = tasks.map((task) => ({ ...task, editing: task.id === id }));
  renderTasks();
}

function saveTaskEdit(id, newText) {
  const text = newText.trim();

  if (!text) {
    alert("Task tidak boleh kosong.");
    return;
  }

  const duplicate = tasks.some((task) => {
    return task.id !== id && task.text.toLowerCase() === text.toLowerCase();
  });

  if (duplicate) {
    alert("Task ini sudah ada.");
    return;
  }

  tasks = tasks.map((task) => {
    if (task.id !== id) return task;
    return { ...task, text, editing: false };
  });

  saveTasks();
  renderTasks();
}

function cancelTaskEdit(id) {
  tasks = tasks.map((task) => {
    if (task.id !== id) return task;
    return { ...task, editing: false };
  });

  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  saveTasks();
  renderTasks();
}

// =============================================================================
// Section 4: Quick Links
// =============================================================================

let quickLinks = [];

function loadLinks() {
  const stored = localStorage.getItem("quickLinks");

  try {
    quickLinks = stored ? JSON.parse(stored) : [];
  } catch (error) {
    quickLinks = [];
  }
}

function saveLinks() {
  localStorage.setItem("quickLinks", JSON.stringify(quickLinks));
}

function showLinkMessage(message) {
  const validationMsg = $("#link-validation-msg");
  validationMsg.textContent = message;
  validationMsg.classList.remove("hidden");
}

function hideLinkMessage() {
  const validationMsg = $("#link-validation-msg");
  validationMsg.textContent = "";
  validationMsg.classList.add("hidden");
}

function normalizeUrl(url) {
  const trimmedUrl = url.trim();

  if (trimmedUrl.startsWith("http://") || trimmedUrl.startsWith("https://")) {
    return trimmedUrl;
  }

  return `https://${trimmedUrl}`;
}

function isValidUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch (error) {
    return false;
  }
}

function renderLinks() {
  const linksList = $("#links-list");
  linksList.innerHTML = "";

  quickLinks.forEach((link) => {
    const div = document.createElement("div");
    div.className = "link-item";

    const openBtn = document.createElement("button");
    openBtn.className = "link-open-btn";
    openBtn.textContent = link.label;
    openBtn.addEventListener("click", () => {
      window.open(link.url, "_blank", "noopener,noreferrer");
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "link-delete-btn";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => deleteLink(link.id));

    div.append(openBtn, deleteBtn);
    linksList.appendChild(div);
  });
}

function addLink() {
  const labelInput = $("#link-label-input");
  const urlInput = $("#link-url-input");

  const label = labelInput.value.trim();
  const url = normalizeUrl(urlInput.value);

  hideLinkMessage();

  if (!label || !urlInput.value.trim()) {
    showLinkMessage("Label dan URL wajib diisi.");
    return;
  }

  if (!isValidUrl(url)) {
    showLinkMessage("URL tidak valid. Contoh: https://google.com");
    urlInput.focus();
    return;
  }

  const duplicate = quickLinks.some((link) => {
    return link.label.toLowerCase() === label.toLowerCase() || link.url.toLowerCase() === url.toLowerCase();
  });

  if (duplicate) {
    showLinkMessage("Link dengan label atau URL ini sudah ada.");
    return;
  }

  quickLinks.push({
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    label,
    url
  });

  saveLinks();
  renderLinks();

  labelInput.value = "";
  urlInput.value = "";
  labelInput.focus();
}

function deleteLink(id) {
  quickLinks = quickLinks.filter((link) => link.id !== id);
  saveLinks();
  renderLinks();
}

// =============================================================================
// Section 5: Dark Mode
// =============================================================================

function toggleDarkMode() {
  const isDark = document.body.classList.toggle("dark-mode");
  $("#theme-toggle-btn").textContent = isDark ? "☀️" : "🌙";
  localStorage.setItem("darkMode", isDark ? "enabled" : "disabled");
}

function loadDarkMode() {
  const isDark = localStorage.getItem("darkMode") === "enabled";
  document.body.classList.toggle("dark-mode", isDark);
  $("#theme-toggle-btn").textContent = isDark ? "☀️" : "🌙";
}

// =============================================================================
// Section 6: Initialization
// =============================================================================

document.addEventListener("DOMContentLoaded", () => {
  // Dark Mode
  loadDarkMode();
  $("#theme-toggle-btn").addEventListener("click", toggleDarkMode);

  // Greeting
  updateGreeting();
  setInterval(updateGreeting, 60_000);
  $("#edit-greeting-btn").addEventListener("click", toggleGreetingInput);
  $("#greeting-input").addEventListener("keydown", (event) => {
    if (event.key === "Enter") saveCustomName();
    if (event.key === "Escape") $("#greeting-input").classList.add("hidden");
  });
  $("#greeting-input").addEventListener("blur", saveCustomName);

  // Timer
  renderTimerDisplay();
  setTimerButtonState(false);
  $("#timer-start-btn").addEventListener("click", startTimer);
  $("#timer-stop-btn").addEventListener("click", stopTimer);
  $("#timer-reset-btn").addEventListener("click", resetTimer);

  // Tasks
  loadTasks();
  renderTasks();
  $("#task-add-btn").addEventListener("click", addTask);
  $("#task-input").addEventListener("keydown", (event) => {
    if (event.key === "Enter") addTask();
  });

  // Quick Links
  loadLinks();
  renderLinks();
  $("#link-add-btn").addEventListener("click", addLink);
  $("#link-label-input").addEventListener("keydown", (event) => {
    if (event.key === "Enter") $("#link-url-input").focus();
  });
  $("#link-url-input").addEventListener("keydown", (event) => {
    if (event.key === "Enter") addLink();
  });
});
