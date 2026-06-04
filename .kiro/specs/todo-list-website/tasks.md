# Implementation Plan: To-Do List Website

## Overview

Build a single-page client-side productivity app using plain HTML, CSS, and Vanilla JavaScript — no frameworks, no build tools, no backend. The app delivers four widgets (Greeting, Focus Timer, Task Manager, Quick Links) in one `index.html`, styled by `css/style.css`, and driven by `js/app.js` organized into five logical sections. All data persists through the browser's `localStorage` API.

---

## Tasks

- [x] 1. Create the HTML skeleton and CSS foundation
  - [x] 1.1 Create `index.html` with all four widget sections
    - Write the full HTML skeleton matching the DOM structure in the design document
    - Include all element IDs: `#greeting-text`, `#time-display`, `#date-display`, `#timer-display`, `#timer-start-btn`, `#timer-stop-btn`, `#timer-reset-btn`, `#task-input`, `#task-add-btn`, `#task-list`, `#link-label-input`, `#link-url-input`, `#link-add-btn`, `#link-validation-msg`, `#links-list`
    - Add `<link rel="stylesheet" href="css/style.css">` and `<script src="js/app.js" defer></script>`
    - Set `#timer-stop-btn` to `disabled` by default
    - _Requirements: TC-1, NFR-1, all widget sections_

  - [x] 1.2 Create `css/style.css` with layout and state classes
    - Implement `.app-container` grid/flex layout with clear separation between all four widgets
    - Style each `.widget` as a card with readable typography (NFR-3)
    - Add all state classes: `.timer-complete` (red text on `#timer-display`), `.task-complete` (line-through), `.editing`, `.hidden` (`display: none`)
    - Add component classes: `.timer-controls`, `.task-input-row`, `.link-input-row`, `.task-item`, `.task-text`, `.task-checkbox`, `.task-edit-btn`, `.task-delete-btn`, `.task-edit-input`, `.task-save-btn`, `.task-cancel-btn`, `.link-item`, `.link-open-btn`, `.link-delete-btn`, `.validation-msg`
    - No inline styles — all visual state changes via CSS classes only
    - _Requirements: NFR-3, TC-1, 2.7, 3.6_

- [x] 2. Implement the Greeting Widget (Section 1 of `app.js`)
  - [x] 2.1 Implement `getGreetingMessage(hour)`, `formatTime(date)`, and `formatDate(date)`
    - `getGreetingMessage(hour)`: return `"Good Morning"` for hours 5–11, `"Good Afternoon"` for 12–17, `"Good Evening"` for 18–21, `"Good Night"` for 22–23 and 0–4
    - `formatTime(date)`: return `"HH:MM"` using `date.getHours()` and `date.getMinutes()`, both zero-padded to 2 digits with `String.padStart(2, "0")`
    - `formatDate(date)`: return `"Weekday, D Month YYYY"` — day without leading zero, full weekday and month names
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

  - [ ]* 2.2 Write property test for `formatTime` (Property 1)
    - **Property 1: Time formatting always produces zero-padded HH:MM**
    - For any `Date` object, assert the result matches `/^\d\d:\d\d$/`, the hour digits equal `date.getHours()` zero-padded to 2, and the minute digits equal `date.getMinutes()` zero-padded to 2
    - Use fast-check `fc.integer({ min: 0, max: 23 })` and `fc.integer({ min: 0, max: 59 })` to generate arbitrary hours and minutes
    - **Validates: Requirements 1.1**

  - [ ]* 2.3 Write property test for `formatDate` (Property 2)
    - **Property 2: Date formatting always produces "Weekday, D Month YYYY"**
    - For any `Date` object, assert the result contains the correct full weekday name, the numeric day (no leading zero), the correct full month name, and the four-digit year
    - **Validates: Requirements 1.2**

  - [ ]* 2.4 Write property test for `getGreetingMessage` (Property 3)
    - **Property 3: Greeting message covers all 24 hours exhaustively and correctly**
    - For any integer `hour` in [0, 23], assert the returned string is one of exactly the four allowed values, and assert each hour maps to the correct greeting per the boundary table in the design
    - Also assert the function never returns anything else (e.g., `undefined`, empty string, a fifth message)
    - **Validates: Requirements 1.3, 1.4, 1.5, 1.6**

  - [x] 2.5 Implement `updateGreeting()` and wire it into initialization
    - Call `getGreetingMessage`, `formatTime`, and `formatDate` with `new Date()`
    - Write results to `#greeting-text`, `#time-display`, and `#date-display` via `.textContent`
    - In the `DOMContentLoaded` bootstrap, call `updateGreeting()` once and then `setInterval(updateGreeting, 60_000)`
    - _Requirements: 1.1, 1.2, 1.7_

