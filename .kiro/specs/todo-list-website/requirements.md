# Requirements Document

## Introduction

A client-side To-Do List website built with HTML, CSS, and Vanilla JavaScript. The application runs entirely in the browser with no backend server. It provides four core features: a time-based greeting, a 25-minute focus timer, a task management list, and a quick-links panel. All persistent data is stored using the browser's Local Storage API. The app is designed to be minimal, fast, and usable as a standalone web page or browser extension.

## Glossary

- **App**: The To-Do List Website as a whole.
- **Greeting_Widget**: The UI component that displays the current time, date, and a time-based greeting message.
- **Timer**: The focus timer component that counts down from 25 minutes.
- **Task_Manager**: The UI component responsible for creating, editing, completing, and deleting tasks.
- **Task**: A single to-do item consisting of a text description and a completion status.
- **Quick_Links**: The UI component that displays and manages shortcut buttons to user-defined URLs.
- **Link**: A single quick-link entry consisting of a label and a URL.
- **Storage**: The browser's Local Storage API used to persist application data.
- **User**: The person interacting with the App in a browser.

---

## Requirements

### Requirement 1: Display Greeting and Current Date/Time

**User Story:** As a user, I want to see the current time, date, and a greeting based on the time of day, so that I have immediate context when I open the app.

#### Acceptance Criteria

1. THE Greeting_Widget SHALL display the current time in HH:MM 24-hour format, updated every minute via a repeating interval set at page load.
2. THE Greeting_Widget SHALL display the current full date using the format "Weekday, D Month YYYY" (e.g., "Monday, 2 June 2025"), derived from the browser's local date.
3. WHEN the current hour (0–23) is between 5 and 11 inclusive, THE Greeting_Widget SHALL display exactly the message "Good Morning" and SHALL NOT display any other greeting message during this time range.
4. WHEN the current hour (0–23) is between 12 and 17 inclusive, THE Greeting_Widget SHALL display exactly the message "Good Afternoon" and SHALL NOT display any other greeting message during this time range.
5. WHEN the current hour (0–23) is between 18 and 21 inclusive, THE Greeting_Widget SHALL display exactly the message "Good Evening" and SHALL NOT display any other greeting message during this time range.
6. WHEN the current hour (0–23) is 22, 23, 0, 1, 2, 3, or 4, THE Greeting_Widget SHALL display exactly the message "Good Night" and SHALL NOT display any other greeting message during this time range.
7. THE Greeting_Widget SHALL update the greeting message whenever the displayed time is refreshed, so that crossing a time boundary automatically changes the greeting without requiring a page reload.

---

### Requirement 2: Focus Timer

**User Story:** As a user, I want a 25-minute countdown timer with Start, Stop, and Reset controls, so that I can use the Pomodoro technique to stay focused.

#### Acceptance Criteria

1. THE Timer SHALL initialize with a countdown value of exactly 1500 seconds (25:00) whenever the page loads or is reset.
2. WHEN the User clicks the Start button and the Timer is in a stopped or paused state, THE Timer SHALL begin decrementing the remaining time by 1 second every 1000 milliseconds using setInterval.
3. WHEN the User clicks the Stop button and the Timer is running, THE Timer SHALL cancel the active interval and preserve the current remaining time without modifying it.
4. WHEN the User clicks the Start button and the Timer is in a paused state, THE Timer SHALL resume counting down from the preserved remaining time without resetting it.
5. WHEN the User clicks the Reset button regardless of Timer state, THE Timer SHALL cancel any active interval and set the remaining time back to 1500 seconds (25:00).
6. WHEN the Timer's remaining time reaches 0, THE Timer SHALL cancel the active interval so the countdown stops at 00:00.
7. WHEN the Timer's remaining time reaches 0, THE Timer SHALL apply a visually distinct style to the timer display (e.g., change the text color to red or add a CSS class named "timer-complete") so the User can see the session has ended without reading the digits.
8. THE Timer SHALL display the remaining time in MM:SS format at all times, zero-padding both the minutes and seconds fields to two digits (e.g., "04:07", "00:00").
9. WHILE the Timer is running, THE Start button SHALL have its disabled attribute set to true, and the Stop button SHALL have its disabled attribute set to false.
10. WHILE the Timer is stopped (never started or after reset) or paused, THE Start button SHALL have its disabled attribute set to false, and the Stop button SHALL have its disabled attribute set to true. IF both AC9 and AC10 apply simultaneously (e.g., transitioning between states), THEN AC10 SHALL take precedence for stopped or paused states.
11. WHEN the Timer is reset, THE Timer SHALL remove any "timer-complete" visual style applied when the countdown reached 00:00.

---

### Requirement 3: Task Management

**User Story:** As a user, I want to add, edit, mark as done, and delete tasks, so that I can track and manage my to-do items.

#### Acceptance Criteria

