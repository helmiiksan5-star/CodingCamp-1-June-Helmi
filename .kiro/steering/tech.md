# Tech Stack

## Languages & Technologies

- **HTML** — single `index.html` entry point
- **CSS** — vanilla CSS, one file at `css/style.css`
- **JavaScript** — vanilla JS (ES6+), one file at `js/app.js`

No build tools, bundlers, package managers, transpilers, or external libraries. The project runs directly in the browser without any compilation step.

## Browser APIs Used

- `localStorage` — persisting tasks and quick links
- `setInterval` / `clearInterval` — timer and clock updates
- `window.open` — opening quick links in a new tab
- `Date` — deriving current time, date, and greeting

## Running the App

Open `index.html` directly in a browser. No server, no install step.

```
# Open in default browser (Windows)
start index.html
```

## Browser Compatibility

Target: current stable versions of Chrome, Firefox, Edge, and Safari.  
Avoid APIs or syntax not supported across all four without a polyfill.
