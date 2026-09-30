/**
 * ============================================================================
 * GAME.JS (Part 1) - Memory Match Game Engine & Card Logic
 * Memory Match Application - Day 3
 * ============================================================================
 * Features:
 * - Predefined card sets (Featured Pokémon theme + Animals, Food, Programming, Space)
 * - Dynamic card board generation with pair slicing based on difficulty
 * - Fisher-Yates array shuffling and hardware-accelerated 3D card injection
 * - Interactive card flipping, 2-card comparison, match lock state, and mismatch reset
 * ============================================================================
 */

'use strict';

/**
 * ----------------------------------------------------------------------------
 * 1. Predefined Card Themes (18+ Unique Items Each for 6x6 Hard Grid)
 * ----------------------------------------------------------------------------
 */
const CARD_THEMES = {
  pokemon: [
    { icon: '⚡', label: 'Pikachu', badge: 'Electric' },
    { icon: '🔥', label: 'Charizard', badge: 'Fire' },
    { icon: '💧', label: 'Blastoise', badge: 'Water' },
    { icon: '🌿', label: 'Venusaur', badge: 'Grass' },
    { icon: '👻', label: 'Gengar', badge: 'Ghost' },
    { icon: '🔮', label: 'Mewtwo', badge: 'Psychic' },
    { icon: '🥊', label: 'Lucario', badge: 'Fighting' },
    { icon: '🐉', label: 'Dragonite', badge: 'Dragon' },
    { icon: '💤', label: 'Snorlax', badge: 'Normal' },
    { icon: '🦊', label: 'Eevee', badge: 'Normal' },
    { icon: '🌊', label: 'Gyarados', badge: 'Water' },
    { icon: '🎤', label: 'Jigglypuff', badge: 'Fairy' },
    { icon: '💪', label: 'Machamp', badge: 'Fighting' },
    { icon: '🥄', label: 'Alakazam', badge: 'Psychic' },
    { icon: '🐕', label: 'Arcanine', badge: 'Fire' },
    { icon: '🧊', label: 'Lapras', badge: 'Ice' },
    { icon: '🦅', label: 'Zapdos', badge: 'Legendary' },
    { icon: '✨', label: 'Rayquaza', badge: 'Legendary' },
    { icon: '🌙', label: 'Umbreon', badge: 'Dark' },
    { icon: '☀️', label: 'Espeon', badge: 'Psychic' }
  ],
  animals: [
    { icon: '🦁', label: 'Lion', badge: 'Mammal' },
    { icon: '🐯', label: 'Tiger', badge: 'Mammal' },
    { icon: '🐘', label: 'Elephant', badge: 'Mammal' },
    { icon: '🐼', label: 'Panda', badge: 'Mammal' },
    { icon: '🦊', label: 'Fox', badge: 'Mammal' },
    { icon: '🐬', label: 'Dolphin', badge: 'Aquatic' },
    { icon: '🦅', label: 'Eagle', badge: 'Bird' },
    { icon: '🐺', label: 'Wolf', badge: 'Mammal' },
    { icon: '🐨', label: 'Koala', badge: 'Marsupial' },
    { icon: '🦉', label: 'Owl', badge: 'Bird' },
    { icon: '🦒', label: 'Giraffe', badge: 'Mammal' },
    { icon: '🦘', label: 'Kangaroo', badge: 'Marsupial' },
    { icon: '🐧', label: 'Penguin', badge: 'Bird' },
    { icon: '🐙', label: 'Octopus', badge: 'Aquatic' },
    { icon: '🦓', label: 'Zebra', badge: 'Mammal' },
    { icon: '🦚', label: 'Peacock', badge: 'Bird' },
    { icon: '🦋', label: 'Butterfly', badge: 'Insect' },
    { icon: '🐝', label: 'Honeybee', badge: 'Insect' },
    { icon: '🦩', label: 'Flamingo', badge: 'Bird' },
    { icon: '🐢', label: 'Turtle', badge: 'Reptile' }
  ],
  food: [
    { icon: '🍕', label: 'Pizza', badge: 'Italian' },
    { icon: '🍔', label: 'Burger', badge: 'Fast Food' },
    { icon: '🍣', label: 'Sushi', badge: 'Japanese' },
    { icon: '🌮', label: 'Taco', badge: 'Mexican' },
    { icon: '🍩', label: 'Donut', badge: 'Bakery' },
    { icon: '🍦', label: 'Ice Cream', badge: 'Dessert' },
    { icon: '🥞', label: 'Pancakes', badge: 'Breakfast' },
    { icon: '🍓', label: 'Strawberry', badge: 'Fruit' },
    { icon: '🥑', label: 'Avocado', badge: 'Produce' },
    { icon: '🍜', label: 'Ramen', badge: 'Noodles' },
    { icon: '🍟', label: 'Fries', badge: 'Snack' },
    { icon: '🧁', label: 'Cupcake', badge: 'Pastry' },
    { icon: '🍿', label: 'Popcorn', badge: 'Snack' },
    { icon: '🍪', label: 'Cookie', badge: 'Bakery' },
    { icon: '🍉', label: 'Watermelon', badge: 'Fruit' },
    { icon: '🥐', label: 'Croissant', badge: 'French' },
    { icon: '🍇', label: 'Grapes', badge: 'Fruit' },
    { icon: '🍫', label: 'Chocolate', badge: 'Candy' },
    { icon: '🥨', label: 'Pretzel', badge: 'Snack' },
    { icon: '🍰', label: 'Shortcake', badge: 'Dessert' }
  ],
  programming: [
    { icon: '💻', label: 'JavaScript', badge: 'Frontend' },
    { icon: '🐍', label: 'Python', badge: 'AI & Data' },
    { icon: '☕', label: 'Java', badge: 'Enterprise' },
    { icon: '⚛️', label: 'React', badge: 'UI Library' },
    { icon: '🦀', label: 'Rust', badge: 'Systems' },
    { icon: '🌐', label: 'HTML5', badge: 'Web Standard' },
    { icon: '🎨', label: 'CSS3', badge: 'Styling' },
    { icon: '🐬', label: 'SQL', badge: 'Database' },
    { icon: '🐳', label: 'Docker', badge: 'DevOps' },
    { icon: '🐙', label: 'Git', badge: 'VCS' },
    { icon: '🚀', label: 'Deploy', badge: 'Cloud' },
    { icon: '🐛', label: 'Bug Fix', badge: 'Debug' },
    { icon: '⚡', label: 'Vite', badge: 'Bundler' },
    { icon: '🔒', label: 'Security', badge: 'Auth' },
    { icon: '📦', label: 'NPM', badge: 'Packages' },
    { icon: '🤖', label: 'Machine Learning', badge: 'AI' },
    { icon: '📱', label: 'Mobile App', badge: 'iOS/Android' },
    { icon: '🐧', label: 'Linux', badge: 'Server OS' },
    { icon: '💎', label: 'Ruby', badge: 'Backend' },
    { icon: '🐘', label: 'PHP', badge: 'Backend' }
  ],
  space: [
    { icon: '🚀', label: 'Rocket', badge: 'Orbital' },
    { icon: '🪐', label: 'Saturn', badge: 'Gas Giant' },
    { icon: '🌍', label: 'Earth', badge: 'Home' },
    { icon: '☀️', label: 'Sun', badge: 'Star' },
    { icon: '🌙', label: 'Moon', badge: 'Satellite' },
    { icon: '🛸', label: 'UFO', badge: 'Cosmic' },
    { icon: '🌌', label: 'Milky Way', badge: 'Galaxy' },
    { icon: '☄️', label: 'Comet', badge: 'Ice & Dust' },
    { icon: '🛰️', label: 'Satellite', badge: 'Orbital' },
    { icon: '👨‍🚀', label: 'Astronaut', badge: 'Explorer' },
    { icon: '🔭', label: 'Telescope', badge: 'Optics' },
    { icon: '⭐', label: 'Supernova', badge: 'Deep Space' },
    { icon: '🌠', label: 'Shooting Star', badge: 'Meteor' },
    { icon: '👾', label: 'Alien Life', badge: 'Exoplanet' },
    { icon: '🌑', label: 'Solar Eclipse', badge: 'Event' },
    { icon: '🪐', label: 'Jupiter', badge: 'Gas Giant' },
    { icon: '🔴', label: 'Mars', badge: 'Red Planet' },
    { icon: '⚛️', label: 'Nebula', badge: 'Stellar' },
    { icon: '🛰️', label: 'Space Station', badge: 'Habitat' },
    { icon: '🌌', label: 'Black Hole', badge: 'Singularity' }
  ]
};