- [ ] 3. Implement the Focus Timer (Section 2 of `app.js`)
  - [ ] 3.1 Declare timer state variables and implement display/button-state helpers
    - Declare `let timerSeconds = 1500` and `let timerInterval = null` at section scope
    - Implement `renderTimerDisplay()`: format `timerSeconds` as `MM:SS` (both fields zero-padded to 2 digits) and write to `#timer-display`
    - Implement `setTimerButtonState(running)`: when `running` is `true`, set `#timer-start-btn.disabled = true` and `#timer-stop-btn.disabled = false`; when `false`, reverse
    - _Requirements: 2.1, 2.8, 2.9, 2.10_

  - [ ]* 3.2 Write property test for timer display format (Property 4)
    - **Property 4: Timer display always produces zero-padded MM:SS**
    - For any integer `seconds` in [0, 1500], assert the rendered string matches `/^\d\d:\d\d$/`, the minute field equals `Math.floor(seconds / 60)` zero-padded, and the second field equals `seconds % 60` zero-padded
    - Test the formatting logic directly (not the DOM) by extracting it into a testable pure function `formatTimerDisplay(seconds)`
    - **Validates: Requirements 2.8**

  - [ ] 3.3 Implement `tickTimer()`, `startTimer()`, `stopTimer()`, and `resetTimer()`
    - `tickTimer()`: decrement `timerSeconds` by 1; call `renderTimerDisplay()`; if `timerSeconds <= 0`, call `clearInterval(timerInterval)`, set `timerInterval = null`, and add CSS class `timer-complete` to `#timer-display`
    - `startTimer()`: if `timerInterval` is already set, return; call `setInterval(tickTimer, 1000)`, store ID in `timerInterval`; call `setTimerButtonState(true)`
    - `stopTimer()`: call `clearInterval(timerInterval)`, set `timerInterval = null`; call `setTimerButtonState(false)`
    - `resetTimer()`: call `stopTimer()`; set `timerSeconds = 1500`; remove `timer-complete` class from `#timer-display`; call `renderTimerDisplay()`; call `setTimerButtonState(false)`
    - _Requirements: 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.11_

  - [ ] 3.4 Attach timer event listeners in the `DOMContentLoaded` bootstrap
    - `#timer-start-btn` → `startTimer()`
    - `#timer-stop-btn` → `stopTimer()`
    - `#timer-reset-btn` → `resetTimer()`
    - Call `renderTimerDisplay()` and `setTimerButtonState(false)` once during initialization to show `25:00` on load
    - _Requirements: 2.1, 2.9, 2.10_

- [ ] 4. Checkpoint — Greeting and Timer
  - Ensure greeting displays correctly for the current time of day, the timer shows `25:00` on load, Start/Stop/Reset buttons behave as specified, and the timer turns red when it hits `00:00`. Ask the user if questions arise.

