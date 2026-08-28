# FOLLOWTRACE — Instagram Data Intelligence & Analytics Chrome Extension

**FOLLOWTRACE** is a dark-mode Chrome Extension (Manifest V3) that parses downloaded Instagram export ZIP files completely offline in your browser to instantly detect accounts that don't follow you back, mutual followers, and fans with one-click Instagram profile links.

---

## Key Features

* 🚀 **Zero Manual Work**: No copying usernames or pasting lists. Drag & drop your Instagram data export `.zip` file and FOLLOWTRACE does the rest.
* 🔒 **100% Offline & Private**: All file extraction, JSON/HTML parsing, and Set comparison happens client-side in the browser. Zero tokens or data leave your device.
* ⚡ **Blazing Fast**: Instant case-insensitive search through thousands of accounts, dynamic sorting (A-Z, Z-A, Newest Followed, Review Status), and filter chips.
* 🎯 **Review Mode**: Rapid 1-by-1 account triage carousel with keyboard shortcuts (`←`/`→` to navigate, `Enter` to open Instagram profile, `C` to mark Checked, `I` to Ignore, `Esc` to exit) and celebratory confetti upon 100% review!
* ↗️ **One-Click Profile Navigation**: Click any `@username` or "VIEW PROFILE ↗" button to instantly open `https://www.instagram.com/{username}/` in a new tab.
* 💾 **Local Persistence**: Automatically remembers your previous analysis and review statuses using IndexedDB.
* 📊 **Export Capabilities**: Download CSV reports for specific categories or full JSON datasets, plus copy usernames to clipboard with a single click.
* ✨ **Demo Data Included**: Click "Try Demo" to preview and test all features instantly without waiting for an Instagram export.

---

## Installation Guide (Load Unpacked Extension in Chrome)

1. Open Google Chrome (or any Chromium browser like Edge, Brave, Arc, Opera).
2. Navigate to `chrome://extensions/` in your address bar.
3. Enable **Developer mode** toggle in the top-right corner.
4. Click **Load unpacked** button in the top-left.
5. Select the `dist` folder located at:
   ```text
   c:\projects\traze\dist
   ```
6. Click the **FOLLOWTRACE** puzzle piece icon in your Chrome toolbar to open the popup, or click **Analyze Instagram Data** to open the full dashboard!

---

## Development & Testing

### Running Tests
Run the comprehensive 35-test unit suite for parsing, Set comparison, and ZIP decompression:
```bash
npm test
```

### Building for Production
Build the Chrome Extension bundle into `dist/`:
```bash
npm run build
```

### Generating Sample ZIP Files
Create realistic JSON and HTML test ZIPs in `sample_exports/`:
```bash
npm run generate:samples
```

---

## How to Export Your Instagram Data
1. Open Instagram on web or mobile &rarr; **Settings** &rarr; **Accounts Center** &rarr; **Your information and permissions**.
2. Click **Download your information** &rarr; **Download or transfer information**.
3. Choose **Some of your information** and select only **Followers and following**.
4. Choose format: **JSON** (recommended) or **HTML**, then download the `.zip` archive.
5. Drop the `.zip` file directly into FOLLOWTRACE!
