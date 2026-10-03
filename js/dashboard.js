/**
 * ============================================================================
 * DASHBOARD.JS - Performance Analytics & Custom Card Set CRUD Controller
 * Memory Match Application - Day 5
 * ============================================================================
 * Features:
 * - Computes and renders 6 core game statistics from IndexedDB
 * - Pure CSS charts: accuracy progress bar, completion rate, difficulty distribution
 * - Chronological match history log table with difficulty badges
 * - Full CRUD Manager for Custom Card Sets (Create, Read, Update, Delete, and Play)
 * - Complete JavaScript form validation: non-empty name, min 8 valid card pairs
 * ============================================================================
 */

'use strict';

/**
 * ----------------------------------------------------------------------------
 * DOM Element References
 * ----------------------------------------------------------------------------
 */
let statGamesPlayedEl = null;
let statGamesWonEl = null;
let statBestScoreEl = null;
let statBestTimeEl = null;
let statTotalMovesEl = null;
let statAverageScoreEl = null;

let winRateBadgeEl = null;
let accuracyPctLabelEl = null;
let accuracyProgressBarEl = null;
let completionPctLabelEl = null;
let completionProgressBarEl = null;

let segEasyEl = null;
let segMediumEl = null;
let segHardEl = null;
let easyCountLabelEl = null;
let mediumCountLabelEl = null;
let hardCountLabelEl = null;

let customSetsGridEl = null;
let historyTableBodyEl = null;
let clearHistoryBtnEl = null;

// Card Set Modal Elements
let openCreateSetModalBtnEl = null;
let cardSetModalEl = null;
let cardSetModalTitleEl = null;
let closeCardSetModalBtnEl = null;
let cancelCardSetModalBtnEl = null;
let cardSetFormEl = null;
let editCardSetIdEl = null;
let cardSetNameInputEl = null;
let groupSetNameEl = null;
let groupCardItemsEl = null;
let dynamicCardInputsEl = null;
let errorSetNameEl = null;
let errorCardItemsEl = null;
let addCardSlotBtnEl = null;

// Delete Modal Elements
let deleteConfirmModalEl = null;
let deleteTargetNameEl = null;
let cancelDeleteBtnEl = null;
let confirmDeleteBtnEl = null;
let pendingDeleteSetId = null;

/**
 * Initialize on DOMContentLoaded
 */
document.addEventListener('DOMContentLoaded', () => {
  cacheDOMElements();
  bindEventListeners();
  loadDashboardData();
});

/**
 * Cache all necessary interactive elements
 */
function cacheDOMElements() {
  statGamesPlayedEl = document.getElementById('statGamesPlayed');
  statGamesWonEl = document.getElementById('statGamesWon');
  statBestScoreEl = document.getElementById('statBestScore');
  statBestTimeEl = document.getElementById('statBestTime');
  statTotalMovesEl = document.getElementById('statTotalMoves');
  statAverageScoreEl = document.getElementById('statAverageScore');

  winRateBadgeEl = document.getElementById('winRateBadge');
  accuracyPctLabelEl = document.getElementById('accuracyPctLabel');
  accuracyProgressBarEl = document.getElementById('accuracyProgressBar');
  completionPctLabelEl = document.getElementById('completionPctLabel');
  completionProgressBarEl = document.getElementById('completionProgressBar');

  segEasyEl = document.getElementById('segEasy');
  segMediumEl = document.getElementById('segMedium');
  segHardEl = document.getElementById('segHard');
  easyCountLabelEl = document.getElementById('easyCountLabel');
  mediumCountLabelEl = document.getElementById('mediumCountLabel');
  hardCountLabelEl = document.getElementById('hardCountLabel');

  customSetsGridEl = document.getElementById('customSetsGrid');
  historyTableBodyEl = document.getElementById('historyTableBody');
  clearHistoryBtnEl = document.getElementById('clearHistoryBtn');

  openCreateSetModalBtnEl = document.getElementById('openCreateSetModalBtn');
  cardSetModalEl = document.getElementById('cardSetModal');
  cardSetModalTitleEl = document.getElementById('cardSetModalTitle');
  closeCardSetModalBtnEl = document.getElementById('closeCardSetModalBtn');
  cancelCardSetModalBtnEl = document.getElementById('cancelCardSetModalBtn');
  cardSetFormEl = document.getElementById('cardSetForm');
  editCardSetIdEl = document.getElementById('editCardSetId');
  cardSetNameInputEl = document.getElementById('cardSetNameInput');
  groupSetNameEl = document.getElementById('groupSetName');
  groupCardItemsEl = document.getElementById('groupCardItems');
  dynamicCardInputsEl = document.getElementById('dynamicCardInputs');
  errorSetNameEl = document.getElementById('errorSetName');
  errorCardItemsEl = document.getElementById('errorCardItems');
  addCardSlotBtnEl = document.getElementById('addCardSlotBtn');

  deleteConfirmModalEl = document.getElementById('deleteConfirmModal');
  deleteTargetNameEl = document.getElementById('deleteTargetName');
  cancelDeleteBtnEl = document.getElementById('cancelDeleteBtn');
  confirmDeleteBtnEl = document.getElementById('confirmDeleteBtn');
}

