/**
 * ============================================================================
 * SETTINGS.JS - Player Identity & Application Preferences Controller
 * Memory Match Application - Day 5
 * ============================================================================
 * Features:
 * - Cookie-backed Player Identity management (form validation & greeting updates)
 * - Persisted gameplay preferences: default difficulty, card theme, sound, 3D flips
 * - Light / Dark visual theme card option switchers
 * - Restore defaults handler
 * - Complete database wipe & local state purge dialog
 * ============================================================================
 */

'use strict';

/**
 * DOM Element References
 */
let profileFormEl = null;
let playerNameInputEl = null;
let groupPlayerNameEl = null;
let errorPlayerNameEl = null;

let preferencesFormEl = null;
let defaultDifficultySelectEl = null;
let defaultThemeSelectEl = null;
let themeCardLightEl = null;
let themeCardDarkEl = null;
let soundToggleEl = null;
let animationToggleEl = null;
let resetDefaultsBtnEl = null;
let savePreferencesBtnEl = null;

let clearAllDataBtnEl = null;
let resetAllConfirmModalEl = null;
let cancelResetAllBtnEl = null;
let confirmResetAllBtnEl = null;

let selectedAppearanceTheme = 'light';

/**
 * Initialize on DOMContentLoaded
 */
document.addEventListener('DOMContentLoaded', () => {
  cacheDOMElements();
  bindEventListeners();
  loadSavedSettings();
});

/**
 * Cache all necessary interactive elements
 */
function cacheDOMElements() {
  profileFormEl = document.getElementById('profileForm');
  playerNameInputEl = document.getElementById('playerNameInput');
  groupPlayerNameEl = document.getElementById('groupPlayerName');
  errorPlayerNameEl = document.getElementById('errorPlayerName');

  preferencesFormEl = document.getElementById('preferencesForm');
  defaultDifficultySelectEl = document.getElementById('defaultDifficultySelect');
  defaultThemeSelectEl = document.getElementById('defaultThemeSelect');
  themeCardLightEl = document.getElementById('themeCardLight');
  themeCardDarkEl = document.getElementById('themeCardDark');
  soundToggleEl = document.getElementById('soundToggle');
  animationToggleEl = document.getElementById('animationToggle');
  resetDefaultsBtnEl = document.getElementById('resetDefaultsBtn');
  savePreferencesBtnEl = document.getElementById('savePreferencesBtn');

  clearAllDataBtnEl = document.getElementById('clearAllDataBtn');
  resetAllConfirmModalEl = document.getElementById('resetAllConfirmModal');
  cancelResetAllBtnEl = document.getElementById('cancelResetAllBtn');
  confirmResetAllBtnEl = document.getElementById('confirmResetAllBtn');
}

/**
 * Bind form & button event listeners
 */
function bindEventListeners() {
  // Player Profile Form Submit
  if (profileFormEl) {
    profileFormEl.addEventListener('submit', handleProfileSubmit);
  }

  // Appearance Theme Cards Selection
  if (themeCardLightEl) {
    themeCardLightEl.addEventListener('click', () => selectAppearanceTheme('light'));
    themeCardLightEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectAppearanceTheme('light');
      }
    });
  }

  if (themeCardDarkEl) {
    themeCardDarkEl.addEventListener('click', () => selectAppearanceTheme('dark'));
    themeCardDarkEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectAppearanceTheme('dark');
      }
    });
  }

  // Preferences Form Submit
  if (preferencesFormEl) {
    preferencesFormEl.addEventListener('submit', handlePreferencesSubmit);
  }

  // Restore Defaults Button
  if (resetDefaultsBtnEl) {
    resetDefaultsBtnEl.addEventListener('click', handleRestoreDefaults);
  }

  // Clear Database / Wipe All Data Dialog
  if (clearAllDataBtnEl) {
    clearAllDataBtnEl.addEventListener('click', openResetAllModal);
  }
  if (cancelResetAllBtnEl) {
    cancelResetAllBtnEl.addEventListener('click', closeResetAllModal);
  }
  if (confirmResetAllBtnEl) {
    confirmResetAllBtnEl.addEventListener('click', handleConfirmResetAll);
  }

  // Escape key closes modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeResetAllModal();
    }
  });
}

/**
 * ----------------------------------------------------------------------------
 * 1. Load Stored Profile & Preferences into Form Inputs
 * ----------------------------------------------------------------------------
 */