- [ ] 5. Implement the Task Manager (Section 3 of `app.js`)
  - [ ] 5.1 Implement `loadTasks()`, `saveTasks()`, and the `tasks` state array
    - Declare `let tasks = []` at section scope
    - `loadTasks()`: read `localStorage.getItem("tasks")` inside a `try/catch`; `JSON.parse` the result; return the parsed value if it is an `Array`, otherwise return `[]`; return `[]` if the key is missing or parsing throws
    - `saveTasks()`: call `localStorage.setItem("tasks", JSON.stringify(tasks))`
    - _Requirements: 3.13, 3.14_

  - [ ]* 5.2 Write property test for `loadTasks` resilience (Property 9)
    - **Property 9: `loadTasks` always returns an array regardless of localStorage content**
    - For any arbitrary string stored under `"tasks"` (empty string, malformed JSON, valid non-array JSON, valid JSON array), assert `loadTasks()` always returns an `Array` and never throws
    - Use fast-check string arbitraries plus hand-written cases for malformed JSON and non-array types
    - **Validates: Requirements 3.14**

  - [ ] 5.3 Implement `renderTasks()`
    - Clear `#task-list` and rebuild it entirely from `tasks[]`
    - Each `<li>` carries `class="task-item"` and `data-index="{i}"`
    - In view mode render: `.task-checkbox` (checked if `done`), `.task-text` span, `.task-edit-btn`, `.task-delete-btn`
    - Add class `task-complete` to the `<li>` when `done === true`
    - In edit mode (triggered externally), render: `.task-checkbox`, `.task-edit-input` pre-filled with current text, `.task-save-btn`, `.task-cancel-btn`; add class `editing` to the `<li>`
    - Track which index is currently in edit mode with a module-scoped variable `let editingIndex = -1`
    - _Requirements: 3.2, 3.6, 3.7, 3.8_

  - [ ] 5.4 Implement `addTask()`
    - Read and trim value from `#task-input`
    - If trimmed value is empty or whitespace-only, return early and call `#task-input.focus()`
    - Create `{ text: trimmedValue, done: false }`, push to `tasks[]`, clear `#task-input`, call `renderTasks()` and `saveTasks()`
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [ ]* 5.5 Write property test for `addTask` (Property 5)
    - **Property 5: Adding a valid task grows the list and persists correctly**
    - For any non-empty, non-whitespace string of 1–500 characters, after calling `addTask()`, assert `tasks.length` increased by exactly 1, the new task's `text` equals the trimmed input, `done` is `false`, and `JSON.parse(localStorage.getItem("tasks"))` contains the new task
    - **Validates: Requirements 3.2, 3.13**

  - [ ]* 5.6 Write property test for whitespace rejection (Property 6)
    - **Property 6: Whitespace-only input is always rejected**
    - For any string composed entirely of whitespace characters, assert that calling `addTask()` leaves `tasks.length` unchanged and does not write a new entry to localStorage
    - **Validates: Requirements 3.4, 3.10**

  - [ ] 5.7 Implement `toggleTask(index)`, `deleteTask(index)`, `editTask(index)`, `saveTaskEdit(index, newText)`, and `cancelTaskEdit(index)`
    - `toggleTask(index)`: flip `tasks[index].done`; call `renderTasks()` and `saveTasks()`
    - `deleteTask(index)`: splice `tasks` at `index`; call `renderTasks()` and `saveTasks()`
    - `editTask(index)`: if another task is in edit mode, call `saveTaskEdit` for it first; set `editingIndex = index`; call `renderTasks()`
    - `saveTaskEdit(index, newText)`: trim `newText`; if empty/whitespace, call `cancelTaskEdit(index)` instead; otherwise update `tasks[index].text`; set `editingIndex = -1`; call `renderTasks()` and `saveTasks()`
    - `cancelTaskEdit(index)`: set `editingIndex = -1`; call `renderTasks()`
    - _Requirements: 3.5, 3.7, 3.8, 3.9, 3.10, 3.11, 3.12_

  - [ ]* 5.8 Write property test for `toggleTask` round-trip (Property 7)
    - **Property 7: Task completion toggle is an involution (round-trip)**
    - For any task at any valid index, assert `toggleTask(i)` flips `done`; call it again and assert `done` is restored to the original value. Also assert `.task-complete` class is present if and only if `done === true` after each toggle
    - **Validates: Requirements 3.5, 3.6**

  - [ ]* 5.9 Write property test for `deleteTask` ordering (Property 8)
    - **Property 8: Deleting a task at any valid index removes exactly that item**
    - For any non-empty `tasks[]` and any valid index `i`, assert `tasks.length` decreases by 1, the deleted task is gone, and all other tasks remain in original relative order
    - **Validates: Requirements 3.12**

  - [ ] 5.10 Attach task event listeners (delegated) in `DOMContentLoaded`
    - Attach a single `click` listener on `#task-list`; dispatch to `toggleTask`, `editTask`, `saveTaskEdit`, `cancelTaskEdit`, or `deleteTask` by reading `event.target.classList` and `closest("[data-index]").dataset.index`
    - Attach `keydown` on `#task-input` → call `addTask()` when `key === "Enter"`
    - Attach `keydown` on `#task-list` (delegated to `.task-edit-input`) → `saveTaskEdit` on `"Enter"`, `cancelTaskEdit` on `"Escape"`
    - Attach `click` on `#task-add-btn` → `addTask()`
    - In initialization, set `tasks = loadTasks()` then call `renderTasks()`
    - _Requirements: 3.3, 3.11_