/**
 * Bind page-level event listeners
 */
function bindEventListeners() {
  // Clear Match History
  if (clearHistoryBtnEl) {
    clearHistoryBtnEl.addEventListener('click', handleClearHistory);
  }

  // Open Create Set Modal
  if (openCreateSetModalBtnEl) {
    openCreateSetModalBtnEl.addEventListener('click', () => openCardSetModal());
  }

  // Close Card Set Modal
  if (closeCardSetModalBtnEl) {
    closeCardSetModalBtnEl.addEventListener('click', closeCardSetModal);
  }
  if (cancelCardSetModalBtnEl) {
    cancelCardSetModalBtnEl.addEventListener('click', closeCardSetModal);
  }

  // Add Card Slot Button
  if (addCardSlotBtnEl) {
    addCardSlotBtnEl.addEventListener('click', () => {
      addCardSlotRow();
    });
  }

  // Card Set Form Submission (Create & Edit)
  if (cardSetFormEl) {
    cardSetFormEl.addEventListener('submit', handleCardSetFormSubmit);
  }

  // Delete Modal Buttons
  if (cancelDeleteBtnEl) {
    cancelDeleteBtnEl.addEventListener('click', closeDeleteModal);
  }
  if (confirmDeleteBtnEl) {
    confirmDeleteBtnEl.addEventListener('click', handleConfirmDelete);
  }

  // Close modals on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeCardSetModal();
      closeDeleteModal();
    }
  });
}

/**
 * ----------------------------------------------------------------------------
 * 1. Load All Dashboard Analytics & Data
 * ----------------------------------------------------------------------------
 */
function loadDashboardData() {
  renderStatisticsAndCharts();
  renderHistoryTable();
  renderCustomCardSets();
}

/**
 * Computes and renders 6 core metrics & pure CSS visual charts
 */
