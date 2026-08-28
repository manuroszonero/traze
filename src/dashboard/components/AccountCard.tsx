import React from 'react';
import { InstagramAccount, AccountCategory } from '../../types/instagram';
import { openInstagramProfile } from '../../lib/utils';
import { ExternalLink, Calendar, Eye } from '../../lib/icons';

interface AccountCardProps {
  account: InstagramAccount;
  category?: AccountCategory;
  onMarkViewed: (username: string, isViewed: boolean) => void;
}

export const AccountCard: React.FC<AccountCardProps> = ({
  account,
  onMarkViewed,
}) => {
  const isViewed = !!account.isViewed;

  const handleCardClick = () => {
    // 1. Immediately mark as viewed
    onMarkViewed(account.username, true);
    // 2. Open Instagram profile in new tab
    openInstagramProfile(account.username);
  };

  const handleToggleViewed = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMarkViewed(account.username, !isViewed);
  };

  // 2-letter monogram initials for sleek visual identity
  const initials = account.username.replace(/[^a-zA-Z0-9]/g, '').slice(0, 2).toUpperCase() || 'IG';

  const borderColor = '#000000';
  const textColor = '#000000';
  const dateColor = 'rgba(0, 0, 0, 0.7)';
  const avatarBg = isViewed ? 'rgba(0, 0, 0, 0.08)' : 'transparent';

  return (
    <div
      onClick={handleCardClick}
      style={{
        backgroundColor: 'transparent',
        borderColor: borderColor,
        borderWidth: '1.5px',
        borderStyle: 'solid',
        color: textColor,
      }}
      className={`liquid-hover group relative p-3.5 sm:p-4 rounded-3xl cursor-pointer flex items-center justify-between gap-2.5 select-none shadow-sm transition-all ${
        isViewed ? 'card-viewed' : 'card-unviewed'
      }`}
    >
      {/* Left: Monogram Icon + Username + Follow Date */}
      <div className="flex items-center space-x-3 min-w-0 flex-1 overflow-hidden relative z-10">
        <div
          style={{
            backgroundColor: avatarBg,
            borderColor: borderColor,
            borderWidth: '1px',
            borderStyle: 'solid',
            color: textColor,
          }}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center font-mono font-bold text-xs flex-shrink-0 transition-all text-black"
        >
          {initials}
        </div>
        <div className="min-w-0 flex-1 overflow-hidden">
          <div
            style={{ color: textColor }}
            className="font-mono font-bold text-xs sm:text-sm flex items-center gap-1 min-w-0 overflow-hidden text-black"
          >
            <div className="relative inline-flex items-center min-w-0 max-w-full">
              <span
                style={{ color: textColor }}
                className={`truncate min-w-0 block font-extrabold text-black transition-opacity duration-200 ${
                  isViewed ? 'opacity-65' : 'opacity-100'
                }`}
                title={`@${account.username}`}
              >
                @{account.username}
              </span>

              {/* Realistic Hand-Drawn Scribble Strikethrough when Viewed */}
              {isViewed && (
                <svg
                  viewBox="0 0 200 16"
                  preserveAspectRatio="none"
                  className="animate-scribble absolute -left-1 -right-1 top-1/2 -translate-y-1/2 w-[calc(100%+8px)] h-4 pointer-events-none select-none z-20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M 2,9.5 C 30,7.5 75,10.2 135,8.8 C 165,8.1 190,9.2 198,8.2 M 198,8.2 C 160,7 100,6.2 5,11 M 5,11 C 45,9.8 110,9.2 195,8 M 195,8 C 150,9.5 90,8.2 2,10 M 2,10 C 60,7.2 140,8.8 199,9"
                    stroke="#000000"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>

            <ExternalLink
              style={{ color: textColor }}
              className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-black transition-all flex-shrink-0"
            />
          </div>

          {account.formattedDate && (
            <div
              style={{ color: dateColor }}
              className="viewed-date text-[10px] sm:text-[11px] font-mono flex items-center gap-1 mt-0.5 truncate font-semibold"
            >
              <Calendar
                style={{ color: dateColor }}
                className="w-3 h-3 flex-shrink-0 opacity-75"
              />
              <span style={{ color: dateColor }} className="truncate">
                Followed {account.formattedDate}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Right: Transparent Viewed Status Toggle Button */}
      <div className="flex items-center space-x-2 flex-shrink-0 ml-1.5 relative z-10" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={handleToggleViewed}
          style={{
            backgroundColor: isViewed ? 'rgba(0, 0, 0, 0.08)' : 'transparent',
            borderColor: '#000000',
            borderWidth: '1.5px',
            borderStyle: 'solid',
            color: textColor,
          }}
          className="liquid-hover px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer shadow-sm text-black"
          title={isViewed ? 'Click to mark as Not Viewed' : 'Click to mark as Viewed'}
        >
          <Eye style={{ color: textColor }} className="w-3.5 h-3.5 flex-shrink-0 stroke-[2.2] text-black" />
          <span style={{ color: textColor }} className="whitespace-nowrap font-bold text-black">
            {isViewed ? 'Viewed' : 'Mark Viewed'}
          </span>
        </button>
      </div>
    </div>
  );
};
