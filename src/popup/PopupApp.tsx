import React, { useEffect, useState } from 'react';
import { getQuickSummary } from '../lib/storage';
import { openDashboardTab, formatNumber } from '../lib/utils';
import { ArrowUpRight, PlusCircle, AlertCircle, Users, UserCheck, Sparkles } from '../lib/icons';

export const PopupApp: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<{
    totalFollowersCount: number;
    totalFollowingCount: number;
    notFollowingBackCount: number;
    analyzedAt: string;
  } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        let isTabOpen = false;
        if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
          try {
            const tabs = await chrome.tabs.query({});
            const dashboardUrl = chrome.runtime.getURL('src/dashboard/dashboard.html');
            isTabOpen = tabs.some((t) => t.url && t.url.startsWith(dashboardUrl));
          } catch {
            isTabOpen = false;
          }
        }

        if (!isTabOpen) {
          // If no dashboard tab is open, clear session storage and show clean upload screen
          if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            await chrome.storage.local.remove([
              'followtrace_current_analysis',
              'followtrace_viewed_users',
              'followtrace_review_statuses',
            ]);
          }
          setSummary(null);
        } else {
          const data = await getQuickSummary();
          setSummary(data);
        }
      } catch (err) {
        console.error('Error loading popup summary', err);
        setSummary(null);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleOpenDashboard = () => {
    openDashboardTab();
    if (typeof window !== 'undefined') {
      window.close();
    }
  };

  const handleNewAnalysis = () => {
    openDashboardTab({ upload: true });
    if (typeof window !== 'undefined') {
      window.close();
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#fbcfff',
        color: '#000000',
      }}
      className="w-full text-black p-5 select-none font-mono relative overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-1 relative z-10">
        <div className="flex items-center space-x-2.5">
          {/* T Logo Emblem */}
          <div
            style={{ backgroundColor: 'transparent', border: '1.5px solid #000000', color: '#000000' }}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-black font-black text-sm shadow-sm select-none"
          >
            T
          </div>
          <div>
            <h1 style={{ color: '#000000' }} className="font-black text-sm tracking-tight text-black">
              TRAZE
            </h1>
            <p style={{ color: '#000000' }} className="text-[10px] text-black font-mono font-bold">find the culprit</p>
          </div>
        </div>
      </div>

      {/* Body */}
      {loading ? (
        <div className="py-10 flex flex-col items-center justify-center space-y-3">
          <div className="w-6 h-6 border-2 border-black/30 border-t-black rounded-full animate-spin" />
          <p style={{ color: '#000000' }} className="text-xs text-black font-mono font-bold">Reading local state...</p>
        </div>
      ) : summary ? (
        /* State when an analysis already exists */
        <div className="py-4 space-y-4 relative z-10">
          {/* Highlight Card: Not Following Back */}
          <div
            style={{ backgroundColor: 'transparent', border: '1.5px solid #000000', color: '#000000' }}
            className="liquid-hover p-3.5 rounded-2xl flex items-center justify-between shadow-sm cursor-default"
          >
            <div className="space-y-0.5">
              <div style={{ color: '#000000' }} className="flex items-center space-x-1.5 text-black font-bold">
                <AlertCircle className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                <span style={{ color: '#000000' }} className="text-[11px] font-extrabold uppercase tracking-wider text-black">Not Following Back</span>
              </div>
              <p style={{ color: '#000000' }} className="text-[10px] text-black font-semibold">Accounts ignoring follow</p>
            </div>
            <div style={{ color: '#000000' }} className="text-2xl font-black font-mono text-black">
              {formatNumber(summary.notFollowingBackCount)}
            </div>
          </div>

          {/* Followers & Following Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <div
              style={{ backgroundColor: 'transparent', border: '1.5px solid #000000', color: '#000000' }}
              className="liquid-hover p-3 rounded-xl flex flex-col justify-between shadow-sm cursor-default"
            >
              <div style={{ color: '#000000' }} className="flex items-center space-x-1 text-black mb-1 font-bold">
                <Users className="w-3 h-3 text-black stroke-[2.5]" />
                <span style={{ color: '#000000' }} className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-black">Followers</span>
              </div>
              <span style={{ color: '#000000' }} className="text-base font-black font-mono text-black">
                {formatNumber(summary.totalFollowersCount)}
              </span>
            </div>

            <div
              style={{ backgroundColor: 'transparent', border: '1.5px solid #000000', color: '#000000' }}
              className="liquid-hover p-3 rounded-xl flex flex-col justify-between shadow-sm cursor-default"
            >
              <div style={{ color: '#000000' }} className="flex items-center space-x-1 text-black mb-1 font-bold">
                <UserCheck className="w-3 h-3 text-black stroke-[2.5]" />
                <span style={{ color: '#000000' }} className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-black">Following</span>
              </div>
              <span style={{ color: '#000000' }} className="text-base font-black font-mono text-black">
                {formatNumber(summary.totalFollowingCount)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            <button
              onClick={handleOpenDashboard}
              style={{ backgroundColor: 'transparent', border: '1.5px solid #000000', color: '#000000' }}
              className="liquid-hover w-full py-2.5 px-4 rounded-xl text-black font-extrabold text-xs flex items-center justify-center space-x-2 transition-all shadow-sm cursor-pointer"
            >
              <span style={{ color: '#000000' }} className="text-black font-extrabold">View Full Dashboard</span>
              <ArrowUpRight className="w-4 h-4 text-black stroke-[2.5]" />
            </button>

            <button
              onClick={handleNewAnalysis}
              style={{ backgroundColor: 'transparent', border: '1.5px solid #000000', color: '#000000' }}
              className="liquid-hover w-full py-2 px-4 rounded-xl text-black text-xs font-bold flex items-center justify-center space-x-1.5 shadow-sm cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5 text-black stroke-[2.5]" />
              <span style={{ color: '#000000' }} className="text-black font-bold">Upload New Export ZIP</span>
            </button>
          </div>
        </div>
      ) : (
        /* State when no analysis exists */
        <div className="py-6 flex flex-col items-center text-center space-y-4 relative z-10">
          <div
            style={{ backgroundColor: 'transparent', border: '1.5px solid #000000', color: '#000000' }}
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-black shadow-sm"
          >
            <Sparkles className="w-6 h-6 text-black stroke-[2.5]" />
          </div>

          <div className="space-y-1">
            <h2 style={{ color: '#000000' }} className="text-sm font-black text-black">find the culprit</h2>
            <p style={{ color: '#000000' }} className="text-xs text-black max-w-[240px] leading-relaxed font-medium">
              Upload your Instagram data export ZIP to instantly reveal unfollowers, mutuals, and fans.
            </p>
          </div>

          <button
            onClick={handleOpenDashboard}
            style={{ backgroundColor: 'transparent', border: '1.5px solid #000000', color: '#000000' }}
            className="liquid-hover w-full py-3 px-4 rounded-xl text-black font-black text-xs flex items-center justify-center space-x-2 transition-all shadow-sm cursor-pointer"
          >
            <span style={{ color: '#000000' }} className="text-black font-black">Open TRAZE</span>
            <ArrowUpRight className="w-4 h-4 text-black stroke-[2.5]" />
          </button>
        </div>
      )}
    </div>
  );
};
