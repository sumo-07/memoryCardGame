/**
 * ============================================================================
 * INDEXEDDB.JS - Structured Database Storage (MemoryMatchDB)
 * Memory Match Application - Day 4
 * ============================================================================
 * Implements client-side database persistence using IndexedDB:
 * - Object store 'cardSets': Custom user-created card decks (Full CRUD)
 * - Object store 'gameHistory': Chronological game session logs and performance metrics
 * - Automatic seeding of default starter custom set ('🕹️ Retro Arcade')
 * - Promise-based API for seamless asynchronous usage
 * - Aggregate statistics engine (calculateStats)
 * ============================================================================
 */

'use strict';

const DB_NAME = 'MemoryMatchDB';
const DB_VERSION = 1;

/**
 * Starter Custom Card Deck seeded automatically on initial launch
 */
const STARTER_CARD_SET = {
  id: 'custom-starter-arcade',
  name: '🕹️ Retro Arcade',
  description: 'Classic 8-bit arcade legends, tokens, powerups, and pixel art icons.',
  author: 'Memory Match',
  isBuiltIn: true,
  createdAt: '2026-09-01T00:00:00.000Z',
  cards: [
    { icon: '👾', label: 'Space Invader', badge: 'Alien' },
    { icon: '🕹️', label: 'Arcade Stick', badge: 'Hardware' },
    { icon: '👻', label: 'Pac Ghost', badge: 'Retro' },
    { icon: '🍒', label: 'Power Cherry', badge: 'Bonus' },
    { icon: '🪙', label: 'Insert Coin', badge: 'Token' },
    { icon: '🍄', label: 'Super Shroom', badge: 'Powerup' },
    { icon: '⭐', label: 'Star Power', badge: 'Invincible' },
    { icon: '🗡️', label: 'Hero Sword', badge: 'Quest' },
    { icon: '🛡️', label: 'Aegis Shield', badge: 'Armor' },
    { icon: '💣', label: 'Pixel Bomb', badge: 'Explosive' },
    { icon: '💎', label: 'Blue Gem', badge: 'Treasure' },
    { icon: '🏆', label: 'High Score', badge: 'Trophy' },
    { icon: '🏎️', label: 'Turbo Kart', badge: 'Racing' },
    { icon: '🥊', label: 'Street Fighter', badge: 'Brawler' },
    { icon: '🚀', label: 'Galaga Ship', badge: 'Shooter' },
    { icon: '🏰', label: '8-Bit Castle', badge: 'Level' },
    { icon: '🔑', label: 'Boss Key', badge: 'Dungeon' },
    { icon: '❤️', label: 'Extra Life', badge: '1-UP' }
  ]
};

let dbInstance = null;

/**
 * Opens or initializes connection to MemoryMatchDB
 * @returns {Promise<IDBDatabase>}
 */
function openDB() {
  if (dbInstance) {
    return Promise.resolve(dbInstance);
  }

  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB is not supported in this browser.'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // 1. Create 'cardSets' store for custom deck CRUD
      if (!db.objectStoreNames.contains('cardSets')) {
        const cardSetsStore = db.createObjectStore('cardSets', { keyPath: 'id' });
        cardSetsStore.createIndex('name', 'name', { unique: false });
        cardSetsStore.createIndex('createdAt', 'createdAt', { unique: false });

        // Seed starter custom deck
        cardSetsStore.add(STARTER_CARD_SET);
      }

      // 2. Create 'gameHistory' store for match statistics & analytics
      if (!db.objectStoreNames.contains('gameHistory')) {
        const historyStore = db.createObjectStore('gameHistory', { keyPath: 'id', autoIncrement: true });
        historyStore.createIndex('date', 'date', { unique: false });
        historyStore.createIndex('difficulty', 'difficulty', { unique: false });
        historyStore.createIndex('theme', 'theme', { unique: false });
        historyStore.createIndex('score', 'score', { unique: false });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = event.target.result;

      // Reset instance on unexpected closure
      dbInstance.onversionchange = () => {
        dbInstance.close();
        dbInstance = null;
      };

      resolve(dbInstance);
    };

    request.onerror = (event) => {
      console.error('IndexedDB open error:', event.target.error);
      reject(event.target.error);
    };
  });
}

/**
 * Helper to execute a database transaction
 */
function executeTransaction(storeName, mode, callback) {
  return openDB().then((db) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, mode);
      const store = transaction.objectStore(storeName);

      let result;

      transaction.oncomplete = () => resolve(result);
      transaction.onerror = (event) => {
        console.error(`IndexedDB transaction error on ${storeName}:`, event.target.error);
        reject(event.target.error);
      };

      try {
        result = callback(store, transaction);
      } catch (err) {
        reject(err);
      }
    });
  });
}

