import React, { useState, useMemo } from 'react';
import { InstagramAccount, AccountCategory } from '../../types/instagram';
import { AccountCard } from './AccountCard';
import { SearchX, ChevronLeft, ChevronRight, ExternalLink } from '../../lib/icons';

interface AccountListProps {
  accounts: InstagramAccount[];
  category: AccountCategory;
  searchQuery?: string;
  onMarkViewed: (username: string, isViewed: boolean) => void;
  onBatchMarkViewed: (usernames: string[], isViewed: boolean) => void;
  onClearSearch: () => void;
}

export const AccountList: React.FC<AccountListProps> = ({
  accounts,
  category,
  searchQuery = '',
  onMarkViewed,
  onClearSearch,
}) => {
  const [pageSize] = useState<number>(24);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const totalPages = Math.max(1, Math.ceil(accounts.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedAccounts = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return accounts.slice(start, start + pageSize);
  }, [accounts, safePage, pageSize]);

  // Check if the user is searching for creator (requires typing at least 'manurosz')
  const isSearchingCreator = useMemo(() => {
    const q = (searchQuery || '').toLowerCase().trim().replace(/^@/, '');
    return q.startsWith('manurosz');
  }, [searchQuery]);

  const CreatorCard = (
    <div
      style={{ backgroundColor: 'transparent', border: '1.5px solid #000000' }}
      className="liquid-hover p-4 sm:p-5 rounded-3xl mb-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm select-none"
    >
      <div className="flex items-center space-x-3.5">
        <div
          style={{ backgroundColor: 'transparent', border: '1.5px solid #000000' }}
          className="liquid-hover w-12 h-12 rounded-2xl flex items-center justify-center font-mono font-black text-xl flex-shrink-0 text-black shadow-sm select-none"
        >
          M
        </div>
        <div className="space-y-0.5 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <span className="font-mono font-black text-sm sm:text-base text-black">
              @manuroszonero
            </span>
            <span
              style={{ backgroundColor: 'transparent', border: '1px solid #000000' }}
              className="px-2 py-0.5 rounded-full text-[10px] font-mono font-black text-black uppercase tracking-wider"
            >
              Creator
            </span>
          </div>
          <p className="text-xs text-black/80 font-mono font-medium">
            Creator & Developer of TRAZE
          </p>
        </div>
      </div>

      <a
        href="https://www.instagram.com/manuroszonero/"
        target="_blank"
        rel="noreferrer"
        style={{ backgroundColor: 'transparent', border: '1.5px solid #000000', color: '#000000' }}
        className="liquid-hover px-4 py-2.5 rounded-xl text-black no-underline font-mono font-bold text-xs flex items-center space-x-2 transition-all shadow-sm cursor-pointer whitespace-nowrap"
      >
        <span className="text-black font-extrabold">stalk him</span>
        <ExternalLink className="w-3.5 h-3.5 text-black stroke-[2.5]" />
      </a>
    </div>
  );

  if (accounts.length === 0) {
    return (
      <div className="space-y-4">
        {isSearchingCreator && CreatorCard}

        <div
          className="py-16 px-4 text-center rounded-3xl space-y-4 shadow-sm"
          style={{ backgroundColor: 'transparent', border: '1.5px solid #000000' }}
        >
          <div
            className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center text-black shadow-sm"
            style={{ backgroundColor: 'transparent', border: '1.5px solid #000000' }}
          >
            <SearchX className="w-7 h-7 text-black stroke-[2.5]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-black font-mono">
              {isSearchingCreator ? 'No data matches in this export' : 'No accounts found'}
            </h3>
            <p className="text-xs text-black/80 max-w-sm mx-auto font-mono font-medium">
              {isSearchingCreator
                ? '@manuroszonero is not in this export data, but you can visit the creator profile above!'
                : 'No Instagram accounts match your current search query or filter.'}
            </p>
          </div>
          <button
            onClick={onClearSearch}
            style={{ backgroundColor: 'transparent', border: '1.5px solid #000000' }}
            className="liquid-hover px-4 py-2 rounded-2xl text-black text-xs font-mono font-bold transition-all shadow-sm cursor-pointer"
          >
            Clear Search & Filters
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Creator Spotlight card if searched */}
      {isSearchingCreator && CreatorCard}

      {/* Grid of Clean Liquid Glass Account Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
        {paginatedAccounts.map((account) => (
          <AccountCard
            key={account.username.toLowerCase()}
            account={account}
            category={category}
            onMarkViewed={onMarkViewed}
          />
        ))}
      </div>

      {/* Pagination Controls (Solid Black Divider Line & Black Controls) */}
      {totalPages > 1 && (
        <div
          style={{ borderTop: '1.5px solid #000000' }}
          className="flex items-center justify-start gap-2 pt-4"
        >
          <button
            disabled={safePage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            style={{ backgroundColor: 'transparent', border: '1.5px solid #000000' }}
            className="liquid-hover p-2 rounded-xl text-black disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm cursor-pointer"
            title="Previous Page"
          >
            <ChevronLeft className="w-4 h-4 text-black stroke-[2.5]" />
          </button>

          <span
            style={{ backgroundColor: 'transparent', border: '1.5px solid #000000' }}
            className="liquid-hover text-xs font-mono text-black font-bold px-3.5 py-2 rounded-xl shadow-sm cursor-default select-none"
          >
            Page <span className="text-black font-black">{safePage}</span> of {totalPages}
          </span>

          <button
            disabled={safePage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            style={{ backgroundColor: 'transparent', border: '1.5px solid #000000' }}
            className="liquid-hover p-2 rounded-xl text-black disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm cursor-pointer"
            title="Next Page"
          >
            <ChevronRight className="w-4 h-4 text-black stroke-[2.5]" />
          </button>
        </div>
      )}
    </div>
  );
};