/**
 * Difficulty Configuration Table
 */
const DIFFICULTY_CONFIG = {
  easy: {
    pairs: 8,
    gridClass: 'grid--easy',
    cols: 4,
    rows: 4
  },
  medium: {
    pairs: 10,
    gridClass: 'grid--medium',
    cols: 5,
    rows: 4
  },
  hard: {
    pairs: 18,
    gridClass: 'grid--hard',
    cols: 6,
    rows: 6
  }
};

/**
 * ----------------------------------------------------------------------------
 * 2. Game State Variables
 * ----------------------------------------------------------------------------
 */
let currentTheme = 'pokemon';
let currentDifficulty = 'easy';
let flippedCards = [];
let matchedPairs = 0;
let totalPairs = 8;
let movesCount = 0;
let currentScore = 0;
let isBoardLocked = false;
let isGameActive = false;
let isPaused = false;
let timerSeconds = 0;
let timerInterval = null;

/**
 * ----------------------------------------------------------------------------
 * 3. DOM Element References
 * ----------------------------------------------------------------------------
 */
let cardBoardEl = null;
let movesCountEl = null;
let timeElapsedEl = null;
let matchesCountEl = null;
let currentScoreEl = null;
let themeSelectEl = null;
let difficultySelectEl = null;
let pauseBtnEl = null;
let restartBtnEl = null;
let newGameBtnEl = null;
let pauseModalEl = null;
let resumeBtnEl = null;
let modalRestartBtnEl = null;
let winModalEl = null;
let winScoreEl = null;
let winTimeEl = null;
let winMovesEl = null;
let winAccuracyEl = null;
let playAgainBtnEl = null;