/**
 * ----------------------------------------------------------------------------
 * 1. Custom Card Sets (CRUD Implementation)
 * ----------------------------------------------------------------------------
 */

/**
 * Creates and stores a new custom card set
 * @param {Object} cardSet - { name, description, cards, author }
 * @returns {Promise<Object>} The stored card set with generated ID
 */
function createCardSet(cardSet) {
  if (!cardSet || !cardSet.name || !Array.isArray(cardSet.cards)) {
    return Promise.reject(new Error('Invalid card set: "name" and "cards" array are required.'));
  }

  const newSet = {
    id: cardSet.id || `custom-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    name: cardSet.name.trim(),
    description: cardSet.description ? cardSet.description.trim() : '',
    author: cardSet.author ? cardSet.author.trim() : 'Player',
    isBuiltIn: false,
    createdAt: new Date().toISOString(),
    cards: cardSet.cards
  };

  return executeTransaction('cardSets', 'readwrite', (store) => {
    store.add(newSet);
    return newSet;
  });
}

/**
 * Retrieves all custom card sets from IndexedDB
 * @returns {Promise<Array>}
 */
function getAllCardSets() {
  return openDB().then((db) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('cardSets', 'readonly');
      const store = transaction.objectStore('cardSets');
      const request = store.getAll();

      request.onsuccess = () => {
        const sets = request.result || [];
        resolve(sets);
      };

      request.onerror = (e) => reject(e.target.error);
    });
  });
}

/**
 * Retrieves a single card set by ID
 * @param {string} id
 * @returns {Promise<Object|null>}
 */
function getCardSetById(id) {
  return openDB().then((db) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('cardSets', 'readonly');
      const store = transaction.objectStore('cardSets');
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = (e) => reject(e.target.error);
    });
  });
}

/**
 * Updates an existing card set
 * @param {string} id
 * @param {Object} updatedData
 * @returns {Promise<Object>}
 */
function updateCardSet(id, updatedData) {
  return getCardSetById(id).then((existing) => {
    if (!existing) {
      throw new Error(`Card set with id "${id}" not found.`);
    }

    const merged = {
      ...existing,
      ...updatedData,
      id: existing.id, // Preserve immutable ID
      updatedAt: new Date().toISOString()
    };

    return executeTransaction('cardSets', 'readwrite', (store) => {
      store.put(merged);
      return merged;
    });
  });
}

/**
 * Deletes a card set by ID
 * @param {string} id
 * @returns {Promise<boolean>}
 */
function deleteCardSet(id) {
  return executeTransaction('cardSets', 'readwrite', (store) => {
    store.delete(id);
    return true;
  });
}

/**
 * ----------------------------------------------------------------------------
 * 2. Game History Management
 * ----------------------------------------------------------------------------
 */

/**
 * Saves a completed game session record into gameHistory
 * @param {Object} gameRecord - { difficulty, theme, moves, time, timeSeconds, accuracy, score, won }
 * @returns {Promise<Object>} Stored record with auto-increment ID
 */
function saveGameHistory(gameRecord) {
  const record = {
    date: gameRecord.date || new Date().toISOString(),
    difficulty: gameRecord.difficulty || 'easy',
    theme: gameRecord.theme || 'pokemon',
    moves: Number(gameRecord.moves) || 0,
    time: gameRecord.time || '00:00',
    timeSeconds: Number(gameRecord.timeSeconds) || 0,
    accuracy: Number(gameRecord.accuracy) || 100,
    score: Number(gameRecord.score) || 0,
    won: gameRecord.won !== undefined ? Boolean(gameRecord.won) : true
  };

  return openDB().then((db) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('gameHistory', 'readwrite');
      const store = transaction.objectStore('gameHistory');
      const request = store.add(record);

      request.onsuccess = (e) => {
        record.id = e.target.result;
        resolve(record);
      };

      request.onerror = (e) => reject(e.target.error);
    });
  });
}

/**
 * Retrieves all game session records (newest first)
 * @returns {Promise<Array>}
 */
function getAllGameHistory() {
  return openDB().then((db) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('gameHistory', 'readonly');
      const store = transaction.objectStore('gameHistory');
      const request = store.getAll();

      request.onsuccess = () => {
        const records = request.result || [];
        // Sort newest first
        records.sort((a, b) => new Date(b.date) - new Date(a.date));
        resolve(records);
      };

      request.onerror = (e) => reject(e.target.error);
    });
  });
}

/**
 * Clears all game history logs
 * @returns {Promise<boolean>}
 */
function clearGameHistory() {
  return executeTransaction('gameHistory', 'readwrite', (store) => {
    store.clear();
    return true;
  });
}

/**
 * ----------------------------------------------------------------------------
 * 3. Performance Analytics & Aggregations (calculateStats)
 * ----------------------------------------------------------------------------
 * Computes aggregate metrics from gameHistory for Dashboard presentation:
 * - Total games played & games won
 * - Best score & best time
 * - Total moves made & average score
 * - Overall matching accuracy %
 * - Games completion rate %
 * - Difficulty distribution counts (Easy, Medium, Hard)
 *
 * @returns {Promise<Object>} Aggregated analytics data
 */
function calculateStats() {
  return getAllGameHistory().then((history) => {
    const totalGames = history.length;

    if (totalGames === 0) {
      return {
        gamesPlayed: 0,
        gamesWon: 0,
        bestScore: 0,
        bestTime: '00:00',
        bestTimeSeconds: 0,
        totalMoves: 0,
        averageScore: 0,
        averageAccuracy: 0,
        completionRate: 0,
        difficultyDistribution: {
          easy: 0,
          medium: 0,
          hard: 0
        }
      };
    }

    let gamesWon = 0;
    let totalScore = 0;
    let totalMoves = 0;
    let totalAccuracy = 0;
    let bestScore = 0;
    let bestTimeSeconds = Infinity;
    let bestTimeFormatted = '00:00';

    const difficultyDistribution = {
      easy: 0,
      medium: 0,
      hard: 0
    };

    history.forEach((game) => {
      // Games won
      if (game.won) {
        gamesWon++;
      }

      // Scores
      const score = Number(game.score) || 0;
      totalScore += score;
      if (score > bestScore) {
        bestScore = score;
      }

      // Moves
      totalMoves += Number(game.moves) || 0;

      // Accuracy
      totalAccuracy += Number(game.accuracy) || 0;

      // Best Time (only consider won games with positive timeSeconds)
      if (game.won && game.timeSeconds && game.timeSeconds > 0) {
        if (game.timeSeconds < bestTimeSeconds) {
          bestTimeSeconds = game.timeSeconds;
          bestTimeFormatted = game.time || '00:00';
        }
      }

      // Difficulty distribution
      const diffKey = String(game.difficulty).toLowerCase();
      if (difficultyDistribution[diffKey] !== undefined) {
        difficultyDistribution[diffKey]++;
      }
    });

    if (bestTimeSeconds === Infinity) {
      bestTimeSeconds = 0;
      bestTimeFormatted = '00:00';
    }

    const averageScore = Math.round(totalScore / totalGames);
    const averageAccuracy = Math.round(totalAccuracy / totalGames);
    const completionRate = Math.round((gamesWon / totalGames) * 100);

    return {
      gamesPlayed: totalGames,
      gamesWon,
      bestScore,
      bestTime: bestTimeFormatted,
      bestTimeSeconds,
      totalMoves,
      averageScore,
      averageAccuracy,
      completionRate,
      difficultyDistribution
    };
  });
}

/**
 * ----------------------------------------------------------------------------
 * Global Window and Module Exports
 * ----------------------------------------------------------------------------
 */
if (typeof window !== 'undefined') {
  window.DB_NAME = DB_NAME;
  window.DB_VERSION = DB_VERSION;
  window.STARTER_CARD_SET = STARTER_CARD_SET;

  window.openDB = openDB;
  window.createCardSet = createCardSet;
  window.getAllCardSets = getAllCardSets;
  window.getCardSetById = getCardSetById;
  window.updateCardSet = updateCardSet;
  window.deleteCardSet = deleteCardSet;

  window.saveGameHistory = saveGameHistory;
  window.getAllGameHistory = getAllGameHistory;
  window.clearGameHistory = clearGameHistory;
  window.calculateStats = calculateStats;

  window.MemoryMatchDB = {
    openDB,
    createCardSet,
    getAllCardSets,
    getCardSetById,
    updateCardSet,
    deleteCardSet,
    saveGameHistory,
    getAllGameHistory,
    clearGameHistory,
    calculateStats
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    DB_NAME,
    DB_VERSION,
    STARTER_CARD_SET,
    openDB,
    createCardSet,
    getAllCardSets,
    getCardSetById,
    updateCardSet,
    deleteCardSet,
    saveGameHistory,
    getAllGameHistory,
    clearGameHistory,
    calculateStats
  };
}
