/**
 * Zilli Content Script
 * Runs on Facebook pages to detect profiles and extract data
 */

class ZilliScraper {
  constructor() {
    this.profileURLs = [];
    this.extractedData = [];
    this.failedProfiles = [];
    this.isRunning = false;
    this.init();
  }

  init() {
    console.log('Zilli Content Script loaded on:', window.location.hostname);
    this.attachMessageListeners();
  }

  attachMessageListeners() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      switch (request.action) {
        case 'START_SCRAPING':
          this.startScraping(request, sendResponse);
          break;
        case 'PAUSE_SCRAPING':
          this.pauseScraping(sendResponse);
          break;
        case 'EXTRACT_DATA':
          this.extractProfileData(sendResponse);
          break;
      }
      return true;
    });
  }

  startScraping(request, sendResponse) {
    this.isRunning = true;
    const limit = request.limit || 100;
    const keyword = request.keyword;

    console.log(`Starting to scrape ${limit} profiles for keyword: ${keyword}`);

    this.autoScroll(limit);
    sendResponse({ success: true });
  }

  pauseScraping(sendResponse) {
    this.isRunning = false;
    sendResponse({ success: true });
  }

  autoScroll(limit) {
    let scrollCount = 0;
    const maxScrolls = Math.ceil(limit / 10);
    const scrollDelay = 1000; // 1 second delay between scrolls

    const scrollInterval = setInterval(() => {
      if (!this.isRunning) {
        clearInterval(scrollInterval);
        return;
      }

      window.scrollBy(0, window.innerHeight);
      scrollCount++;

      // Detect profiles on current screen
      this.detectProfiles();

      // Stop if we've reached the limit
      if (scrollCount >= maxScrolls || this.profileURLs.length >= limit) {
        clearInterval(scrollInterval);
        this.completeScaping();
      }
    }, scrollDelay);
  }

  detectProfiles() {
    // Facebook profile selectors (update these based on current Facebook structure)
    const profileElements = document.querySelectorAll(
      'a[href*="/profile.php?id="], a[href*="facebook.com/"][href*="about"]'
    );

    profileElements.forEach(element => {
      const href = element.getAttribute('href');
      if (href && !this.profileURLs.includes(href)) {
        this.profileURLs.push(href);
      }
    });

    console.log(`Detected ${this.profileURLs.length} profiles so far`);
  }

  extractProfileData(sendResponse) {
    // Extract data from current Facebook profile page
    const data = {
      companyName: this.extractCompanyName(),
      email: this.extractEmail(),
      phone: this.extractPhone(),
      whatsapp: this.extractWhatsApp(),
      website: this.extractWebsite(),
      instagram: this.extractSocialLink('instagram'),
      linkedin: this.extractSocialLink('linkedin'),
      x: this.extractSocialLink('twitter'),
      telegram: this.extractSocialLink('telegram'),
      youtube: this.extractSocialLink('youtube'),
      profileURL: window.location.href
    };

    this.extractedData.push(data);
    sendResponse({ success: true, data: data });
  }

  extractCompanyName() {
    // Look for company name in profile
    const nameElements = document.querySelectorAll('h1, [data-testid="profile_name"]');
    return nameElements.length > 0 ? nameElements[0].textContent.trim() : '';
  }

  extractEmail() {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const pageText = document.body.innerText;
    const matches = pageText.match(emailRegex);
    return matches ? matches[0] : '';
  }

  extractPhone() {
    // Pakistan phone number regex: +92 or 03 followed by digits
    const phoneRegex = /(?:\+92|0)[0-9\s\-()]{9,}/g;
    const pageText = document.body.innerText;
    const matches = pageText.match(phoneRegex);
    return matches ? matches[0] : '';
  }

  extractWhatsApp() {
    const whatsappLinks = document.querySelectorAll('a[href*="wa.me"]');
    if (whatsappLinks.length > 0) {
      return whatsappLinks[0].getAttribute('href');
    }
    return '';
  }

  extractWebsite() {
    const websiteLinks = document.querySelectorAll('a[href*="http"]');
    for (let link of websiteLinks) {
      const href = link.getAttribute('href');
      if (href && !href.includes('facebook.com')) {
        return href;
      }
    }
    return '';
  }

  extractSocialLink(platform) {
    const selectors = {
      instagram: 'a[href*="instagram.com"]',
      linkedin: 'a[href*="linkedin.com"]',
      twitter: 'a[href*="twitter.com"], a[href*="x.com"]',
      telegram: 'a[href*="t.me"]',
      youtube: 'a[href*="youtube.com"], a[href*="youtu.be"]'
    };

    const element = document.querySelector(selectors[platform]);
    return element ? element.getAttribute('href') : '';
  }

  completeScaping() {
    console.log(`Completed scraping. Found ${this.profileURLs.length} profiles`);
    console.log(`Extracted data from ${this.extractedData.length} profiles`);

    // Send final report to background worker
    chrome.runtime.sendMessage({
      action: 'SCRAPING_COMPLETE',
      profiles: this.profileURLs,
      extracted: this.extractedData,
      failed: this.failedProfiles
    });
  }
}

// Initialize scraper
const scraper = new ZilliScraper();