- [ ] 6. Implement Quick Links (Section 4 of `app.js`)
  - [ ] 6.1 Implement `loadLinks()`, `saveLinks()`, and the `quickLinks` state array
    - Declare `let quickLinks = []` at section scope
    - `loadLinks()`: mirror the same pattern as `loadTasks()` but use key `"quickLinks"`
    - `saveLinks()`: call `localStorage.setItem("quickLinks", JSON.stringify(quickLinks))`
    - _Requirements: 4.9, 4.10_

  - [ ]* 6.2 Write property test for `loadLinks` resilience (Property 13)
    - **Property 13: `loadLinks` always returns an array regardless of localStorage content**
    - For any arbitrary string stored under `"quickLinks"`, assert `loadLinks()` always returns an `Array` and never throws
    - **Validates: Requirements 4.10**

  - [ ] 6.3 Implement `validateLink(label, url)`
    - Accept raw (untrimmed) `label` and `url` strings; trim both internally
    - Return `{ valid: true }` if trimmed label is 1–50 characters AND trimmed URL starts with `"http://"` or `"https://"`
    - Return `{ valid: false, message: "..." }` for each invalid case: empty label, label > 50 chars, empty URL, URL not starting with `http://` or `https://`
    - _Requirements: 4.3, 4.4, 4.5, 4.6_

  - [ ] 6.4 Implement `renderLinks()`
    - Clear `#links-list` and rebuild from `quickLinks[]`
    - Each child `<div>` carries `class="link-item"` and `data-index="{i}"`
    - Inside each `<div>`: a `.link-open-btn` button labeled with `link.label`, and a `.link-delete-btn` button labeled `×`
    - _Requirements: 4.1_

  - [ ] 6.5 Implement `addLink()`, `deleteLink(index)`, and `openLink(url)`
    - `addLink()`: read `#link-label-input` and `#link-url-input`; call `validateLink(label, url)`; if invalid, show the returned message in `#link-validation-msg` (remove `.hidden` class), return early; if valid, clear `#link-validation-msg` (add `.hidden` class), push `{ label: trimmedLabel, url: trimmedUrl }` to `quickLinks[]`, clear both inputs, call `renderLinks()` and `saveLinks()`
    - `deleteLink(index)`: splice `quickLinks` at `index`; call `renderLinks()` and `saveLinks()`
    - `openLink(url)`: call `window.open(url, "_blank")`
    - _Requirements: 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9_

  - [ ]* 6.6 Write property test for link trimming (Property 10)
    - **Property 10: Stored label and URL are always trimmed**
    - For any valid link inputs with arbitrary leading/trailing whitespace, assert that the `Link` object in `quickLinks[]` has `label` and `url` equal to the trimmed versions
    - **Validates: Requirements 4.3**

  - [ ]* 6.7 Write property test for `addLink` valid/invalid discrimination (Property 11)
    - **Property 11: Valid links are added and persisted; invalid links are rejected**
    - For valid inputs (trimmed label 1–50 chars, URL starting with `http://` or `https://`), assert `quickLinks.length` increases by 1 and localStorage is updated
    - For invalid inputs (any of: empty label, label > 50 chars, empty URL, URL not starting with `http://` or `https://`), assert `quickLinks.length` is unchanged
    - **Validates: Requirements 4.4, 4.5, 4.6, 4.9**

  - [ ]* 6.8 Write property test for `deleteLink` ordering (Property 12)
    - **Property 12: Deleting a link at any valid index removes exactly that item**
    - For any non-empty `quickLinks[]` and any valid index `i`, assert `quickLinks.length` decreases by 1, the deleted link is gone, and all other links remain in original relative order
    - **Validates: Requirements 4.8**

  - [ ] 6.9 Attach Quick Links event listeners (delegated) in `DOMContentLoaded`
    - Attach a single `click` listener on `#links-list`; dispatch to `openLink(url)` or `deleteLink(index)` by `event.target.classList` and `closest("[data-index]").dataset.index`
    - Attach `click` on `#link-add-btn` → `addLink()`
    - In initialization, set `quickLinks = loadLinks()` then call `renderLinks()`
    - _Requirements: 4.7, 4.8_

- [ ] 7. Final Checkpoint — Full Integration
  - Ensure all four widgets render correctly on a clean page load; test adding/editing/completing/deleting tasks; test adding and clicking quick links; test localStorage persistence across a page reload; test that the timer completes and applies `.timer-complete`; ensure the Stop button is disabled on load and the Start button is disabled while the timer runs. Ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references the specific requirements and design properties it satisfies
- No test runner is pre-installed — before executing property test sub-tasks, install fast-check (`npm install --save-dev fast-check`) or load it via CDN in a test HTML file
- All state classes must be toggled via `classList.add/remove` — never via inline styles
- Event delegation on `#task-list` and `#links-list` avoids stale listener issues on re-render
- The `editingIndex` module-scoped variable tracks which task (if any) is in edit mode
- Checkpoints are intentional gates — verify behavior manually or via tests before continuing

---

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["2.1", "3.1", "5.1", "6.1"] },
    { "id": 2, "tasks": ["2.2", "2.3", "2.4", "2.5", "3.2", "3.3", "5.2", "5.3", "6.2", "6.3"] },
    { "id": 3, "tasks": ["3.4", "5.4", "5.5", "5.6", "6.4", "6.5"] },
    { "id": 4, "tasks": ["5.7", "5.8", "5.9", "6.6", "6.7", "6.8"] },
    { "id": 5, "tasks": ["5.10", "6.9"] }
  ]
}
```