function loadSavedSettings() {
  // 1. Player Name from Cookies
  if (playerNameInputEl && typeof getPlayerName === 'function') {
    playerNameInputEl.value = getPlayerName();
  }

  // 2. Default Difficulty from localStorage
  if (defaultDifficultySelectEl && typeof getDifficulty === 'function') {
    defaultDifficultySelectEl.value = getDifficulty();
  }

  // 3. Audio & Animation Toggles from localStorage
  if (soundToggleEl && typeof isSoundEnabled === 'function') {
    soundToggleEl.checked = isSoundEnabled();
  }
  if (animationToggleEl && typeof isAnimationEnabled === 'function') {
    animationToggleEl.checked = isAnimationEnabled();
  }

  // 4. Appearance Mode from localStorage
  if (typeof getTheme === 'function') {
    selectedAppearanceTheme = getTheme();
    updateThemeCardSelection(selectedAppearanceTheme);
  }

  // 5. Preferred Theme & Custom Card Sets from IndexedDB
  loadThemeOptions();
}

/**
 * Dynamically populates custom card sets into the theme dropdown
 */
function loadThemeOptions() {
  if (!defaultThemeSelectEl) return;

  const activeTheme = typeof getSelectedTheme === 'function' ? getSelectedTheme() : 'pokemon';
  defaultThemeSelectEl.value = activeTheme;

  if (typeof getAllCardSets !== 'function') return;

  getAllCardSets()
    .then((customSets) => {
      if (!Array.isArray(customSets) || customSets.length === 0) return;

      let customGroup = defaultThemeSelectEl.querySelector('optgroup[data-custom-group="true"]');
      if (!customGroup) {
        customGroup = document.createElement('optgroup');
        customGroup.label = '🎨 Custom Card Sets';
        customGroup.setAttribute('data-custom-group', 'true');
        defaultThemeSelectEl.appendChild(customGroup);
      }

      customGroup.innerHTML = '';
      customSets.forEach((set) => {
        const option = document.createElement('option');
        option.value = set.id;
        option.textContent = `${set.name} (${set.cards.length} cards)`;
        if (set.id === activeTheme) {
          option.selected = true;
        }
        customGroup.appendChild(option);
      });
    })
    .catch((err) => {
      console.warn('Could not populate custom sets in settings:', err);
    });
}

/**
 * ----------------------------------------------------------------------------
 * 2. Player Profile Submission (Cookie Storage)
 * ----------------------------------------------------------------------------
 */
function handleProfileSubmit(event) {
  event.preventDefault();

  const name = playerNameInputEl ? playerNameInputEl.value.trim() : '';

  // Validation: 2 to 20 characters
  if (!name || name.length < 2 || name.length > 20) {
    if (groupPlayerNameEl) groupPlayerNameEl.classList.add('has-error');
    if (errorPlayerNameEl) errorPlayerNameEl.textContent = 'Player name must be between 2 and 20 characters.';
    return;
  }

  if (groupPlayerNameEl) groupPlayerNameEl.classList.remove('has-error');

  // Save to browser cookie
  if (typeof setPlayerName === 'function') {
    setPlayerName(name);
  }

  // Update greeting banners on page
  const nameTargets = document.querySelectorAll('.js-player-name');
  nameTargets.forEach((el) => {
    el.textContent = name;
  });

  if (typeof showToast === 'function') {
    showToast(`Player alias saved as "${name}"!`, 'success');
  }
}

/**
 * ----------------------------------------------------------------------------
 * 3. Appearance Theme Switcher
 * ----------------------------------------------------------------------------
 */
function selectAppearanceTheme(theme) {
  selectedAppearanceTheme = theme === 'dark' ? 'dark' : 'light';
  updateThemeCardSelection(selectedAppearanceTheme);

  // Apply immediately to body and save to localStorage
  if (typeof setTheme === 'function') {
    setTheme(selectedAppearanceTheme);
  }
}

function updateThemeCardSelection(theme) {
  if (themeCardLightEl && themeCardDarkEl) {
    themeCardLightEl.classList.toggle('is-active', theme === 'light');
    themeCardDarkEl.classList.toggle('is-active', theme === 'dark');
  }
}

/**
 * ----------------------------------------------------------------------------
 * 4. Gameplay Preferences Submission (localStorage)
 * ----------------------------------------------------------------------------
 */
