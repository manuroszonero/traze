import React from 'react';
import { X, Instagram, Linkedin, Github } from '../../lib/icons';

interface AboutModalProps {
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ onClose }) => {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/15 backdrop-blur-sm animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ backgroundColor: 'transparent', border: '1.5px solid #000000' }}
        className="w-full max-w-md rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative text-black font-mono"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{ backgroundColor: 'transparent', border: '1.5px solid #000000' }}
          className="liquid-hover absolute top-5 right-5 p-2 rounded-xl text-black hover:opacity-75 transition-opacity cursor-pointer shadow-sm"
          title="Close"
        >
          <X className="w-4 h-4 text-black stroke-[2.5]" />
        </button>

        {/* Creator Avatar & Header */}
        <div className="flex flex-col items-center text-center space-y-3 pt-2">
          <div
            style={{ backgroundColor: 'transparent', border: '2px solid #000000' }}
            className="liquid-hover w-20 h-20 rounded-3xl flex items-center justify-center text-3xl font-black text-black shadow-sm select-none"
          >
            M
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-black text-black">manuroszonero</h3>
            <p className="text-xs text-black/70 font-bold">Creator of TRAZE</p>
          </div>

          {/* Transparent Social Links (Instagram, LinkedIn, GitHub) */}
          <div className="flex items-center space-x-2.5 pt-1">
            {/* Instagram */}
            <a
              href="https://www.instagram.com/manuroszonero/"
              target="_blank"
              rel="noreferrer"
              style={{ backgroundColor: 'transparent', border: '1.5px solid #000000', color: '#000000' }}
              className="liquid-hover p-2 rounded-xl text-black hover:opacity-80 transition-all shadow-sm flex items-center justify-center cursor-pointer"
              title="Instagram: @manuroszonero"
            >
              <Instagram className="w-4 h-4 text-black stroke-[2.2]" />
            </a>

            {/* LinkedIn */}
            <a
              href="https://www.linkedin.com/in/manu6767"
              target="_blank"
              rel="noreferrer"
              style={{ backgroundColor: 'transparent', border: '1.5px solid #000000', color: '#000000' }}
              className="liquid-hover p-2 rounded-xl text-black hover:opacity-80 transition-all shadow-sm flex items-center justify-center cursor-pointer"
              title="LinkedIn: manu6767"
            >
              <Linkedin className="w-4 h-4 text-black stroke-[2.2]" />
            </a>

            {/* GitHub */}
            <a
              href="https://github.com/manuroszonero"
              target="_blank"
              rel="noreferrer"
              style={{ backgroundColor: 'transparent', border: '1.5px solid #000000', color: '#000000' }}
              className="liquid-hover p-2 rounded-xl text-black hover:opacity-80 transition-all shadow-sm flex items-center justify-center cursor-pointer"
              title="GitHub"
            >
              <Github className="w-4 h-4 text-black stroke-[2.2]" />
            </a>
          </div>
        </div>

        {/* Bio / About Box */}
        <div
          style={{ backgroundColor: 'transparent', border: '1.5px solid #000000' }}
          className="liquid-hover p-4 sm:p-5 rounded-2xl space-y-3 text-xs leading-relaxed text-black shadow-sm cursor-default"
        >
          <p className="font-bold text-sm">
            Yo, I’m <strong>manuroszonero</strong>.
          </p>
          <p className="font-medium text-black/90">
            I built TRAZE because manually checking who follows you back is NPC behavior. You’re followmaxxing, they’re not following back. Lame.
          </p>
          <p className="font-medium text-black/90">
            Drop your data, let TRAZE cook, and boom — the culprits get kirkified.
          </p>
          <p className="font-medium text-black/90">
            No logins. No passwords. No sketchy ahh nonsense.
          </p>
          <p className="font-black pt-1 text-black">
            You bring the receipts. TRAZE finds the goofy ahh suspects.
          </p>
        </div>
      </div>
    </div>
  );
};
