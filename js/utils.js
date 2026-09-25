/**
 * ============================================================================
 * UTILS.JS - Core Utility Helpers & Zero-Dependency Web Audio Synthesizer
 * Memory Match Application - Day 2
 * ============================================================================
 */

'use strict';

/**
 * ----------------------------------------------------------------------------
 * 1. Fisher-Yates (Knuth) Array Shuffle Algorithm
 * ----------------------------------------------------------------------------
 * Performs a statistically unbiased in-place or copied shuffle with O(n)
 * time complexity and uniform distribution.
 *
 * @param {Array} array - The array to shuffle.
 * @param {boolean} [inPlace=false] - Whether to mutate original or return copy.
 * @returns {Array} The shuffled array.
 */
function shuffleArray(array, inPlace = false) {
  if (!Array.isArray(array)) {
    console.warn('shuffleArray: Expected an Array argument, received:', typeof array);
    return [];
  }

  const target = inPlace ? array : [...array];

  for (let i = target.length - 1; i > 0; i--) {
    // Generate random integer j in range [0, i]
    const j = Math.floor(Math.random() * (i + 1));
    // Swap elements at indices i and j
    const temp = target[i];
    target[i] = target[j];
    target[j] = temp;
  }

  return target;
}

/**
 * ----------------------------------------------------------------------------
 * 2. formatTime(seconds)
 * ----------------------------------------------------------------------------
 * Converts a raw second count into a clean, zero-padded MM:SS display string
 * (or HH:MM:SS when duration reaches 1 hour).
 *
 * @param {number} seconds - Elapsed duration in seconds.
 * @returns {string} Formatted time string (e.g. "00:00", "01:25", "12:04").
 */
function formatTime(seconds) {
  if (typeof seconds !== 'number' || isNaN(seconds) || seconds < 0) {
    return '00:00';
  }

  const totalSeconds = Math.floor(seconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  const mm = String(minutes).padStart(2, '0');
  const ss = String(secs).padStart(2, '0');

  if (hours > 0) {
    const hh = String(hours).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  }

  return `${mm}:${ss}`;
}

/**
 * ----------------------------------------------------------------------------
 * 3. SoundEffects Object (Web Audio API Synthesizer)
 * ----------------------------------------------------------------------------
 * Pure zero-dependency audio synthesizer using Web Audio API (AudioContext).
 * Generates custom synthesized sound cues for:
 * - flip: Crisp card turn blip
 * - match: Bright harmonious ascending arpeggio
 * - mismatch: Gentle descending minor tone
 * - victory: Triumphant celebratory fanfare
 * ----------------------------------------------------------------------------
 */
const SoundEffects = (function () {
  let audioCtx = null;
  let masterGain = null;
  let isEnabled = true;

  // Initialize audio state from localStorage if previously stored
  try {
    const storedPref = localStorage.getItem('memoryMatch_sound');
    if (storedPref !== null) {
      isEnabled = storedPref !== 'false';
    }
  } catch (e) {
    // Graceful fallback for restricted environments
    isEnabled = true;
  }

  /**
   * Lazily initializes AudioContext upon first user interaction to comply
   * with browser autoplay policies.
   */
  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) {
        console.warn('Web Audio API is not supported in this browser.');
        return null;
      }

      audioCtx = new AudioContextClass();

      // Master gain node for global volume control
      masterGain = audioCtx.createGain();
      masterGain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      masterGain.connect(audioCtx.destination);
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch((err) => {
        console.warn('AudioContext resume was prevented:', err);
      });
    }

    return audioCtx;
  }

  /**
   * Attaches one-time gesture listeners to resume AudioContext promptly
   */
  if (typeof window !== 'undefined') {
    const unlockAudio = () => {
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };

    window.addEventListener('pointerdown', unlockAudio, { passive: true });
    window.addEventListener('keydown', unlockAudio, { passive: true });
  }

  /**
   * Plays a synthesized musical tone with configurable ADSR gain envelope.
   *
   * @param {number} freq - Frequency in Hertz (Hz).
   * @param {string} [type='sine'] - Oscillator waveform ('sine', 'triangle', 'square', 'sawtooth').
   * @param {number} [duration=0.1] - Duration in seconds.
   * @param {number} [delay=0] - Delay from current time in seconds.
   * @param {number} [peakGain=0.15] - Peak gain level.
   * @param {number} [endFreq=null] - Optional frequency glide target.
   */
  function playTone(freq, type = 'sine', duration = 0.1, delay = 0, peakGain = 0.15, endFreq = null) {
    if (!isEnabled) return;

    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const startTime = ctx.currentTime + delay;
      const endTime = startTime + duration;

      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);

      if (endFreq && endFreq !== freq) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(1, endFreq), endTime);
      }

      // Attack and Exponential Decay Envelope
      gainNode.gain.setValueAtTime(0.0001, startTime);
      gainNode.gain.exponentialRampToValueAtTime(peakGain, startTime + 0.015);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, endTime);

      osc.connect(gainNode);
      gainNode.connect(masterGain || ctx.destination);

      osc.start(startTime);
      osc.stop(endTime);
    } catch (err) {
      console.warn('Error playing tone:', err);
    }
  }

  return {
    /**
     * Card Flip Sound: Crisp, subtle frequency blip
     */
    flip() {
      if (!isEnabled) return;
      // High-to-mid fast pitch blip simulating tactile card rotation
      playTone(480, 'sine', 0.06, 0, 0.12, 620);
    },

    /**
     * Match Sound: Bright, cheerful 3-note ascending major arpeggio
     * C5 (523.25 Hz) -> E5 (659.25 Hz) -> G5 (783.99 Hz) -> C6 (1046.5 Hz)
     */
    match() {
      if (!isEnabled) return;
      playTone(523.25, 'triangle', 0.12, 0.00, 0.18);
      playTone(659.25, 'triangle', 0.12, 0.08, 0.18);
      playTone(783.99, 'triangle', 0.14, 0.16, 0.20);
      playTone(1046.50, 'sine',     0.28, 0.24, 0.22);
    },

    /**
     * Mismatch Sound: Gentle 2-note descending minor tone
     * Informative without being jarring or harsh.
     */
    mismatch() {
      if (!isEnabled) return;
      playTone(320, 'triangle', 0.12, 0.00, 0.14, 280);
      playTone(220, 'sine',     0.18, 0.10, 0.12, 196);
    },

    /**
     * Victory Fanfare: Grand triumphant celebratory sequence
     */
    victory() {
      if (!isEnabled) return;
      // Arpeggio flourish
      playTone(523.25, 'triangle', 0.12, 0.00, 0.20);
      playTone(659.25, 'triangle', 0.12, 0.10, 0.20);
      playTone(783.99, 'triangle', 0.12, 0.20, 0.22);
      playTone(1046.50, 'sine',    0.20, 0.30, 0.25);

      // Sustained celebratory major chord
      playTone(523.25, 'sine',     0.65, 0.48, 0.16);
      playTone(659.25, 'triangle', 0.65, 0.48, 0.16);
      playTone(783.99, 'sine',     0.75, 0.48, 0.18);
      playTone(1046.50, 'triangle',0.85, 0.48, 0.20);
    },

    /**
     * Generic sound trigger helper
     * @param {'flip'|'match'|'mismatch'|'victory'} soundName
     */
    play(soundName) {
      if (typeof this[soundName] === 'function') {
        this[soundName]();
      } else {
        console.warn(`SoundEffects: Unknown sound "${soundName}"`);
      }
    },

    /**
     * Query or toggle enabled audio state
     */
    isEnabled() {
      return isEnabled;
    },

    setEnabled(enabled) {
      isEnabled = Boolean(enabled);
      try {
        localStorage.setItem('memoryMatch_sound', String(isEnabled));
      } catch (e) {
        // Ignore quota/access errors
      }
    },

    toggle() {
      this.setEnabled(!isEnabled);
      return isEnabled;
    },

    /**
     * Adjust master volume (0.0 to 1.0)
     */
    setVolume(volume) {
      const vol = Math.max(0, Math.min(1, volume));
      const ctx = getAudioContext();
      if (ctx && masterGain) {
        masterGain.gain.setValueAtTime(vol * 0.3, ctx.currentTime);
      }
    }
  };
})();

