import React from 'react';
import { AccountCategory, AnalysisResult } from '../../types/instagram';
import { UserMinus, Sparkles, UserPlus, Users } from '../../lib/icons';
import { formatNumber } from '../../lib/utils';

interface FilterTabsProps {
  analysis: AnalysisResult;
  activeCategory: AccountCategory;
  onSelectCategory: (category: AccountCategory) => void;
}

export const FilterTabs: React.FC<FilterTabsProps> = ({
  analysis,
  activeCategory,
  onSelectCategory,
}) => {
  const tabs = [
    {
      id: 'not_following_back' as AccountCategory,
      label: 'Not Following Back',
      count: analysis.notFollowingBack.length,
      icon: UserMinus,
    },
    {
      id: 'you_dont_follow_back' as AccountCategory,
      label: "You Don't Follow Back",
      count: analysis.youDontFollowBack.length,
      icon: UserPlus,
    },
    {
      id: 'all' as AccountCategory,
      label: 'All Accounts',
      count: analysis.followers.length + analysis.notFollowingBack.length,
      icon: Users,
    },
  ];

  return (
    <div
      className="p-1.5 rounded-2xl flex items-center space-x-2 overflow-x-auto scrollbar-none shadow-sm"
      style={{ backgroundColor: 'transparent', border: '1px solid rgba(0, 0, 0, 0.15)' }}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeCategory === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onSelectCategory(tab.id)}
            style={{
              backgroundColor: 'transparent',
              borderColor: isActive ? '#0f172a' : 'transparent',
              borderWidth: isActive ? '2px' : '1px',
              borderStyle: 'solid',
            }}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap active:scale-95 ${
              isActive
                ? 'text-slate-950 shadow-sm'
                : 'text-slate-700 hover:text-slate-950 hover:bg-black/5'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-600'}`} />
            <span className={isActive ? 'text-slate-950 font-extrabold' : 'text-slate-700'}>
              {tab.label}
            </span>
            <span
              style={{
                backgroundColor: isActive ? 'rgba(15, 23, 42, 0.12)' : 'rgba(15, 23, 42, 0.06)',
                borderColor: isActive ? 'rgba(15, 23, 42, 0.3)' : 'rgba(0, 0, 0, 0.12)',
              }}
              className="ml-1.5 px-2 py-0.5 rounded-full text-xs font-mono font-bold border transition-colors text-slate-900"
            >
              {formatNumber(tab.count)}
            </span>
          </button>
        );
      })}
    </div>
  );
};
