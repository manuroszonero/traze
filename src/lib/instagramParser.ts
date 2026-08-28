import { NativeZip, type ZipEntry } from './zipReader.ts';
import type { InstagramAccount, ParseProgress } from '../types/instagram.ts';

export interface ParsedInstagramData {
  followers: InstagramAccount[];
  following: InstagramAccount[];
  detectedFiles: {
    followerFiles: string[];
    followingFiles: string[];
  };
}

export function cleanUsername(raw: string): string {
  if (!raw) return '';
  let cleaned = raw.trim();

  if (cleaned.includes('instagram.com/')) {
    try {
      const url = new URL(cleaned.startsWith('http') ? cleaned : `https://${cleaned}`);
      const parts = url.pathname.split('/').filter(Boolean);
      if (parts.length > 0) {
        if (parts[0] === '_u' && parts.length > 1) {
          cleaned = parts[1];
        } else {
          cleaned = parts[0];
        }
      }
    } catch {
      const match = cleaned.match(/instagram\.com\/(?:_u\/)?([^/?#]+)/i);
      if (match && match[1]) {
        cleaned = match[1];
      }
    }
  }

  cleaned = cleaned.replace(/^@+/, '').trim();
  cleaned = cleaned.replace(/\/+$/, '').trim();

  return cleaned;
}

export function formatTimestamp(timestamp?: number): string | undefined {
  if (!timestamp || isNaN(timestamp)) return undefined;
  const ms = timestamp < 10000000000 ? timestamp * 1000 : timestamp;
  const date = new Date(ms);
  if (isNaN(date.getTime())) return undefined;

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function parseAccountsFromJson(jsonContent: string): InstagramAccount[] {
  const accountsMap = new Map<string, InstagramAccount>();

  try {
    const data = JSON.parse(jsonContent);

    function extractFromObj(obj: unknown) {
      if (!obj || typeof obj !== 'object') return;

      if (Array.isArray(obj)) {
        for (const item of obj) {
          if (item && typeof item === 'object' && 'string_list_data' in item && Array.isArray((item as Record<string, unknown>).string_list_data)) {
            const listData = (item as Record<string, unknown>).string_list_data as Array<Record<string, unknown>>;
            for (const entry of listData) {
              const rawUser = String(entry.value || entry.href || '');
              const user = cleanUsername(rawUser);
              const ts = typeof entry.timestamp === 'number' ? entry.timestamp : undefined;
              if (user && isValidUsername(user)) {
                const key = user.toLowerCase();
                if (!accountsMap.has(key)) {
                  accountsMap.set(key, {
                    username: user,
                    profileUrl: `https://www.instagram.com/${user}/`,
                    timestamp: ts,
                    formattedDate: formatTimestamp(ts),
                    reviewStatus: 'unreviewed',
                  });
                }
              }
            }
          } else if (typeof item === 'string') {
            const user = cleanUsername(item);
            if (user && isValidUsername(user)) {
              const key = user.toLowerCase();
              if (!accountsMap.has(key)) {
                accountsMap.set(key, {
                  username: user,
                  profileUrl: `https://www.instagram.com/${user}/`,
                  reviewStatus: 'unreviewed',
                });
              }
            }
          } else if (item && typeof item === 'object') {
            const record = item as Record<string, unknown>;
            if (record.title && typeof record.title === 'string' && record.title.length > 0 && !record.title.includes(' ')) {
              const user = cleanUsername(record.title);
              if (user && isValidUsername(user)) {
                const key = user.toLowerCase();
                if (!accountsMap.has(key)) {
                  accountsMap.set(key, {
                    username: user,
                    profileUrl: `https://www.instagram.com/${user}/`,
                    reviewStatus: 'unreviewed',
                  });
                }
              }
            }
            extractFromObj(item);
          }
        }
      } else {
        const record = obj as Record<string, unknown>;

        if (record.relationships_following && Array.isArray(record.relationships_following)) {
          extractFromObj(record.relationships_following);
          return;
        }
        if (record.relationships_followers && Array.isArray(record.relationships_followers)) {
          extractFromObj(record.relationships_followers);
          return;
        }
        if (record.followers && typeof record.followers === 'object') {
          extractFromObj(record.followers);
          return;
        }
        if (record.following && typeof record.following === 'object') {
          extractFromObj(record.following);
          return;
        }

        for (const [key, value] of Object.entries(record)) {
          const user = cleanUsername(key);
          if (isValidUsername(user) && (typeof value === 'number' || typeof value === 'string' || typeof value === 'object')) {
            const ts = typeof value === 'number' ? value : undefined;
            const norm = user.toLowerCase();
            if (!accountsMap.has(norm)) {
              accountsMap.set(norm, {
                username: user,
                profileUrl: `https://www.instagram.com/${user}/`,
                timestamp: ts,
                formattedDate: formatTimestamp(ts),
                reviewStatus: 'unreviewed',
              });
            }
          }
          if (typeof value === 'object' && value !== null) {
            extractFromObj(value);
          }
        }
      }
    }

    extractFromObj(data);
  } catch (err) {
    console.error('Failed to parse JSON file content', err);
  }

  return Array.from(accountsMap.values());
}

export function parseAccountsFromHtml(htmlContent: string): InstagramAccount[] {
  const accountsMap = new Map<string, InstagramAccount>();

  try {
    const linkRegex = /<a\s+[^>]*href=["'](?:https?:\/\/(?:www\.)?instagram\.com\/(?:_u\/)?)([^"'/?#]+)["'][^>]*>(.*?)<\/a>/gi;
    let match: RegExpExecArray | null;

    while ((match = linkRegex.exec(htmlContent)) !== null) {
      const urlUser = cleanUsername(match[1]);
      const textUser = cleanUsername(match[2].replace(/<[^>]*>/g, ''));
      const user = urlUser || textUser;

      if (user && isValidUsername(user)) {
        const key = user.toLowerCase();
        if (!accountsMap.has(key)) {
          accountsMap.set(key, {
            username: user,
            profileUrl: `https://www.instagram.com/${user}/`,
            reviewStatus: 'unreviewed',
          });
        }
      }
    }

    if (accountsMap.size === 0) {
      const genericAnchorRegex = /<a\s+[^>]*>(.*?)<\/a>/gi;
      while ((match = genericAnchorRegex.exec(htmlContent)) !== null) {
        const rawText = match[1].replace(/<[^>]*>/g, '').trim();
        const user = cleanUsername(rawText);
        if (user && isValidUsername(user)) {
          const key = user.toLowerCase();
          if (!accountsMap.has(key)) {
            accountsMap.set(key, {
              username: user,
              profileUrl: `https://www.instagram.com/${user}/`,
              reviewStatus: 'unreviewed',
            });
          }
        }
      }
    }
  } catch (err) {
    console.error('Failed to parse HTML file content', err);
  }

  return Array.from(accountsMap.values());
}

export function isValidUsername(user: string): boolean {
  if (!user || typeof user !== 'string') return false;
  const trimmed = user.trim();
  if (trimmed.length === 0 || trimmed.length > 35) return false;

  if (!/^[a-zA-Z0-9._]+$/.test(trimmed)) return false;

  const blockedKeywords = new Set([
    'instagram',
    'facebook',
    'threads',
    'meta',
    'help',
    'about',
    'privacy',
    'terms',
    'explore',
    'direct',
    'accounts',
    'login',
    'signup',
    'settings',
    'home',
    'reel',
    'reels',
    'stories',
    'p',
    'null',
    'undefined',
    'true',
    'false',
    'media',
    'string_list_data',
    'relationships_following',
    'relationships_followers',
  ]);

  if (blockedKeywords.has(trimmed.toLowerCase())) return false;

  return true;
}

export function isFollowersFile(path: string): boolean {
  const lower = path.toLowerCase();
  if (lower.includes('recently_unfollowed') || lower.includes('pending') || lower.includes('close_friends') || lower.includes('blocked')) {
    return false;
  }
  return /(^|\/)followers(_\d+)?\.(json|html)$/i.test(lower) ||
         /(^|\/)followers_and_following\/followers(_\d+)?\.(json|html)$/i.test(lower);
}

export function isFollowingFile(path: string): boolean {
  const lower = path.toLowerCase();
  if (lower.includes('recently_unfollowed') || lower.includes('pending') || lower.includes('close_friends') || lower.includes('blocked') || lower.includes('hashtags')) {
    return false;
  }
  return /(^|\/)following(_\d+)?\.(json|html)$/i.test(lower) ||
         /(^|\/)followers_and_following\/following(_\d+)?\.(json|html)$/i.test(lower);
}

export async function parseInstagramZip(
  file: File | Blob | ArrayBuffer | Uint8Array,
  onProgress?: (progress: ParseProgress) => void
): Promise<ParsedInstagramData> {
  const notify = (stage: ParseProgress['stage'], message: string, percent: number, extra?: Partial<ParseProgress>) => {
    if (onProgress) {
      onProgress({
        stage,
        message,
        percent,
        ...extra,
      });
    }
  };

  notify('extracting', 'Opening and decompressing ZIP archive...', 15);

  let zip: NativeZip;
  try {
    zip = await NativeZip.loadAsync(file);
  } catch (err) {
    const errorMsg = 'Could not read the ZIP file. Please ensure it is a valid, uncorrupted Instagram export ZIP archive.';
    notify('error', errorMsg, 0, { errorDetails: String(err) });
    throw new Error(errorMsg);
  }

  notify('scanning', 'Scanning directory structure for follower & following records...', 35);

  const followerFiles: string[] = [];
  const followingFiles: string[] = [];

  zip.forEach((relativePath: string, zipEntry: ZipEntry) => {
    if (zipEntry.dir) return;

    if (isFollowersFile(relativePath)) {
      followerFiles.push(relativePath);
    } else if (isFollowingFile(relativePath)) {
      followingFiles.push(relativePath);
    }
  });

  if (followerFiles.length === 0 || followingFiles.length === 0) {
    zip.forEach((relativePath: string, zipEntry: ZipEntry) => {
      if (zipEntry.dir) return;
      const lower = relativePath.toLowerCase();
      if (!lower.endsWith('.json') && !lower.endsWith('.html')) return;

      if (followerFiles.length === 0 && lower.includes('follower') && !lower.includes('following') && !lower.includes('unfollow')) {
        followerFiles.push(relativePath);
      }
      if (followingFiles.length === 0 && lower.includes('following') && !lower.includes('unfollow') && !lower.includes('hashtag')) {
        followingFiles.push(relativePath);
      }
    });
  }

  if (followerFiles.length === 0 && followingFiles.length === 0) {
    const errorMsg = 'Could not find followers or following data files in this ZIP archive. Make sure you downloaded the complete "Followers and following" information from Instagram in JSON or HTML format.';
    notify('error', errorMsg, 0);
    throw new Error(errorMsg);
  }

  if (followerFiles.length === 0) {
    const errorMsg = 'Could not find any followers files (e.g., followers_1.json or followers_1.html). Please verify your export files.';
    notify('error', errorMsg, 0);
    throw new Error(errorMsg);
  }

  if (followingFiles.length === 0) {
    const errorMsg = 'Could not find any following files (e.g., following.json or following.html). Please verify your export files.';
    notify('error', errorMsg, 0);
    throw new Error(errorMsg);
  }

  notify('parsing_followers', `Found ${followerFiles.length} followers file(s). Extracting usernames...`, 55);
  const followersMap = new Map<string, InstagramAccount>();

  for (const filePath of followerFiles) {
    const zipEntry = zip.file(filePath);
    if (!zipEntry) continue;
    const content: string = await zipEntry.async('text');

    let accounts: InstagramAccount[] = [];
    if (filePath.toLowerCase().endsWith('.json')) {
      accounts = parseAccountsFromJson(content);
    } else {
      accounts = parseAccountsFromHtml(content);
    }

    for (const acc of accounts) {
      const key = acc.username.toLowerCase();
      if (!followersMap.has(key)) {
        followersMap.set(key, acc);
      }
    }
  }

  const followers = Array.from(followersMap.values());

  notify('parsing_following', `Found ${followingFiles.length} following file(s). Extracting accounts...`, 75, {
    followersFound: followers.length,
  });

  const followingMap = new Map<string, InstagramAccount>();

  for (const filePath of followingFiles) {
    const zipEntry = zip.file(filePath);
    if (!zipEntry) continue;
    const content: string = await zipEntry.async('text');

    let accounts: InstagramAccount[] = [];
    if (filePath.toLowerCase().endsWith('.json')) {
      accounts = parseAccountsFromJson(content);
    } else {
      accounts = parseAccountsFromHtml(content);
    }

    for (const acc of accounts) {
      const key = acc.username.toLowerCase();
      if (!followingMap.has(key)) {
        followingMap.set(key, acc);
      }
    }
  }

  const following = Array.from(followingMap.values());

  notify('complete', 'Extraction and parsing complete!', 100, {
    followersFound: followers.length,
    followingFound: following.length,
  });

  return {
    followers,
    following,
    detectedFiles: {
      followerFiles,
      followingFiles,
    },
  };
}
