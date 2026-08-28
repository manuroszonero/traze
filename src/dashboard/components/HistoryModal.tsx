import React from 'react';
import { HistoricalAnalysisSummary } from '../../types/instagram';
import { X, History, FileArchive, Calendar, Trash2 } from '../../lib/icons';
import { formatNumber } from '../../lib/utils';

interface HistoryModalProps {
  history: HistoricalAnalysisSummary[];
  onClose: () => void;
  onClearHistory: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  history,
  onClose,
  onClearHistory,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div
        style={{
          backgroundColor: 'transparent',
          border: '1px solid rgba(0, 0, 0, 0.2)',
          backdropFilter: 'blur(24px)',
        }}
        className="w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        <div
          style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}
          className="flex items-center justify-between px-6 py-4"
        >
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5 text-slate-800" />
            <h3 className="font-bold text-base text-slate-950">Analysis History</h3>
          </div>
          <button
            onClick={onClose}
            style={{ backgroundColor: 'transparent', border: '1px solid rgba(0, 0, 0, 0.2)' }}
            className="w-8 h-8 rounded-full hover:bg-black/5 text-slate-700 hover:text-slate-950 flex items-center justify-center transition-all shadow-sm active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-3">
          {history.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <History className="w-8 h-8 text-slate-400 mx-auto opacity-50" />
              <p className="text-xs text-slate-600 font-medium">No previous analyses recorded yet.</p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                style={{ backgroundColor: 'transparent', border: '1px solid rgba(0, 0, 0, 0.15)' }}
                className="p-4 rounded-2xl space-y-3 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div
                      style={{ backgroundColor: 'transparent', border: '1px solid rgba(0, 0, 0, 0.2)' }}
                      className="w-8 h-8 rounded-xl text-slate-800 flex items-center justify-center"
                    >
                      <FileArchive className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-950 font-mono truncate max-w-[200px] sm:max-w-xs">
                        {item.zipFileName}
                      </h4>
                      <p className="text-[10px] text-slate-600 font-mono flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span>{new Date(item.analyzedAt).toLocaleString()}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  style={{ borderTop: '1px solid rgba(0, 0, 0, 0.1)' }}
                  className="grid grid-cols-3 gap-2 pt-2 text-center font-mono"
                >
                  <div
                    style={{ backgroundColor: 'transparent', border: '1px solid rgba(0, 0, 0, 0.15)' }}
                    className="p-2 rounded-xl"
                  >
                    <div className="text-[10px] text-slate-600 font-bold">Followers</div>
                    <div className="text-xs font-extrabold text-slate-950">{formatNumber(item.followersCount)}</div>
                  </div>
                  <div
                    style={{ backgroundColor: 'transparent', border: '1px solid rgba(0, 0, 0, 0.15)' }}
                    className="p-2 rounded-xl"
                  >
                    <div className="text-[10px] text-slate-600 font-bold">Following</div>
                    <div className="text-xs font-extrabold text-slate-950">{formatNumber(item.followingCount)}</div>
                  </div>
                  <div
                    style={{ backgroundColor: 'transparent', border: '1px solid rgba(0, 0, 0, 0.15)' }}
                    className="p-2 rounded-xl"
                  >
                    <div className="text-[10px] text-slate-600 font-bold">Unfollowers</div>
                    <div className="text-xs font-extrabold text-slate-950">{formatNumber(item.notFollowingBackCount)}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div
          style={{ borderTop: '1px solid rgba(0, 0, 0, 0.12)' }}
          className="px-6 py-3.5 flex items-center justify-between"
        >
          {history.length > 0 ? (
            <button
              onClick={onClearHistory}
              style={{ backgroundColor: 'transparent' }}
              className="text-xs text-rose-700 hover:text-rose-900 flex items-center gap-1 transition-colors font-bold"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          ) : (
            <div />
          )}

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
