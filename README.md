# Memory Match 🃏

A feature-rich, high-performance, and responsive **Memory Card Matching Game Platform** built purely with **Vanilla HTML5, CSS3, and modern JavaScript (ES6+)**.

Designed as a comprehensive academic showcase, this project demonstrates advanced DOM manipulation, event delegation, client-side form validation, hardware-accelerated CSS 3D transforms, real-time procedural audio synthesis via the Web Audio API, and browser storage diversity (**Cookies**, **localStorage**, and **IndexedDB**) featuring a complete CRUD management system for custom card decks.

---

## 🚀 Key Highlights & Architectural Rules

* **100% Frontend-Only**: Operates completely offline with zero backend servers, zero runtime dependencies, and no external CDN or API calls.
* **Strictly No Frameworks**: Built using pure web standards (No React, Vue, jQuery, TailwindCSS, or Bootstrap).
* **Zero Inline CSS**: All styling is strictly encapsulated in modular external stylesheets (`style.css`, `components.css`, `game.css`, `dashboard.css`, `settings.css`, `responsive.css`). Dynamic states are driven exclusively via CSS classes (`.is-flipped`, `.is-matched`, `.is-mismatched`, `.is-paused`, `.modal--active`, `.dark-theme`, `.no-animations`).
* **Zero Inline Scripts**: All logic is partitioned into dedicated modular JavaScript files with clear separation of concerns.
* **Hardware-Accelerated 3D Transforms**: Silky smooth 60fps card flips utilizing CSS `perspective: 1000px`, `transform-style: preserve-3d`, and `backface-visibility: hidden`.
* **Zero-Dependency Web Audio Synthesizer**: Sound effects (`flip`, `match`, `mismatch`, `victory`) are generated procedurally on-the-fly using the browser's `AudioContext` with custom oscillator waveforms and ADSR gain envelopes — no external `.mp3` or `.wav` files required.
* **Pure CSS Analytics Visualizations**: Accuracy meters, win rate indicators, and segmented difficulty distribution bars built entirely with CSS flexbox, gradients, and custom properties — without any third-party charting libraries.

---

## 📁 Project Directory Structure (Day 5 Final State)

```text
memoryCardGame/
├── .gitignore                  # Git ignore definitions
├── README.md                   # Comprehensive documentation & Viva guide
├── index.html                  # Main Game Arena template
├── dashboard.html              # Analytics & Custom Card Set CRUD template
├── settings.html               # Preferences & Player Profile settings template
├── css/
│   ├── style.css               # Design tokens, CSS variables, reset, light/dark themes
│   ├── components.css          # Navigation, buttons, modals, badges, toast notifications
│   ├── game.css                # 3D card architecture, grid layouts, HUD, pause blur
│   ├── dashboard.css           # Statistics cards, CSS visual charts, CRUD grid, data table
│   ├── settings.css            # Form rows, theme cards, iOS toggle switches, action bars
│   └── responsive.css          # Multi-device media queries (Mobile, Tablet, Desktop)
└── js/
    ├── utils.js                # Fisher-Yates shuffle, formatTime, Web Audio synthesizer, toasts
    ├── storage.js              # Cookie manager (player, visit) & localStorage manager (theme, sound)
    ├── indexedDB.js            # MemoryMatchDB (cardSets CRUD, match history logs, calculateStats)
    ├── app.js                  # Global app controller (theme toggle, active nav links, greetings)
    ├── game.js                 # Complete game engine: timer, combo scoring, pause/blur, win & DB saves
    ├── dashboard.js            # Analytics computation, chart rendering, card set CRUD & validation
    └── settings.js             # Player profile editor, preference synchronization & database wipe
```

---

## 💾 Client-Side Storage Architecture & Breakdown

This application implements a multi-tier client storage model designed to demonstrate when and why to use each browser storage mechanism:

| Storage Type | Target Scope | Keys / Stores Stored | Lifecycle / Expiration | Storage Limit |
| :--- | :--- | :--- | :--- | :--- |
| **Cookies** | Player Identity & Session | `playerName`, `lastVisit` | 30 days (`SameSite=Lax`) | ~4 KB |
| **localStorage** | Lightweight Preferences | `memoryMatch_theme`, `memoryMatch_difficulty`, `memoryMatch_cardTheme`, `memoryMatch_sound`, `memoryMatch_animations` | Persistent across sessions | ~5 MB |
| **IndexedDB** (`MemoryMatchDB`) | Structured High-Volume Data | Object Store: `'cardSets'`<br>Object Store: `'gameHistory'` | Permanent client database | Hundreds of MBs |

