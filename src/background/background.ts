// TRAZE - Chrome Extension Service Worker

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('TRAZE Extension installed successfully.');
  }
});

// Handle incoming messages from popup or dashboard
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === 'OPEN_DASHBOARD') {
    const dashboardUrl = chrome.runtime.getURL('src/dashboard/dashboard.html');
    chrome.tabs.create({ url: dashboardUrl });
    sendResponse({ success: true });
    return true;
  }
  if (message.action === 'CLEAR_ACTIVE_SESSION') {
    chrome.storage.local.remove([
      'followtrace_current_analysis',
      'followtrace_viewed_users',
      'followtrace_review_statuses',
    ]);
    sendResponse({ success: true });
    return true;
  }
});

// When any tab is closed, check if any TRAZE dashboard tabs remain open.
// If NO dashboard tabs are open, clear the active analysis session so popup starts fresh.
chrome.tabs.onRemoved.addListener(async () => {
  try {
    const dashboardUrl = chrome.runtime.getURL('src/dashboard/dashboard.html');
    const tabs = await chrome.tabs.query({});
    const hasOpenDashboard = tabs.some((t) => t.url && t.url.startsWith(dashboardUrl));
    if (!hasOpenDashboard) {
      await chrome.storage.local.remove([
        'followtrace_current_analysis',
        'followtrace_viewed_users',
        'followtrace_review_statuses',
      ]);
    }
  } catch (err) {
    console.error('Error cleaning session on tab close:', err);
  }
});
