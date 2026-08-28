import React, { useState, useEffect, useRef } from 'react';
import { Palette, Check, X, RotateCcw } from '../../lib/icons';

// 10 Aesthetic Liquid Glass Presets
export const PRESET_COLORS = [
  { name: 'Mist Silver (Default)', hex: '#c1bdc2' },
  { name: 'Slate Gray', hex: '#64748b' },
  { name: 'Crimson Red', hex: '#881337' },
  { name: 'Deep Indigo', hex: '#1e1b4b' },
  { name: 'Ocean Cyan', hex: '#0f172a' },
  { name: 'Forest Emerald', hex: '#064e3b' },
  { name: 'Warm Amber', hex: '#78350f' },
  { name: 'Rose Gold', hex: '#9d174d' },
  { name: 'Velvet Midnight', hex: '#18181b' },
  { name: 'Frost Violet', hex: '#3b0764' },
];

export const DEFAULT_BG = '#c1bdc2';

export const ThemeControl: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [bgColor, setBgColor] = useState<string>(DEFAULT_BG);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 1. Load initial saved color from chrome.storage.local or default
  useEffect(() => {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(['theme_bg_color'], (result) => {
          if (result && result.theme_bg_color) {
            setBgColor(result.theme_bg_color);
            applyBodyBg(result.theme_bg_color);
          } else {
            applyBodyBg(DEFAULT_BG);
          }
        });
      } else {
        const saved = localStorage.getItem('traze_bg_color');
        if (saved) {
          setBgColor(saved);
          applyBodyBg(saved);
        } else {
          applyBodyBg(DEFAULT_BG);
        }
      }
    } catch {
      applyBodyBg(DEFAULT_BG);
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const applyBodyBg = (hex: string) => {
    document.body.style.backgroundColor = hex;
    document.documentElement.style.backgroundColor = hex;
    const root = document.getElementById('root');
    if (root) {
      root.style.backgroundColor = hex;
    }
  };

  const applyColor = (hex: string) => {
    setBgColor(hex);
    applyBodyBg(hex);

    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ theme_bg_color: hex });
      } else {
        localStorage.setItem('traze_bg_color', hex);
      }
    } catch {
      // ignore
    }
  };

  const handleHexInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setBgColor(val);
    if (/^#[0-9A-Fa-f]{6}$/.test(val) || /^#[0-9A-Fa-f]{3}$/.test(val)) {
      applyColor(val);
    }
  };

  const handleReset = () => {
    applyColor(DEFAULT_BG);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Liquid Glass Header Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          backgroundColor: 'transparent',
          border: isOpen ? '2px solid #0f172a' : '1px solid rgba(0, 0, 0, 0.2)',
        }}
        className="px-3 py-2 rounded-2xl text-xs font-bold text-slate-900 flex items-center space-x-2 hover:bg-black/5 transition-all duration-200 active:scale-95 shadow-sm"
        title="Customize Background Color Theme"
      >
        <span className="hidden sm:inline">Theme</span>
        <span
          className="w-3.5 h-3.5 rounded-full border border-slate-700/40 flex-shrink-0 shadow-sm"
          style={{ backgroundColor: bgColor }}
        />
      </button>

      {/* Floating Control Panel Popover */}
      {isOpen && (
        <div
          style={{
            backgroundColor: 'transparent',
            border: '1px solid rgba(0, 0, 0, 0.2)',
            backdropFilter: 'blur(24px)',
          }}
          className="absolute right-0 mt-2 w-72 sm:w-80 rounded-3xl shadow-2xl p-4 z-50 animate-fade-in space-y-4"
        >
          {/* Header */}
          <div
            style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}
            className="flex items-center justify-between pb-2.5"
          >
            <div className="flex items-center space-x-2">
              <Palette className="w-4 h-4 text-slate-800" />
              <h3 className="font-bold text-xs text-slate-950 uppercase tracking-wider">
                Background Theme
              </h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{ backgroundColor: 'transparent', border: '1px solid rgba(0, 0, 0, 0.2)' }}
              className="w-6 h-6 rounded-lg text-slate-700 hover:text-slate-950 flex items-center justify-center transition-colors shadow-sm"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Color Picker Control */}
          <div className="space-y-2">
            <label className="text-[11px] font-mono font-bold text-slate-800 block">Custom Color:</label>
            <div className="flex items-center space-x-2.5">
              <div
                style={{ border: '2px solid rgba(0, 0, 0, 0.2)' }}
                className="relative w-10 h-10 rounded-xl overflow-hidden shadow-sm flex-shrink-0 cursor-pointer group"
              >
                <input
                  type="color"
                  value={bgColor.startsWith('#') && bgColor.length === 7 ? bgColor : DEFAULT_BG}
                  onChange={(e) => applyColor(e.target.value)}
                  className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer border-0 p-0 opacity-0"
                />
                <div
                  className="w-full h-full rounded-xl transition-transform group-hover:scale-105"
                  style={{ backgroundColor: bgColor }}
                />
              </div>

              <input
                type="text"
                value={bgColor}
                onChange={handleHexInput}
                placeholder="#c1bdc2"
                style={{ backgroundColor: 'transparent', border: '1px solid rgba(0, 0, 0, 0.2)' }}
                className="flex-1 px-3 py-2 rounded-xl text-xs font-mono font-bold text-slate-950 placeholder-slate-500 focus:border-slate-900 transition-all uppercase"
                maxLength={7}
              />
            </div>
          </div>

          {/* Curated Presets Palette */}
          <div className="space-y-2">
            <label className="text-[11px] font-mono font-bold text-slate-800 block">Preset Palettes:</label>
            <div className="grid grid-cols-5 gap-2">
              {PRESET_COLORS.map((preset) => {
                const isSelected = bgColor.toLowerCase() === preset.hex.toLowerCase();
                return (
                  <button
                    key={preset.name}
                    onClick={() => applyColor(preset.hex)}
                    className={`group relative h-9 rounded-xl border flex items-center justify-center transition-all active:scale-90 shadow-sm ${
                      isSelected
                        ? 'border-slate-950 ring-2 ring-slate-900/50 scale-105'
                        : 'border-black/20 hover:scale-105'
                    }`}
                    style={{ backgroundColor: preset.hex }}
                    title={preset.name}
                  >
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-white shadow-sm border border-black/20" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reset Button */}
          <div
            style={{ borderTop: '1px solid rgba(0, 0, 0, 0.12)' }}
            className="pt-2 flex justify-end"
          >
            <button
              onClick={handleReset}
              style={{ backgroundColor: 'transparent', border: '1px solid rgba(0, 0, 0, 0.2)' }}
              className="px-3 py-1.5 rounded-xl hover:bg-black/5 text-slate-900 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Default</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
