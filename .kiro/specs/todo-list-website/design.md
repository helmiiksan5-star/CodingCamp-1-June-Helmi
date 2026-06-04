# Design Document: To-Do List Website

## Overview

The To-Do List Website is a single-page client-side application delivering four productivity widgets in one HTML file. There is no backend, no build step, and no dependencies. The browser loads `index.html` directly; `css/style.css` provides all visual styling; `js/app.js` contains all application logic organized into four feature sections plus initialization.

The app persists user data exclusively through the browser's `localStorage` API, using two keys: `"tasks"` for the task list and `"quickLinks"` for the quick-links list. All four widgets are present in the DOM at load time; JavaScript reads stored data and renders the initial UI during a single `DOMContentLoaded` callback.

### Design Goals

- **Zero dependencies** — every line runs natively in the browser with no compilation.
- **Single-file-per-type** — one HTML file, one CSS file, one JS file, enforced by the file structure constraints.
- **Clear widget boundaries** — each feature is a self-contained section in both the HTML and the JS, making the code easy to navigate.
- **localStorage as the single source of truth** — every mutation writes back immediately so no data is lost on page close.

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                          index.html                          │
│                                                              │
│  ┌───────────────────┐    ┌───────────────────────────────┐  │
│  │  Greeting Widget  │    │         Focus Timer           │  │
│  │  #greeting-widget │    │         #timer-widget         │  │
│  └───────────────────┘    └───────────────────────────────┘  │
│  ┌───────────────────┐    ┌───────────────────────────────┐  │
│  │   Task Manager    │    │         Quick Links           │  │
│  │  #task-widget     │    │        #links-widget          │  │
│  └───────────────────┘    └───────────────────────────────┘  │
│                                                              │
│  <link rel="stylesheet" href="css/style.css">               │
│  <script src="js/app.js" defer></script>                    │
└──────────────────────────────────────────────────────────────┘

         ↕  DOM reads/writes

┌──────────────────────────────────────────────────────────────┐
│                           js/app.js                          │
│                                                              │
│  Section 1: Greeting Widget                                  │
│  Section 2: Focus Timer                                      │
│  Section 3: Task Manager                                     │
│  Section 4: Quick Links                                      │
│  Section 5: Initialization (DOMContentLoaded)               │
└──────────────────────────────────────────────────────────────┘

         ↕  JSON.stringify / JSON.parse

┌──────────────────────────────────────────────────────────────┐
│                         localStorage                         │
│   "tasks"      → JSON array of Task objects                  │
│   "quickLinks" → JSON array of Link objects                  │
└──────────────────────────────────────────────────────────────┘
```

**Data flow**: User actions trigger JS event handlers → state arrays are mutated in memory → `renderTasks()` / `renderLinks()` rebuild DOM from the current array → localStorage is updated with the serialized array. There is no two-way binding; the DOM is always rebuilt from the array on every mutation.

---

## Components and Interfaces

### 1. Greeting Widget

**Purpose**: Shows the current time (HH:MM), full date, and a time-based greeting.

**DOM elements referenced by JS**:

| Element ID        | Tag    | Role                          |
|-------------------|--------|-------------------------------|
| `#greeting-text`  | `<p>`  | Displays "Good Morning" etc.  |
| `#time-display`   | `<p>`  | Displays "14:05"              |
| `#date-display`   | `<p>`  | Displays "Monday, 2 June 2025"|

**JS interface** (functions exported to the module scope):

```js
// Called once on load and then every 60 000 ms via setInterval
function updateGreeting() { ... }

// Returns "Good Morning" | "Good Afternoon" | "Good Evening" | "Good Night"
function getGreetingMessage(hour) { ... }

// Returns "HH:MM" padded string
function formatTime(date) { ... }

// Returns "Weekday, D Month YYYY" string
function formatDate(date) { ... }
```

---

### 2. Focus Timer

**Purpose**: 25-minute countdown with Start, Stop, Reset controls and visual end-of-session indicator.

**DOM elements referenced by JS**:

| Element ID          | Tag        | Role                              |
|---------------------|------------|-----------------------------------|
| `#timer-display`    | `<p>`      | Shows remaining time in MM:SS     |
| `#timer-start-btn`  | `<button>` | Starts or resumes countdown       |
| `#timer-stop-btn`   | `<button>` | Pauses countdown                  |
| `#timer-reset-btn`  | `<button>` | Resets to 25:00                   |

**State variables** (declared in the Focus Timer section of `app.js`):

