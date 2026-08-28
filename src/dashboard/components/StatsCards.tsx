import React, { useEffect, useState } from 'react';
import { AnalysisResult } from '../../types/instagram';
import { formatNumber } from '../../lib/utils';

interface StatsCardsProps {
  analysis: AnalysisResult;
}

function useCountUp(target: number, duration: number = 800) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = target;
    if (start === end) {
      setCount(end);
      return;
    }

    const startTime = performance.now();

    const updateCounter = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(ease * end);
      setCount(current);

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(updateCounter);
  }, [target, duration]);

  return count;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ analysis }) => {
  const followersCount = useCountUp(analysis.totalFollowersCount);
  const followingCount = useCountUp(analysis.totalFollowingCount);
  const notFollowingCount = useCountUp(analysis.notFollowingBack.length);
  const mutualsCount = useCountUp(analysis.mutuals.length);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. FOLLOWERS CARD */}
      <div
        style={{
          backgroundColor: 'transparent',
          border: '1.5px solid #000000',
          color: '#000000',
        }}
        className="liquid-hover group p-5 rounded-3xl relative shadow-sm select-none cursor-default"
      >
        <div className="flex items-center justify-between mb-2 relative z-10">
          <span className="text-xs font-mono font-black uppercase tracking-wider text-black">
            Followers
          </span>
        </div>
        <div className="text-3xl font-black font-mono text-black tracking-tight relative z-10">
          {formatNumber(followersCount)}
        </div>
      </div>

      {/* 2. FOLLOWING CARD */}
      <div
        style={{
          backgroundColor: 'transparent',
          border: '1.5px solid #000000',
          color: '#000000',
        }}
        className="liquid-hover group p-5 rounded-3xl relative shadow-sm select-none cursor-default"
      >
        <div className="flex items-center justify-between mb-2 relative z-10">
          <span className="text-xs font-mono font-black uppercase tracking-wider text-black">
            Following
          </span>
        </div>
        <div className="text-3xl font-black font-mono text-black tracking-tight relative z-10">
          {formatNumber(followingCount)}
        </div>
      </div>

      {/* 3. NOT FOLLOWING BACK CARD */}
      <div
        style={{
          backgroundColor: 'transparent',
          border: '1.5px solid #000000',
          color: '#000000',
        }}
        className="liquid-hover group p-5 rounded-3xl relative shadow-sm select-none cursor-default"
      >
        <div className="flex items-center justify-between mb-2 relative z-10">
          <span className="text-xs font-mono font-black uppercase tracking-wider text-black">
            Not Following Back
          </span>
        </div>
        <div className="text-3xl font-black font-mono text-black tracking-tight relative z-10">
          {formatNumber(notFollowingCount)}
        </div>
      </div>

      {/* 4. MUTUALS CARD */}
      <div
        style={{
          backgroundColor: 'transparent',
          border: '1.5px solid #000000',
          color: '#000000',
        }}
        className="liquid-hover group p-5 rounded-3xl relative shadow-sm select-none cursor-default"
      >
        <div className="flex items-center justify-between mb-2 relative z-10">
          <span className="text-xs font-mono font-black uppercase tracking-wider text-black">
            Mutuals
          </span>
        </div>
        <div className="text-3xl font-black font-mono text-black tracking-tight relative z-10">
          {formatNumber(mutualsCount)}
        </div>
      </div>
    </div>
  );
};
