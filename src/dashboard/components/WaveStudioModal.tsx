import React, { useState, useEffect, useRef } from 'react';
import { X, RotateCcw, Sliders, Sparkles } from '../../lib/icons';

export interface WaveSettings {
  canvasBg: string;
  horizonColor: string;
  waveColor: string;
  crestColor: string;
  speed: number;
  amplitude: number;
  waveScale: number;
  waveRatio: number;
  swell: number;
  turbulence: number;
  tilt: number;
  zoom: number;
  height: number;
  fogDepth: number;
  detail: 'low' | 'medium' | 'high';
  brightness: number;
  opacity: number;
  grain: boolean;
  grainIntensity: number;
  mouseInteraction: boolean;
  parallaxStrength: number;
}

export interface TypographySettings {
  primaryTextColor: string;
  secondaryTextColor: string;
  accentTextColor: string;
  viewedCardBg: string;
  viewedCardText: string;
  unviewedCardText: string;
  unviewedCardBorder: string;
  headingWeight: string;
  bodyWeight: string;
  letterSpacing: string;
  fontScale: number; // in %
}

export const DEFAULT_WAVE_SETTINGS: WaveSettings = {
  canvasBg: '#fac7ff',
  horizonColor: '#000000',
  waveColor: '#000000',
  crestColor: '#050000',
  speed: 0.6,
  amplitude: 2.7,
  waveScale: 0.55,
  waveRatio: 0.8,
  swell: 52,
  turbulence: 20,
  tilt: 1.11,
  zoom: 1.25,
  height: 1.9,
  fogDepth: 18,
  detail: 'medium',
  brightness: 1.0,
  opacity: 0.55,
  grain: true,
  grainIntensity: 0.2,
  mouseInteraction: true,
  parallaxStrength: 0.7,
};

export const DEFAULT_TYPOGRAPHY_SETTINGS: TypographySettings = {
  primaryTextColor: '#000000',
  secondaryTextColor: '#000000',
  accentTextColor: '#000000',
  viewedCardBg: 'transparent',
  viewedCardText: '#000000',
  unviewedCardText: '#000000',
  unviewedCardBorder: '#000000',
  headingWeight: '800',
  bodyWeight: '500',
  letterSpacing: '0px',
  fontScale: 100,
};

export const WAVE_PRESETS: { name: string; settings: Partial<WaveSettings> }[] = [
  {
    name: 'Electric Purple (Default)',
    settings: {
      canvasBg: '#120f17',
      horizonColor: '#5227FF',
      waveColor: '#FF9FFC',
      crestColor: '#FFFFFF',
      speed: 0.4,
      amplitude: 2.5,
      zoom: 1.0,
      turbulence: 20,
    },
  },
  {
    name: 'Monochrome Silver',
    settings: {
      canvasBg: '#09090b',
      horizonColor: '#ffffff',
      waveColor: '#a1a1aa',
      crestColor: '#ffffff',
      speed: 0.35,
      amplitude: 2.2,
      zoom: 0.8,
      turbulence: 60,
    },
  },
  {
    name: 'Sunset Cyber',
    settings: {
      canvasBg: '#180728',
      horizonColor: '#f43f5e',
      waveColor: '#fb923c',
      crestColor: '#fef08a',
      speed: 0.45,
      amplitude: 2.8,
      zoom: 1.1,
      turbulence: 25,
    },
  },
  {
    name: 'Neon Emerald',
    settings: {
      canvasBg: '#022c22',
      horizonColor: '#059669',
      waveColor: '#34d399',
      crestColor: '#a7f3d0',
      speed: 0.35,
      amplitude: 2.0,
      zoom: 1.0,
      turbulence: 15,
    },
  },
  {
    name: 'Deep Ocean Cyan',
    settings: {
      canvasBg: '#030712',
      horizonColor: '#0284c7',
      waveColor: '#38bdf8',
      crestColor: '#bae6fd',
      speed: 0.4,
      amplitude: 2.6,
      zoom: 1.0,
      turbulence: 30,
    },
  },
];