```js
let timerSeconds = 1500;   // remaining seconds; initialized to 1500 on load/reset
let timerInterval = null;  // holds the setInterval ID, null when stopped
```

**JS interface**:

```js
function startTimer() { ... }   // begins or resumes setInterval countdown
function stopTimer() { ... }    // cancels interval, preserves timerSeconds
function resetTimer() { ... }   // cancels interval, sets timerSeconds = 1500, updates display
function tickTimer() { ... }    // called each interval tick: decrement, render, check 0
function renderTimerDisplay() { ... }   // writes MM:SS to #timer-display
function setTimerButtonState(running) { ... }  // sets disabled attributes on buttons
```

---

### 3. Task Manager

**Purpose**: Add, edit, complete/uncomplete, and delete tasks; persist to localStorage.

**DOM elements referenced by JS**:

| Element ID           | Tag          | Role                          |
|----------------------|--------------|-------------------------------|
| `#task-input`        | `<input>`    | New task text entry           |
| `#task-add-btn`      | `<button>`   | Triggers task creation        |
| `#task-list`         | `<ul>`       | Container for rendered tasks  |

**State variables**:

```js
let tasks = [];  // Array of Task objects; loaded from localStorage on init
```

**JS interface**:

```js
function addTask() { ... }                    // reads input, validates, pushes Task, renders, saves
function deleteTask(index) { ... }            // removes tasks[index], renders, saves
function toggleTask(index) { ... }            // flips tasks[index].done, renders, saves
function editTask(index) { ... }              // replaces task text display with inline input
function saveTaskEdit(index, newText) { ... } // validates newText, commits or discards, renders, saves
function cancelTaskEdit(index) { ... }        // discards edit, re-renders
function renderTasks() { ... }               // rebuilds #task-list entirely from tasks[]
function saveTasks() { ... }                 // localStorage.setItem("tasks", JSON.stringify(tasks))
function loadTasks() { ... }                 // reads "tasks" from localStorage; returns array or []
```

---

### 4. Quick Links

**Purpose**: User-defined URL shortcuts rendered as clickable buttons.

**DOM elements referenced by JS**:

| Element ID              | Tag        | Role                              |
|-------------------------|------------|-----------------------------------|
| `#link-label-input`     | `<input>`  | New link label entry              |
| `#link-url-input`       | `<input>`  | New link URL entry                |
| `#link-add-btn`         | `<button>` | Triggers link creation            |
| `#link-validation-msg`  | `<p>`      | Inline validation error message   |
| `#links-list`           | `<div>`    | Container for rendered link buttons|

**State variables**:

```js
let quickLinks = [];  // Array of Link objects; loaded from localStorage on init
```

**JS interface**:

```js
function addLink() { ... }          // reads inputs, validates, pushes Link, renders, saves
function deleteLink(index) { ... }  // removes quickLinks[index], renders, saves
function openLink(url) { ... }      // calls window.open(url, "_blank")
function renderLinks() { ... }      // rebuilds #links-list entirely from quickLinks[]
function saveLinks() { ... }        // localStorage.setItem("quickLinks", JSON.stringify(quickLinks))
function loadLinks() { ... }        // reads "quickLinks"; returns array or []
function validateLink(label, url) { ... }  // returns { valid: bool, message: string }
```

---

### 5. Initialization

```js
document.addEventListener("DOMContentLoaded", () => {
  // Greeting
  updateGreeting();
  setInterval(updateGreeting, 60_000);

  // Timer — display initial 25:00
  renderTimerDisplay();
  setTimerButtonState(false);

  // Tasks
  tasks = loadTasks();
  renderTasks();

  // Links
  quickLinks = loadLinks();
  renderLinks();

  // Attach static event listeners
  // ... (timer buttons, add-task button, Enter key on task input, add-link button)
});
```

---

## Data Models

### Task Object

```js
/**
 * @typedef {Object} Task
 * @property {string}  text - The task description (trimmed, 1–500 characters)
 * @property {boolean} done - Completion status; false = pending, true = complete
 */

// Example
const task = { text: "Buy groceries", done: false };
```

### Link Object

```js
/**
 * @typedef {Object} Link
 * @property {string} label - Display label (trimmed, 1–50 characters)
 * @property {string} url   - Full URL beginning with "http://" or "https://"
 */

// Example
const link = { label: "GitHub", url: "https://github.com" };
```

### localStorage Schema