/**
 * Initialize on DOMContentLoaded
 */
document.addEventListener('DOMContentLoaded', () => {
  // Only initialize game logic if on a page containing the cardBoard
  cardBoardEl = document.getElementById('cardBoard');
  if (!cardBoardEl) return;

  cacheDOMElements();
  bindEventListeners();
  loadSavedPreferences();
  initGame();
});

/**
 * Cache all necessary interactive elements
 */
function cacheDOMElements() {
  movesCountEl = document.getElementById('movesCount');
  timeElapsedEl = document.getElementById('timeElapsed');
  matchesCountEl = document.getElementById('matchesCount');
  currentScoreEl = document.getElementById('currentScore');
  themeSelectEl = document.getElementById('themeSelect');
  difficultySelectEl = document.getElementById('difficultySelect');
  pauseBtnEl = document.getElementById('pauseBtn');
  restartBtnEl = document.getElementById('restartBtn');
  newGameBtnEl = document.getElementById('newGameBtn');

  pauseModalEl = document.getElementById('pauseModal');
  resumeBtnEl = document.getElementById('resumeBtn');
  modalRestartBtnEl = document.getElementById('modalRestartBtn');

  winModalEl = document.getElementById('winModal');
  winScoreEl = document.getElementById('winScore');
  winTimeEl = document.getElementById('winTime');
  winMovesEl = document.getElementById('winMoves');
  winAccuracyEl = document.getElementById('winAccuracy');
  playAgainBtnEl = document.getElementById('playAgainBtn');
}

