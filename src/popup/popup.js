/**
 * Zilli Lead Finder - Popup Script
 * Handles UI interactions and communication with background service worker
 */

class ZilliPopup {
  constructor() {
    this.currentLimit = 100;
    this.sessionData = {
      profiles: [],
      extracted: [],
      failed: []
    };
    this.init();
  }

  init() {
    this.attachEventListeners();
    this.loadSavedData();
    this.setupTabNavigation();
  }

  attachEventListeners() {
    // Quick limit buttons
    document.querySelectorAll('.quick-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.setLimit(e.target.dataset.limit));
    });

    // Main buttons
    document.getElementById('start-btn').addEventListener('click', () => this.startScraping());
    document.getElementById('pause-btn').addEventListener('click', () => this.pauseScraping());
    document.getElementById('stop-btn').addEventListener('click', () => this.stopScraping());

    // Export
    document.getElementById('export-btn').addEventListener('click', () => this.exportData());

    // Sessions
    document.getElementById('clear-sessions-btn').addEventListener('click', () => this.clearSessions());

    // Settings
    document.getElementById('auto-save').addEventListener('change', (e) => {
      chrome.storage.sync.set({ autoSave: e.target.checked });
    });

    document.getElementById('scroll-delay').addEventListener('change', (e) => {
      chrome.storage.sync.set({ scrollDelay: e.target.value });
    });
  }

  setupTabNavigation() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
    });
  }

  switchTab(tabName) {
    // Hide all panels
    document.querySelectorAll('.tab-panel').forEach(panel => {
      panel.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.remove('active');
    });

    // Show selected panel
    document.getElementById(`${tabName}-tab`).classList.add('active');
    event.target.classList.add('active');
  }

  setLimit(limit) {
    this.currentLimit = limit;
    document.querySelectorAll('.quick-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    event.target.classList.add('active');
    document.getElementById('progress-total').textContent = limit;
  }

  startScraping() {
    const keyword = document.getElementById('search-input').value.trim();
    if (!keyword) {
      alert('براہ کرم کوئی keyword یا topic لکھیں');
      return;
    }

    const customLimit = document.getElementById('custom-limit').value;
    const limit = customLimit ? parseInt(customLimit) : this.currentLimit;

    // Send message to service worker
    chrome.runtime.sendMessage({
      action: 'START_SCRAPING',
      keyword: keyword,
      limit: limit
    }, (response) => {
      if (response.success) {
        this.updateUI('started');
      }
    });
  }

  pauseScraping() {
    chrome.runtime.sendMessage({ action: 'PAUSE_SESSION' }, (response) => {
      this.updateUI('paused');
    });
  }

  stopScraping() {
    if (confirm('کیا آپ scraping روکنا چاہتے ہیں؟ ڈیٹا محفوظ رہے گا')) {
      chrome.runtime.sendMessage({ action: 'STOP_SESSION' }, (response) => {
        this.updateUI('stopped');
      });
    }
  }

  exportData() {
    const format = document.getElementById('export-format').value;
    chrome.runtime.sendMessage({
      action: 'EXPORT_DATA',
      format: format
    }, (response) => {
      if (response.success) {
        alert(`ڈیٹا ${format.toUpperCase()} میں ڈاؤن لوڈ ہو رہا ہے...`);
      }
    });
  }

  clearSessions() {
    if (confirm('تمام sessions حذف کریں؟ یہ action واپس نہیں کیا جا سکتا')) {
      chrome.storage.local.clear(() => {
        alert('تمام sessions حذف ہو گئے');
        this.loadSavedData();
      });
    }
  }

  updateUI(status) {
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const stopBtn = document.getElementById('stop-btn');

    if (status === 'started') {
      startBtn.disabled = true;
      pauseBtn.disabled = false;
      stopBtn.disabled = false;
    } else if (status === 'paused' || status === 'stopped') {
      startBtn.disabled = false;
      pauseBtn.disabled = true;
      stopBtn.disabled = true;
    }
  }

  loadSavedData() {
    chrome.storage.local.get(['sessionData', 'progress'], (result) => {
      if (result.sessionData) {
        this.sessionData = result.sessionData;
        this.updateStats();
      }
      if (result.progress) {
        this.updateProgress(result.progress.current, result.progress.total);
      }
    });
  }

  updateStats() {
    document.getElementById('stat-found').textContent = this.sessionData.profiles.length;
    document.getElementById('stat-extracted').textContent = this.sessionData.extracted.length;
    document.getElementById('stat-failed').textContent = this.sessionData.failed.length;
  }

  updateProgress(current, total) {
    const percentage = (current / total) * 100;
    document.getElementById('progress-fill').style.width = percentage + '%';
    document.getElementById('progress-current').textContent = current;
    document.getElementById('progress-total').textContent = total;
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.zilliPopup = new ZilliPopup();
  });
} else {
  window.zilliPopup = new ZilliPopup();
}

// Listen for messages from service worker
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'UPDATE_PROGRESS') {
    window.zilliPopup.updateProgress(request.current, request.total);
  }
  if (request.action === 'UPDATE_STATS') {
    window.zilliPopup.sessionData = request.data;
    window.zilliPopup.updateStats();
  }
});
