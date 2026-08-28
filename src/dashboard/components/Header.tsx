import React from 'react';
import { Home, LayoutDashboard, Download, History, Trash2 } from '../../lib/icons';

interface HeaderProps {
  hasAnalysis: boolean;
  notFollowingCount: number;
  onGoToHome?: () => void;
  onGoToDashboard: () => void;
  onNewAnalysis: () => void;
  onOpenReviewMode: () => void;
  onOpenHistory: () => void;
  onOpenExport: () => void;
  onOpenAbout: () => void;
  onOpenTrazeInfo?: () => void;
  onOpenWaveStudio: () => void;
  onClearData: () => void;
  onLoadDemoData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  hasAnalysis,
  onGoToHome,
  onGoToDashboard,
  onNewAnalysis,
  onOpenHistory,
  onOpenExport,
  onOpenAbout,
  onOpenTrazeInfo,
  onClearData,
}) => {
  return (
    <header className="relative z-20 w-full transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
        {/* Left: Brand Identity (TRAZE Logo Emblem & Title) */}
        <div
          onClick={onOpenTrazeInfo || onGoToDashboard}
          style={{ backgroundColor: 'transparent' }}
          className="liquid-hover px-2 py-1 rounded-2xl flex items-center space-x-3 flex-shrink-0 cursor-pointer select-none"
          title="About TRAZE"
        >
          <div className="flex items-center space-x-2">
            {/* T Logo Emblem */}
            <div
              style={{
                backgroundColor: 'transparent',
                border: '1.5px solid #000000',
              }}
              className="w-6 h-6 rounded-full flex items-center justify-center shadow-sm select-none"
            >
              <span
                style={{ color: '#000000' }}
                className="font-mono font-bold text-black text-xs"
              >
                T
              </span>
            </div>

            {/* TRAZE Text */}
            <span
              style={{ color: '#000000' }}
              className="font-bold font-mono text-xs sm:text-sm text-black uppercase tracking-wider select-none"
            >
              TRAZE
            </span>
          </div>

          {/* Subtitle Divider */}
          <div
            style={{ borderColor: 'rgba(0, 0, 0, 0.35)' }}
            className="hidden md:flex items-center pl-2.5 border-l"
          >
            <span style={{ color: '#000000' }} className="text-xs text-black font-mono font-bold">
              find the culprit
            </span>
          </div>
        </div>

        {/* Right: Action Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 flex-shrink-0">
          {/* Home Button */}
          <button
            onClick={onGoToHome || onNewAnalysis}
            style={{ backgroundColor: 'transparent', border: '1.5px solid #000000', color: '#000000' }}
            className="liquid-hover px-3.5 py-2 rounded-2xl text-black text-xs font-mono font-bold flex items-center space-x-1.5 shadow-sm cursor-pointer"
            title="Go to Home / Upload page"
          >
            <Home className="w-3.5 h-3.5 text-black stroke-[2.5]" />
            <span className="font-extrabold text-black">Home</span>
          </button>

          {hasAnalysis && (
            <>
              {/* Dashboard Main Grid Button */}
              <button
                onClick={onGoToDashboard}
                style={{ backgroundColor: 'transparent', border: '1.5px solid #000000', color: '#000000' }}
                className="liquid-hover px-3.5 py-2 rounded-2xl text-black text-xs font-mono font-bold flex items-center space-x-1.5 shadow-sm cursor-pointer"
                title="Go to main dashboard cards grid"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                <span className="font-extrabold text-black">Dashboard</span>
              </button>

              {/* Export Modal */}
              <button
                onClick={onOpenExport}
                style={{ backgroundColor: 'transparent', border: '1.5px solid #000000', color: '#000000' }}
                className="liquid-hover px-3 py-2 rounded-2xl text-black text-xs font-mono font-bold flex items-center space-x-1.5 shadow-sm cursor-pointer"
                title="Export results to CSV or JSON"
              >
                <Download className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                <span className="hidden sm:inline">Export</span>
              </button>

              {/* History Button */}
              <button
                onClick={onOpenHistory}
                style={{ backgroundColor: 'transparent', border: '1.5px solid #000000', color: '#000000' }}
                className="liquid-hover px-3 py-2 rounded-2xl text-black text-xs font-mono font-bold flex items-center space-x-1.5 shadow-sm cursor-pointer"
                title="View previous analysis history"
              >
                <History className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                <span className="hidden sm:inline">History</span>
              </button>

              {/* Dustbin / Clear Data Button */}
              <button
                onClick={onClearData}
                style={{ backgroundColor: 'transparent', border: '1.5px solid #000000', color: '#000000' }}
                className="liquid-hover px-3 py-2 rounded-2xl text-black text-xs font-mono font-bold flex items-center space-x-1.5 shadow-sm cursor-pointer"
                title="Delete current analysis and reset to upload a new file"
              >
                <Trash2 className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                <span className="hidden sm:inline">Delete</span>
              </button>
            </>
          )}

          {/* About Creator manuroszonero Button */}
          <button
            onClick={onOpenAbout}
            style={{ backgroundColor: 'transparent', border: '1.5px solid #000000', color: '#000000' }}
            className="liquid-hover px-3.5 py-2 rounded-2xl text-black text-xs font-mono font-bold flex items-center space-x-1.5 shadow-sm cursor-pointer"
            title="About manuroszonero & TRAZE"
          >
            <span>About</span>
          </button>
        </div>
      </div>
    </header>
  );
};
