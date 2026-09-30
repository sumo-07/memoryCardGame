/**
 * ============================================================================
 * STORAGE.JS - Client Storage Layer: Cookies & HTML5 localStorage Management
 * Memory Match Application - Day 3
 * ============================================================================
 */

'use strict';

/**
 * ----------------------------------------------------------------------------
 * 1. Cookie Management Helpers
 * ----------------------------------------------------------------------------
 * Handles setting, reading, and deleting browser cookies with URL encoding,
 * secure expiration, and SameSite policies.
 */
function setCookie(name, value, days = 30) {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = 'expires=' + date.toUTCString();
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)};${expires};path=/;SameSite=Lax`;
}

function getCookie(name) {
  const nameEQ = encodeURIComponent(name) + '=';
  const cookies = document.cookie.split(';');

  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i].trim();
    if (cookie.indexOf(nameEQ) === 0) {
      try {
        return decodeURIComponent(cookie.substring(nameEQ.length));
      } catch (e) {
        return cookie.substring(nameEQ.length);
      }
    }
  }
  return null;
}

function deleteCookie(name) {
  document.cookie = `${encodeURIComponent(name)}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax`;
}

/**
 * Specific Cookie Helpers for Player Identity & Session Activity
 */
function getPlayerName() {
  const storedName = getCookie('playerName');
  return (storedName && storedName.trim()) ? storedName.trim() : 'Player';
}

function setPlayerName(name) {
  const cleanName = (name && name.trim()) ? name.trim().substring(0, 20) : 'Player';
  setCookie('playerName', cleanName, 30);
  return cleanName;
}

function getLastVisit() {
  return getCookie('lastVisit');
}

function updateLastVisit() {
  const now = new Date();
  const options = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  };
  const formattedDate = now.toLocaleDateString(undefined, options);
  setCookie('lastVisit', formattedDate, 30);
  return formattedDate;
}

/**
 * ----------------------------------------------------------------------------
 * 2. localStorage Management Helpers
 * ----------------------------------------------------------------------------
 * Manages persisted user preferences across browser sessions:
 * - Theme (light / dark)
 * - Default Difficulty (easy / medium / hard)
 * - Preferred Card Set Theme (pokemon / animals / food / programming / space)
 * - Sound Effects (true / false)
 * - 3D Card Flip Animations (true / false)
 */
const STORAGE_KEYS = {
  THEME: 'memoryMatch_theme',
  DIFFICULTY: 'memoryMatch_difficulty',
  CARD_THEME: 'memoryMatch_cardTheme',
  SOUND: 'memoryMatch_sound',
  ANIMATIONS: 'memoryMatch_animations'
};

function getTheme() {
  try {
    const theme = localStorage.getItem(STORAGE_KEYS.THEME);
    if (theme === 'dark' || theme === 'light') {
      return theme;
    }
    // Check system preference if no stored theme
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
  } catch (e) {
    console.warn('localStorage access failed:', e);
  }
  return 'light';
}

function setTheme(theme) {
  const validTheme = theme === 'dark' ? 'dark' : 'light';
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, validTheme);
  } catch (e) {
    console.warn('localStorage write failed:', e);
  }
  applyTheme(validTheme);
  return validTheme;
}

function getDifficulty() {
  try {
    const diff = localStorage.getItem(STORAGE_KEYS.DIFFICULTY);
    if (diff === 'easy' || diff === 'medium' || diff === 'hard') {
      return diff;
    }
  } catch (e) {}
  return 'easy';
}

function setDifficulty(difficulty) {
  const validDiff = ['easy', 'medium', 'hard'].includes(difficulty) ? difficulty : 'easy';
  try {
    localStorage.setItem(STORAGE_KEYS.DIFFICULTY, validDiff);
  } catch (e) {}
  return validDiff;
}

function getSelectedTheme() {
  try {
    const cardTheme = localStorage.getItem(STORAGE_KEYS.CARD_THEME);
    if (cardTheme) return cardTheme;
  } catch (e) {}
  return 'pokemon';
}

function setSelectedTheme(cardTheme) {
  const valid = cardTheme ? String(cardTheme).trim().toLowerCase() : 'pokemon';
  try {
    localStorage.setItem(STORAGE_KEYS.CARD_THEME, valid);
  } catch (e) {}
  return valid;
}

function isSoundEnabled() {
  try {
    const sound = localStorage.getItem(STORAGE_KEYS.SOUND);
    return sound === null ? true : sound !== 'false';
  } catch (e) {
    return true;
  }
}

function setSoundEnabled(enabled) {
  const val = Boolean(enabled);
  try {
    localStorage.setItem(STORAGE_KEYS.SOUND, String(val));
  } catch (e) {}
  if (typeof window.SoundEffects !== 'undefined' && window.SoundEffects.setEnabled) {
    window.SoundEffects.setEnabled(val);
  }
  return val;
}

function isAnimationEnabled() {
  try {
    const anim = localStorage.getItem(STORAGE_KEYS.ANIMATIONS);
    return anim === null ? true : anim !== 'false';
  } catch (e) {
    return true;
  }
}

function setAnimationEnabled(enabled) {
  const val = Boolean(enabled);
  try {
    localStorage.setItem(STORAGE_KEYS.ANIMATIONS, String(val));
  } catch (e) {}
  applyAnimationSetting(val);
  return val;
}

/**
 * ----------------------------------------------------------------------------
 * 3. Body Class Applicators (Zero Inline CSS Compliance)
 * ----------------------------------------------------------------------------
 */
function applyTheme(theme = getTheme()) {
  if (typeof document === 'undefined' || !document.body) return;

  if (theme === 'dark') {
    document.body.classList.add('dark-theme');
  } else {
    document.body.classList.remove('dark-theme');
  }

  // Update theme toggle button icon if present in DOM
  const toggleBtn = document.getElementById('themeToggleBtn');
  if (toggleBtn) {
    toggleBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
    toggleBtn.setAttribute('aria-label', theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme');
  }
}

function applyAnimationSetting(enabled = isAnimationEnabled()) {
  if (typeof document === 'undefined' || !document.body) return;

  if (!enabled) {
    document.body.classList.add('no-animations');
  } else {
    document.body.classList.remove('no-animations');
  }
}

/**
 * ----------------------------------------------------------------------------
 * Global Window and Module Exports
 * ----------------------------------------------------------------------------
 */
if (typeof window !== 'undefined') {
  window.setCookie = setCookie;
  window.getCookie = getCookie;
  window.deleteCookie = deleteCookie;
  window.getPlayerName = getPlayerName;
  window.setPlayerName = setPlayerName;
  window.getLastVisit = getLastVisit;
  window.updateLastVisit = updateLastVisit;

  window.getTheme = getTheme;
  window.setTheme = setTheme;
  window.getDifficulty = getDifficulty;
  window.setDifficulty = setDifficulty;
  window.getSelectedTheme = getSelectedTheme;
  window.setSelectedTheme = setSelectedTheme;
  window.isSoundEnabled = isSoundEnabled;
  window.setSoundEnabled = setSoundEnabled;
  window.isAnimationEnabled = isAnimationEnabled;
  window.setAnimationEnabled = setAnimationEnabled;

  window.applyTheme = applyTheme;
  window.applyAnimationSetting = applyAnimationSetting;

  window.StorageManager = {
    setCookie,
    getCookie,
    deleteCookie,
    getPlayerName,
    setPlayerName,
    getLastVisit,
    updateLastVisit,
    getTheme,
    setTheme,
    getDifficulty,
    setDifficulty,
    getSelectedTheme,
    setSelectedTheme,
    isSoundEnabled,
    setSoundEnabled,
    isAnimationEnabled,
    setAnimationEnabled,
    applyTheme,
    applyAnimationSetting
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    setCookie,
    getCookie,
    deleteCookie,
    getPlayerName,
    setPlayerName,
    getLastVisit,
    updateLastVisit,
    getTheme,
    setTheme,
    getDifficulty,
    setDifficulty,
    getSelectedTheme,
    setSelectedTheme,
    isSoundEnabled,
    setSoundEnabled,
    isAnimationEnabled,
    setAnimationEnabled,
    applyTheme,
    applyAnimationSetting
  };
}