function renderStatisticsAndCharts() {
  if (typeof calculateStats !== 'function') return;

  calculateStats()
    .then((stats) => {
      // 1. Core Metrics Overview
      if (statGamesPlayedEl) statGamesPlayedEl.textContent = stats.gamesPlayed;
      if (statGamesWonEl) statGamesWonEl.textContent = stats.gamesWon;
      if (statBestScoreEl) statBestScoreEl.textContent = stats.bestScore;
      if (statBestTimeEl) statBestTimeEl.textContent = stats.bestTime;
      if (statTotalMovesEl) statTotalMovesEl.textContent = stats.totalMoves;
      if (statAverageScoreEl) statAverageScoreEl.textContent = stats.averageScore;

      // 2. Pure CSS Visual Charts
      if (winRateBadgeEl) {
        winRateBadgeEl.textContent = `${stats.completionRate}% Rate`;
        winRateBadgeEl.className = stats.completionRate >= 70 ? 'badge badge--success' : 'badge badge--warning';
      }

      if (accuracyPctLabelEl) accuracyPctLabelEl.textContent = `${stats.averageAccuracy}%`;
      if (accuracyProgressBarEl) {
        accuracyProgressBarEl.style.width = `${stats.averageAccuracy}%`;
        accuracyProgressBarEl.setAttribute('aria-valuenow', stats.averageAccuracy);
      }

      if (completionPctLabelEl) completionPctLabelEl.textContent = `${stats.completionRate}%`;
      if (completionProgressBarEl) {
        completionProgressBarEl.style.width = `${stats.completionRate}%`;
        completionProgressBarEl.setAttribute('aria-valuenow', stats.completionRate);
      }

      // 3. Difficulty Distribution Segmented Bar
      const diff = stats.difficultyDistribution;
      const totalDiff = (diff.easy + diff.medium + diff.hard) || 1;

      const easyPct = Math.round((diff.easy / totalDiff) * 100);
      const medPct = Math.round((diff.medium / totalDiff) * 100);
      const hardPct = Math.max(0, 100 - easyPct - medPct);

      if (segEasyEl) segEasyEl.style.width = `${easyPct}%`;
      if (segMediumEl) segMediumEl.style.width = `${medPct}%`;
      if (segHardEl) segHardEl.style.width = `${hardPct}%`;

      if (easyCountLabelEl) easyCountLabelEl.textContent = diff.easy;
      if (mediumCountLabelEl) mediumCountLabelEl.textContent = diff.medium;
      if (hardCountLabelEl) hardCountLabelEl.textContent = diff.hard;
    })
    .catch((err) => {
      console.warn('Failed to calculate dashboard statistics:', err);
    });
}

/**
 * ----------------------------------------------------------------------------
 * 2. Match History Table
 * ----------------------------------------------------------------------------
 */
function renderHistoryTable() {
  if (!historyTableBodyEl || typeof getAllGameHistory !== 'function') return;

  getAllGameHistory()
    .then((history) => {
      historyTableBodyEl.innerHTML = '';

      if (!history || history.length === 0) {
        const emptyTr = document.createElement('tr');
        emptyTr.innerHTML = `
          <td colspan="7" class="table-empty-row">
            No match records found. Play a game in the Arena to start logging statistics!
          </td>
        `;
        historyTableBodyEl.appendChild(emptyTr);
        return;
      }

      history.forEach((record) => {
        const tr = document.createElement('tr');

        // Format Date
        const dateObj = new Date(record.date);
        const formattedDate = isNaN(dateObj.getTime())
          ? record.date
          : dateObj.toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

        // Difficulty Badge
        const diffLower = String(record.difficulty).toLowerCase();
        let badgeClass = 'badge--primary';
        if (diffLower === 'easy') badgeClass = 'badge--success';
        if (diffLower === 'medium') badgeClass = 'badge--warning';
        if (diffLower === 'hard') badgeClass = 'badge--danger';

        const diffTitle = record.difficulty.charAt(0).toUpperCase() + record.difficulty.slice(1);
        const themeTitle = record.theme.charAt(0).toUpperCase() + record.theme.slice(1);

        tr.innerHTML = `
          <td><strong>${formattedDate}</strong></td>
          <td><span class="badge ${badgeClass}">${diffTitle}</span></td>
          <td>${themeTitle}</td>
          <td>${record.moves}</td>
          <td>${record.time}</td>
          <td><strong class="text-success">${record.accuracy}%</strong></td>
          <td><strong class="text-primary">${record.score}</strong></td>
        `;

        historyTableBodyEl.appendChild(tr);
      });
    })
    .catch((err) => {
      console.warn('Failed to render history table:', err);
    });
}

function handleClearHistory() {
  if (typeof clearGameHistory !== 'function') return;

  if (confirm('Are you sure you want to clear all match history records? This cannot be undone.')) {
    clearGameHistory()
      .then(() => {
        renderStatisticsAndCharts();
        renderHistoryTable();
        if (typeof showToast === 'function') {
          showToast('Match history records cleared successfully.', 'info');
        }
      })
      .catch((err) => {
        console.error('Failed to clear history:', err);
      });
  }
}

