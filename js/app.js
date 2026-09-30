/**
 * ============================================================================
 * APP.JS - Global Application Controller
 * Memory Match Application - Day 3
 * ============================================================================
 * Handles global page lifecycle tasks across all templates (Game Arena,
 * Dashboard, and Settings):
 * - Persisted theme initialization & navbar theme toggling
 * - Dynamic active nav link detection based on URL pathname
 * - Cookie-driven player greetings and last-visit activity timestamps
 * ============================================================================
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initThemeAndAppearance();
  initNavigation();
  initPlayerGreetings();
});

/**
 * ----------------------------------------------------------------------------
 * 1. Theme & Appearance Initialization
 * ----------------------------------------------------------------------------
 */
function initThemeAndAppearance() {
  // Apply saved theme and animations to <body>
  if (typeof applyTheme === 'function') {
    applyTheme();
  }
  if (typeof applyAnimationSetting === 'function') {
    applyAnimationSetting();
  }

  // Hook up navbar theme toggle button
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  if (themeToggleBtn) {
    // Sync button icon with current theme
    const currentTheme = typeof getTheme === 'function' ? getTheme() : 'light';
    themeToggleBtn.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
    themeToggleBtn.setAttribute('aria-label', currentTheme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme');

    themeToggleBtn.addEventListener('click', () => {
      const activeTheme = typeof getTheme === 'function' ? getTheme() : 'light';
      const nextTheme = activeTheme === 'dark' ? 'light' : 'dark';

      if (typeof setTheme === 'function') {
        setTheme(nextTheme);
      } else {
        document.body.classList.toggle('dark-theme');
      }

      themeToggleBtn.textContent = nextTheme === 'dark' ? '☀️' : '🌙';
      themeToggleBtn.setAttribute('aria-label', nextTheme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme');

      if (typeof SoundEffects !== 'undefined' && SoundEffects.flip) {
        SoundEffects.flip();
      }

      if (typeof showToast === 'function') {
        showToast(`Appearance set to ${nextTheme === 'dark' ? 'Dark' : 'Light'} Mode`, 'info', 2000);
      }
    });
  }
}

/**
 * ----------------------------------------------------------------------------
 * 2. Active Navigation Link Detection
 * ----------------------------------------------------------------------------
 */
function initNavigation() {
  const currentPath = window.location.pathname.toLowerCase();
  const navLinks = document.querySelectorAll('.nav-menu .nav-link');

  navLinks.forEach((link) => {
    const href = link.getAttribute('href').toLowerCase();

    // Remove active class initially
    link.classList.remove('active');

    if (currentPath.includes('dashboard.html') && href.includes('dashboard.html')) {
      link.classList.add('active');
    } else if (currentPath.includes('settings.html') && href.includes('settings.html')) {
      link.classList.add('active');
    } else if (
      (currentPath.endsWith('/') || currentPath.endsWith('index.html') || (!currentPath.includes('dashboard') && !currentPath.includes('settings'))) &&
      href.includes('index.html')
    ) {
      link.classList.add('active');
    }
  });
}

/**
 * ----------------------------------------------------------------------------
 * 3. Cookie-driven Player Profile Greetings
 * ----------------------------------------------------------------------------
 */
function initPlayerGreetings() {
  const playerName = typeof getPlayerName === 'function' ? getPlayerName() : 'Player';
  const lastVisit = typeof getLastVisit === 'function' ? getLastVisit() : null;

  // Update all player name placeholders
  const nameTargets = document.querySelectorAll('.js-player-name');
  nameTargets.forEach((el) => {
    el.textContent = playerName;
  });

  // Update all last visit placeholders
  const visitTargets = document.querySelectorAll('.js-last-visit');
  visitTargets.forEach((el) => {
    if (lastVisit) {
      el.textContent = `Last active: ${lastVisit}`;
    } else {
      el.textContent = 'Welcome! First session recorded.';
    }
  });

  // Update the lastVisit cookie for future visits
  if (typeof updateLastVisit === 'function') {
    updateLastVisit();
  }
}