### 1. Cookies Layer (`js/storage.js`)
* Manages lightweight player profile identity:
  * `playerName`: Custom alias entered by the user (default: `"Player"`).
  * `lastVisit`: Timestamp of the player's previous session, dynamically formatted and displayed in welcome banners across all pages.
* Encoded with expiration headers and `SameSite=Lax` compliance.

### 2. localStorage Layer (`js/storage.js`)
* Stores instant configuration settings synchronously:
  * Appearance mode (`'light'` or `'dark'`).
  * Default difficulty grid (`'easy'`, `'medium'`, `'hard'`).
  * Active card theme (`'pokemon'`, `'animals'`, `'food'`, `'programming'`, `'space'`, or custom deck ID).
  * Sound effects toggle (`true` / `false`).
  * 3D Card flip animation toggle (`true` / `false` — toggles `.no-animations` on `<body>`).

### 3. IndexedDB Layer (`js/indexedDB.js` — `MemoryMatchDB` v1)
* Asynchronous, transactional, schema-driven client database:
  * **`cardSets` Store** (`keyPath: 'id'`): Stores custom user-created card decks with unique IDs, names, descriptions, author tags, timestamps, and card item arrays.
  * **`gameHistory` Store** (`keyPath: 'id'`, `autoIncrement: true`): Stores complete match logs including timestamp, difficulty, theme, total moves, elapsed time, accuracy percentage, final score, and win status.
  * **Seeded Starter Set**: Automatically initializes `🕹️ Retro Arcade` (18 pixel art cards) on initial database creation.
  * **Aggregation Engine (`calculateStats()`)**: Computes games played, games won, best score, best time, total moves, average score, average accuracy, completion rate, and difficulty distribution on-the-fly.

---

## 🎮 Game Rules & Mechanics

### 1. Difficulty Grids
* **Easy (4 × 4)**: 16 cards (8 pairs). Board max-width: 580px. Target Time: 90 seconds.
* **Medium (5 × 4)**: 20 cards (10 pairs). Board max-width: 680px. Target Time: 140 seconds.
* **Hard (6 × 6)**: 36 cards (18 pairs). Board max-width: 780px. Target Time: 240 seconds.

### 2. Turn Lifecycle & 3D Transform Pipeline
1. **Initial State**: All cards are face-down showing the mystery card back (`.card__face--back` at `rotateY(0deg)`).
2. **First Card Click**:
   * Timer begins counting automatically on the first flip.
   * `.card` receives `.is-flipped`, rotating `.card__inner` by `180deg` via CSS 3D preserve transform.
   * `SoundEffects.flip()` produces a tactile blip.
3. **Second Card Click**:
   * Board is immediately locked (`isBoardLocked = true`) to prevent spam-clicking.
   * Total move counter increments by $1$.
   * **Match Case**:
     * Cards receive `.is-matched` and stay locked face-up.
     * `SoundEffects.match()` plays a 4-note ascending major arpeggio.
     * Base reward of $+120$ points is added, plus $+30 \times (\text{streak} - 1)$ for consecutive combo matches.
     * Board unlocks immediately.
   * **Mismatch Case**:
     * Both cards receive `.is-mismatched`, triggering a CSS keyframe shake animation.
     * `SoundEffects.mismatch()` plays a soft descending minor tone.
     * A minor penalty of $-10$ points is deducted (floored at $0$). Combo streak resets to $0$.
     * After an $850\text{ ms}$ delay, cards rotate back face-down, and the board unlocks.
4. **Victory Case**:
   * Triggered when `matchedPairs === totalPairs`.
   * Precision timer stops (`clearInterval`).
   * Celebratory fanfare arpeggio `SoundEffects.victory()` plays.
   * Final score bonus is computed and added.
   * Win modal displays final score, elapsed time, total moves, and accuracy.
   * Match log is persisted to IndexedDB.

### 3. Dynamic Scoring Formula
$$\text{Match Points} = 120 + (\text{Consecutive Streak} - 1) \times 30$$
$$\text{Mismatch Penalty} = -10 \quad (\text{Score Floor} = 0)$$
$$\text{Time Bonus} = \max(0, (\text{Target Time} - \text{Elapsed Seconds}) \times 6)$$
$$\text{Move Efficiency Bonus} = \max(0, (\text{Total Pairs} \times 2 - \text{Total Moves}) \times 12)$$
$$\text{Final Victory Score} = \max(0, \text{Current Score} + \text{Time Bonus} + \text{Move Efficiency Bonus})$$

### 4. Matching Accuracy Formula
$$\text{Accuracy (\%)} = \min\left(100, \operatorname{round}\left(\frac{\text{Total Pairs}}{\text{Total Moves}} \times 100\right)\right)$$