/**
 * ----------------------------------------------------------------------------
 * 3. Custom Card Sets CRUD Manager
 * ----------------------------------------------------------------------------
 */
function renderCustomCardSets() {
  if (!customSetsGridEl || typeof getAllCardSets !== 'function') return;

  getAllCardSets()
    .then((sets) => {
      customSetsGridEl.innerHTML = '';

      if (!sets || sets.length === 0) {
        customSetsGridEl.innerHTML = `
          <div class="card-set-empty-state">
            <div class="card-set-empty-state__icon">📭</div>
            <h3>No Custom Card Sets Created</h3>
            <p class="text-muted">Create your own themed card sets with custom emojis and badges!</p>
            <button class="btn btn--primary btn--sm" type="button" onclick="document.getElementById('openCreateSetModalBtn').click()">
              ➕ Create Your First Set
            </button>
          </div>
        `;
        return;
      }

      sets.forEach((set) => {
        const cardCard = document.createElement('div');
        cardCard.className = 'card-set-card';
        cardCard.dataset.setId = set.id;

        // Emoji previews (first 6 items)
        const previewIcons = set.cards.slice(0, 7).map((c) => c.icon).join(' ');

        cardCard.innerHTML = `
          <div>
            <div class="card-set-card__header">
              <h3 class="card-set-card__title">${set.name}</h3>
              <span class="badge ${set.isBuiltIn ? 'badge--primary' : 'badge--success'}">
                ${set.isBuiltIn ? 'Default' : 'Custom'}
              </span>
            </div>
            <p class="card-set-card__desc">${set.description || 'Custom player deck.'}</p>
          </div>

          <div class="card-set-card__preview" title="Card deck preview">
            ${previewIcons} ${set.cards.length > 7 ? '...' : ''}
          </div>

          <div class="card-set-card__meta">
            <span>Cards: <strong>${set.cards.length} unique</strong></span>
            <span>By: <strong>${set.author || 'Player'}</strong></span>
          </div>

          <div class="card-set-card__actions">
            <button class="btn btn--primary btn--sm js-play-set-btn" type="button" data-set-id="${set.id}">
              🎮 Play
            </button>
            <button class="btn btn--outline btn--sm js-edit-set-btn" type="button" data-set-id="${set.id}">
              ✏️ Edit
            </button>
            ${
              set.isBuiltIn
                ? ''
                : `<button class="btn btn--danger-outline btn--sm js-delete-set-btn" type="button" data-set-id="${set.id}" data-set-name="${set.name}">
                     🗑️
                   </button>`
            }
          </div>
        `;

        // Attach action handlers
        const playBtn = cardCard.querySelector('.js-play-set-btn');
        if (playBtn) {
          playBtn.addEventListener('click', () => handlePlaySet(set.id));
        }

        const editBtn = cardCard.querySelector('.js-edit-set-btn');
        if (editBtn) {
          editBtn.addEventListener('click', () => handleEditSet(set.id));
        }

        const deleteBtn = cardCard.querySelector('.js-delete-set-btn');
        if (deleteBtn) {
          deleteBtn.addEventListener('click', () => openDeleteModal(set.id, set.name));
        }

        customSetsGridEl.appendChild(cardCard);
      });
    })
    .catch((err) => {
      console.warn('Failed to render custom card sets:', err);
    });
}

/**
 * Launches the Game Arena with the selected custom set
 */
function handlePlaySet(setId) {
  if (typeof setSelectedTheme === 'function') {
    setSelectedTheme(setId);
  }
  window.location.href = 'index.html';
}

/**
 * ----------------------------------------------------------------------------
 * 4. Card Set Modal & Form Validation (Create & Edit)
 * ----------------------------------------------------------------------------
 */
