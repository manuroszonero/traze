import fs from 'fs';
import path from 'path';
import { ZipBuilder } from '../src/lib/zipReader.ts';

async function createSampleZips() {
  const sampleDir = path.resolve('sample_exports');
  if (!fs.existsSync(sampleDir)) {
    fs.mkdirSync(sampleDir, { recursive: true });
  }

  // 1. Create Modern JSON Export Sample ZIP
  const jsonZip = ZipBuilder.create();

  const followersData = [
    { string_list_data: [{ href: 'https://www.instagram.com/alex_rivers', value: 'alex_rivers', timestamp: 1700000000 }] },
    { string_list_data: [{ href: 'https://www.instagram.com/cyber_samurai', value: 'cyber_samurai', timestamp: 1700000100 }] },
    { string_list_data: [{ href: 'https://www.instagram.com/tech_nomad', value: 'tech_nomad', timestamp: 1700000200 }] },
    { string_list_data: [{ href: 'https://www.instagram.com/sarah_designs', value: 'sarah_designs', timestamp: 1700000300 }] },
    { string_list_data: [{ href: 'https://www.instagram.com/fan_account_99', value: 'fan_account_99', timestamp: 1700000400 }] },
    { string_list_data: [{ href: 'https://www.instagram.com/retro_gamer_88', value: 'retro_gamer_88', timestamp: 1700000500 }] },
  ];

  const followingData = {
    relationships_following: [
      { string_list_data: [{ href: 'https://www.instagram.com/alex_rivers', value: 'alex_rivers', timestamp: 1700000000 }] },
      { string_list_data: [{ href: 'https://www.instagram.com/cyber_samurai', value: 'cyber_samurai', timestamp: 1700000100 }] },
      { string_list_data: [{ href: 'https://www.instagram.com/tech_nomad', value: 'tech_nomad', timestamp: 1700000200 }] },
      { string_list_data: [{ href: 'https://www.instagram.com/celebrity_news', value: 'celebrity_news', timestamp: 1699000000 }] },
      { string_list_data: [{ href: 'https://www.instagram.com/tech_insider', value: 'tech_insider', timestamp: 1699000100 }] },
      { string_list_data: [{ href: 'https://www.instagram.com/future_of_ai', value: 'future_of_ai', timestamp: 1699000200 }] },
      { string_list_data: [{ href: 'https://www.instagram.com/ghost_influencer', value: 'ghost_influencer', timestamp: 1699000300 }] },
    ],
  };

  jsonZip.file(
    'connections/followers_and_following/followers_1.json',
    JSON.stringify(followersData, null, 2)
  );
  jsonZip.file(
    'connections/followers_and_following/following.json',
    JSON.stringify(followingData, null, 2)
  );

  const jsonZipBuf = await jsonZip.generateAsync({ type: 'nodebuffer' });
  fs.writeFileSync(path.join(sampleDir, 'instagram_json_export_sample.zip'), jsonZipBuf);
  console.log('Created sample_exports/instagram_json_export_sample.zip');

  // 2. Create HTML Export Sample ZIP
  const htmlZip = ZipBuilder.create();

  const followersHtml = `
  <!DOCTYPE html>
  <html>
  <head><title>Followers</title></head>
  <body>
    <div class="pam _3-95 _2pi0 _2lei">
      <a target="_blank" href="https://www.instagram.com/alex_rivers">alex_rivers</a>
      <div>Nov 14, 2023, 8:20 PM</div>
    </div>
    <div class="pam _3-95 _2pi0 _2lei">
      <a target="_blank" href="https://www.instagram.com/elena_photo">elena_photo</a>
      <div>Dec 01, 2023, 10:15 AM</div>
    </div>
    <div class="pam _3-95 _2pi0 _2lei">
      <a target="_blank" href="https://www.instagram.com/sunset_seeker_22">sunset_seeker_22</a>
      <div>Jan 05, 2024, 04:30 PM</div>
    </div>
  </body>
  </html>
  `;

  const followingHtml = `
  <!DOCTYPE html>
  <html>
  <head><title>Following</title></head>
  <body>
    <div class="pam _3-95 _2pi0 _2lei">
      <a target="_blank" href="https://www.instagram.com/alex_rivers">alex_rivers</a>
      <div>Nov 14, 2023, 8:20 PM</div>
    </div>
    <div class="pam _3-95 _2pi0 _2lei">
      <a target="_blank" href="https://www.instagram.com/elena_photo">elena_photo</a>
      <div>Dec 01, 2023, 10:15 AM</div>
    </div>
    <div class="pam _3-95 _2pi0 _2lei">
      <a target="_blank" href="https://www.instagram.com/hyper_car_daily">hyper_car_daily</a>
      <div>Dec 20, 2023, 11:00 PM</div>
    </div>
    <div class="pam _3-95 _2pi0 _2lei">
      <a target="_blank" href="https://www.instagram.com/viral_memes_2026">viral_memes_2026</a>
      <div>Feb 10, 2024, 01:10 AM</div>
    </div>
  </body>
  </html>
  `;

  htmlZip.file('followers_and_following/followers_1.html', followersHtml);
  htmlZip.file('followers_and_following/following.html', followingHtml);

  const htmlZipBuf = await htmlZip.generateAsync({ type: 'nodebuffer' });
  fs.writeFileSync(path.join(sampleDir, 'instagram_html_export_sample.zip'), htmlZipBuf);
  console.log('Created sample_exports/instagram_html_export_sample.zip');
}

createSampleZips().catch(console.error);
