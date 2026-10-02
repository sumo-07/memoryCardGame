# Memory Match 🃏

A feature-rich, responsive **Memory Card Matching Game Platform** built purely with **HTML5, CSS3, and Vanilla JavaScript (ES6+)**. 

This application is designed as an academic showcase demonstrating DOM manipulation, events, form validation, CSS 3D transforms, and browser storage diversity (`localStorage`, `Cookies`, and `IndexedDB`) with full CRUD operations for custom card sets.

---

## 🚀 Key Highlights & Architectural Rules
* **100% Frontend-Only**: No backend server, no external API dependencies, works completely offline.
* **Strictly No Frameworks**: Pure Vanilla HTML5, CSS3, and modern JavaScript.
* **Zero Inline CSS**: All styling is encapsulated in external modular `.css` files. Dynamic states are managed strictly via CSS classes (`.is-flipped`, `.is-matched`, `.modal--active`, `.dark-theme`).
* **Hardware-Accelerated 3D Transforms**: Smooth 60fps card flips utilizing CSS `perspective`, `transform-style: preserve-3d`, and `backface-visibility`.
* **Storage Separation**:
  * **`localStorage`**: Lightweight settings (dark/light theme, difficulty, audio, animations).
  * **`Cookies`**: Player profile identity (`playerName`, `lastVisit`) with dynamic welcome greetings.
  * **`IndexedDB`**: Structured storage (`MemoryMatchDB`) for custom card sets and match history logs.
* **Featured Themes**: Default Pokémon theme (`⚡ Pikachu`, `🔥 Charizard`, `💧 Blastoise`, etc.) alongside Animals, Food, Programming, Space, and user-created custom card sets.

---

## 📁 Project Structure (Day 4 State)

```text
memoryCardGame/
├── .gitignore                  # Git ignore definitions
├── README.md                   # Project documentation
├── index.html                  # Main Game Arena template
├── dashboard.html              # Analytics & Custom Card Set CRUD template
├── settings.html               # Preferences & Profile settings template
├── css/
│   ├── style.css               # Design tokens, variables, reset & typography
│   ├── components.css          # Navigation, buttons, modals, badges & form controls
│   ├── game.css                # 3D card architecture, grid templates & HUD/controls
│   └── responsive.css          # Fluid mobile, tablet, and desktop breakpoints
└── js/
    ├── utils.js                # Fisher-Yates shuffle, formatTime, Web Audio synthesizer, toasts
    ├── storage.js              # Cookies (player, lastVisit), localStorage (theme, sound, anims)
    ├── indexedDB.js            # MemoryMatchDB (cardSets CRUD, gameHistory, calculateStats)
    ├── app.js                  # Global theme toggle, active nav links & greeting banners
    └── game.js                 # Complete game engine: timer, scoring, pause/blur, win & DB saves
```

---

## 🛠️ How to Run Locally

Because this project is built using 100% frontend vanilla web standards, you can run it simply by opening `index.html` in any modern web browser:

1. Clone or download this repository.
2. Open `index.html` directly in Google Chrome, Microsoft Edge, Mozilla Firefox, or Safari.
3. Or use a local development server such as VS Code **Live Server** or `npx serve .`.
