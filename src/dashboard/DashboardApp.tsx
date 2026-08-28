import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  AnalysisResult,
  AccountCategory,
  FilterOptions,
  ParseProgress,
  InstagramAccount,
  HistoricalAnalysisSummary,
} from '../types/instagram';
import { parseInstagramZip } from '../lib/instagramParser';
import { compareInstagramAccounts } from '../lib/compareAccounts';
import {
  saveAnalysis,
  getAnalysis,
  saveUserViewed,
  batchSaveUsersViewed,
  clearViewedHistory,
  clearActiveSessionAnalysis,
  clearAllData,
  getHistory,
} from '../lib/storage';
import { generateSampleDataset } from '../lib/sampleData';
import confetti from '../lib/confetti';

// Subcomponents
import { Header } from './components/Header';
import { UploadArea } from './components/UploadArea';
import { StatsCards } from './components/StatsCards';
import { SearchBar } from './components/SearchBar';
import { AccountList } from './components/AccountList';
import { ReviewMode } from './components/ReviewMode';
import { ExportModal } from './components/ExportModal';
import { ConfirmModal } from './components/ConfirmModal';
import { HistoryModal } from './components/HistoryModal';
import { PrivacyBadge } from './components/PrivacyBadge';
import { AboutModal } from './components/AboutModal';
import { TrazeInfoModal } from './components/TrazeInfoModal';
import { GradientWaves } from './components/GradientWaves';
import {
  WaveStudioModal,
  WaveSettings,
  DEFAULT_WAVE_SETTINGS,
  TypographySettings,
  DEFAULT_TYPOGRAPHY_SETTINGS,
  FONT_OPTIONS,
} from './components/WaveStudioModal';