| Key          | Type          | Shape                                          |
|--------------|---------------|------------------------------------------------|
| `"tasks"`    | JSON string   | `Task[]` — `[{ "text": "...", "done": false }]` |
| `"quickLinks"` | JSON string | `Link[]` — `[{ "label": "...", "url": "..." }]` |

**Read pattern** (same for both keys):
```js
function loadTasks() {
  try {
    const raw = localStorage.getItem("tasks");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
```

**Write pattern**:
```js
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}
```

---

## DOM Structure

### index.html Skeleton

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>To-Do List</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <div class="app-container">

    <!-- Greeting Widget -->
    <section id="greeting-widget" class="widget">
      <p id="greeting-text">Good Morning</p>
      <p id="time-display">00:00</p>
      <p id="date-display">Monday, 1 January 2025</p>
    </section>

    <!-- Focus Timer Widget -->
    <section id="timer-widget" class="widget">
      <p id="timer-display">25:00</p>
      <div class="timer-controls">
        <button id="timer-start-btn">Start</button>
        <button id="timer-stop-btn" disabled>Stop</button>
        <button id="timer-reset-btn">Reset</button>
      </div>
    </section>

    <!-- Task Manager Widget -->
    <section id="task-widget" class="widget">
      <div class="task-input-row">
        <input id="task-input" type="text" placeholder="Add a new task…" maxlength="500">
        <button id="task-add-btn">Add</button>
      </div>
      <ul id="task-list"></ul>
    </section>

    <!-- Quick Links Widget -->
    <section id="links-widget" class="widget">
      <div class="link-input-row">
        <input id="link-label-input" type="text" placeholder="Label" maxlength="50">
        <input id="link-url-input"   type="url"  placeholder="https://…">
        <button id="link-add-btn">Add Link</button>
      </div>
      <p id="link-validation-msg" class="validation-msg hidden"></p>
      <div id="links-list"></div>
    </section>

  </div>
  <script src="js/app.js" defer></script>
</body>
</html>
```

### Task List Item Structure (rendered by JS)

Each `<li>` rendered into `#task-list`:

```html
<!-- Normal (view) mode -->
<li class="task-item" data-index="0">
  <input type="checkbox" class="task-checkbox">
  <span class="task-text">Buy groceries</span>
  <button class="task-edit-btn">Edit</button>
  <button class="task-delete-btn">Delete</button>
</li>

<!-- Completed state — JS adds .task-complete to the <li> -->
<li class="task-item task-complete" data-index="1">
  ...
</li>

<!-- Edit mode — JS replaces .task-text span with an input -->
<li class="task-item editing" data-index="2">
  <input type="checkbox" class="task-checkbox">
  <input type="text" class="task-edit-input" value="Buy groceries">
  <button class="task-save-btn">Save</button>
  <button class="task-cancel-btn">Cancel</button>
</li>
```

### Link Button Structure (rendered by JS)

Each child rendered into `#links-list`:

```html
<div class="link-item" data-index="0">
  <button class="link-open-btn">GitHub</button>
  <button class="link-delete-btn">×</button>
</div>
```

---

## CSS Class Naming Conventions

### Layout / Container Classes

| Class            | Element              | Purpose                                    |
|------------------|----------------------|--------------------------------------------|
| `.app-container` | `<div>` wrapping all | Top-level grid/flex layout                 |
| `.widget`        | `<section>`          | Card-style container for each feature      |
| `.timer-controls`| `<div>`              | Flex row for Start/Stop/Reset buttons      |
| `.task-input-row`| `<div>`              | Flex row for task input + Add button       |
| `.link-input-row`| `<div>`              | Flex row for label, URL inputs, Add button |

### State Classes (toggled by JS — no inline styles)

| Class              | Applied to         | Effect                                       |
|--------------------|--------------------|----------------------------------------------|
| `.timer-complete`  | `#timer-display`   | Changes text color (red) when timer hits 0:00|
| `.task-complete`   | `.task-item <li>`  | Applies `text-decoration: line-through`      |
| `.editing`         | `.task-item <li>`  | Swaps view controls for edit controls        |
| `.hidden`          | Any element        | `display: none` utility class                |

### Component Classes

