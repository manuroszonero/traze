import fs from 'fs';
import path from 'path';
import {
  cleanUsername,
  isValidUsername,
  parseAccountsFromJson,
  parseAccountsFromHtml,
  parseInstagramZip,
} from '../src/lib/instagramParser.ts';
import { compareInstagramAccounts } from '../src/lib/compareAccounts.ts';
import { ZipBuilder } from '../src/lib/zipReader.ts';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

async function runAllTests() {
  console.log('\n--- 1. Testing Username Cleaning & Validation ---');
  assert(cleanUsername('@john_doe') === 'john_doe', 'Strips leading @ from @john_doe');
  assert(cleanUsername('  alice.smith  ') === 'alice.smith', 'Trims whitespace from alice.smith');
  assert(
    cleanUsername('https://www.instagram.com/tech_guru/') === 'tech_guru',
    'Extracts username from URL https://www.instagram.com/tech_guru/'
  );
  assert(
    cleanUsername('https://www.instagram.com/_u/cyber_samurai') === 'cyber_samurai',
    'Extracts username from _u format URL'
  );
  assert(isValidUsername('john_doe') === true, 'john_doe is a valid username');
  assert(isValidUsername('sarah.123') === true, 'sarah.123 is a valid username');
  assert(isValidUsername('instagram') === false, 'Blocked system word instagram');
  assert(isValidUsername('threads') === false, 'Blocked system word threads');
  assert(isValidUsername('') === false, 'Empty string is invalid');

  console.log('\n--- 2. Testing Modern Meta JSON Parsing ---');
  const jsonMeta = JSON.stringify([
    {
      string_list_data: [
        { href: 'https://www.instagram.com/_u/cyber_samurai', value: 'cyber_samurai', timestamp: 1690000000 },
      ],
    },
    {
      string_list_data: [
        { href: 'https://www.instagram.com/tech_nomad', value: 'tech_nomad', timestamp: 1690000500 },
      ],
    },
  ]);
  const metaAccounts = parseAccountsFromJson(jsonMeta);
  assert(metaAccounts.length === 2, 'Parsed 2 accounts from modern Meta array JSON');
  assert(metaAccounts[0].username === 'cyber_samurai', 'Correct username cyber_samurai');
  assert(metaAccounts[0].profileUrl === 'https://www.instagram.com/cyber_samurai/', 'Correct profile URL');
  assert(metaAccounts[0].timestamp === 1690000000, 'Correct timestamp');

  console.log('\n--- 3. Testing Following JSON Parsing ---');
  const jsonFollowing = JSON.stringify({
    relationships_following: [
      {
        string_list_data: [
          { href: 'https://www.instagram.com/elon_musk', value: 'elon_musk', timestamp: 1680000000 },
        ],
      },
    ],
  });
  const followingAccounts = parseAccountsFromJson(jsonFollowing);
  assert(followingAccounts.length === 1, 'Parsed 1 following account');
  assert(followingAccounts[0].username === 'elon_musk', 'Extracted elon_musk');

  console.log('\n--- 4. Testing Legacy Dictionary JSON Parsing ---');
  const jsonLegacy = JSON.stringify({
    followers: {
      dev_lead: 1590000000,
      ui_designer: 1590001000,
    },
  });
  const legacyAccounts = parseAccountsFromJson(jsonLegacy);
  assert(legacyAccounts.length === 2, 'Parsed 2 legacy dictionary accounts');

  console.log('\n--- 5. Testing HTML Export Parsing ---');
  const htmlContent = `
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
  const htmlAccounts = parseAccountsFromHtml(htmlContent);
  assert(htmlAccounts.length === 2, 'Parsed 2 HTML accounts');
  assert(htmlAccounts[0].username === 'alex_rivers', 'Extracted alex_rivers');
  assert(htmlAccounts[1].username === 'sophia_ai', 'Extracted sophia_ai');

  console.log('\n--- 6. Testing Account Comparison Engine ---');
  const followersList = [
    { username: 'mutual_friend_1', profileUrl: 'https://www.instagram.com/mutual_friend_1/' },
    { username: 'fan_who_follows_me', profileUrl: 'https://www.instagram.com/fan_who_follows_me/' },
  ];
  const followingList = [
    { username: 'mutual_friend_1', profileUrl: 'https://www.instagram.com/mutual_friend_1/' },
    { username: 'unfollower_brand', profileUrl: 'https://www.instagram.com/unfollower_brand/' },
  ];

  const analysis = compareInstagramAccounts(followersList, followingList);

  assert(analysis.notFollowingBack.length === 1, 'Computed 1 account Not Following Back');
  assert(analysis.notFollowingBack[0].username === 'unfollower_brand', 'Correctly identified unfollower_brand');
  assert(analysis.mutuals.length === 1, 'Computed 1 Mutual account');
  assert(analysis.mutuals[0].username === 'mutual_friend_1', 'Correctly identified mutual_friend_1');
  assert(analysis.youDontFollowBack.length === 1, 'Computed 1 Fan (You Don\'t Follow Back)');
  assert(analysis.youDontFollowBack[0].username === 'fan_who_follows_me', 'Correctly identified fan_who_follows_me');

  console.log('\n--- 7. Testing End-to-End Generated ZIP Files ---');
  const sampleJsonZipPath = path.resolve('sample_exports', 'instagram_json_export_sample.zip');
  const jsonZipBuf = fs.readFileSync(sampleJsonZipPath);
  const parsedJsonZip = await parseInstagramZip(jsonZipBuf);
  assert(parsedJsonZip.followers.length === 6, `Extracted 6 followers from real sample ZIP (got ${parsedJsonZip.followers.length})`);
  assert(parsedJsonZip.following.length === 7, `Extracted 7 following from real sample ZIP (got ${parsedJsonZip.following.length})`);

  const jsonAnalysis = compareInstagramAccounts(parsedJsonZip.followers, parsedJsonZip.following);
  assert(jsonAnalysis.mutuals.length === 3, 'Found 3 mutual accounts in JSON sample');
  assert(jsonAnalysis.notFollowingBack.length === 4, 'Found 4 not following back in JSON sample');
  assert(jsonAnalysis.youDontFollowBack.length === 3, 'Found 3 fans in JSON sample');

  const sampleHtmlZipPath = path.resolve('sample_exports', 'instagram_html_export_sample.zip');
  const htmlZipBuf = fs.readFileSync(sampleHtmlZipPath);
  const parsedHtmlZip = await parseInstagramZip(htmlZipBuf);
  assert(parsedHtmlZip.followers.length === 3, `Extracted 3 followers from HTML sample ZIP (got ${parsedHtmlZip.followers.length})`);
  assert(parsedHtmlZip.following.length === 4, `Extracted 4 following from HTML sample ZIP (got ${parsedHtmlZip.following.length})`);

  const htmlAnalysis = compareInstagramAccounts(parsedHtmlZip.followers, parsedHtmlZip.following);
  assert(htmlAnalysis.mutuals.length === 2, 'Found 2 mutuals in HTML sample');
  assert(htmlAnalysis.notFollowingBack.length === 2, 'Found 2 not following back in HTML sample');
  assert(htmlAnalysis.youDontFollowBack.length === 1, 'Found 1 fan in HTML sample');

  console.log('\n--- 8. Testing Viewed Tracking State Engine ---');
  const viewedMap = {
    unfollower_brand: true,
  };
  const analysisWithViewed = compareInstagramAccounts(
    followersList,
    followingList,
    undefined,
    undefined,
    viewedMap
  );
  assert(
    analysisWithViewed.notFollowingBack[0].isViewed === true,
    'Preserved isViewed = true on unfollower_brand'
  );
  assert(
    !analysisWithViewed.mutuals[0].isViewed,
    'Unviewed mutual account isViewed is false/undefined'
  );

  console.log(`\n========================================`);
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runAllTests().catch((err) => {
  console.error('Test execution crashed:', err);
  process.exit(1);
});

