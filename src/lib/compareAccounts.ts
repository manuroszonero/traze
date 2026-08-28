import type { InstagramAccount, AnalysisResult, ReviewStatus } from '../types/instagram.ts';

export function compareInstagramAccounts(
  followers: InstagramAccount[],
  following: InstagramAccount[],
  existingReviewStatuses?: Record<string, ReviewStatus>,
  zipFileName?: string,
  existingViewedStatuses?: Record<string, boolean>
): AnalysisResult {
  const followersMap = new Map<string, InstagramAccount>();
  const followingMap = new Map<string, InstagramAccount>();

  for (const acc of followers) {
    const key = acc.username.toLowerCase().trim();
    if (!followersMap.has(key)) {
      followersMap.set(key, {
        ...acc,
        reviewStatus: existingReviewStatuses?.[key] || acc.reviewStatus || 'unreviewed',
        isViewed: existingViewedStatuses?.[key] !== undefined ? existingViewedStatuses[key] : acc.isViewed,
      });
    }
  }

  for (const acc of following) {
    const key = acc.username.toLowerCase().trim();
    if (!followingMap.has(key)) {
      followingMap.set(key, {
        ...acc,
        reviewStatus: existingReviewStatuses?.[key] || acc.reviewStatus || 'unreviewed',
        isViewed: existingViewedStatuses?.[key] !== undefined ? existingViewedStatuses[key] : acc.isViewed,
      });
    }
  }

  const followersKeys = new Set(followersMap.keys());
  const followingKeys = new Set(followingMap.keys());

  const notFollowingBack: InstagramAccount[] = [];
  const mutuals: InstagramAccount[] = [];
  const youDontFollowBack: InstagramAccount[] = [];

  for (const [key, account] of followingMap.entries()) {
    if (followersKeys.has(key)) {
      const followerAcc = followersMap.get(key);
      const combined: InstagramAccount = {
        ...account,
        timestamp: account.timestamp || followerAcc?.timestamp,
        formattedDate: account.formattedDate || followerAcc?.formattedDate,
        reviewStatus: existingReviewStatuses?.[key] || account.reviewStatus || 'unreviewed',
        isViewed: existingViewedStatuses?.[key] !== undefined ? existingViewedStatuses[key] : (account.isViewed || followerAcc?.isViewed),
      };
      mutuals.push(combined);
    } else {
      notFollowingBack.push(account);
    }
  }

  for (const [key, account] of followersMap.entries()) {
    if (!followingKeys.has(key)) {
      youDontFollowBack.push(account);
    }
  }

  const sortAlpha = (a: InstagramAccount, b: InstagramAccount) =>
    a.username.localeCompare(b.username, undefined, { sensitivity: 'base' });

  notFollowingBack.sort(sortAlpha);
  mutuals.sort(sortAlpha);
  youDontFollowBack.sort(sortAlpha);

  const normalizedFollowers = Array.from(followersMap.values()).sort(sortAlpha);
  const normalizedFollowing = Array.from(followingMap.values()).sort(sortAlpha);

  return {
    followers: normalizedFollowers,
    following: normalizedFollowing,
    notFollowingBack,
    mutuals,
    youDontFollowBack,
    analyzedAt: new Date().toISOString(),
    zipFileName: zipFileName || 'instagram_export.zip',
    totalFollowersCount: normalizedFollowers.length,
    totalFollowingCount: normalizedFollowing.length,
  };
}