| Class                | Element           | Purpose                              |
|----------------------|-------------------|--------------------------------------|
| `.task-item`         | `<li>`            | Individual task row                  |
| `.task-text`         | `<span>`          | Task description text                |
| `.task-checkbox`     | `<input>`         | Complete toggle                      |
| `.task-edit-btn`     | `<button>`        | Opens edit mode                      |
| `.task-delete-btn`   | `<button>`        | Removes task                         |
| `.task-edit-input`   | `<input>`         | Inline text field in edit mode       |
| `.task-save-btn`     | `<button>`        | Confirms edit                        |
| `.task-cancel-btn`   | `<button>`        | Cancels edit                         |
| `.link-item`         | `<div>`           | Wrapper for a single link button+delete|
| `.link-open-btn`     | `<button>`        | Opens URL in new tab                 |
| `.link-delete-btn`   | `<button>`        | Removes link                         |
| `.validation-msg`    | `<p>`             | Inline form error message            |

---

## Event Handling Design

All event listeners are attached once inside the `DOMContentLoaded` callback. Task and link items use **event delegation** on their container elements (`#task-list`, `#links-list`) rather than attaching individual listeners per item, avoiding stale listener issues on re-render.

```
Event                         Target                   Handler
─────────────────────────────────────────────────────────────────
click                         #timer-start-btn         startTimer()
click                         #timer-stop-btn          stopTimer()
click                         #timer-reset-btn         resetTimer()

click                         #task-add-btn            addTask()
keydown (key === "Enter")      #task-input              addTask()

click (delegated)             #task-list               dispatch by class:
  .task-checkbox → change       toggleTask(index)
  .task-edit-btn  → click       editTask(index)
  .task-save-btn  → click       saveTaskEdit(index, value)
  .task-cancel-btn → click      cancelTaskEdit(index)
  .task-delete-btn → click      deleteTask(index)
keydown (key === "Enter")      .task-edit-input         saveTaskEdit(index, value)
keydown (key === "Escape")     .task-edit-input         cancelTaskEdit(index)

click                         #link-add-btn            addLink()

click (delegated)             #links-list              dispatch by class:
  .link-open-btn  → click       openLink(url)
  .link-delete-btn → click      deleteLink(index)
```

**Index retrieval**: Each rendered item carries a `data-index` attribute matching its position in the `tasks[]` or `quickLinks[]` array. Handlers read `event.target.closest("[data-index]").dataset.index` to locate the correct item.

---

## Error Handling

| Scenario                                          | Handling                                                        |
|---------------------------------------------------|-----------------------------------------------------------------|
| localStorage unavailable (private browsing, quota)| `try/catch` around `getItem`/`setItem`; app still functions in-memory |
| Corrupted / non-JSON value in localStorage        | `JSON.parse` inside `try/catch`; returns `[]` on error          |
| Task input empty or whitespace-only               | `addTask()` returns early, re-focuses `#task-input`             |
| Edit saved with empty/whitespace text             | `saveTaskEdit()` discards change and exits edit mode            |
| Link label empty or > 50 chars                    | `validateLink()` returns error message, displayed in `#link-validation-msg` |
| Link URL missing or not http/https                | Same `validateLink()` path                                      |
| Timer tick below zero                             | `tickTimer()` clamps at 0, cancels interval, adds `.timer-complete`|

---



**Tag format**: `// Feature: todo-list-website, Property N: <property text>`

See the Correctness Properties section below for the full list of properties to implement.

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

The properties below are derived from the feature's acceptance criteria via the prework analysis. Criteria 1.3–1.6 are consolidated into a single greeting-coverage property; criteria 3.5 and 3.6 are consolidated into the toggle round-trip property; criteria 4.5 and 4.6 are merged; persistence criteria (3.13, 4.9) are subsumed by the add/delete properties that already verify localStorage.

---

### Property 1: Time formatting always produces zero-padded HH:MM

*For any* `Date` object, `formatTime(date)` SHALL return a string matching the pattern `\d\d:\d\d` where the two-digit hour equals `date.getHours()` and the two-digit minute equals `date.getMinutes()`.

**Validates: Requirements 1.1**

---

### Property 2: Date formatting always produces "Weekday, D Month YYYY"

*For any* `Date` object, `formatDate(date)` SHALL return a string that contains the correct full weekday name, the day of the month (without leading zero), the correct full month name, and the four-digit year, in the format "Weekday, D Month YYYY".

**Validates: Requirements 1.2**

---

### Property 3: Greeting message covers all 24 hours exhaustively and correctly

*For any* integer `hour` in the range [0, 23], `getGreetingMessage(hour)` SHALL return:
- `"Good Morning"` when `hour` ∈ {5, 6, 7, 8, 9, 10, 11}
- `"Good Afternoon"` when `hour` ∈ {12, 13, 14, 15, 16, 17}
- `"Good Evening"` when `hour` ∈ {18, 19, 20, 21}
- `"Good Night"` when `hour` ∈ {22, 23, 0, 1, 2, 3, 4}