function openCardSetModal(existingSet = null) {
  if (!cardSetModalEl) return;

  // Reset form and validation errors
  resetCardSetForm();

  if (existingSet) {
    if (cardSetModalTitleEl) cardSetModalTitleEl.textContent = '✏️ Edit Card Set';
    if (editCardSetIdEl) editCardSetIdEl.value = existingSet.id;
    if (cardSetNameInputEl) cardSetNameInputEl.value = existingSet.name;

    // Populate existing card slots
    if (dynamicCardInputsEl) {
      dynamicCardInputsEl.innerHTML = '';
      existingSet.cards.forEach((card) => {
        addCardSlotRow(card.icon, card.label, card.badge);
      });
    }
  } else {
    if (cardSetModalTitleEl) cardSetModalTitleEl.textContent = '➕ Create Card Set';
    if (editCardSetIdEl) editCardSetIdEl.value = '';

    // Seed 8 starter empty slots for convenience
    if (dynamicCardInputsEl) {
      dynamicCardInputsEl.innerHTML = '';
      const sampleSeeds = [
        { icon: '⭐', label: 'Star', badge: 'Bonus' },
        { icon: '💎', label: 'Diamond', badge: 'Gem' },
        { icon: '⚡', label: 'Lightning', badge: 'Energy' },
        { icon: '🔥', label: 'Flame', badge: 'Element' },
        { icon: '🍀', label: 'Clover', badge: 'Luck' },
        { icon: '🌙', label: 'Crescent', badge: 'Night' },
        { icon: '🚀', label: 'Rocket', badge: 'Cosmic' },
        { icon: '🏆', label: 'Trophy', badge: 'Victory' }
      ];
      sampleSeeds.forEach((s) => addCardSlotRow(s.icon, s.label, s.badge));
    }
  }

  cardSetModalEl.classList.add('modal--active');
}

function closeCardSetModal() {
  if (cardSetModalEl) {
    cardSetModalEl.classList.remove('modal--active');
  }
  resetCardSetForm();
}

function resetCardSetForm() {
  if (cardSetFormEl) cardSetFormEl.reset();
  if (editCardSetIdEl) editCardSetIdEl.value = '';
  if (groupSetNameEl) groupSetNameEl.classList.remove('has-error');
  if (groupCardItemsEl) groupCardItemsEl.classList.remove('has-error');
}

/**
 * Dynamically appends a card slot input row
 */
function addCardSlotRow(icon = '🃏', label = '', badge = '') {
  if (!dynamicCardInputsEl) return;

  const currentSlots = dynamicCardInputsEl.querySelectorAll('.card-input-row');
  if (currentSlots.length >= 18) {
    if (typeof showToast === 'function') {
      showToast('Maximum of 18 card pairs allowed.', 'warning');
    }
    return;
  }

  const row = document.createElement('div');
  row.className = 'card-input-row';

  row.innerHTML = `
    <input type="text" class="card-input-emoji" value="${icon}" maxlength="4" placeholder="Emoji" required aria-label="Card Emoji">
    <input type="text" class="card-input-label" value="${label}" maxlength="20" placeholder="Card Title (e.g. Star)" required aria-label="Card Title">
    <input type="text" class="card-input-badge" value="${badge}" maxlength="15" placeholder="Badge / Tag" aria-label="Card Badge">
    <button type="button" class="remove-card-slot-btn" aria-label="Remove card slot" title="Remove slot">✕</button>
  `;

  // Remove button handler
  const removeBtn = row.querySelector('.remove-card-slot-btn');
  removeBtn.addEventListener('click', () => {
    const remaining = dynamicCardInputsEl.querySelectorAll('.card-input-row').length;
    if (remaining <= 8) {
      if (typeof showToast === 'function') {
        showToast('At least 8 card pairs are required.', 'warning');
      }
      return;
    }
    row.remove();
  });

  dynamicCardInputsEl.appendChild(row);
}

/**
 * Handle card set edit click
 */
function handleEditSet(setId) {
  if (typeof getCardSetById !== 'function') return;

  getCardSetById(setId)
    .then((cardSet) => {
      if (cardSet) {
        openCardSetModal(cardSet);
      }
    })
    .catch((err) => {
      console.warn('Could not fetch card set for editing:', err);
    });
}

/**
 * Card Set Form Validation & Submission
 */
