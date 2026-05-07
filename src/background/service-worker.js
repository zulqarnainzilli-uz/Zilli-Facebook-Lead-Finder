/**
 * Zilli Background Service Worker
 * Handles session management, data persistence, and message routing
 */

class ZilliSessionManager {
  constructor() {
    this.currentSession = null;
    this.isRunning = false;
    this.isPaused = false;
    this.init();
  }

  init() {
    console.log('Zilli Service Worker Initialized');
    this.attachMessageListeners();
    this.restoreSession();
  }

  attachMessageListeners() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      console.log('Message received:', request.action);

      switch (request.action) {
        case 'START_SCRAPING':
          this.startSession(request, sendResponse);
          break;
        case 'PAUSE_SESSION':
          this.pauseSession(sendResponse);
          break;
        case 'STOP_SESSION':
          this.stopSession(sendResponse);
          break;
        case 'CONTINUE_SESSION':
          this.continueSession(sendResponse);
          break;
        case 'EXPORT_DATA':
          this.exportData(request, sendResponse);
          break;
        case 'UPDATE_PROGRESS':
          this.updateProgress(request, sendResponse);
          break;
        default:
          sendResponse({ error: 'Unknown action' });
      }
      return true; // Keep message channel open for async response
    });
  }

  startSession(request, sendResponse) {
    this.currentSession = {
      id: Date.now().toString(),
      keyword: request.keyword,
      limit: request.limit,
      startTime: new Date().toISOString(),
      status: 'running',
      profiles: [],
      extracted: [],
      failed: [],
      progress: {
        current: 0,
        total: request.limit
      }
    };

    this.isRunning = true;
    this.isPaused = false;

    // Save session
    chrome.storage.local.set({
      currentSession: this.currentSession
    });

    // Notify popup
    chrome.runtime.sendMessage({
      action: 'SESSION_STARTED',
      session: this.currentSession
    }).catch(() => {}); // Ignore if popup is closed

    sendResponse({ success: true, sessionId: this.currentSession.id });
  }

  pauseSession(sendResponse) {
    if (this.currentSession) {
      this.isPaused = true;
      this.currentSession.status = 'paused';
      chrome.storage.local.set({ currentSession: this.currentSession });
      sendResponse({ success: true });
    } else {
      sendResponse({ error: 'No active session' });
    }
  }

  stopSession(sendResponse) {
    if (this.currentSession) {
      this.currentSession.status = 'stopped';
      this.currentSession.endTime = new Date().toISOString();
      this.isRunning = false;
      this.isPaused = false;

      // Save as completed session
      chrome.storage.local.get(['sessions'], (result) => {
        const sessions = result.sessions || [];
        sessions.push(this.currentSession);
        chrome.storage.local.set({ sessions: sessions });
      });

      sendResponse({ success: true });
    } else {
      sendResponse({ error: 'No active session' });
    }
  }

  continueSession(sendResponse) {
    if (this.currentSession) {
      this.isPaused = false;
      this.currentSession.status = 'running';
      chrome.storage.local.set({ currentSession: this.currentSession });
      sendResponse({ success: true });
    } else {
      sendResponse({ error: 'No session to continue' });
    }
  }

  updateProgress(request, sendResponse) {
    if (this.currentSession) {
      this.currentSession.progress = request.progress;
      this.currentSession.profiles = request.profiles || [];
      this.currentSession.extracted = request.extracted || [];
      this.currentSession.failed = request.failed || [];

      // Save progress
      chrome.storage.local.set({ currentSession: this.currentSession });

      // Notify popup
      chrome.runtime.sendMessage({
        action: 'UPDATE_PROGRESS',
        current: request.progress.current,
        total: request.progress.total
      }).catch(() => {});

      sendResponse({ success: true });
    }
  }

  exportData(request, sendResponse) {
    chrome.storage.local.get(['currentSession'], (result) => {
      const data = result.currentSession?.extracted || [];

      if (request.format === 'csv') {
        this.exportAsCSV(data);
      } else if (request.format === 'json') {
        this.exportAsJSON(data);
      }

      sendResponse({ success: true });
    });
  }

  exportAsCSV(data) {
    const headers = [
      'Company Name',
      'Email',
      'Phone',
      'WhatsApp',
      'Website',
      'Instagram',
      'LinkedIn',
      'X',
      'Telegram',
      'YouTube'
    ];

    let csv = headers.join(',') + '\n';

    data.forEach(item => {
      const row = [
        this.escapeCSV(item.companyName || ''),
        this.escapeCSV(item.email || ''),
        this.escapeCSV(item.phone || ''),
        this.escapeCSV(item.whatsapp || ''),
        this.escapeCSV(item.website || ''),
        this.escapeCSV(item.instagram || ''),
        this.escapeCSV(item.linkedin || ''),
        this.escapeCSV(item.x || ''),
        this.escapeCSV(item.telegram || ''),
        this.escapeCSV(item.youtube || '')
      ];
      csv += row.join(',') + '\n';
    });

    this.downloadFile(csv, 'leads.csv', 'text/csv');
  }

  exportAsJSON(data) {
    const json = JSON.stringify(data, null, 2);
    this.downloadFile(json, 'leads.json', 'application/json');
  }

  escapeCSV(value) {
    if (typeof value !== 'string') value = '';
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    chrome.downloads.download({
      url: url,
      filename: filename,
      saveAs: true
    });
  }

  restoreSession() {
    chrome.storage.local.get(['currentSession'], (result) => {
      if (result.currentSession && result.currentSession.status === 'paused') {
        this.currentSession = result.currentSession;
        console.log('Session restored:', this.currentSession.id);
      }
    });
  }
}

// Initialize session manager
const sessionManager = new ZilliSessionManager();