The function SHALL return exactly one of these four strings and never return anything else.

**Validates: Requirements 1.3, 1.4, 1.5, 1.6**

---

### Property 4: Timer display always produces zero-padded MM:SS

*For any* integer `seconds` in the range [0, 1500], the timer display function SHALL render a string matching the pattern `\d\d:\d\d` where the minute field equals `Math.floor(seconds / 60)` zero-padded to 2 digits and the second field equals `seconds % 60` zero-padded to 2 digits.

**Validates: Requirements 2.8**

---

### Property 5: Adding a valid task grows the list and persists correctly

*For any* existing task list and any non-empty, non-whitespace string of 1–500 characters, calling `addTask()` with that string SHALL increase the length of `tasks[]` by exactly 1, the new task's `text` field SHALL equal the trimmed input, `done` SHALL be `false`, and `localStorage.getItem("tasks")` SHALL deserialize to a JSON array containing the new task.

**Validates: Requirements 3.2, 3.13**

---

### Property 6: Whitespace-only input is always rejected

*For any* string composed entirely of whitespace characters (spaces, tabs, newlines), calling `addTask()` or `saveTaskEdit()` with that string SHALL leave the task list unchanged and SHALL NOT write any new or modified entry to localStorage.

**Validates: Requirements 3.4, 3.10**

---

### Property 7: Task completion toggle is an involution (round-trip)

*For any* task at any index in `tasks[]`, calling `toggleTask(index)` SHALL flip `done` from `false` to `true` or from `true` to `false`, and the rendered `<li>` SHALL have the `.task-complete` class if and only if `done === true`. Calling `toggleTask(index)` a second time SHALL restore `done` to its original value.

**Validates: Requirements 3.5, 3.6**

---

### Property 8: Deleting a task at any valid index removes exactly that item

*For any* non-empty `tasks[]` and any valid index `i` (0 ≤ i < tasks.length), calling `deleteTask(i)` SHALL reduce `tasks.length` by exactly 1, the task previously at index `i` SHALL no longer be present, and all other tasks SHALL remain in their original relative order.

**Validates: Requirements 3.12**

---

### Property 9: loadTasks always returns an array regardless of localStorage content

*For any* string value stored under `"tasks"` in localStorage (including empty string, malformed JSON, a JSON non-array primitive, a JSON object, or a valid JSON array), `loadTasks()` SHALL always return a JavaScript `Array` and SHALL never throw.

**Validates: Requirements 3.14**

---

### Property 10: Link trimming — stored label and URL are always trimmed

*For any* valid link input where the trimmed label is 1–50 characters and the trimmed URL begins with `"http://"` or `"https://"`, regardless of leading or trailing whitespace in the raw input values, the `Link` object stored in `quickLinks[]` SHALL have `label` and `url` equal to the trimmed versions of the inputs.

**Validates: Requirements 4.3**

---

### Property 11: Valid links are added and persisted; invalid links are rejected

*For any* pair of (label, url):
- If the trimmed label is 1–50 characters AND the trimmed URL begins with `"http://"` or `"https://"`, calling `addLink()` SHALL increase `quickLinks.length` by 1 and `localStorage.getItem("quickLinks")` SHALL contain the new link.
- If the trimmed label is empty, exceeds 50 characters, the trimmed URL is empty, or the trimmed URL does not begin with `"http://"` or `"https://"`, calling `addLink()` SHALL leave `quickLinks.length` unchanged.

**Validates: Requirements 4.4, 4.5, 4.6, 4.9**

---

### Property 12: Deleting a link at any valid index removes exactly that item

*For any* non-empty `quickLinks[]` and any valid index `i` (0 ≤ i < quickLinks.length), calling `deleteLink(i)` SHALL reduce `quickLinks.length` by exactly 1, the link previously at index `i` SHALL no longer be present, and all other links SHALL remain in their original relative order.

**Validates: Requirements 4.8**

---

### Property 13: loadLinks always returns an array regardless of localStorage content

*For any* string value stored under `"quickLinks"` in localStorage (including empty string, malformed JSON, a JSON non-array primitive, or a JSON object), `loadLinks()` SHALL always return a JavaScript `Array` and SHALL never throw.

**Validates: Requirements 4.10**
