import React from 'react';
import { FilterOptions } from '../../types/instagram';
import { AccountCategory, AnalysisResult } from '../../types/instagram';
import { Search, X, UserMinus, UserPlus, Users, Eye, EyeOff } from '../../lib/icons';
import { formatNumber } from '../../lib/utils';

interface SearchBarProps {
  filters: FilterOptions;
  onChangeFilters: (filters: FilterOptions) => void;
  filteredCount: number;
  totalCount: number;
  viewedCount: number;
  unviewedCount: number;
  analysis?: AnalysisResult | null;
  onResetViewed?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  filters,
  onChangeFilters,
  totalCount,
  viewedCount,
  unviewedCount,
  analysis,
}) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChangeFilters({
      ...filters,
      searchQuery: e.target.value,
    });
  };

  const handleClearSearch = () => {
    onChangeFilters({
      ...filters,
      searchQuery: '',
    });
  };

  const handleCategoryChange = (cat: AccountCategory) => {
    onChangeFilters({
      ...filters,
      activeCategory: cat,
    });
  };

  const handleViewedFilterChange = (filter: 'all' | 'viewed' | 'not_viewed') => {
    onChangeFilters({
      ...filters,
      viewedFilter: filter,
    });
  };

  const categoryTabs = analysis
    ? [
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
      ]
    : [];

  return (
    <div className="space-y-5 w-full">
      {/* 1. Unified Single Rectangular Filter Card (Placed ON TOP) */}
      <div
        className="p-3 sm:p-3.5 rounded-2xl flex flex-col gap-3 shadow-sm"
        style={{ backgroundColor: 'transparent', border: '1.5px solid #000000' }}
      >
        {/* Top Row: Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 overflow-x-auto scrollbar-none">
          {categoryTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = filters.activeCategory === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => handleCategoryChange(tab.id)}
                style={{
                  backgroundColor: 'transparent',
                  borderColor: isActive ? '#000000' : 'transparent',
                  borderWidth: isActive ? '2px' : '1px',
                  borderStyle: 'solid',
                  color: '#000000',
                }}
                className={`liquid-hover flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-mono font-bold transition-all whitespace-nowrap text-black cursor-pointer ${
                  isActive ? 'shadow-sm' : 'opacity-75 hover:opacity-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                <span className="text-black font-extrabold">{tab.label}</span>
                <span
                  style={{
                    backgroundColor: isActive ? 'rgba(0, 0, 0, 0.08)' : 'transparent',
                    borderColor: '#000000',
                  }}
                  className="ml-1 px-2 py-0.5 rounded-full text-xs font-mono font-black border text-black"
                >
                  {formatNumber(tab.count)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Divider Line */}
        <div style={{ borderTop: '1px solid rgba(0, 0, 0, 0.2)' }} className="w-full" />

        {/* Bottom Row: Viewed Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => handleViewedFilterChange('all')}
            style={{
              backgroundColor: 'transparent',
              borderColor: filters.viewedFilter === 'all' ? '#000000' : 'transparent',
              borderWidth: filters.viewedFilter === 'all' ? '2px' : '1px',
              borderStyle: 'solid',
              color: '#000000',
            }}
            className={`liquid-hover px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all text-black cursor-pointer ${
              filters.viewedFilter === 'all' ? 'shadow-sm' : 'opacity-75 hover:opacity-100'
            }`}
          >
            All ({totalCount})
          </button>

          <button
            onClick={() => handleViewedFilterChange('not_viewed')}
            style={{
              backgroundColor: 'transparent',
              borderColor: filters.viewedFilter === 'not_viewed' ? '#000000' : 'transparent',
              borderWidth: filters.viewedFilter === 'not_viewed' ? '2px' : '1px',
              borderStyle: 'solid',
              color: '#000000',
            }}
            className={`liquid-hover px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all text-black cursor-pointer ${
              filters.viewedFilter === 'not_viewed' ? 'shadow-sm' : 'opacity-75 hover:opacity-100'
            }`}
          >
            <EyeOff className="w-3.5 h-3.5 text-black stroke-[2.5]" />
            <span>Not Viewed ({unviewedCount})</span>
          </button>

          <button
            onClick={() => handleViewedFilterChange('viewed')}
            style={{
              backgroundColor: 'transparent',
              borderColor: filters.viewedFilter === 'viewed' ? '#000000' : 'transparent',
              borderWidth: filters.viewedFilter === 'viewed' ? '2px' : '1px',
              borderStyle: 'solid',
              color: '#000000',
            }}
            className={`liquid-hover px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all text-black cursor-pointer ${
              filters.viewedFilter === 'viewed' ? 'shadow-sm' : 'opacity-75 hover:opacity-100'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-black stroke-[2.5]" />
            <span>Viewed ({viewedCount})</span>
          </button>
        </div>
      </div>

      {/* 2. Instant Search Bar (Placed BELOW with increased spacing) */}
      <div className="relative w-full pt-1">
        <style>{`
          .search-input-black::placeholder {
            color: #52525b !important;
            -webkit-text-fill-color: #52525b !important;
            opacity: 1 !important;
            font-weight: 600 !important;
          }
          .search-input-black::-webkit-input-placeholder {
            color: #52525b !important;
            -webkit-text-fill-color: #52525b !important;
            opacity: 1 !important;
            font-weight: 600 !important;
          }
        `}</style>
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-black">
          <Search className="w-4 h-4 text-black stroke-[2.5]" />
        </div>
        <input
          type="text"
          value={filters.searchQuery}
          onChange={handleSearchChange}
          placeholder="Search username (e.g. 'manuroszonero')..."
          className="search-input-black w-full pl-10 pr-11 py-2.5 rounded-2xl text-sm font-mono font-bold transition-all"
        />
        {filters.searchQuery && (
          <button
            type="button"
            onClick={handleClearSearch}
            style={{ backgroundColor: 'transparent', border: 'none', background: 'transparent' }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center justify-center text-black hover:opacity-80 transition-opacity cursor-pointer bg-transparent border-0 outline-none"
            title="Clear search"
          >
            <div
              style={{ backgroundColor: 'transparent', border: '1px solid #000000' }}
              className="liquid-hover w-6 h-6 rounded-lg flex items-center justify-center text-black shadow-sm"
            >
              <X className="w-3.5 h-3.5 text-black stroke-[2.5]" />
            </div>
          </button>
        )}
      </div>
    </div>
  );
};
