import React, { useState } from 'react';
import { AnalysisResult, AccountCategory } from '../../types/instagram';
import { downloadCsv, downloadJson, copyToClipboard } from '../../lib/utils';
import { X, Copy, Check, FileSpreadsheet, FileCode, Users, Sparkles, UserMinus } from '../../lib/icons';

interface ExportModalProps {
  analysis: AnalysisResult;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ analysis, onClose }) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const handleCopyUsernames = async (category: AccountCategory, typeKey: string) => {
    let accounts = analysis.notFollowingBack;
    if (category === 'mutual') accounts = analysis.mutuals;
    if (category === 'you_dont_follow_back') accounts = analysis.youDontFollowBack;
    if (category === 'all') accounts = analysis.following;

    const text = accounts.map((a) => a.username).join('\n');
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedType(typeKey);
      setTimeout(() => setCopiedType(null), 2000);
    }
  };

  const handleDownloadCsv = (category: AccountCategory, filenameSuffix: string) => {
    let accounts = analysis.notFollowingBack;
    if (category === 'mutual') accounts = analysis.mutuals;
    if (category === 'you_dont_follow_back') accounts = analysis.youDontFollowBack;
    if (category === 'all') accounts = analysis.following;

    downloadCsv(accounts, `traze_${filenameSuffix}_${Date.now()}.csv`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div
        style={{
          backgroundColor: 'transparent',
          border: '1px solid rgba(0, 0, 0, 0.2)',
          backdropFilter: 'blur(24px)',
        }}
        className="w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden relative"
      >
        <div
          style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}
          className="flex items-center justify-between px-6 py-4"
        >
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="w-5 h-5 text-slate-800" />
            <h3 className="font-bold text-base text-slate-950">Export & Download Data</h3>
          </div>
          <button
            onClick={onClose}
            style={{ backgroundColor: 'transparent', border: '1px solid rgba(0, 0, 0, 0.2)' }}
            className="w-8 h-8 rounded-full hover:bg-black/5 text-slate-700 hover:text-slate-950 flex items-center justify-center transition-all shadow-sm active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-700 font-medium">
            Export your analyzed account lists into CSV spreadsheets or raw JSON format for spreadsheet analysis or backup.
          </p>

          <div className="space-y-3">
            {/* Not following back CSV */}
            <div
              style={{ backgroundColor: 'transparent', border: '1px solid rgba(0, 0, 0, 0.15)' }}
              className="p-4 rounded-2xl flex items-center justify-between gap-3 shadow-sm"
            >
              <div className="flex items-center space-x-3">
                <div
                  style={{ backgroundColor: 'transparent', border: '1px solid rgba(0, 0, 0, 0.2)' }}
                  className="w-9 h-9 rounded-xl text-slate-800 flex items-center justify-center flex-shrink-0"
                >
                  <UserMinus className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-950">Not Following Back List</h4>
                  <p className="text-[11px] text-slate-600 font-mono">{analysis.notFollowingBack.length} accounts</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleCopyUsernames('not_following_back', 'not_following')}
                  style={{ backgroundColor: 'transparent', border: '1px solid rgba(0, 0, 0, 0.2)' }}
                  className="px-3 py-1.5 rounded-xl hover:bg-black/5 text-xs font-bold text-slate-900 flex items-center gap-1 transition-all shadow-sm active:scale-95"
                  title="Copy usernames to clipboard"
                >
                  {copiedType === 'not_following' ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy</span>
                </button>
                <button
                  onClick={() => handleDownloadCsv('not_following_back', 'not_following_back')}
                  style={{ backgroundColor: 'transparent', border: '2px solid #0f172a' }}
                  className="px-3.5 py-1.5 rounded-xl hover:bg-black/5 text-xs font-extrabold text-slate-950 transition-all shadow-sm active:scale-95"
                >
                  CSV
                </button>
              </div>
            </div>

            {/* Mutuals CSV */}
            <div
              style={{ backgroundColor: 'transparent', border: '1px solid rgba(0, 0, 0, 0.15)' }}
              className="p-4 rounded-2xl flex items-center justify-between gap-3 shadow-sm"
            >
              <div className="flex items-center space-x-3">
                <div
                  style={{ backgroundColor: 'transparent', border: '1px solid rgba(0, 0, 0, 0.2)' }}
                  className="w-9 h-9 rounded-xl text-slate-800 flex items-center justify-center flex-shrink-0"
                >
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-950">Mutual Followers List</h4>
                  <p className="text-[11px] text-slate-600 font-mono">{analysis.mutuals.length} accounts</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleCopyUsernames('mutual', 'mutuals')}
                  style={{ backgroundColor: 'transparent', border: '1px solid rgba(0, 0, 0, 0.2)' }}
                  className="px-3 py-1.5 rounded-xl hover:bg-black/5 text-xs font-bold text-slate-900 flex items-center gap-1 transition-all shadow-sm active:scale-95"
                >
                  {copiedType === 'mutuals' ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy</span>
                </button>
                <button
                  onClick={() => handleDownloadCsv('mutual', 'mutuals')}
                  style={{ backgroundColor: 'transparent', border: '2px solid #0f172a' }}
                  className="px-3.5 py-1.5 rounded-xl hover:bg-black/5 text-xs font-extrabold text-slate-950 transition-all shadow-sm active:scale-95"
                >
                  CSV
                </button>
              </div>
            </div>

            {/* All Following CSV */}
            <div
              style={{ backgroundColor: 'transparent', border: '1px solid rgba(0, 0, 0, 0.15)' }}
              className="p-4 rounded-2xl flex items-center justify-between gap-3 shadow-sm"
            >
              <div className="flex items-center space-x-3">
                <div
                  style={{ backgroundColor: 'transparent', border: '1px solid rgba(0, 0, 0, 0.2)' }}
                  className="w-9 h-9 rounded-xl text-slate-800 flex items-center justify-center flex-shrink-0"
                >
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-950">All Following Accounts</h4>
                  <p className="text-[11px] text-slate-600 font-mono">{analysis.totalFollowingCount} accounts</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleCopyUsernames('all', 'all')}
                  style={{ backgroundColor: 'transparent', border: '1px solid rgba(0, 0, 0, 0.2)' }}
                  className="px-3 py-1.5 rounded-xl hover:bg-black/5 text-xs font-bold text-slate-900 flex items-center gap-1 transition-all shadow-sm active:scale-95"
                >
                  {copiedType === 'all' ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy</span>
                </button>
                <button
                  onClick={() => handleDownloadCsv('all', 'all_following')}
                  style={{ backgroundColor: 'transparent', border: '2px solid #0f172a' }}
                  className="px-3.5 py-1.5 rounded-xl hover:bg-black/5 text-xs font-extrabold text-slate-950 transition-all shadow-sm active:scale-95"
                >
                  CSV
                </button>
              </div>
            </div>

            {/* Complete Full JSON Analysis */}
            <div
              style={{ backgroundColor: 'transparent', border: '1px solid rgba(0, 0, 0, 0.15)' }}
              className="p-4 rounded-2xl flex items-center justify-between gap-3 shadow-sm"
            >
              <div className="flex items-center space-x-3">
                <div
                  style={{ backgroundColor: 'transparent', border: '1px solid rgba(0, 0, 0, 0.2)' }}
                  className="w-9 h-9 rounded-xl text-slate-800 flex items-center justify-center flex-shrink-0"
                >
                  <FileCode className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-950">Complete JSON Report</h4>
                  <p className="text-[11px] text-slate-600 font-mono">Full raw data with all sets & timestamps</p>
                </div>
              </div>

              <button
                onClick={() => downloadJson(analysis, `traze_full_analysis_${Date.now()}.json`)}
                style={{ backgroundColor: 'transparent', border: '2px solid #0f172a' }}
                className="px-4 py-1.5 rounded-xl hover:bg-black/5 text-xs font-extrabold text-slate-950 transition-all shadow-sm active:scale-95"
              >
                Download JSON
              </button>
            </div>
          </div>
        </div>

        <div
          style={{ borderTop: '1px solid rgba(0, 0, 0, 0.12)' }}
          className="px-6 py-3.5 flex justify-end"
        >
          <button
            onClick={onClose}
            style={{ backgroundColor: 'transparent', border: '1px solid rgba(0, 0, 0, 0.2)' }}
            className="px-4 py-2 rounded-2xl hover:bg-black/5 text-xs text-slate-950 font-bold transition-all shadow-sm active:scale-95"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