/**
 * Load persisted theme & difficulty from localStorage
 */
function loadSavedPreferences() {
  if (typeof getDifficulty === 'function') {
    currentDifficulty = getDifficulty();
    if (difficultySelectEl) {
      difficultySelectEl.value = currentDifficulty;
    }
  }

  if (typeof getSelectedTheme === 'function') {
    currentTheme = getSelectedTheme();
    if (themeSelectEl) {
      themeSelectEl.value = currentTheme;
    }
  }
}

/**
 * ----------------------------------------------------------------------------
 * 4. Game Initialization & Dynamic Board Generator
 * ----------------------------------------------------------------------------
 */
function initGame() {
  stopTimer();
  closeModals();

  // Read selected controls
  if (difficultySelectEl) {
    currentDifficulty = difficultySelectEl.value || 'easy';
  }
  if (themeSelectEl) {
    currentTheme = themeSelectEl.value || 'pokemon';
  }

  const config = DIFFICULTY_CONFIG[currentDifficulty] || DIFFICULTY_CONFIG.easy;
  totalPairs = config.pairs;
  matchedPairs = 0;
  movesCount = 0;
  currentScore = 0;
  timerSeconds = 0;
  isGameActive = false;
  isPaused = false;
  isBoardLocked = false;
  flippedCards = [];

  // Update HUD display
  updateHUD();

  // Configure grid layout class on #cardBoard
  cardBoardEl.className = `card-board ${config.gridClass}`;
  cardBoardEl.innerHTML = '';

  // Retrieve base card list for active theme
  const sourceDeck = CARD_THEMES[currentTheme] || CARD_THEMES.pokemon;

  // Slice pairs based on difficulty
  const selectedCards = sourceDeck.slice(0, totalPairs);

  // Duplicate cards into matching pairs
  const pairDeck = [];
  selectedCards.forEach((card, pairIndex) => {
    pairDeck.push({
      ...card,
      pairId: pairIndex,
      uid: `${pairIndex}-a`
    });
    pairDeck.push({
      ...card,
      pairId: pairIndex,
      uid: `${pairIndex}-b`
    });
  });

  // Shuffle using Fisher-Yates algorithm from utils.js
  const shuffledDeck = typeof shuffleArray === 'function' ? shuffleArray(pairDeck) : pairDeck;

  // Inject cards into board using a DocumentFragment
  const fragment = document.createDocumentFragment();

  shuffledDeck.forEach((card) => {
    const cardBtn = createCardElement(card);
    fragment.appendChild(cardBtn);
  });

  cardBoardEl.appendChild(fragment);
}

/**
 * Creates a single 3D Card DOM Element with Front & Back Faces
 */
function createCardElement(card) {
  const btn = document.createElement('button');
  btn.className = 'card';
  btn.type = 'button';
  btn.dataset.pairId = card.pairId;
  btn.dataset.uid = card.uid;
  btn.setAttribute('role', 'button');
  btn.setAttribute('tabindex', '0');
  btn.setAttribute('aria-label', 'Mystery Card: Face Down');

  btn.innerHTML = `
    <div class="card__inner">
      <div class="card__face card__face--back">
        <span class="card__back-emblem" aria-hidden="true">🃏</span>
      </div>
      <div class="card__face card__face--front">
        <span class="card__icon" aria-hidden="true">${card.icon}</span>
        <span class="card__label">${card.label}</span>
        ${card.badge ? `<span class="card__badge">${card.badge}</span>` : ''}
      </div>
    </div>
  `;

  // Attach card click interaction
  btn.addEventListener('click', () => handleCardClick(btn, card));

  return btn;
}

