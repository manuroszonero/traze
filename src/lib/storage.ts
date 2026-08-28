import { get, set, del } from './idb.ts';
import type { AnalysisResult, HistoricalAnalysisSummary, ReviewStatus } from '../types/instagram.ts';

const STORAGE_KEYS = {
  CURRENT_ANALYSIS: 'followtrace_current_analysis',
  REVIEW_STATUSES: 'followtrace_review_statuses',
  VIEWED_USERS: 'followtrace_viewed_users',
  ANALYSIS_HISTORY: 'followtrace_history',
};

export function isChromeExtension(): boolean {
  return typeof chrome !== 'undefined' && !!chrome.storage && !!chrome.storage.local;
}

export async function saveAnalysis(result: AnalysisResult): Promise<void> {
  try {
    await set(STORAGE_KEYS.CURRENT_ANALYSIS, result);

    if (isChromeExtension()) {
      try {
        await chrome.storage.local.set({
          [STORAGE_KEYS.CURRENT_ANALYSIS]: {
            totalFollowersCount: result.totalFollowersCount,
            totalFollowingCount: result.totalFollowingCount,
            notFollowingBackCount: result.notFollowingBack.length,
            mutualsCount: result.mutuals.length,
            youDontFollowBackCount: result.youDontFollowBack.length,
            analyzedAt: result.analyzedAt,
            zipFileName: result.zipFileName,
          },
        });
      } catch (err) {
        console.warn('Could not sync summary to chrome.storage.local', err);
      }
    }

    await appendHistorySummary({
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      analyzedAt: result.analyzedAt,
      zipFileName: result.zipFileName || 'instagram_export.zip',
      followersCount: result.totalFollowersCount,
      followingCount: result.totalFollowingCount,
      notFollowingBackCount: result.notFollowingBack.length,
      mutualsCount: result.mutuals.length,
      youDontFollowBackCount: result.youDontFollowBack.length,
    });
  } catch (err) {
    console.error('Failed to save analysis result', err);
  }
}

export async function getAnalysis(): Promise<AnalysisResult | null> {
  try {
    const data = await get<AnalysisResult>(STORAGE_KEYS.CURRENT_ANALYSIS);
    if (data && data.followers && data.following) {
      const [reviewStatuses, viewedUsers] = await Promise.all([
        getReviewStatuses(),
        getViewedUsers(),
      ]);

      const updateAccount = (acc: AnalysisResult['followers'][0]) => {
        const key = acc.username.toLowerCase().trim();
        return {
          ...acc,
          reviewStatus: reviewStatuses[key] || acc.reviewStatus || 'unreviewed',
          isViewed: !!viewedUsers[key],
        };
      };

      return {
        ...data,
        followers: data.followers.map(updateAccount),
        following: data.following.map(updateAccount),
        notFollowingBack: data.notFollowingBack.map(updateAccount),
        mutuals: data.mutuals.map(updateAccount),
        youDontFollowBack: data.youDontFollowBack.map(updateAccount),
      };
    }
  } catch (err) {
    console.error('Failed to read analysis result from storage', err);
  }
  return null;
}

export async function getQuickSummary(): Promise<{
  totalFollowersCount: number;
  totalFollowingCount: number;
  notFollowingBackCount: number;
  analyzedAt: string;
} | null> {
  try {
    if (isChromeExtension()) {
      const res = await chrome.storage.local.get(STORAGE_KEYS.CURRENT_ANALYSIS);
      if (res && res[STORAGE_KEYS.CURRENT_ANALYSIS]) {
        return res[STORAGE_KEYS.CURRENT_ANALYSIS];
      }
    }

    const fullAnalysis = await getAnalysis();
    if (fullAnalysis) {
      return {
        totalFollowersCount: fullAnalysis.totalFollowersCount,
        totalFollowingCount: fullAnalysis.totalFollowingCount,
        notFollowingBackCount: fullAnalysis.notFollowingBack.length,
        analyzedAt: fullAnalysis.analyzedAt,
      };
    }
  } catch (err) {
    console.error('Error fetching quick summary', err);
  }
  return null;
}

export async function saveReviewStatus(username: string, status: ReviewStatus): Promise<void> {
  try {
    const key = username.toLowerCase().trim();
    const statuses = (await get<Record<string, ReviewStatus>>(STORAGE_KEYS.REVIEW_STATUSES)) || {};
    statuses[key] = status;
    await set(STORAGE_KEYS.REVIEW_STATUSES, statuses);
  } catch (err) {
    console.error('Failed to save review status', err);
  }
}

export async function batchSaveReviewStatuses(newStatuses: Record<string, ReviewStatus>): Promise<void> {
  try {
    const statuses = (await get<Record<string, ReviewStatus>>(STORAGE_KEYS.REVIEW_STATUSES)) || {};
    for (const [user, status] of Object.entries(newStatuses)) {
      statuses[user.toLowerCase().trim()] = status;
    }
    await set(STORAGE_KEYS.REVIEW_STATUSES, statuses);
  } catch (err) {
    console.error('Failed to batch save review statuses', err);
  }
}

