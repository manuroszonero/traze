import type { InstagramAccount, AnalysisResult } from '../types/instagram.ts';

export function openInstagramProfile(username: string): void {
  const clean = username.replace(/^@+/, '').trim();
  const url = `https://www.instagram.com/${clean}/`;

  if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) {
    try {
      chrome.tabs.create({ url, active: true });
      return;
    } catch {
      // fallback
    }
  }

  window.open(url, '_blank', 'noopener,noreferrer');
}

export function openDashboardTab(options?: { upload?: boolean }): void {
  const query = options?.upload ? '?action=upload' : '';
  if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create && chrome.runtime && chrome.runtime.getURL) {
    try {
      const url = chrome.runtime.getURL('src/dashboard/dashboard.html' + query);
      chrome.tabs.create({ url, active: true });
      return;
    } catch {
      // fallback
    }
  }

  window.open('/src/dashboard/dashboard.html' + query, '_blank');
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('Failed to copy to clipboard', err);
    return false;
  }
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-US').format(n || 0);
}

export function downloadCsv(accounts: InstagramAccount[], filename: string = 'followtrace_accounts.csv'): void {
  const headers = ['Username', 'Profile URL', 'Status', 'Date Followed'];
  const rows = accounts.map((acc) => [
    `"${acc.username}"`,
    `"${acc.profileUrl}"`,
    `"${acc.reviewStatus || 'unreviewed'}"`,
    `"${acc.formattedDate || ''}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadJson(analysis: AnalysisResult, filename: string = 'followtrace_analysis.json'): void {
  const jsonContent = JSON.stringify(analysis, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