function handleCardSetFormSubmit(event) {
  event.preventDefault();

  let isValid = true;

  // 1. Validate Card Set Name
  const setName = cardSetNameInputEl ? cardSetNameInputEl.value.trim() : '';
  if (!setName || setName.length < 3 || setName.length > 30) {
    if (groupSetNameEl) groupSetNameEl.classList.add('has-error');
    isValid = false;
  } else {
    if (groupSetNameEl) groupSetNameEl.classList.remove('has-error');
  }

  // 2. Validate Card Slots (At least 8 unique, non-empty pairs)
  const rows = dynamicCardInputsEl ? dynamicCardInputsEl.querySelectorAll('.card-input-row') : [];
  const cards = [];
  const uniqueLabels = new Set();

  rows.forEach((row) => {
    const iconInput = row.querySelector('.card-input-emoji');
    const labelInput = row.querySelector('.card-input-label');
    const badgeInput = row.querySelector('.card-input-badge');

    const icon = iconInput ? iconInput.value.trim() : '';
    const label = labelInput ? labelInput.value.trim() : '';
    const badge = badgeInput ? badgeInput.value.trim() : '';

    if (icon && label) {
      cards.push({ icon, label, badge });
      uniqueLabels.add(label.toLowerCase());
    }
  });

  if (cards.length < 8) {
    if (groupCardItemsEl) groupCardItemsEl.classList.add('has-error');
    if (errorCardItemsEl) {
      errorCardItemsEl.textContent = `At least 8 valid cards are required. Currently have ${cards.length}.`;
    }
    isValid = false;
  } else if (uniqueLabels.size < cards.length) {
    if (groupCardItemsEl) groupCardItemsEl.classList.add('has-error');
    if (errorCardItemsEl) {
      errorCardItemsEl.textContent = 'Each card must have a unique title. Please remove duplicate names.';
    }
    isValid = false;
  } else {
    if (groupCardItemsEl) groupCardItemsEl.classList.remove('has-error');
  }

  if (!isValid) {
    return;
  }

  // Construct card set object
  const editId = editCardSetIdEl ? editCardSetIdEl.value.trim() : '';
  const cardSetPayload = {
    name: setName,
    description: `Custom deck with ${cards.length} themed cards.`,
    author: typeof getPlayerName === 'function' ? getPlayerName() : 'Player',
    cards: cards
  };

  if (editId) {
    // Update existing set
    updateCardSet(editId, cardSetPayload)
      .then(() => {
        closeCardSetModal();
        renderCustomCardSets();
        if (typeof showToast === 'function') {
          showToast(`Card set "${setName}" updated successfully!`, 'success');
        }
      })
      .catch((err) => {
        console.error('Failed to update card set:', err);
      });
  } else {
    // Create new set
    createCardSet(cardSetPayload)
      .then(() => {
        closeCardSetModal();
        renderCustomCardSets();
        if (typeof showToast === 'function') {
          showToast(`Custom card set "${setName}" created!`, 'success');
        }
      })
      .catch((err) => {
        console.error('Failed to create card set:', err);
      });
  }
}

/**
 * ----------------------------------------------------------------------------
 * 5. Delete Set Confirmation Modal
 * ----------------------------------------------------------------------------
 */
function openDeleteModal(setId, setName) {
  pendingDeleteSetId = setId;
  if (deleteTargetNameEl) deleteTargetNameEl.textContent = `"${setName}"`;
  if (deleteConfirmModalEl) deleteConfirmModalEl.classList.add('modal--active');
}

function closeDeleteModal() {
  pendingDeleteSetId = null;
  if (deleteConfirmModalEl) deleteConfirmModalEl.classList.remove('modal--active');
}

function handleConfirmDelete() {
  if (!pendingDeleteSetId || typeof deleteCardSet !== 'function') return;

  deleteCardSet(pendingDeleteSetId)
    .then(() => {
      closeDeleteModal();
      renderCustomCardSets();
      if (typeof showToast === 'function') {
        showToast('Card set deleted successfully.', 'info');
      }
    })
    .catch((err) => {
      console.error('Failed to delete card set:', err);
    });
}