/**
 * ----------------------------------------------------------------------------
 * 5. Card Flip Interaction & 2-Card Matching Logic
 * ----------------------------------------------------------------------------
 */
function handleCardClick(cardBtn, cardData) {
  // Guard checks: board locked, game paused, or card already open/matched
  if (isBoardLocked || isPaused) return;
  if (cardBtn.classList.contains('is-flipped') || cardBtn.classList.contains('is-matched')) return;
  if (flippedCards.length >= 2) return;

  // Start game timer on very first flip
  if (!isGameActive) {
    isGameActive = true;
    startTimer();
  }

  // Flip card
  cardBtn.classList.add('is-flipped');
  cardBtn.setAttribute('aria-label', `Card: ${cardData.label}`);

  // Zero-dependency sound effect
  if (typeof SoundEffects !== 'undefined' && SoundEffects.flip) {
    SoundEffects.flip();
  }

  flippedCards.push({ element: cardBtn, data: cardData });

  // When 2 cards are face-up, perform comparison
  if (flippedCards.length === 2) {
    processCardComparison();
  }
}

/**
 * Compares 2 flipped cards, applies match lock or mismatch shake reset
 */
function processCardComparison() {
  isBoardLocked = true;
  movesCount++;
  updateHUD();

  const [cardA, cardB] = flippedCards;
  const isMatch = cardA.data.pairId === cardB.data.pairId;

  if (isMatch) {
    handleMatch(cardA, cardB);
  } else {
    handleMismatch(cardA, cardB);
  }
}

/**
 * Handle successful match
 */
function handleMatch(cardA, cardB) {
  matchedPairs++;

  // Reward points: base 100 points with speed/move consideration
  currentScore += 100;
  updateHUD();

  // Play cheerful match arpeggio
  if (typeof SoundEffects !== 'undefined' && SoundEffects.match) {
    SoundEffects.match();
  }

  // Lock both cards in matched state
  cardA.element.classList.add('is-matched');
  cardB.element.classList.add('is-matched');
  cardA.element.setAttribute('aria-disabled', 'true');
  cardB.element.setAttribute('aria-disabled', 'true');

  flippedCards = [];
  isBoardLocked = false;

  // Check victory condition
  if (matchedPairs === totalPairs) {
    handleVictory();
  }
}

/**
 * Handle non-matching pair
 */
function handleMismatch(cardA, cardB) {
  // Minor score penalty
  currentScore = Math.max(0, currentScore - 5);
  updateHUD();

  // Play subtle mismatch audio cue
  if (typeof SoundEffects !== 'undefined' && SoundEffects.mismatch) {
    SoundEffects.mismatch();
  }

  // Trigger CSS shake keyframe animation
  cardA.element.classList.add('is-mismatched');
  cardB.element.classList.add('is-mismatched');

  // Flip cards back after brief delay
  setTimeout(() => {
    cardA.element.classList.remove('is-flipped', 'is-mismatched');
    cardB.element.classList.remove('is-flipped', 'is-mismatched');
    cardA.element.setAttribute('aria-label', 'Mystery Card: Face Down');
    cardB.element.setAttribute('aria-label', 'Mystery Card: Face Down');

    flippedCards = [];
    isBoardLocked = false;
  }, 850);
}

/**
 * Handle victory when all pairs are matched
 */
function handleVictory() {
  stopTimer();
  isGameActive = false;

  // Time bonus added to score (faster finish = more points)
  const timeBonus = Math.max(0, 300 - timerSeconds) * 2;
  currentScore += timeBonus;
  updateHUD();

  // Play triumphant victory fanfare
  if (typeof SoundEffects !== 'undefined' && SoundEffects.victory) {
    SoundEffects.victory();
  }

  if (typeof showToast === 'function') {
    showToast('🎉 Magnificently done! All pairs matched!', 'success', 3500);
  }

  // Calculate final accuracy percentage
  const accuracy = movesCount > 0 ? Math.round((totalPairs / movesCount) * 100) : 100;

  // Populate win modal statistics
  if (winScoreEl) winScoreEl.textContent = currentScore;
  if (winTimeEl) winTimeEl.textContent = typeof formatTime === 'function' ? formatTime(timerSeconds) : timerSeconds;
  if (winMovesEl) winMovesEl.textContent = movesCount;
  if (winAccuracyEl) winAccuracyEl.textContent = `${accuracy}%`;

  // Display Win Modal
  if (winModalEl) {
    setTimeout(() => {
      winModalEl.classList.add('modal--active');
    }, 600);
  }
}

