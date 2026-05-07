# Zilli - Facebook Lead Finder 💙

> اپنے Facebook Business Leads تلاش کریں، ڈیٹا نکالیں اور Export کریں

## 🎯 خصوصیات

- 🔍 **Smart Search**: Facebook میں keyword اور topic سے تلاش
- 📄 **Page Selection**: متعدد pages منتخب کریں
- 🤖 **Auto Scraping**: خودکار طور پر profiles کو scroll اور ڈیٹا نکالیں
- 📊 **Data Extraction**: 
  - Company Name
  - Email Addresses
  - Phone Numbers
  - WhatsApp Links
  - Website URLs
  - Social Media (Instagram, LinkedIn, X, Telegram, YouTube)
- 💾 **Session Recovery**: Connection ٹوٹ جائے تو ڈیٹا محفوظ رہے
- 📥 **Export**: CSV/JSON میں ڈیٹا نکالیں
- 🎨 **Modern UI**: Beautiful Blue + White theme

## 📦 Installation

### Development Mode:

1. **Clone کریں**:
   ```bash
   git clone https://github.com/zulqarnainzilli-uz/Zilli-Facebook-Lead-Finder.git
   cd Zilli-Facebook-Lead-Finder
   ```

2. **Chrome میں Load کریں**:
   - `chrome://extensions` کھولیں
   - "Developer mode" ON کریں (دائیں طرف اوپر)
   - "Load unpacked" پر کلک کریں
   - اس folder کو select کریں

3. **Facebook میں جائیں**:
   - https://facebook.com کھولیں
   - Extension icon پر کلک کریں
   - "Start Scraping" بتن دبائیں

## 🚀 کیسے استعمال کریں

### Step 1: Search & Pages
```
1. Extension popup میں keyword لکھیں (مثلاً: "CBD Shop")
2. "Search" بتن دبائیں
3. Facebook صفحات دیکھیں
4. اپنے مطلوبہ pages منتخب کریں
5. "Next" دبائیں
```

### Step 2: Auto Scraping
```
1. Target profiles کی تعداد بتائیں (100, 500, 1000, etc)
2. "Start Scraping" دبائیں
3. Sidebar میں progress دیکھیں
4. Extension خود scroll کرے گی اور ڈیٹا جمع کرے گی
5. Pause/Resume/Stop کنٹرول ہیں
```

### Step 3: Data Export
```
1. "Results" ٹیب میں جائیں
2. CSV یا JSON select کریں
3. "Download" دبائیں
```

## 📁 Project Structure

```
Zilli-Facebook-Lead-Finder/
├── manifest.json                 # Extension configuration
├── README.md                     # یہ فائل
├── ROADMAP.md                    # Development roadmap
├── package.json                  # Dependencies
├── src/
│   ├── popup/
│   │   ├── popup.html           # Main UI
│   │   ├── popup.css            # Styling (Blue + White)
│   │   └── popup.js             # Popup logic
│   ├── sidebar/
│   │   └── sidebar.js           # Split-view sidebar (reading mode style)
│   ├── content/
│   │   └── content-script.js    # Facebook data extraction
│   └── background/
│       └── service-worker.js    # Background tasks & storage
├── assets/
│   └── theme.css                # Global theme
└── icons/
    ├── icon-16.png
    ├── icon-48.png
    └── icon-128.png
```

## 🎨 Theme Colors

- **Primary Blue**: `#1e3a8a`
- **Light Blue**: `#3b82f6`
- **Sky Blue**: `#0ea5e9`
- **White**: `#ffffff`
- **Borders**: `#e5e7eb`

## 🔐 Privacy & Security

✅ **100% Local**: سب کچھ آپ کے کمپیوٹر پر
✅ **No Tracking**: کوئی data سرورز پر نہیں بھیجا جاتا
✅ **No Ads**: کوئی اشتہار نہیں
✅ **Open Source**: کوڈ پوری طرح دیکھی جا سکتی ہے

## ⚖️ Facebook Terms of Service

یہ extension صرف:
- Public معلومات استعمال کرتا ہے
- شخصی استعمال کے لیے ہے
- Automated requests میں مناسب delay رکھتا ہے
- Facebook API استعمال نہیں کرتا

## 🐛 Issues & Support

مسائل کی رپورٹ کریں:
- GitHub Issues: https://github.com/zulqarnainzilli-uz/Zilli-Facebook-Lead-Finder/issues

## 📝 License

MIT License - آزادی سے استعمال اور modify کریں

## 🤝 Contributing

Pull requests خوش آمدید ہیں!

1. Fork کریں
2. Feature branch بنائیں (`git checkout -b feature/amazing`)
3. Commit کریں (`git commit -m 'Add amazing feature'`)
4. Push کریں (`git push origin feature/amazing`)
5. Pull Request کھولیں

## 📧 Contact

**Created by**: Zilli Team
**Email**: contact@zilli.dev
**Website**: Coming Soon 🚀

---

**Made with 💙 by Zilli**

*Last Updated: 2026-05-07*
