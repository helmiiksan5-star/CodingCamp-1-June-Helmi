# Project Structure

```
project-root/
├── index.html        # Single HTML entry point — all markup lives here
├── css/
│   └── style.css     # All styles — exactly one CSS file
├── js/
│   └── app.js        # All JavaScript — exactly one JS file
└── .kiro/
    ├── specs/        # Kiro spec documents (requirements, design, tasks)
    └── steering/     # Kiro steering rules (this folder)
```

## Conventions

- **One file per type** — exactly one `.css` file and one `.js` file. Do not split into multiple files or add new ones.
- **No folders beyond `css/` and `js/`** — keep the root flat.
- **All JS in `app.js`** — widgets (Greeting, Timer, Task Manager, Quick Links) are implemented as logical sections within the single file, not separate modules.
- **All styles in `style.css`** — component styles, utility classes, and state classes (e.g., `.timer-complete`, `.task-complete`) all live here.
- **No inline styles** — use CSS classes for all visual state changes.
- **localStorage keys** — use exactly `"tasks"` for the task list and `"quickLinks"` for the links list. Do not introduce other keys.

## JavaScript Organization (within `app.js`)

Group code by feature in this order:
1. Greeting Widget (clock interval, date formatting, greeting logic)
2. Focus Timer (countdown, Start/Stop/Reset handlers, button state)
3. Task Manager (add, edit, complete, delete, render, localStorage sync)
4. Quick Links (add, delete, render, localStorage sync)
5. Initialization (DOMContentLoaded bootstrap, load from localStorage)