/**
 * ----------------------------------------------------------------------------
 * 6. Timer & HUD Management
 * ----------------------------------------------------------------------------
 */
function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (!isPaused) {
      timerSeconds++;
      if (timeElapsedEl) {
        timeElapsedEl.textContent = typeof formatTime === 'function' ? formatTime(timerSeconds) : timerSeconds;
      }
    }
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function updateHUD() {
  if (movesCountEl) movesCountEl.textContent = movesCount;
  if (matchesCountEl) matchesCountEl.textContent = `${matchedPairs} / ${totalPairs}`;
  if (currentScoreEl) currentScoreEl.textContent = currentScore;
  if (timeElapsedEl && !isGameActive && timerSeconds === 0) {
    timeElapsedEl.textContent = '00:00';
  }
}

/**
 * ----------------------------------------------------------------------------
 * 7. Controls & Modal Event Listeners
 * ----------------------------------------------------------------------------
 */
function bindEventListeners() {
  // Theme dropdown change
  if (themeSelectEl) {
    themeSelectEl.addEventListener('change', (e) => {
      currentTheme = e.target.value;
      if (typeof setSelectedTheme === 'function') {
        setSelectedTheme(currentTheme);
      }
      initGame();
    });
  }

  // Difficulty dropdown change
  if (difficultySelectEl) {
    difficultySelectEl.addEventListener('change', (e) => {
      currentDifficulty = e.target.value;
      if (typeof setDifficulty === 'function') {
        setDifficulty(currentDifficulty);
      }
      initGame();
    });
  }

  // New Game Button
  if (newGameBtnEl) {
    newGameBtnEl.addEventListener('click', () => {
      initGame();
      if (typeof showToast === 'function') {
        showToast('New game board shuffled!', 'info', 1800);
      }
    });
  }

  // Restart Button
  if (restartBtnEl) {
    restartBtnEl.addEventListener('click', () => {
      initGame();
      if (typeof showToast === 'function') {
        showToast('Game restarted!', 'info', 1800);
      }
    });
  }

  // Pause Button
  if (pauseBtnEl) {
    pauseBtnEl.addEventListener('click', () => {
      if (!isGameActive) return;
      isPaused = true;
      if (pauseModalEl) {
        pauseModalEl.classList.add('modal--active');
      }
    });
  }

  // Resume Button in Pause Modal
  if (resumeBtnEl) {
    resumeBtnEl.addEventListener('click', () => {
      isPaused = false;
      closeModals();
    });
  }

  // Restart from Pause Modal
  if (modalRestartBtnEl) {
    modalRestartBtnEl.addEventListener('click', () => {
      closeModals();
      initGame();
    });
  }

  // Play Again Button in Win Modal
  if (playAgainBtnEl) {
    playAgainBtnEl.addEventListener('click', () => {
      closeModals();
      initGame();
    });
  }
}

function closeModals() {
  if (pauseModalEl) pauseModalEl.classList.remove('modal--active');
  if (winModalEl) winModalEl.classList.remove('modal--active');
}

/**
 * Global Exports
 */
if (typeof window !== 'undefined') {
  window.initGame = initGame;
  window.CARD_THEMES = CARD_THEMES;
  window.DIFFICULTY_CONFIG = DIFFICULTY_CONFIG;
}