/**
 * ----------------------------------------------------------------------------
 * 4. showToast(message, type, duration)
 * ----------------------------------------------------------------------------
 * Displays an accessible, animated notification toast anchored to the screen
 * using existing CSS classes (.toast-container, .toast, .toast--active, etc.).
 *
 * @param {string} message - Notification text to display.
 * @param {'info'|'success'|'danger'|'warning'|'error'} [type='info'] - Toast category.
 * @param {number} [duration=3000] - Duration in ms before auto-dismissal.
 * @returns {HTMLElement} The created toast element with a .dismiss() method.
 */
function showToast(message, type = 'info', duration = 3000) {
  if (typeof document === 'undefined') return null;

  // Normalize type
  const normalizedType = type === 'error' ? 'danger' : type;

  // Ensure toast container exists
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    container.setAttribute('aria-live', 'polite');
    container.setAttribute('aria-atomic', 'true');
    document.body.appendChild(container);
  }

  // Type-specific icons
  const iconMap = {
    success: '✅',
    danger: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };
  const icon = iconMap[normalizedType] || 'ℹ️';

  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast toast--${normalizedType}`;
  toast.setAttribute('role', 'status');

  // Build toast inner markup
  const iconSpan = document.createElement('span');
  iconSpan.className = 'toast__icon';
  iconSpan.setAttribute('aria-hidden', 'true');
  iconSpan.textContent = icon;

  const msgSpan = document.createElement('span');
  msgSpan.className = 'toast__message';
  msgSpan.textContent = message;

  toast.appendChild(iconSpan);
  toast.appendChild(msgSpan);

  container.appendChild(toast);

  // Trigger entrance transition via .toast--active
  requestAnimationFrame(() => {
    toast.classList.add('toast--active');
  });

  let dismissTimeout = null;

  const dismiss = () => {
    if (dismissTimeout) {
      clearTimeout(dismissTimeout);
      dismissTimeout = null;
    }

    toast.classList.remove('toast--active');

    // Remove from DOM once fade-out transition completes
    const handleTransitionEnd = () => {
      toast.removeEventListener('transitionend', handleTransitionEnd);
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    };

    toast.addEventListener('transitionend', handleTransitionEnd);

    // Fallback safety timeout in case transitions are disabled
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 350);
  };

  // Auto dismiss after specified duration
  if (duration > 0) {
    dismissTimeout = setTimeout(dismiss, duration);
  }

  // Allow clicking toast to dismiss immediately
  toast.addEventListener('click', dismiss);

  toast.dismiss = dismiss;
  return toast;
}

/**
 * ----------------------------------------------------------------------------
 * Global Window and Module Exports
 * ----------------------------------------------------------------------------
 */
if (typeof window !== 'undefined') {
  window.shuffleArray = shuffleArray;
  window.formatTime = formatTime;
  window.SoundEffects = SoundEffects;
  window.showToast = showToast;

  window.Utils = {
    shuffleArray,
    shuffle: shuffleArray,
    formatTime,
    SoundEffects,
    showToast
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    shuffleArray,
    formatTime,
    SoundEffects,
    showToast
  };
}