1. THE Task_Manager SHALL provide a text input field and an "Add" button for creating new tasks.
2. WHEN the User clicks the Add button and the input field contains non-whitespace text (up to 500 characters), THE Task_Manager SHALL create a new Task object with the trimmed text and a completion status of false, append it to the task list, clear the input field, and re-render the list.
3. WHEN the User presses the Enter key while the task input field is focused and the input field contains valid non-whitespace text (up to 500 characters), THE Task_Manager SHALL perform the same action as clicking the Add button, including respecting the 500-character length validation and not creating the task if the text exceeds 500 characters.
4. IF the input field is empty or contains only whitespace when the User attempts to add a Task, THEN THE Task_Manager SHALL not add the Task and SHALL return focus to the input field.
5. WHEN the User clicks the complete control (checkbox or toggle) on a Task, THE Task_Manager SHALL toggle the Task's completion status: false becomes true and true becomes false.
6. WHILE a Task has a completion status of true, THE Task_Manager SHALL apply a CSS class that renders the Task text with a line-through text-decoration style.
7. WHEN the User clicks the Edit control on a Task and no other Task is currently in edit mode, THE Task_Manager SHALL replace the Task's text display with an editable input field pre-filled with the current Task text and set focus to that field.
8. WHEN the User clicks the Edit control on a Task and another Task is already in edit mode, THE Task_Manager SHALL save any pending changes to the Task already in edit mode before opening the new edit input.
9. WHEN the User confirms an edit by pressing Enter or clicking a Save button, and the edit input contains non-whitespace text, THE Task_Manager SHALL update the Task text to the trimmed new value and exit edit mode.
10. IF the User confirms an edit and the edit input is empty or contains only whitespace, THEN THE Task_Manager SHALL discard the change, restore the original Task text, and exit edit mode.
11. WHEN the User presses Escape or clicks a Cancel button while in edit mode, THE Task_Manager SHALL discard the change, restore the original Task text, and exit edit mode.
12. WHEN the User clicks the Delete control on a Task, THE Task_Manager SHALL remove that Task from the list and re-render the remaining tasks.
13. WHEN a Task is added, edited, completed, or deleted, THE Task_Manager SHALL serialize the full task list as a JSON string and write it to Storage under the key "tasks".
14. WHEN the App loads, THE Task_Manager SHALL read the value at Storage key "tasks", parse it as a JSON array, and render each Task. IF the key does not exist or the value is not valid JSON, THEN THE Task_Manager SHALL initialize with an empty task list.

---

### Requirement 4: Quick Links

**User Story:** As a user, I want to add and manage shortcut buttons that open my favorite websites, so that I can access them quickly from the app.

#### Acceptance Criteria

1. THE Quick_Links component SHALL display all saved Links as clickable buttons, each labeled with the Link's label text.
2. THE Quick_Links component SHALL provide an input field for a label and an input field for a URL, plus an "Add Link" button.
3. WHEN the User submits a new Link, THE Quick_Links component SHALL trim whitespace from both the label and URL values before validation.
4. WHEN the trimmed label is non-empty, the trimmed URL is non-empty, and the trimmed URL begins with "http://" or "https://", THE Quick_Links component SHALL add the Link and render it as a new button.
5. IF the trimmed label is empty, the trimmed URL is empty, or the trimmed URL does not begin with "http://" or "https://", THEN THE Quick_Links component SHALL not add the Link and SHALL display an inline validation message identifying which field is invalid. THE Quick_Links component SHALL only block link creation and show validation messages when one or more inputs are actually invalid; valid inputs SHALL NOT trigger validation messages or block submission.
6. THE label SHALL be no longer than 50 characters; IF the User enters a label exceeding 50 characters, THEN THE Quick_Links component SHALL not add the Link and SHALL display a validation message stating the label is too long.
7. WHEN the User clicks a Link button, THE Quick_Links component SHALL call window.open with the Link's URL and a target of "_blank".
8. WHEN the User clicks the delete control on a Link, THE Quick_Links component SHALL remove that Link button from the display.
9. WHEN a Link is added or deleted, THE Quick_Links component SHALL serialize the full links list as a JSON string and write it to Storage under the key "quickLinks".
10. WHEN the App loads, THE Quick_Links component SHALL read the value at Storage key "quickLinks", parse it as a JSON array, and render each Link as a button. IF the key does not exist or the value is not valid JSON, THEN THE Quick_Links component SHALL initialize with an empty links list.

---

## Technical Constraints

- **TC-1 (Technology Stack):** THE App SHALL be implemented using only HTML, CSS, and Vanilla JavaScript with no external frameworks or libraries. No backend server is required.
- **TC-2 (Data Storage):** THE App SHALL use the browser Local Storage API as the sole persistence mechanism. All data SHALL be stored client-side only.
- **TC-3 (Browser Compatibility):** THE App SHALL function correctly in current stable versions of Chrome, Firefox, Edge, and Safari.

## Non-Functional Requirements

- **NFR-1 (Simplicity):** THE App SHALL require no installation or configuration steps beyond opening the HTML file in a browser.
- **NFR-2 (Performance):** THE App SHALL render all UI interactions with no perceptible lag on standard consumer hardware.
- **NFR-3 (Visual Design):** THE App SHALL present a clean visual hierarchy with readable typography and clear separation between the four feature widgets.

## File Structure Constraints

- THE App SHALL contain exactly one CSS file located inside a `css/` directory.
- THE App SHALL contain exactly one JavaScript file located inside a `js/` directory.
