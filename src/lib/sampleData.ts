import type { AnalysisResult, InstagramAccount } from '../types/instagram.ts';
import { compareInstagramAccounts } from './compareAccounts.ts';

export function generateSampleDataset(): AnalysisResult {
  const commonFollowers = [
    'alex_rivers', 'cyber_samurai', 'tech_nomad', 'sarah_designs', 'quantum_dev',
    'elena_photo', 'pixel_craft', 'nordic_vibes', 'david_codez', 'neon_dreamer',
    'luna_astronomy', 'marcus_fitness', 'ai_architect', 'maya_illustrates', 'code_ninja',
    'hannah_bakes', 'zen_gardener', 'leo_travels', 'stellar_labs', 'olivia_writes',
    'ethan_sound', 'crypto_pulse', 'sophia_ai', 'kai_drone', 'chloe_ceramics',
    'lucas_minimal', 'emma_nature', 'ryan_skate', 'bella_coffee', 'noah_runner'
  ];

  const onlyFollowers = [
    'fan_account_99', 'shadow_listener', 'retro_gamer_88', 'indie_reader', 'coffee_enthusiast',
    'daily_quotes_hq', 'sunset_seeker_22', 'minimal_decor_fan', 'synth_wave_radio', 'curator_club',
    'random_wanderer', 'urban_explorer_x', 'midnight_reader', 'lofi_chill_beats', 'art_collector_01'
  ];

  const onlyFollowing = [
    'celebrity_news', 'tech_insider', 'elonmusk_parody', 'nasa_official_updates', 'design_inspiration',
    'luxury_escapes', 'macro_economics', 'hyper_car_daily', 'future_of_ai', 'unfollowed_brand',
    'ghost_influencer', 'viral_memes_2026', 'venture_capital_hub', 'startup_founders_club', 'crypto_whales',
    'world_arch_daily', 'sneaker_drops_live', 'filmmaking_pro', 'gourmet_chef_secret', 'gadget_review_hub'
  ];

  const followersList: InstagramAccount[] = [
    ...commonFollowers.map((username, i) => ({
      username,
      profileUrl: `https://www.instagram.com/${username}/`,
      timestamp: Math.floor(Date.now() / 1000) - (i * 86400 * 3),
      formattedDate: new Date(Date.now() - (i * 86400 * 3000)).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      reviewStatus: 'unreviewed' as const,
    })),
    ...onlyFollowers.map((username, i) => ({
      username,
      profileUrl: `https://www.instagram.com/${username}/`,
      timestamp: Math.floor(Date.now() / 1000) - (i * 86400 * 2),
      formattedDate: new Date(Date.now() - (i * 86400 * 2000)).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      reviewStatus: 'unreviewed' as const,
    }))
  ];

  const followingList: InstagramAccount[] = [
    ...commonFollowers.map((username, i) => ({
      username,
      profileUrl: `https://www.instagram.com/${username}/`,
      timestamp: Math.floor(Date.now() / 1000) - (i * 86400 * 3),
      formattedDate: new Date(Date.now() - (i * 86400 * 3000)).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      reviewStatus: 'unreviewed' as const,
    })),
    ...onlyFollowing.map((username, i) => ({
      username,
      profileUrl: `https://www.instagram.com/${username}/`,
      timestamp: Math.floor(Date.now() / 1000) - (i * 86400 * 5),
      formattedDate: new Date(Date.now() - (i * 86400 * 5000)).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      reviewStatus: 'unreviewed' as const,
    }))
  ];

  return compareInstagramAccounts(followersList, followingList, undefined, 'demo_sample_export.zip');
}