### 5. Anti-Peeking Pause System
* Pressing the **Pause** button or the **Escape** key freezes the timer and instantly applies `.is-paused` to `.card-board`.
* Cards are blurred via `filter: blur(10px); pointer-events: none; opacity: 0.55;` so players cannot memorize positions while paused.
* Resuming via the modal or pressing **Escape** again unfreezes the timer and restores board visibility.

---

## 🎨 Custom Card Sets Manager (CRUD)

Located on `dashboard.html`, players can manage custom card decks stored directly inside IndexedDB:

1. **Create (`createCardSet`)**:
   * Click `➕ Create Card Set` to launch the modal form.
   * Form validation enforces:
     * Card Set Name: 3 to 30 characters (non-empty).
     * Card Slots: Minimum of 8 valid, unique cards (maximum 18).
     * Each slot requires an emoji and a unique title.
2. **Read (`getAllCardSets`)**:
   * Decks are retrieved asynchronously and rendered as interactive cards showing card count, author, description, and emoji previews.
3. **Update (`updateCardSet`)**:
   * Clicking `✏️ Edit` pre-fills the modal form with the deck's cards and metadata, allowing seamless updates.
4. **Delete (`deleteCardSet`)**:
   * Clicking `🗑️ Delete` prompts a confirmation dialog before permanently removing custom decks from IndexedDB (starter set is protected).
5. **Play**:
   * Clicking `🎮 Play` writes the deck ID to `localStorage` and automatically routes the player to `index.html` with the custom deck loaded into the Arena.

---

## 🎓 Academic Viva & Technical Interview Questions

### Q1. Why use CSS 3D Transforms (`perspective`, `preserve-3d`, `backface-visibility`) instead of swapping image `src` or toggling display?
> **Answer:** Swapping image `src` or toggling `display: none` / `block` causes DOM reflows and repaints, resulting in frame drops and stuttering. By utilizing `perspective: 1000px`, `transform-style: preserve-3d`, and `backface-visibility: hidden`, rotation operations (`transform: rotateY(180deg)`) are offloaded directly to the **GPU (Compositor Layer)** via hardware acceleration. Both card faces remain loaded in the DOM, producing silky-smooth 60fps animations without layout recalculation.

### Q2. How does the Fisher-Yates (Knuth) Shuffle algorithm work, and why is `array.sort(() => Math.random() - 0.5)` considered an anti-pattern?
> **Answer:** `array.sort(() => Math.random() - 0.5)` does not produce a uniform distribution because sorting algorithms (like Timsort) compare adjacent elements in a non-random sequence, introducing statistical bias. In contrast, the **Fisher-Yates algorithm** runs in deterministic $O(n)$ time complexity and guarantees an unbiased, uniform permutation by iterating backward from index $n - 1$ down to $1$ and swapping each element with a randomly selected index from $0$ to $i$.

### Q3. Explain the differences between Cookies, localStorage, and IndexedDB in this architecture.
> **Answer:**
> * **Cookies** (~4KB limit): Automatically sent with every HTTP request. Used here strictly for player identity (`playerName`) and session tracking (`lastVisit`) with expiration headers and `SameSite=Lax`.
> * **localStorage** (~5MB limit): Synchronous, string-based key-value store. Ideal for instant user preferences (light/dark theme, sound toggles, difficulty) that must be read synchronously before page paint to prevent flash-of-unstyled-content (FOUC).
> * **IndexedDB** (Hundreds of MBs): Asynchronous, transactional, NoSQL object database. Supports indexing, cursors, and structured objects. Essential for storing complex custom card sets and long-term match history logs without blocking the browser main thread.

### Q4. How does the Web Audio API synthesizer work without external audio files?
> **Answer:** Instead of loading heavy `.mp3` assets over the network, `SoundEffects` instantiates an `AudioContext`. It creates virtual `OscillatorNode` instances (generating mathematical sine or triangle sound waves at frequencies like $523.25\text{ Hz}$ for $C_5$) connected to `GainNode` volume controllers. By applying exponential gain ramps (`exponentialRampToValueAtTime`), it synthesizes customized ADSR (Attack, Decay, Sustain, Release) envelopes for clicks, harmonious chords, and fanfare arpeggios with zero latency and zero bandwidth.

### Q5. What is the browser Audio Autoplay Policy, and how is it handled here?
> **Answer:** Modern browsers automatically place new `AudioContext` instances into a `'suspended'` state until the user interacts with the page (click, tap, or key press). The `SoundEffects` engine handles this lazily: it registers one-time `{ passive: true }` listeners on `pointerdown` and `keydown` to call `audioCtx.resume()`, ensuring smooth audio initialization without console warnings.

