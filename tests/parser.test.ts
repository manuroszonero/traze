import { describe, it, expect } from 'vitest';
import {
  cleanUsername,
  isValidUsername,
  parseAccountsFromJson,
  parseAccountsFromHtml,
  parseInstagramZip,
} from '../src/lib/instagramParser';
import { compareInstagramAccounts } from '../src/lib/compareAccounts';
import { ZipBuilder } from '../src/lib/zipReader';

describe('Instagram Username Cleaning & Validation', () => {
  it('should clean usernames from raw text', () => {
    expect(cleanUsername('@john_doe')).toBe('john_doe');
    expect(cleanUsername('  alice.smith  ')).toBe('alice.smith');
    expect(cleanUsername('https://www.instagram.com/tech_guru/')).toBe('tech_guru');
    expect(cleanUsername('https://www.instagram.com/_u/cyber_samurai')).toBe('cyber_samurai');
    expect(cleanUsername('http://instagram.com/nordic_dev')).toBe('nordic_dev');
  });

  it('should correctly validate legitimate usernames and filter system words', () => {
    expect(isValidUsername('john_doe')).toBe(true);
    expect(isValidUsername('sarah.123')).toBe(true);
    expect(isValidUsername('instagram')).toBe(false);
    expect(isValidUsername('threads')).toBe(false);
    expect(isValidUsername('help')).toBe(false);
    expect(isValidUsername('')).toBe(false);
    expect(isValidUsername('user with spaces')).toBe(false);
    expect(isValidUsername('user@invalid!#')).toBe(false);
  });
});

describe('JSON Parser', () => {
  it('should parse Meta modern string_list_data JSON structure', () => {
    const jsonStr = JSON.stringify([
      {
        title: '',
        media_list_data: [],
        string_list_data: [
          {
            href: 'https://www.instagram.com/_u/cyber_samurai',
            value: 'cyber_samurai',
            timestamp: 1690000000,
          },
        ],
      },
      {
        title: '',
        media_list_data: [],
        string_list_data: [
          {
            href: 'https://www.instagram.com/tech_nomad',
            value: 'tech_nomad',
            timestamp: 1690000500,
          },
        ],
      },
    ]);

    const accounts = parseAccountsFromJson(jsonStr);
    expect(accounts).toHaveLength(2);
    expect(accounts[0].username).toBe('cyber_samurai');
    expect(accounts[0].profileUrl).toBe('https://www.instagram.com/cyber_samurai/');
    expect(accounts[0].timestamp).toBe(1690000000);
    expect(accounts[1].username).toBe('tech_nomad');
  });

  it('should parse Meta relationships_following JSON structure', () => {
    const jsonStr = JSON.stringify({
      relationships_following: [
        {
          title: 'elon_musk',
          media_list_data: [],
          string_list_data: [
            {
              href: 'https://www.instagram.com/elon_musk',
              value: 'elon_musk',
              timestamp: 1680000000,
            },
          ],
        },
      ],
    });

    const accounts = parseAccountsFromJson(jsonStr);
    expect(accounts).toHaveLength(1);
    expect(accounts[0].username).toBe('elon_musk');
  });

  it('should parse legacy dictionary key-value JSON structure', () => {
    const jsonStr = JSON.stringify({
      followers: {
        dev_lead: 1590000000,
        ui_designer: 1590001000,
      },
    });

    const accounts = parseAccountsFromJson(jsonStr);
    expect(accounts).toHaveLength(2);
    const users = accounts.map((a) => a.username);
    expect(users).toContain('dev_lead');
    expect(users).toContain('ui_designer');
  });
});

describe('HTML Parser', () => {
  it('should parse Instagram HTML export files', () => {
    const html = `
      <!DOCTYPE html>
      <html>
        <body>
          <div class="pam _3-95 _2pi0 _2lei">
            <a target="_blank" href="https://www.instagram.com/alex_rivers">alex_rivers</a>
            <div>Dec 15, 2023, 10:45 AM</div>
          </div>
          <div class="pam _3-95 _2pi0 _2lei">
            <a target="_blank" href="https://www.instagram.com/_u/sophia_ai">sophia_ai</a>
            <div>Jan 20, 2024, 02:15 PM</div>
          </div>
        </body>
      </html>
    `;

    const accounts = parseAccountsFromHtml(html);
    expect(accounts).toHaveLength(2);
    expect(accounts[0].username).toBe('alex_rivers');
    expect(accounts[1].username).toBe('sophia_ai');
  });
});

describe('Full ZIP Extraction & Comparison Flow', () => {
  it('should extract ZIP, parse files, and perform accurate account comparison', async () => {
    const builder = ZipBuilder.create();

    const followersJson = JSON.stringify([
      {
        string_list_data: [{ value: 'user_mutual', timestamp: 1700000000 }],
      },
      {
        string_list_data: [{ value: 'user_fan_only', timestamp: 1700001000 }],
      },
    ]);

    const followingJson = JSON.stringify({
      relationships_following: [
        {
          string_list_data: [{ value: 'user_mutual', timestamp: 1700000000 }],
        },
        {
          string_list_data: [{ value: 'user_not_following_back', timestamp: 1700002000 }],
        },
      ],
    });

    builder.file('connections/followers_and_following/followers_1.json', followersJson);
    builder.file('connections/followers_and_following/following.json', followingJson);

    const zipBuffer = await builder.generateAsync({ type: 'nodebuffer' });
    const parsedData = await parseInstagramZip(zipBuffer);

    expect(parsedData.followers).toHaveLength(2);
    expect(parsedData.following).toHaveLength(2);

    const analysis = compareInstagramAccounts(parsedData.followers, parsedData.following);

    // Assert Not Following Back: accounts we follow that don't follow back
    expect(analysis.notFollowingBack).toHaveLength(1);
    expect(analysis.notFollowingBack[0].username).toBe('user_not_following_back');

    // Assert Mutuals
    expect(analysis.mutuals).toHaveLength(1);
    expect(analysis.mutuals[0].username).toBe('user_mutual');

    // Assert Fans (You don't follow back)
    expect(analysis.youDontFollowBack).toHaveLength(1);
    expect(analysis.youDontFollowBack[0].username).toBe('user_fan_only');
  });
});
