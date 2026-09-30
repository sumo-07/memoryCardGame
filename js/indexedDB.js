/**
 * ============================================================================
 * INDEXEDDB.JS - Structured Database Storage (MemoryMatchDB)
 * Memory Match Application
 * ============================================================================
 * Reserved for Day 4: Custom Card Set CRUD and Match Analytics History.
 * ============================================================================
 */

'use strict';

const DB_NAME = 'MemoryMatchDB';
const DB_VERSION = 1;

if (typeof window !== 'undefined') {
  window.DB_NAME = DB_NAME;
  window.DB_VERSION = DB_VERSION;
}
