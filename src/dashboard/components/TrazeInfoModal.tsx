import React from 'react';
import { X, Instagram, Linkedin, Github } from '../../lib/icons';

interface TrazeInfoModalProps {
  onClose: () => void;
}

export const TrazeInfoModal: React.FC<TrazeInfoModalProps> = ({ onClose }) => {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/15 backdrop-blur-sm animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ backgroundColor: 'transparent', border: '1.5px solid #000000' }}
        className="w-full max-w-lg rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl relative text-black font-mono"
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

        {/* Brand Emblem & Header */}
        <div className="flex flex-col items-center text-center space-y-2.5 pt-1">
          <div
            style={{ backgroundColor: 'transparent', border: '2px solid #000000' }}
            className="liquid-hover w-16 h-16 sm:w-20 sm:h-20 rounded-3xl flex items-center justify-center text-2xl sm:text-3xl font-black text-black shadow-sm select-none"
          >
            T
          </div>

          <div className="space-y-0.5">
            <h3 className="text-xl font-black text-black">TRAZE</h3>
            <p className="text-xs text-black font-mono font-bold">find the culprit</p>
          </div>
        </div>

        {/* About TRAZE Statement Box */}
        <div
          style={{ backgroundColor: 'transparent', border: '1.5px solid #000000' }}
          className="liquid-hover p-4 sm:p-5 rounded-2xl space-y-3 text-xs leading-relaxed text-black shadow-sm cursor-default max-h-[60vh] overflow-y-auto"
        >
          <h4 className="font-bold text-sm text-black">
            What is TRAZE?
          </h4>
          <p className="font-medium text-black/90">
            TRAZE is basically your personal unfollow FBI, but without the corny ahh detective work. Instead of spending 47 business days stalking your followers list like an NPC, just drop your official Instagram data ZIP and let TRAZE absolutely cook.
          </p>
          <p className="font-medium text-black/90">
            It scans your followers and following, does its little sigma calculations, and exposes the people who had you out here followmaxxing while they were never planning to follow back. Diabolical. Unc behavior. Straight up lame.
          </p>
          <p className="font-medium text-black/90">
            No passwords to yoink. No weird ahh logins. No sus API nonsense. No random server farming your data for absolutely no reason. Everything runs locally in your browser, so your data stays yours and the investigation stays between you and TRAZE.
          </p>
          <p className="font-black pt-1 text-black">
            Zero tracking. Zero data yoinking. Maximum aura preservation. The goofy ahh suspects will be located and kirkified.
          </p>

          {/* Solid Black Divider Line */}
          <div style={{ borderTop: '1.5px solid #000000' }} className="w-full my-3" />

          {/* Creator Signature & Social Links */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            <p className="font-black text-black text-xs">
              Developed by <strong>manuroszonero</strong>.
            </p>

            {/* Transparent Social Links (Instagram, LinkedIn, GitHub) */}
            <div className="flex items-center space-x-2">
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
        </div>
      </div>
    </div>
  );
};