function handlePreferencesSubmit(event) {
  event.preventDefault();

  // 1. Difficulty
  const difficulty = defaultDifficultySelectEl ? defaultDifficultySelectEl.value : 'easy';
  if (typeof setDifficulty === 'function') {
    setDifficulty(difficulty);
  }

  // 2. Preferred Card Theme
  const cardTheme = defaultThemeSelectEl ? defaultThemeSelectEl.value : 'pokemon';
  if (typeof setSelectedTheme === 'function') {
    setSelectedTheme(cardTheme);
  }

  // 3. Sound Effects Toggle
  const soundEnabled = soundToggleEl ? soundToggleEl.checked : true;
  if (typeof setSoundEnabled === 'function') {
    setSoundEnabled(soundEnabled);
  }

  // 4. 3D Animations Toggle
  const animEnabled = animationToggleEl ? animationToggleEl.checked : true;
  if (typeof setAnimationEnabled === 'function') {
    setAnimationEnabled(animEnabled);
  }

  // 5. Appearance Theme
  if (typeof setTheme === 'function') {
    setTheme(selectedAppearanceTheme);
  }

  if (typeof showToast === 'function') {
    showToast('Preferences updated and saved successfully!', 'success');
  }
}

/**
 * ----------------------------------------------------------------------------
 * 5. Restore Default Settings
 * ----------------------------------------------------------------------------
 */
function handleRestoreDefaults() {
  if (defaultDifficultySelectEl) defaultDifficultySelectEl.value = 'easy';
  if (defaultThemeSelectEl) defaultThemeSelectEl.value = 'pokemon';
  if (soundToggleEl) soundToggleEl.checked = true;
  if (animationToggleEl) animationToggleEl.checked = true;

  selectAppearanceTheme('light');

  if (typeof setDifficulty === 'function') setDifficulty('easy');
  if (typeof setSelectedTheme === 'function') setSelectedTheme('pokemon');
  if (typeof setSoundEnabled === 'function') setSoundEnabled(true);
  if (typeof setAnimationEnabled === 'function') setAnimationEnabled(true);
  if (typeof setTheme === 'function') setTheme('light');

  if (typeof showToast === 'function') {
    showToast('Default preferences restored.', 'info');
  }
}

/**
 * ----------------------------------------------------------------------------
 * 6. Wipe All Application Data Modal & Execution
 * ----------------------------------------------------------------------------
 */
function openResetAllModal() {
  if (resetAllConfirmModalEl) {
    resetAllConfirmModalEl.classList.add('modal--active');
  }
}

function closeResetAllModal() {
  if (resetAllConfirmModalEl) {
    resetAllConfirmModalEl.classList.remove('modal--active');
  }
}

function handleConfirmResetAll() {
  closeResetAllModal();

  // 1. Clear IndexedDB match history
  const clearHistoryPromise = typeof clearGameHistory === 'function' ? clearGameHistory() : Promise.resolve();

  // 2. Clear IndexedDB custom decks (except starter)
  const clearCustomDecksPromise = typeof getAllCardSets === 'function'
    ? getAllCardSets().then((sets) => {
        const deletions = sets
          .filter((s) => !s.isBuiltIn)
          .map((s) => (typeof deleteCardSet === 'function' ? deleteCardSet(s.id) : Promise.resolve()));
        return Promise.all(deletions);
      })
    : Promise.resolve();

  Promise.all([clearHistoryPromise, clearCustomDecksPromise])
    .then(() => {
      // 3. Reset Cookies
      if (typeof setPlayerName === 'function') setPlayerName('Player');
      if (typeof deleteCookie === 'function') deleteCookie('lastVisit');

      // 4. Reset localStorage
      handleRestoreDefaults();

      // Refresh inputs
      if (playerNameInputEl) playerNameInputEl.value = 'Player';
      const nameTargets = document.querySelectorAll('.js-player-name');
      nameTargets.forEach((el) => {
        el.textContent = 'Player';
      });

      if (typeof showToast === 'function') {
        showToast('All database logs, custom sets, and preferences reset clean.', 'success', 3500);
      }
    })
    .catch((err) => {
      console.error('Failed to wipe application data:', err);
      if (typeof showToast === 'function') {
        showToast('Encountered an error while clearing data.', 'danger');
      }
    });
}