const ensureHex6 = (color?: string): string => {
  if (!color) return '#ffffff';
  let c = color.trim();
  if (!c.startsWith('#')) c = '#' + c;
  if (c.length === 4) {
    c = '#' + c[1] + c[1] + c[2] + c[2] + c[3] + c[3];
  }
  if (/^#[0-9a-fA-F]{6}$/.test(c)) {
    return c;
  }
  return '#ffffff';
};

interface WaveStudioModalProps {
  settings: WaveSettings;
  typography: TypographySettings;
  onChangeWave: (settings: WaveSettings) => void;
  onChangeTypography: (typography: TypographySettings) => void;
  onClose: () => void;
}

export const WaveStudioModal: React.FC<WaveStudioModalProps> = ({
  settings,
  typography,
  onChangeWave,
  onChangeTypography,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'waves' | 'typography'>('typography');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Scroll to top on tab switch
  const handleTabChange = (tab: 'waves' | 'typography') => {
    setActiveTab(tab);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  };

  const updateWaveProp = <K extends keyof WaveSettings>(key: K, value: WaveSettings[K]) => {
    onChangeWave({
      ...settings,
      [key]: value,
    });
  };

  const updateTypoProp = <K extends keyof TypographySettings>(key: K, value: TypographySettings[K]) => {
    onChangeTypography({
      ...typography,
      [key]: value,
    });
  };

  const handleResetWave = () => {
    onChangeWave(DEFAULT_WAVE_SETTINGS);
  };

  const handleResetTypo = () => {
    onChangeTypography(DEFAULT_TYPOGRAPHY_SETTINGS);
  };

  const applyPreset = (preset: Partial<WaveSettings>) => {
    onChangeWave({
      ...settings,
      ...preset,
    });
  };

  return (
    <aside
      style={{
        position: 'fixed',
        top: '72px',
        left: '20px',
        width: '360px',
        maxWidth: 'calc(100vw - 40px)',
        height: 'calc(100vh - 96px)',
        maxHeight: '760px',
        zIndex: 9999,
        backgroundColor: 'rgba(18, 15, 23, 0.96)',
        border: '1px solid rgba(255, 255, 255, 0.22)',
        borderRadius: '24px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(24px)',
      }}
      className="flex flex-col text-white animate-fade-in overflow-hidden"
    >
      {/* Top Header */}
      <div
        style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.15)' }}
        className="flex items-center justify-between px-4 py-3.5 flex-shrink-0 bg-white/5"
      >
        <div className="flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-purple-400" />
          <div>
            <h2 className="font-extrabold text-xs sm:text-sm text-white tracking-wide">
              TRAZE Studio
            </h2>
            <p className="text-[10px] text-slate-300 font-medium">Live parameters & colors</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.25)' }}
          className="liquid-hover w-7 h-7 rounded-full flex items-center justify-center text-slate-200 hover:text-white hover:bg-white/20 transition-all cursor-pointer shadow-sm"
          title="Close Studio (Esc)"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Tab Switcher: Waves vs Typography */}
      <div
        style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.12)' }}
        className="px-4 py-2 bg-black/30 flex items-center gap-2 flex-shrink-0"
      >
        <button
          type="button"
          onClick={() => handleTabChange('typography')}
          style={{
            backgroundColor: activeTab === 'typography' ? 'rgba(255, 255, 255, 0.25)' : 'transparent',
            borderColor: activeTab === 'typography' ? 'rgba(255, 255, 255, 0.8)' : 'transparent',
            borderWidth: '1px',
            borderStyle: 'solid',
          }}
          className={`liquid-hover flex-1 py-1 rounded-xl text-xs font-mono font-bold transition-all text-center cursor-pointer ${
            activeTab === 'typography' ? 'text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          ✍️ Typography & Cards
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('waves')}
          style={{
            backgroundColor: activeTab === 'waves' ? 'rgba(255, 255, 255, 0.25)' : 'transparent',
            borderColor: activeTab === 'waves' ? 'rgba(255, 255, 255, 0.8)' : 'transparent',
            borderWidth: '1px',
            borderStyle: 'solid',
          }}
          className={`liquid-hover flex-1 py-1 rounded-xl text-xs font-mono font-bold transition-all text-center cursor-pointer ${
            activeTab === 'waves' ? 'text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          🌊 Waves
        </button>
      </div>

      {/* Settings Body */}
      <div
        ref={scrollContainerRef}
        className="p-4 overflow-y-auto space-y-5 scrollbar-thin scrollbar-thumb-white/20 flex-1"
      >
        {activeTab === 'waves' ? (
          <>
            {/* Presets Bar */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span>Preset Palettes:</span>
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
                {WAVE_PRESETS.map((p) => (
                  <button
                    type="button"
                    key={p.name}
                    onClick={() => applyPreset(p.settings)}
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.2)' }}
                    className="liquid-hover px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold whitespace-nowrap text-slate-200 hover:text-white cursor-pointer"
                  >
                    {p.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* SECTION 1: ATMOSPHERIC COLORS */}
            <div className="space-y-2">
              <h3 className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-300">
                1. Atmospheric Colors
              </h3>

              <div className="grid grid-cols-1 gap-2">
                {/* Canvas BG */}
                <div
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.15)' }}
                  className="p-2 rounded-xl flex items-center justify-between gap-2"
                >
                  <div>
                    <label className="text-xs font-bold text-slate-200 block">Canvas BG</label>
                    <p className="text-[9px] text-slate-400">Background void</p>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <input
                      type="color"
                      value={ensureHex6(settings.canvasBg)}
                      onChange={(e) => updateWaveProp('canvasBg', e.target.value)}
                      className="w-6 h-6 rounded cursor-pointer bg-transparent border border-white/20"
                    />
                    <input
                      type="text"
                      value={settings.canvasBg}
                      onChange={(e) => updateWaveProp('canvasBg', e.target.value)}
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.2)' }}
                      className="w-18 px-1.5 py-0.5 rounded text-[11px] font-mono uppercase text-white"
                      maxLength={7}
                    />
                  </div>
                </div>

                {/* Horizon Color */}
                <div
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.15)' }}
                  className="p-2 rounded-xl flex items-center justify-between gap-2"
                >
                  <div>
                    <label className="text-xs font-bold text-slate-200 block">Horizon Color</label>
                    <p className="text-[9px] text-slate-400">Distant haze fade</p>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <input
                      type="color"
                      value={ensureHex6(settings.horizonColor)}
                      onChange={(e) => updateWaveProp('horizonColor', e.target.value)}
                      className="w-6 h-6 rounded cursor-pointer bg-transparent border border-white/20"
                    />
                    <input
                      type="text"
                      value={settings.horizonColor}
                      onChange={(e) => updateWaveProp('horizonColor', e.target.value)}
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.2)' }}
                      className="w-18 px-1.5 py-0.5 rounded text-[11px] font-mono uppercase text-white"
                      maxLength={7}
                    />
                  </div>
                </div>

                {/* Wave Color */}
                <div
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.15)' }}
                  className="p-2 rounded-xl flex items-center justify-between gap-2"
                >
                  <div>
                    <label className="text-xs font-bold text-slate-200 block">Wave Color</label>
                    <p className="text-[9px] text-slate-400">Rolling wave bodies</p>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <input
                      type="color"
                      value={ensureHex6(settings.waveColor)}
                      onChange={(e) => updateWaveProp('waveColor', e.target.value)}
                      className="w-6 h-6 rounded cursor-pointer bg-transparent border border-white/20"
                    />
                    <input
                      type="text"
                      value={settings.waveColor}
                      onChange={(e) => updateWaveProp('waveColor', e.target.value)}
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.2)' }}
                      className="w-18 px-1.5 py-0.5 rounded text-[11px] font-mono uppercase text-white"
                      maxLength={7}
                    />
                  </div>
                </div>

                {/* Crest Color */}
                <div
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.15)' }}
                  className="p-2 rounded-xl flex items-center justify-between gap-2"
                >
                  <div>
                    <label className="text-xs font-bold text-slate-200 block">Crest Color</label>
                    <p className="text-[9px] text-slate-400">Wave top highlights</p>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <input
                      type="color"
                      value={ensureHex6(settings.crestColor)}
                      onChange={(e) => updateWaveProp('crestColor', e.target.value)}
                      className="w-6 h-6 rounded cursor-pointer bg-transparent border border-white/20"
                    />
                    <input
                      type="text"
                      value={settings.crestColor}
                      onChange={(e) => updateWaveProp('crestColor', e.target.value)}
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.2)' }}
                      className="w-18 px-1.5 py-0.5 rounded text-[11px] font-mono uppercase text-white"
                      maxLength={7}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: WAVE DYNAMICS */}
            <div className="space-y-2.5">
              <h3 className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-300">
                2. Wave Dynamics & Motion
              </h3>

              <div className="space-y-2.5">
                {/* Speed */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-slate-300 font-bold">Speed</span>
                    <span className="text-white font-bold">{settings.speed.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="2.0"
                    step="0.05"
                    value={settings.speed}
                    onChange={(e) => updateWaveProp('speed', parseFloat(e.target.value))}
                    className="w-full accent-purple-400 cursor-pointer h-1.5 bg-white/20 rounded-lg"
                  />
                </div>

                {/* Amplitude */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-slate-300 font-bold">Amplitude</span>
                    <span className="text-white font-bold">{settings.amplitude.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="5.0"
                    step="0.1"
                    value={settings.amplitude}
                    onChange={(e) => updateWaveProp('amplitude', parseFloat(e.target.value))}
                    className="w-full accent-purple-400 cursor-pointer h-1.5 bg-white/20 rounded-lg"
                  />
                </div>

                {/* Wave Scale */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-slate-300 font-bold">Wave Scale</span>
                    <span className="text-white font-bold">{settings.waveScale.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="2.0"
                    step="0.05"
                    value={settings.waveScale}
                    onChange={(e) => updateWaveProp('waveScale', parseFloat(e.target.value))}
                    className="w-full accent-purple-400 cursor-pointer h-1.5 bg-white/20 rounded-lg"
                  />
                </div>

                {/* Wave Ratio */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-slate-300 font-bold">Wave Ratio</span>
                    <span className="text-white font-bold">{settings.waveRatio.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="2.0"
                    step="0.05"
                    value={settings.waveRatio}
                    onChange={(e) => updateWaveProp('waveRatio', parseFloat(e.target.value))}
                    className="w-full accent-purple-400 cursor-pointer h-1.5 bg-white/20 rounded-lg"
                  />
                </div>

                {/* Swell */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-slate-300 font-bold">Swell</span>
                    <span className="text-white font-bold">{settings.swell}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={settings.swell}
                    onChange={(e) => updateWaveProp('swell', parseInt(e.target.value))}
                    className="w-full accent-purple-400 cursor-pointer h-1.5 bg-white/20 rounded-lg"
                  />
                </div>

                {/* Turbulence */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-slate-300 font-bold">Turbulence</span>
                    <span className="text-white font-bold">{settings.turbulence}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={settings.turbulence}
                    onChange={(e) => updateWaveProp('turbulence', parseInt(e.target.value))}
                    className="w-full accent-purple-400 cursor-pointer h-1.5 bg-white/20 rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 3: CAMERA & ATMOSPHERE */}
            <div className="space-y-2.5">
              <h3 className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-300">
                3. Camera & Atmosphere
              </h3>

              <div className="space-y-2.5">
                {/* Zoom */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-slate-300 font-bold">Zoom</span>
                    <span className="text-white font-bold">{settings.zoom.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="3.0"
                    step="0.05"
                    value={settings.zoom}
                    onChange={(e) => updateWaveProp('zoom', parseFloat(e.target.value))}
                    className="w-full accent-purple-400 cursor-pointer h-1.5 bg-white/20 rounded-lg"
                  />
                </div>

                {/* Tilt */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-slate-300 font-bold">Tilt</span>
                    <span className="text-white font-bold">{settings.tilt.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="3.14"
                    step="0.05"
                    value={settings.tilt}
                    onChange={(e) => updateWaveProp('tilt', parseFloat(e.target.value))}
                    className="w-full accent-purple-400 cursor-pointer h-1.5 bg-white/20 rounded-lg"
                  />
                </div>

                {/* Height */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-slate-300 font-bold">Height</span>
                    <span className="text-white font-bold">{settings.height.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="15.0"
                    step="0.1"
                    value={settings.height}
                    onChange={(e) => updateWaveProp('height', parseFloat(e.target.value))}
                    className="w-full accent-purple-400 cursor-pointer h-1.5 bg-white/20 rounded-lg"
                  />
                </div>

                {/* Fog Depth */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-slate-300 font-bold">Fog Depth</span>
                    <span className="text-white font-bold">{settings.fogDepth}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    step="1"
                    value={settings.fogDepth}
                    onChange={(e) => updateWaveProp('fogDepth', parseInt(e.target.value))}
                    className="w-full accent-purple-400 cursor-pointer h-1.5 bg-white/20 rounded-lg"
                  />
                </div>

                {/* Brightness */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-slate-300 font-bold">Brightness</span>
                    <span className="text-white font-bold">{settings.brightness.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="2.0"
                    step="0.05"
                    value={settings.brightness}
                    onChange={(e) => updateWaveProp('brightness', parseFloat(e.target.value))}
                    className="w-full accent-purple-400 cursor-pointer h-1.5 bg-white/20 rounded-lg"
                  />
                </div>

                {/* Opacity */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-slate-300 font-bold">Opacity</span>
                    <span className="text-white font-bold">{settings.opacity.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="1.0"
                    step="0.05"
                    value={settings.opacity}
                    onChange={(e) => updateWaveProp('opacity', parseFloat(e.target.value))}
                    className="w-full accent-purple-400 cursor-pointer h-1.5 bg-white/20 rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 4: EFFECTS & QUALITY */}
            <div className="space-y-2.5">
              <h3 className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-300">
                4. Effects & Quality
              </h3>

              <div className="space-y-2.5">
                {/* Detail Tier */}
                <div className="space-y-1">
                  <label className="text-[11px] font-mono font-bold text-slate-300 block">Shader Detail:</label>
                  <div className="flex rounded-xl overflow-hidden border border-white/20 p-0.5">
                    {(['low', 'medium', 'high'] as const).map((tier) => (
                      <button
                        type="button"
                        key={tier}
                        onClick={() => updateWaveProp('detail', tier)}
                        style={{
                          backgroundColor: settings.detail === tier ? 'rgba(255, 255, 255, 0.25)' : 'transparent',
                        }}
                        className={`flex-1 py-0.5 rounded text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${
                          settings.detail === tier ? 'text-white shadow-sm' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {tier}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cursor Parallax */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-300 font-bold">Cursor Parallax</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.mouseInteraction}
                        onChange={(e) => updateWaveProp('mouseInteraction', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-8 h-4 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-purple-600" />
                    </label>
                  </div>
                  {settings.mouseInteraction && (
                    <div className="space-y-1 pt-0.5">
                      <div className="flex justify-between text-[10px] font-mono text-slate-400">
                        <span>Parallax Strength</span>
                        <span>{settings.parallaxStrength.toFixed(2)}</span>
                      </div>
                      <input
                        type="range"
                        min="0.0"
                        max="2.0"
                        step="0.05"
                        value={settings.parallaxStrength}
                        onChange={(e) => updateWaveProp('parallaxStrength', parseFloat(e.target.value))}
                        className="w-full accent-purple-400 cursor-pointer h-1.5 bg-white/20 rounded-lg"
                      />
                    </div>
                  )}
                </div>

                {/* Film Grain */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-300 font-bold">Film Grain</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.grain}
                        onChange={(e) => updateWaveProp('grain', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-8 h-4 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-purple-600" />
                    </label>
                  </div>
                  {settings.grain && (
                    <div className="space-y-1 pt-0.5">
                      <div className="flex justify-between text-[10px] font-mono text-slate-400">
                        <span>Grain Intensity</span>
                        <span>{settings.grainIntensity.toFixed(2)}</span>
                      </div>
                      <input
                        type="range"
                        min="0.0"
                        max="0.2"
                        step="0.01"
                        value={settings.grainIntensity}
                        onChange={(e) => updateWaveProp('grainIntensity', parseFloat(e.target.value))}
                        className="w-full accent-purple-400 cursor-pointer h-1.5 bg-white/20 rounded-lg"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          /* TYPOGRAPHY & CARD COLOR STUDIO TAB */
          <div className="space-y-5 animate-fade-in">
            {/* SECTION 1: VIEWED & UNVIEWED CARD COLORS (TOP) */}
            <div className="space-y-2">
              <h3 className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-300">
                1. Viewed & Unviewed Card Colors
              </h3>

              <div className="grid grid-cols-1 gap-2">
                {/* Viewed Card BG */}
                <div
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.15)' }}
                  className="p-2.5 rounded-xl flex items-center justify-between"
                >
                  <div>
                    <label className="text-xs font-bold text-slate-200 block">Viewed Card BG</label>
                    <p className="text-[9px] text-slate-400">Card background for viewed accounts</p>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <input
                      type="color"
                      value={ensureHex6(typography.viewedCardBg)}
                      onChange={(e) => updateTypoProp('viewedCardBg', e.target.value)}
                      className="w-7 h-7 rounded cursor-pointer bg-transparent border border-white/20"
                    />
                    <input
                      type="text"
                      value={typography.viewedCardBg}
                      onChange={(e) => updateTypoProp('viewedCardBg', e.target.value)}
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.2)' }}
                      className="w-18 px-1.5 py-0.5 rounded text-[11px] font-mono uppercase text-white font-bold"
                      maxLength={7}
                    />
                  </div>
                </div>

                {/* Viewed Card Text */}
                <div
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.15)' }}
                  className="p-2.5 rounded-xl flex items-center justify-between"
                >
                  <div>
                    <label className="text-xs font-bold text-slate-200 block">Viewed Card Text</label>
                    <p className="text-[9px] text-slate-400">Text & badge inside viewed cards</p>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <input
                      type="color"
                      value={ensureHex6(typography.viewedCardText)}
                      onChange={(e) => updateTypoProp('viewedCardText', e.target.value)}
                      className="w-7 h-7 rounded cursor-pointer bg-transparent border border-white/20"
                    />
                    <input
                      type="text"
                      value={typography.viewedCardText}
                      onChange={(e) => updateTypoProp('viewedCardText', e.target.value)}
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.2)' }}
                      className="w-18 px-1.5 py-0.5 rounded text-[11px] font-mono uppercase text-white font-bold"
                      maxLength={7}
                    />
                  </div>
                </div>

                {/* Unviewed Card Text */}
                <div
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.15)' }}
                  className="p-2.5 rounded-xl flex items-center justify-between"
                >
                  <div>
                    <label className="text-xs font-bold text-slate-200 block">Unviewed Card Text</label>
                    <p className="text-[9px] text-slate-400">Username text on unviewed cards</p>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <input
                      type="color"
                      value={ensureHex6(typography.unviewedCardText)}
                      onChange={(e) => updateTypoProp('unviewedCardText', e.target.value)}
                      className="w-7 h-7 rounded cursor-pointer bg-transparent border border-white/20"
                    />
                    <input
                      type="text"
                      value={typography.unviewedCardText}
                      onChange={(e) => updateTypoProp('unviewedCardText', e.target.value)}
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.2)' }}
                      className="w-18 px-1.5 py-0.5 rounded text-[11px] font-mono uppercase text-white font-bold"
                      maxLength={7}
                    />
                  </div>
                </div>

                {/* Unviewed Card Border */}
                <div
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.15)' }}
                  className="p-2.5 rounded-xl flex items-center justify-between"
                >
                  <div>
                    <label className="text-xs font-bold text-slate-200 block">Unviewed Card Border</label>
                    <p className="text-[9px] text-slate-400">Outline border on unviewed cards</p>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <input
                      type="color"
                      value={ensureHex6(typography.unviewedCardBorder)}
                      onChange={(e) => updateTypoProp('unviewedCardBorder', e.target.value)}
                      className="w-7 h-7 rounded cursor-pointer bg-transparent border border-white/20"
                    />
                    <input
                      type="text"
                      value={typography.unviewedCardBorder}
                      onChange={(e) => updateTypoProp('unviewedCardBorder', e.target.value)}
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.2)' }}
                      className="w-18 px-1.5 py-0.5 rounded text-[11px] font-mono uppercase text-white font-bold"
                      maxLength={7}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: PAGE TEXT & ACCENT COLORS */}
            <div className="space-y-2">
              <h3 className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-300">
                2. Page & Accent Colors
              </h3>

              <div className="grid grid-cols-1 gap-2">
                {/* Primary Text */}
                <div
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.15)' }}
                  className="p-2.5 rounded-xl flex items-center justify-between"
                >
                  <div>
                    <label className="text-xs font-bold text-slate-200 block">Primary Headings</label>
                    <p className="text-[9px] text-slate-400">Header & main labels</p>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <input
                      type="color"
                      value={ensureHex6(typography.primaryTextColor)}
                      onChange={(e) => updateTypoProp('primaryTextColor', e.target.value)}
                      className="w-7 h-7 rounded cursor-pointer bg-transparent border border-white/20"
                    />
                    <input
                      type="text"
                      value={typography.primaryTextColor}
                      onChange={(e) => updateTypoProp('primaryTextColor', e.target.value)}
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.2)' }}
                      className="w-18 px-1.5 py-0.5 rounded text-[11px] font-mono uppercase text-white font-bold"
                      maxLength={7}
                    />
                  </div>
                </div>

                {/* Secondary Text */}
                <div
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.15)' }}
                  className="p-2.5 rounded-xl flex items-center justify-between"
                >
                  <div>
                    <label className="text-xs font-bold text-slate-200 block">Secondary Subtitles</label>
                    <p className="text-[9px] text-slate-400">Stats, info & details</p>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <input
                      type="color"
                      value={ensureHex6(typography.secondaryTextColor)}
                      onChange={(e) => updateTypoProp('secondaryTextColor', e.target.value)}
                      className="w-7 h-7 rounded cursor-pointer bg-transparent border border-white/20"
                    />
                    <input
                      type="text"
                      value={typography.secondaryTextColor}
                      onChange={(e) => updateTypoProp('secondaryTextColor', e.target.value)}
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.2)' }}
                      className="w-18 px-1.5 py-0.5 rounded text-[11px] font-mono uppercase text-white font-bold"
                      maxLength={7}
                    />
                  </div>
                </div>

                {/* Accent Highlight */}
                <div
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.15)' }}
                  className="p-2.5 rounded-xl flex items-center justify-between"
                >
                  <div>
                    <label className="text-xs font-bold text-slate-200 block">Accent / Active Badges</label>
                    <p className="text-[9px] text-slate-400">Buttons & active tabs</p>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <input
                      type="color"
                      value={ensureHex6(typography.accentTextColor)}
                      onChange={(e) => updateTypoProp('accentTextColor', e.target.value)}
                      className="w-7 h-7 rounded cursor-pointer bg-transparent border border-white/20"
                    />
                    <input
                      type="text"
                      value={typography.accentTextColor}
                      onChange={(e) => updateTypoProp('accentTextColor', e.target.value)}
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.2)' }}
                      className="w-18 px-1.5 py-0.5 rounded text-[11px] font-mono uppercase text-white font-bold"
                      maxLength={7}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 3: FONT WEIGHTS & SCALING */}
            <div className="space-y-2.5">
              <h3 className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-300">
                3. Weight, Sizing & Tracking
              </h3>

              <div className="space-y-2.5">
                {/* Heading Weight */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-slate-300 font-bold">Heading Weight:</span>
                    <span className="text-white font-bold">{typography.headingWeight}</span>
                  </div>
                  <div className="flex rounded-xl overflow-hidden border border-white/20 p-0.5">
                    {['500', '600', '700', '800'].map((w) => (
                      <button
                        type="button"
                        key={w}
                        onClick={() => updateTypoProp('headingWeight', w)}
                        style={{
                          backgroundColor: typography.headingWeight === w ? 'rgba(255, 255, 255, 0.25)' : 'transparent',
                          fontWeight: w,
                        }}
                        className={`flex-1 py-0.5 rounded text-[10px] transition-all cursor-pointer ${
                          typography.headingWeight === w ? 'text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Body Weight */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-slate-300 font-bold">Body Weight:</span>
                    <span className="text-white font-bold">{typography.bodyWeight}</span>
                  </div>
                  <div className="flex rounded-xl overflow-hidden border border-white/20 p-0.5">
                    {['400', '500', '600', '700'].map((w) => (
                      <button
                        type="button"
                        key={w}
                        onClick={() => updateTypoProp('bodyWeight', w)}
                        style={{
                          backgroundColor: typography.bodyWeight === w ? 'rgba(255, 255, 255, 0.25)' : 'transparent',
                          fontWeight: w,
                        }}
                        className={`flex-1 py-0.5 rounded text-[10px] transition-all cursor-pointer ${
                          typography.bodyWeight === w ? 'text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Scale Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-slate-300 font-bold">Font Size Scale</span>
                    <span className="text-white font-bold">{typography.fontScale}%</span>
                  </div>
                  <input
                    type="range"
                    min="85"
                    max="125"
                    step="5"
                    value={typography.fontScale}
                    onChange={(e) => updateTypoProp('fontScale', parseInt(e.target.value))}
                    className="w-full accent-purple-400 cursor-pointer h-1.5 bg-white/20 rounded-lg"
                  />
                </div>

                {/* Letter Spacing */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-slate-300 font-bold">Letter Spacing:</span>
                    <span className="text-white font-bold">{typography.letterSpacing}</span>
                  </div>
                  <div className="flex rounded-xl overflow-hidden border border-white/20 p-0.5">
                    {['-0.5px', '0px', '0.5px', '1px', '2px'].map((ls) => (
                      <button
                        type="button"
                        key={ls}
                        onClick={() => updateTypoProp('letterSpacing', ls)}
                        style={{
                          backgroundColor: typography.letterSpacing === ls ? 'rgba(255, 255, 255, 0.25)' : 'transparent',
                        }}
                        className={`flex-1 py-0.5 rounded text-[10px] font-mono transition-all cursor-pointer ${
                          typography.letterSpacing === ls ? 'text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {ls}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        style={{ borderTop: '1px solid rgba(255, 255, 255, 0.15)' }}
        className="px-4 py-2.5 flex items-center justify-between bg-black/40 flex-shrink-0"
      >
        <button
          type="button"
          onClick={activeTab === 'waves' ? handleResetWave : handleResetTypo}
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.25)' }}
          className="liquid-hover px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer shadow-sm"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>

        <button
          type="button"
          onClick={onClose}
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #ffffff' }}
          className="liquid-hover px-4 py-1 rounded-xl text-xs font-extrabold text-slate-950 hover:bg-white cursor-pointer shadow-sm"
        >
          Done
        </button>
      </div>
    </aside>
  );
};