export async function getReviewStatuses(): Promise<Record<string, ReviewStatus>> {
  try {
    const statuses = await get<Record<string, ReviewStatus>>(STORAGE_KEYS.REVIEW_STATUSES);
    return statuses || {};
  } catch (err) {
    console.error('Failed to retrieve review statuses', err);
    return {};
  }
}

/* ==========================================================================
   VIEWED USERS PERSISTENCE (chrome.storage.local with IndexedDB fallback)
   ========================================================================== */

export async function getViewedUsers(): Promise<Record<string, boolean>> {
  try {
    if (isChromeExtension()) {
      const res = await chrome.storage.local.get(STORAGE_KEYS.VIEWED_USERS);
      if (res && res[STORAGE_KEYS.VIEWED_USERS]) {
        return res[STORAGE_KEYS.VIEWED_USERS];
      }
    }
    const data = await get<Record<string, boolean>>(STORAGE_KEYS.VIEWED_USERS);
    return data || {};
  } catch (err) {
    console.error('Failed to retrieve viewed users', err);
    return {};
  }
}

export async function saveUserViewed(username: string, isViewed: boolean = true): Promise<void> {
  try {
    const key = username.toLowerCase().trim();
    const viewed = await getViewedUsers();

    if (isViewed) {
      viewed[key] = true;
    } else {
      delete viewed[key];
    }

    // Persist to chrome.storage.local
    if (isChromeExtension()) {
      try {
        await chrome.storage.local.set({ [STORAGE_KEYS.VIEWED_USERS]: viewed });
      } catch (e) {
        console.warn('Could not save viewedUsers to chrome.storage.local', e);
      }
    }

    // Persist to IndexedDB
    await set(STORAGE_KEYS.VIEWED_USERS, viewed);
  } catch (err) {
    console.error('Failed to save viewed status for user', username, err);
  }
}

export async function batchSaveUsersViewed(newStatuses: Record<string, boolean>): Promise<void> {
  try {
    const viewed = await getViewedUsers();
    for (const [user, isViewed] of Object.entries(newStatuses)) {
      const key = user.toLowerCase().trim();
      if (isViewed) {
        viewed[key] = true;
      } else {
        delete viewed[key];
      }
    }

    if (isChromeExtension()) {
      try {
        await chrome.storage.local.set({ [STORAGE_KEYS.VIEWED_USERS]: viewed });
      } catch (e) {
        console.warn('Could not batch save viewedUsers to chrome.storage.local', e);
      }
    }

    await set(STORAGE_KEYS.VIEWED_USERS, viewed);
  } catch (err) {
    console.error('Failed to batch save viewed statuses', err);
  }
}

export async function clearViewedHistory(): Promise<void> {
  try {
    if (isChromeExtension()) {
      try {
        await chrome.storage.local.remove(STORAGE_KEYS.VIEWED_USERS);
      } catch (e) {
        console.warn('Could not remove viewedUsers from chrome.storage.local', e);
      }
    }
    await del(STORAGE_KEYS.VIEWED_USERS);
  } catch (err) {
    console.error('Failed to clear viewed history', err);
  }
}

/* ==========================================================================
   HISTORY & RESET
   ========================================================================== */

export async function appendHistorySummary(summary: HistoricalAnalysisSummary): Promise<void> {
  try {
    const history = (await get<HistoricalAnalysisSummary[]>(STORAGE_KEYS.ANALYSIS_HISTORY)) || [];
    const updated = [summary, ...history.filter(h => h.analyzedAt !== summary.analyzedAt)].slice(0, 10);
    await set(STORAGE_KEYS.ANALYSIS_HISTORY, updated);
  } catch (err) {
    console.error('Failed to append to history', err);
  }
}

export async function getHistory(): Promise<HistoricalAnalysisSummary[]> {
  try {
    const history = await get<HistoricalAnalysisSummary[]>(STORAGE_KEYS.ANALYSIS_HISTORY);
    return history || [];
  } catch (err) {
    console.error('Failed to retrieve history', err);
    return [];
  }
}

export async function clearActiveSessionAnalysis(): Promise<void> {
  try {
    await del(STORAGE_KEYS.CURRENT_ANALYSIS);
    await del(STORAGE_KEYS.REVIEW_STATUSES);
    await del(STORAGE_KEYS.VIEWED_USERS);

    if (isChromeExtension()) {
      await chrome.storage.local.remove([
        STORAGE_KEYS.CURRENT_ANALYSIS,
        STORAGE_KEYS.REVIEW_STATUSES,
        STORAGE_KEYS.VIEWED_USERS,
      ]);
    }
  } catch (err) {
    console.error('Failed to clear active session analysis', err);
  }
}

export async function clearAllData(): Promise<void> {
  try {
    await del(STORAGE_KEYS.CURRENT_ANALYSIS);
    await del(STORAGE_KEYS.REVIEW_STATUSES);
    await del(STORAGE_KEYS.VIEWED_USERS);
    await del(STORAGE_KEYS.ANALYSIS_HISTORY);

    if (isChromeExtension()) {
      await chrome.storage.local.clear();
    }
  } catch (err) {
    console.error('Failed to clear storage data', err);
  }
}
