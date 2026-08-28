import React, { useState, useEffect, useCallback } from 'react';
import { InstagramAccount } from '../../types/instagram';
import { openInstagramProfile, copyToClipboard } from '../../lib/utils';
import confetti from '../../lib/confetti';
import {
  X,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Eye,
} from '../../lib/icons';

interface ReviewModeProps {
  accounts: InstagramAccount[];
  title?: string;
  onClose: () => void;
  onMarkViewed: (username: string, isViewed: boolean) => void;
}

export const ReviewMode: React.FC<ReviewModeProps> = ({
  accounts,
  title = 'Review Accounts',
  onClose,
  onMarkViewed,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const total = accounts.length;
  const currentAccount = accounts[currentIndex] || accounts[0];

  const viewedCount = accounts.filter((a) => a.isViewed).length;
  const progressPercent = total > 0 ? Math.round((viewedCount / total) * 100) : 0;

  const handleNext = useCallback(() => {
    if (currentIndex < total - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, total]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const handleOpenProfile = useCallback(() => {
    if (currentAccount) {
      onMarkViewed(currentAccount.username, true);
      openInstagramProfile(currentAccount.username);

      if (viewedCount + 1 >= total) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }

      if (currentIndex < total - 1) {
        setCurrentIndex((i) => i + 1);
      }
    }
  }, [currentAccount, onMarkViewed, viewedCount, total, currentIndex]);

  const handleCopy = async () => {
    if (!currentAccount) return;
    const success = await copyToClipboard(currentAccount.username);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          handleNext();
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          handlePrev();
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          handleOpenProfile();
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, handleOpenProfile, onClose]);

  if (!currentAccount) {
    return null;
  }

  const isViewed = !!currentAccount.isViewed;
  const initials = currentAccount.username.replace(/[^a-zA-Z0-9]/g, '').slice(0, 2).toUpperCase() || 'IG';

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div
        style={{
          backgroundColor: 'transparent',
          border: '1px solid rgba(0, 0, 0, 0.2)',
          backdropFilter: 'blur(24px)',
        }}
        className="w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col relative"
      >
        {/* Modal Top Bar */}
        <div
          style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}
          className="flex items-center justify-between px-6 py-4 relative z-10"
        >
          <div className="flex items-center space-x-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-900" />
            <h2 className="font-bold text-sm sm:text-base text-slate-950 tracking-wide">{title}</h2>
          </div>

          <button
            onClick={onClose}
            style={{ backgroundColor: 'transparent', border: '1px solid rgba(0, 0, 0, 0.2)' }}
            className="w-8 h-8 rounded-full text-slate-800 hover:text-slate-950 hover:bg-black/5 flex items-center justify-center transition-all shadow-sm active:scale-95"
            title="Exit Review Mode (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar Header */}
        <div className="px-6 pt-4 pb-2 relative z-10">
          <div className="flex items-center justify-between text-xs font-mono text-slate-700 mb-2">
            <span>
              Profile <strong className="text-slate-950">{currentIndex + 1}</strong> of {total}
            </span>
            <span>
              <strong className="text-slate-950 font-bold">{viewedCount}</strong> / {total} viewed ({progressPercent}%)
            </span>
          </div>

          <div className="w-full h-1.5 bg-black/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-slate-900 transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Review Card Body */}
        <div className="p-6 sm:p-8 flex flex-col items-center text-center relative z-10 space-y-6">
          <div
            style={{ backgroundColor: 'transparent', border: '1px solid rgba(0, 0, 0, 0.25)' }}
            className="w-20 h-20 rounded-3xl flex items-center justify-center text-slate-950 font-mono font-extrabold text-2xl shadow-sm"
          >
            {initials}
          </div>

          {/* Username & Status */}
          <div className="space-y-2">
            <button
              onClick={handleOpenProfile}
              className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-950 hover:text-slate-700 transition-colors inline-flex items-center gap-2 group relative"
              title="Open profile on Instagram"
            >
              <div className="relative inline-flex items-center">
                <span className={isViewed ? 'opacity-65' : 'opacity-100'}>@{currentAccount.username}</span>
                {isViewed && (
                  <svg
                    viewBox="0 0 200 16"
                    preserveAspectRatio="none"
                    className="animate-scribble absolute -left-2 -right-2 top-1/2 -translate-y-1/2 w-[calc(100%+16px)] h-5 pointer-events-none select-none z-20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M 2,9.5 C 30,7.5 75,10.2 135,8.8 C 165,8.1 190,9.2 198,8.2 M 198,8.2 C 160,7 100,6.2 5,11 M 5,11 C 45,9.8 110,9.2 195,8 M 195,8 C 150,9.5 90,8.2 2,10 M 2,10 C 60,7.2 140,8.8 199,9"
                      stroke="#000000"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
              <ExternalLink className="w-5 h-5 text-slate-600 group-hover:text-slate-900 transition-colors" />
            </button>

            <div className="flex items-center justify-center flex-wrap gap-2">
              {isViewed ? (
                <span
                  style={{ backgroundColor: 'rgba(8, 145, 178, 0.15)', border: '1px solid rgba(8, 145, 178, 0.5)' }}
                  className="px-3 py-1 rounded-full text-xs font-mono font-bold text-cyan-900 flex items-center gap-1.5 shadow-sm"
                >
                  <Eye className="w-3.5 h-3.5 text-cyan-800" />
                  <span>Viewed</span>
                </span>
              ) : (
                <span
                  style={{ backgroundColor: 'transparent', border: '1px solid rgba(0, 0, 0, 0.2)' }}
                  className="px-3 py-1 rounded-full text-xs font-mono font-semibold text-slate-800 shadow-sm"
                >
                  Not Viewed Yet
                </span>
              )}
            </div>

            {currentAccount.formattedDate && (
              <p className="text-xs font-mono text-slate-600 font-medium">
                Followed: {currentAccount.formattedDate}
              </p>
            )}
          </div>

          {/* Primary Action: OPEN PROFILE */}
          <div className="w-full max-w-sm flex gap-3">
            <button
              onClick={handleOpenProfile}
              style={{ backgroundColor: 'transparent', border: '2px solid #0f172a' }}
              className="flex-1 py-3 px-5 rounded-2xl hover:bg-black/5 text-slate-950 font-extrabold text-sm flex items-center justify-center space-x-2 transition-all active:scale-95 shadow-sm"
            >
              <span>OPEN PROFILE</span>
              <ExternalLink className="w-4 h-4" />
            </button>

            <button
              onClick={handleCopy}
              style={{ backgroundColor: 'transparent', border: '1px solid rgba(0, 0, 0, 0.2)' }}
              className="px-4 py-3 rounded-2xl hover:bg-black/5 text-slate-900 text-sm font-bold flex items-center justify-center transition-all shadow-sm active:scale-95"
              title="Copy username"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4 text-slate-700" />}
            </button>
          </div>

          {/* Navigation Buttons: Previous / Next */}
          <div
            style={{ borderTop: '1px solid rgba(0, 0, 0, 0.12)' }}
            className="flex items-center justify-between w-full pt-4"
          >
            <button
              disabled={currentIndex === 0}
              onClick={handlePrev}
              style={{ backgroundColor: 'transparent', border: '1px solid rgba(0, 0, 0, 0.2)' }}
              className="px-4 py-2.5 rounded-2xl hover:bg-black/5 text-slate-950 text-xs font-bold flex items-center space-x-1.5 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous (←)</span>
            </button>

            <span className="text-xs font-mono text-slate-800 font-bold">
              {currentIndex + 1} / {total}
            </span>

            <button
              disabled={currentIndex >= total - 1}
              onClick={handleNext}
              style={{ backgroundColor: 'transparent', border: '1px solid rgba(0, 0, 0, 0.2)' }}
              className="px-4 py-2.5 rounded-2xl hover:bg-black/5 text-slate-950 text-xs font-bold flex items-center space-x-1.5 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95"
            >
              <span>Next (→)</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Footer Keyboard Hints */}
        <div
          style={{ borderTop: '1px solid rgba(0, 0, 0, 0.12)' }}
          className="px-6 py-3 flex items-center justify-center flex-wrap gap-4 text-[11px] font-mono text-slate-700 font-medium"
        >
          <span className="flex items-center gap-1">
            <kbd
              style={{ backgroundColor: 'transparent', border: '1px solid rgba(0, 0, 0, 0.2)' }}
              className="px-1.5 py-0.5 rounded-lg text-slate-900 font-bold shadow-sm"
            >
              ← / →
            </kbd>{' '}
            Navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd
              style={{ backgroundColor: 'transparent', border: '1px solid rgba(0, 0, 0, 0.2)' }}
              className="px-1.5 py-0.5 rounded-lg text-slate-900 font-bold shadow-sm"
            >
              Enter / Space
            </kbd>{' '}
            Open Profile
          </span>
          <span className="flex items-center gap-1">
            <kbd
              style={{ backgroundColor: 'transparent', border: '1px solid rgba(0, 0, 0, 0.2)' }}
              className="px-1.5 py-0.5 rounded-lg text-slate-900 font-bold shadow-sm"
            >
              Esc
            </kbd>{' '}
            Exit
          </span>
        </div>
      </div>
    </div>
  );
};