export const DashboardApp: React.FC = () => {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [progress, setProgress] = useState<ParseProgress | null>(null);
  const [history, setHistory] = useState<HistoricalAnalysisSummary[]>([]);

  // View & Modal states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showReviewMode, setShowReviewMode] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [showConfirmResetViewed, setShowConfirmResetViewed] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showTrazeInfoModal, setShowTrazeInfoModal] = useState(false);
  const [showWaveStudio, setShowWaveStudio] = useState(false);

  // Wave Settings State
  const [waveSettings, setWaveSettings] = useState<WaveSettings>(() => {
    try {
      const saved = localStorage.getItem('traze_wave_settings');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_WAVE_SETTINGS;
  });

  const handleWaveSettingsChange = (newSettings: WaveSettings) => {
    setWaveSettings(newSettings);
    try {
      localStorage.setItem('traze_wave_settings', JSON.stringify(newSettings));
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ traze_wave_settings: newSettings });
      }
    } catch {}
  };

  // Typography Settings State
  const [typographySettings, setTypographySettings] = useState<TypographySettings>(() => {
    try {
      const saved = localStorage.getItem('traze_typography_settings');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_TYPOGRAPHY_SETTINGS;
  });

  const handleTypographySettingsChange = (newTypo: TypographySettings) => {
    setTypographySettings(newTypo);
    try {
      localStorage.setItem('traze_typography_settings', JSON.stringify(newTypo));
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ traze_typography_settings: newTypo });
      }
    } catch {}
  };

  // Synchronize dynamic typography CSS variables to :root
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--app-text-primary', typographySettings.primaryTextColor);
    root.style.setProperty('--app-text-secondary', typographySettings.secondaryTextColor);
    root.style.setProperty('--app-accent-color', typographySettings.accentTextColor);
    root.style.setProperty('--app-viewed-card-bg', typographySettings.viewedCardBg || 'transparent');
    root.style.setProperty('--app-viewed-card-text', typographySettings.viewedCardText || '#000000');
    root.style.setProperty('--app-unviewed-card-text', typographySettings.unviewedCardText || '#000000');
    root.style.setProperty('--app-unviewed-card-border', typographySettings.unviewedCardBorder || '#000000');
    root.style.setProperty('--app-heading-weight', typographySettings.headingWeight);
    root.style.setProperty('--app-body-weight', typographySettings.bodyWeight);
    root.style.setProperty('--app-letter-spacing', typographySettings.letterSpacing);
    root.style.setProperty('--app-font-scale', `${typographySettings.fontScale}%`);
  }, [typographySettings]);

  // Filters & Sorting state
  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: '',
    activeCategory: 'not_following_back',
    reviewFilter: 'all',
    viewedFilter: 'all',
    sortBy: 'alpha_asc',
  });

  // Load saved analysis & wave settings on initial mount
  useEffect(() => {
    async function init() {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const isUploadAction = urlParams.get('action') === 'upload';
        const isSessionActive = sessionStorage.getItem('traze_tab_session_active') === 'true';

        if (isSessionActive && !isUploadAction) {
          const saved = await getAnalysis();
          if (saved) {
            setAnalysis(saved);
          } else {
            setShowUploadModal(true);
          }
        } else {
          // Fresh tab open or action=upload: start clean on dropzone
          await clearActiveSessionAnalysis();
          setAnalysis(null);
          setShowUploadModal(true);
        }

        const hist = await getHistory();
        setHistory(hist);

        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          chrome.storage.local.get(['traze_wave_settings', 'traze_typography_settings'], (res) => {
            if (res && res.traze_wave_settings) {
              setWaveSettings(res.traze_wave_settings);
            }
            if (res && res.traze_typography_settings) {
              setTypographySettings(res.traze_typography_settings);
            }
          });
        }
      } catch (err) {
        console.error('Failed to load initial storage state', err);
      } finally {
        setLoadingInitial(false);
      }
    }
    init();

    // Clear active session when tab is closed/unloaded
    const handleBeforeUnload = () => {
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage({ action: 'CLEAR_ACTIVE_SESSION' });
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Handle ZIP File selection & analysis
  const handleProcessZip = async (file: File) => {
    setProgress({
      stage: 'extracting',
      message: 'Extracting Instagram archive...',
      percent: 10,
    });

    try {
      const parsed = await parseInstagramZip(file, (p) => setProgress(p));

      // Compare accounts
      setProgress({
        stage: 'comparing',
        message: 'Comparing followers and following sets...',
        percent: 90,
      });

      const result = compareInstagramAccounts(
        parsed.followers,
        parsed.following,
        undefined,
        file.name
      );

      // Save to storage
      sessionStorage.setItem('traze_tab_session_active', 'true');
      await saveAnalysis(result);
      // Reload full analysis with any existing viewed statuses preserved
      const refreshed = await getAnalysis();
      setAnalysis(refreshed || result);
      setShowUploadModal(false);

      const hist = await getHistory();
      setHistory(hist);

      setProgress({
        stage: 'complete',
        message: 'Analysis ready!',
        percent: 100,
      });

      // Confetti burst on successful analysis
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 },
      });

      setTimeout(() => setProgress(null), 1500);
    } catch (err: unknown) {
      console.error('Parsing error', err);
      setProgress({
        stage: 'error',
        message: err instanceof Error ? err.message : 'Failed to parse ZIP archive',
        percent: 0,
        errorDetails: err instanceof Error && err.stack ? err.stack : String(err),
      });
    }
  };

  // Handle Demo dataset loading
  const handleLoadDemo = async () => {
    sessionStorage.setItem('traze_tab_session_active', 'true');
    const demo = generateSampleDataset();
    await saveAnalysis(demo);
    setAnalysis(demo);
    setShowUploadModal(false);

    confetti({
      particleCount: 60,
      spread: 50,
      origin: { y: 0.7 },
    });
  };

  // Handle individual account viewed toggle
  const handleMarkViewed = useCallback(
    async (username: string, isViewed: boolean) => {
      await saveUserViewed(username, isViewed);

      setAnalysis((prev) => {
        if (!prev) return null;
        const updateList = (list: InstagramAccount[]) =>
          list.map((acc) =>
            acc.username.toLowerCase() === username.toLowerCase()
              ? { ...acc, isViewed }
              : acc
          );

        return {
          ...prev,
          followers: updateList(prev.followers),
          following: updateList(prev.following),
          notFollowingBack: updateList(prev.notFollowingBack),
          mutuals: updateList(prev.mutuals),
          youDontFollowBack: updateList(prev.youDontFollowBack),
        };
      });
    },
    []
  );

  // Handle batch marking viewed
  const handleBatchMarkViewed = useCallback(
    async (usernames: string[], isViewed: boolean) => {
      await batchSaveUsersViewed(usernames, isViewed);
      const set = new Set(usernames.map((u) => u.toLowerCase()));

      setAnalysis((prev) => {
        if (!prev) return null;
        const updateList = (list: InstagramAccount[]) =>
          list.map((acc) =>
            set.has(acc.username.toLowerCase()) ? { ...acc, isViewed } : acc
          );

        return {
          ...prev,
          followers: updateList(prev.followers),
          following: updateList(prev.following),
          notFollowingBack: updateList(prev.notFollowingBack),
          mutuals: updateList(prev.mutuals),
          youDontFollowBack: updateList(prev.youDontFollowBack),
        };
      });
    },
    []
  );

  // Reset all Viewed History
  const handleConfirmResetViewed = async () => {
    await clearViewedHistory();

    const resetList = (list: InstagramAccount[]) =>
      list.map((acc) => ({ ...acc, isViewed: false }));

    setAnalysis((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        followers: resetList(prev.followers),
        following: resetList(prev.following),
        notFollowingBack: resetList(prev.notFollowingBack),
        mutuals: resetList(prev.mutuals),
        youDontFollowBack: resetList(prev.youDontFollowBack),
      };
    });

    setShowConfirmResetViewed(false);
  };

  // Clear data & reset to upload dropzone
  const handleConfirmClear = async () => {
    sessionStorage.removeItem('traze_tab_session_active');
    await clearActiveSessionAnalysis();
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({ action: 'CLEAR_ACTIVE_SESSION' });
    }
    setAnalysis(null);
    setShowConfirmClear(false);
    setShowUploadModal(true);
  };

  // Get active raw list based on category tab
  const rawAccountsForTab = useMemo<InstagramAccount[]>(() => {
    if (!analysis) return [];
    switch (filters.activeCategory) {
      case 'not_following_back':
        return analysis.notFollowingBack;
      case 'mutual':
        return analysis.mutuals;
      case 'you_dont_follow_back':
        return analysis.youDontFollowBack;
      case 'followers':
        return analysis.followers;
      case 'following':
        return analysis.following;
      case 'all':
      default:
        const map = new Map<string, InstagramAccount>();
        for (const a of analysis.following) map.set(a.username.toLowerCase(), a);
        for (const a of analysis.followers) {
          const k = a.username.toLowerCase();
          if (!map.has(k)) map.set(k, a);
        }
        return Array.from(map.values());
    }
  }, [analysis, filters.activeCategory]);

  // Total viewed and unviewed counts for current category
  const viewedCount = useMemo(() => {
    return rawAccountsForTab.filter((a) => a.isViewed).length;
  }, [rawAccountsForTab]);

  const unviewedCount = useMemo(() => {
    return rawAccountsForTab.length - viewedCount;
  }, [rawAccountsForTab, viewedCount]);

  // Filtered & Sorted accounts computation
  const filteredAndSortedAccounts = useMemo(() => {
    let result = [...rawAccountsForTab];

    // 1. Instant Search query filter
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      result = result.filter((acc) => acc.username.toLowerCase().includes(q));
    }

    // 2. Viewed Status Filter
    if (filters.viewedFilter === 'viewed') {
      result = result.filter((acc) => acc.isViewed === true);
    } else if (filters.viewedFilter === 'not_viewed') {
      result = result.filter((acc) => !acc.isViewed);
    }

    // 3. Sorting
    switch (filters.sortBy) {
      case 'alpha_asc':
        result.sort((a, b) => a.username.localeCompare(b.username));
        break;
      case 'alpha_desc':
        result.sort((a, b) => b.username.localeCompare(a.username));
        break;
      case 'date_newest':
        result.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        break;
      case 'date_oldest':
        result.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
        break;
      case 'viewed':
        result.sort((a, b) => (a.isViewed === b.isViewed ? 0 : a.isViewed ? 1 : -1));
        break;
      default:
        break;
    }

    return result;
  }, [rawAccountsForTab, filters]);

  if (loadingInitial) {
    return (
      <div className="min-h-screen bg-cyber-bg flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-3 border-electric-purple border-t-transparent rounded-full animate-spin shadow-glow-purple" />
        <p className="text-xs font-mono text-cyber-muted">Initializing TRAZE Intelligence...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex flex-col selection:bg-purple-600 selection:text-white">
      {/* Background Gradient Waves from React Bits */}
      <div
        className="fixed inset-0 pointer-events-none -z-10 overflow-hidden"
        style={{ backgroundColor: waveSettings.canvasBg }}
      >
        <GradientWaves
          horizonColor={waveSettings.horizonColor}
          waveColor={waveSettings.waveColor}
          crestColor={waveSettings.crestColor}
          speed={waveSettings.speed}
          amplitude={waveSettings.amplitude}
          waveScale={waveSettings.waveScale}
          waveRatio={waveSettings.waveRatio}
          swell={waveSettings.swell}
          turbulence={waveSettings.turbulence}
          tilt={waveSettings.tilt}
          zoom={waveSettings.zoom}
          height={waveSettings.height}
          fogDepth={waveSettings.fogDepth}
          detail={waveSettings.detail}
          brightness={waveSettings.brightness}
          opacity={waveSettings.opacity}
          mouseInteraction={waveSettings.mouseInteraction}
          parallaxStrength={waveSettings.parallaxStrength}
          grain={waveSettings.grain}
          grainIntensity={waveSettings.grainIntensity}
          style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
        />
      </div>

      {/* Top App Header */}
      <Header
        hasAnalysis={!!analysis}
        notFollowingCount={analysis ? analysis.notFollowingBack.length : 0}
        onGoToHome={() => {
          setShowUploadModal(true);
          setShowReviewMode(false);
          setShowHistoryModal(false);
          setShowExportModal(false);
          setShowWaveStudio(false);
        }}
        onGoToDashboard={() => {
          setShowUploadModal(false);
          setShowReviewMode(false);
          setShowHistoryModal(false);
          setShowExportModal(false);
          setShowWaveStudio(false);
        }}
        onNewAnalysis={() => setShowUploadModal(true)}
        onOpenReviewMode={() => setShowReviewMode(true)}
        onOpenHistory={() => setShowHistoryModal(true)}
        onOpenExport={() => setShowExportModal(true)}
        onOpenAbout={() => setShowAboutModal(true)}
        onOpenTrazeInfo={() => setShowTrazeInfoModal(true)}
        onOpenWaveStudio={() => setShowWaveStudio(true)}
        onClearData={() => setShowConfirmClear(true)}
        onLoadDemoData={handleLoadDemo}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col justify-center">
        {!analysis || showUploadModal ? (
          <div className="flex flex-col items-center justify-center my-auto py-6 sm:py-8 space-y-6 max-w-2xl mx-auto w-full animate-fade-in">
            <div className="text-center space-y-2.5 max-w-xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-black font-mono tracking-tight">
                Find the culprit in a fraction of seconds
              </h2>
              <p className="text-xs sm:text-sm text-black/80 font-mono font-medium leading-relaxed">
                No copying, no pasting, no login required. Simply drag and drop your downloaded
                Instagram data export ZIP file.
              </p>
            </div>

            <UploadArea
              onFileSelected={handleProcessZip}
              progress={progress}
              onLoadDemoData={handleLoadDemo}
              onCancel={() => setShowUploadModal(false)}
              hasExistingAnalysis={!!analysis}
            />

            <div className="w-full">
              <PrivacyBadge />
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-fade-in">
            {/* 4 KPI Stats Cards */}
            <StatsCards analysis={analysis} />

            {/* Instant Search Bar & Filter Options */}
            <SearchBar
              filters={filters}
              onChangeFilters={setFilters}
              filteredCount={filteredAndSortedAccounts.length}
              totalCount={rawAccountsForTab.length}
              viewedCount={viewedCount}
              unviewedCount={unviewedCount}
              analysis={analysis}
              onResetViewed={() => setShowConfirmResetViewed(true)}
            />

            {/* Sleek Grid of Interactive Cards */}
            <AccountList
              accounts={filteredAndSortedAccounts}
              category={filters.activeCategory}
              searchQuery={filters.searchQuery}
              onMarkViewed={handleMarkViewed}
              onBatchMarkViewed={handleBatchMarkViewed}
              onClearSearch={() => setFilters({ ...filters, searchQuery: '', viewedFilter: 'all' })}
            />
          </div>
        )}
      </main>

      {/* Review Mode Overlay */}
      {showReviewMode && analysis && (
        <ReviewMode
          accounts={
            filters.activeCategory === 'not_following_back'
              ? analysis.notFollowingBack
              : filteredAndSortedAccounts
          }
          title={`Reviewing: ${
            filters.activeCategory === 'not_following_back'
              ? 'Not Following Back'
              : filters.activeCategory.toUpperCase()
          }`}
          onClose={() => setShowReviewMode(false)}
          onMarkViewed={handleMarkViewed}
        />
      )}

      {/* Export Modal */}
      {showExportModal && analysis && (
        <ExportModal
          analysis={analysis}
          onClose={() => setShowExportModal(false)}
        />
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <HistoryModal
          history={history}
          onClose={() => setShowHistoryModal(false)}
          onClearHistory={async () => {
            await clearAllData();
            setHistory([]);
          }}
        />
      )}

      {/* Background & Typography Studio Modal */}
      {showWaveStudio && (
        <WaveStudioModal
          settings={waveSettings}
          typography={typographySettings}
          onChangeWave={handleWaveSettingsChange}
          onChangeTypography={handleTypographySettingsChange}
          onClose={() => setShowWaveStudio(false)}
        />
      )}

      {/* Clear Confirmation Modal */}
      {showConfirmClear && (
        <ConfirmModal
          title="Clear Analysis Data?"
          message="This will delete your currently loaded analysis results from your browser's local storage. You will need to upload your Instagram ZIP file again."
          confirmLabel="Clear All Data"
          cancelLabel="Cancel"
          isDestructive={true}
          onConfirm={handleConfirmClear}
          onCancel={() => setShowConfirmClear(false)}
        />
      )}

      {/* Reset Viewed History Confirmation Modal */}
      {showConfirmResetViewed && (
        <ConfirmModal
          title="Reset Viewed History?"
          message="Are you sure you want to clear your viewed history? All accounts will be reset to Not Viewed."
          confirmLabel="Reset Viewed History"
          cancelLabel="Cancel"
          isDestructive={true}
          onConfirm={handleConfirmResetViewed}
          onCancel={() => setShowConfirmResetViewed(false)}
        />
      )}

      {/* About Creator Modal */}
      {showAboutModal && (
        <AboutModal onClose={() => setShowAboutModal(false)} />
      )}

      {/* About TRAZE Modal */}
      {showTrazeInfoModal && (
        <TrazeInfoModal onClose={() => setShowTrazeInfoModal(false)} />
      )}
    </div>
  );
};
