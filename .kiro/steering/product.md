# Product

A client-side **To-Do List Website** — a minimal, single-page productivity app that runs entirely in the browser with no backend.

## Core Features

- **Greeting Widget** — displays current time (HH:MM, updated every minute), full date, and a time-based greeting (Good Morning / Afternoon / Evening / Night)
- **Focus Timer** — 25-minute Pomodoro countdown with Start, Stop, and Reset controls
- **Task Manager** — create, edit, complete (toggle), and delete tasks; tasks persist across sessions
- **Quick Links** — user-defined shortcut buttons that open URLs in a new tab; links persist across sessions

## Key Constraints

- Zero dependencies — no frameworks, no libraries, no backend
- All data persists via the browser's `localStorage` API (`"tasks"` and `"quickLinks"` keys)
- Must work in current stable Chrome, Firefox, Edge, and Safari
- Designed to be opened directly as an HTML file or used as a browser extension