### Q6. How are the visual charts on the Dashboard rendered without Chart.js or external libraries?
> **Answer:** Charts are built using semantic HTML5 and pure CSS. Progress bars use nested tracks (`.css-progress-track` and `.css-progress-bar`) where width percentages (`0%` to `100%`) are animated using CSS `transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1)`. The difficulty distribution is a segmented flex container (`.css-segmented-bar`) where each segment's flex-basis/width is dynamically calculated from match history counts.

### Q7. How does IndexedDB transaction management work in this project?
> **Answer:** Every database operation runs inside an explicit transaction (`db.transaction(storeName, mode)`). Read-only queries (`getAll`, `get`) use mode `'readonly'`, which allows concurrent reads. Write operations (`add`, `put`, `delete`, `clear`) use mode `'readwrite'`. All calls are wrapped in native JavaScript Promises with `transaction.oncomplete` resolving the promise and `transaction.onerror` rejecting it with the error object.

### Q8. How is the "Zero Horizontal Scrolling" requirement enforced on mobile viewports?
> **Answer:**
> 1. Global CSS guard: `html, body { max-width: 100vw; overflow-x: hidden; }`.
> 2. Card grids use CSS Grid with fluid fractional sizing: `grid-template-columns: repeat(N, minmax(0, 1fr))`, where `minmax(0, 1fr)` allows columns to shrink below their content size.
> 3. For the 6×6 Hard Grid on screens $\le 640\text{px}$, textual card labels and badges are hidden (`display: none !important`), leaving only scaled icons and compact gaps ($2.5\text{px} - 4\text{px}$) to comfortably fit within 320px screens.

### Q9. How do you prevent race conditions when a user rapidly clicks multiple cards?
> **Answer:** A boolean flag `isBoardLocked` is utilized. As soon as the second card in a turn is flipped, `isBoardLocked` is set to `true`. Any click on a third card while `isBoardLocked === true` or while cards are already `.is-flipped` / `.is-matched` is immediately rejected. The lock is only released after comparisons, animations, or mismatch reset timeouts ($850\text{ms}$) have fully resolved.

### Q10. What is "Zero Inline CSS", and why is it an important architectural rule?
> **Answer:** Zero Inline CSS means no HTML tag contains a `style="..."` attribute. All layout, colors, and animations are governed by external stylesheets. Dynamic changes are executed strictly by toggling semantic CSS classes (`.is-flipped`, `.is-matched`, `.modal--active`, `.dark-theme`, `.no-animations`). This enforces strict **Separation of Concerns**, satisfies strict Content Security Policies (**CSP**), avoids specificity wars, and allows CSS caching by the browser.

---

## 🛠️ How to Run Locally

Because this project is built using 100% frontend vanilla web standards, it requires no compilation or installation.

### Method 1: Direct Browser Launch
1. Clone or download this repository.
2. Double-click [index.html](file:///d:/Projects/UCA/memoryCardGame/index.html) or right-click and choose **Open with** (Google Chrome, Microsoft Edge, Mozilla Firefox, or Safari).

### Method 2: VS Code Live Server
1. Open the project folder in **Visual Studio Code**.
2. Install the **Live Server** extension.
3. Right-click [index.html](file:///d:/Projects/UCA/memoryCardGame/index.html) and select **Open with Live Server**.

### Method 3: Local HTTP Server (Python / Node.js)
```bash
# Using Python 3
python -m http.server 8000

# Using Node.js npx
npx serve .
```
Navigate to `http://localhost:8000` in your browser.

---

## 📋 Technology Summary

* **Structure**: HTML5 Semantic Elements (`<header>`, `<main>`, `<section>`, `<nav>`, `<dialog>`, `<table>`)
* **Styling**: Vanilla CSS3, CSS Custom Properties (Variables), 3D Transforms, Flexbox, CSS Grid, Transitions & Keyframe Animations
* **Logic**: Vanilla JavaScript (ES6+), Event Delegation, Promises, Asynchronous State Machines
* **Storage**: Document Cookies, Web Storage API (`localStorage`), IndexedDB API (`IDBDatabase`, `IDBTransaction`, `IDBObjectStore`)
* **Audio**: Web Audio API (`AudioContext`, `OscillatorNode`, `GainNode`, ADSR Envelopes)
* **Accessibility**: ARIA labels (`aria-label`, `aria-modal`, `aria-live`, `role="status"`), keyboard focus rings, and Escape key listeners

---

*© 2026 Memory Match — Developed as a Vanilla Web Standards College Project.*
