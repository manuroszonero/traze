export type ReviewStatus = 'unreviewed' | 'checked' | 'ignored';
export type AccountCategory = 'not_following_back' | 'mutual' | 'you_dont_follow_back' | 'all' | 'followers' | 'following';
export type ViewedFilter = 'all' | 'not_viewed' | 'viewed';

export interface InstagramAccount {
  username: string;
  profileUrl: string;
  timestamp?: number;
  formattedDate?: string;
  reviewStatus?: ReviewStatus;
  isViewed?: boolean;
}

export interface AnalysisResult {
  followers: InstagramAccount[];
  following: InstagramAccount[];
  notFollowingBack: InstagramAccount[];
  mutuals: InstagramAccount[];
  youDontFollowBack: InstagramAccount[];
  analyzedAt: string;
  zipFileName: string;
  totalFollowersCount: number;
  totalFollowingCount: number;
}

export interface ParseProgress {
  stage: 'extracting' | 'scanning' | 'parsing_followers' | 'parsing_following' | 'comparing' | 'complete' | 'error';
  message: string;
  percent: number;
  followersFound?: number;
  followingFound?: number;
  errorDetails?: string;
}

export interface FilterOptions {
  searchQuery: string;
  activeCategory: AccountCategory;
  reviewFilter: 'all' | ReviewStatus;
  viewedFilter: ViewedFilter;
  sortBy: 'alpha_asc' | 'alpha_desc' | 'date_newest' | 'date_oldest' | 'status' | 'viewed';
}

export interface HistoricalAnalysisSummary {
  id: string;
  analyzedAt: string;
  zipFileName: string;
  followersCount: number;
  followingCount: number;
  notFollowingBackCount: number;
  mutualsCount: number;
  youDontFollowBackCount: number;
}
