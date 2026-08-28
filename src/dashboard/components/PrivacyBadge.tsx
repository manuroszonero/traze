import React from 'react';
import { ShieldCheck } from '../../lib/icons';

export const PrivacyBadge: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  if (compact) {
    return (
      <div
        style={{ backgroundColor: 'transparent', border: '1.5px solid #000000' }}
        className="liquid-hover inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-black text-xs font-mono font-bold shadow-sm cursor-default"
      >
        <ShieldCheck className="w-3.5 h-3.5 text-black stroke-[2.5]" />
        <span>100% Local & Private Processing</span>
      </div>
    );
  }

  return (
    <div
      style={{ backgroundColor: 'transparent', border: '1.5px solid #000000' }}
      className="liquid-hover p-4 rounded-2xl flex items-center justify-between gap-4 text-xs text-black font-mono shadow-sm cursor-default"
    >
      <div className="flex items-center space-x-3">
        <div
          style={{ backgroundColor: 'transparent', border: '1.5px solid #000000' }}
          className="liquid-hover w-9 h-9 rounded-xl flex items-center justify-center text-black flex-shrink-0 shadow-sm"
        >
          <ShieldCheck className="w-5 h-5 text-black stroke-[2.5]" />
        </div>
        <div>
          <h4 className="font-extrabold text-black text-xs flex items-center gap-1.5">
            <span>Zero Data Collection • 100% Private</span>
            <span className="w-2 h-2 rounded-full bg-black"></span>
          </h4>
          <p className="text-black/80 text-[11px] mt-0.5 font-medium">
            Your Instagram export is decompressed and analyzed strictly inside your browser. No data or tokens are ever sent to any remote server.
          </p>
        </div>
      </div>
    </div>
  );
};
