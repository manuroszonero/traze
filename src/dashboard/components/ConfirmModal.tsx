import React from 'react';
import { AlertTriangle } from '../../lib/icons';

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = true,
  onConfirm,
  onCancel,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div
        style={{
          backgroundColor: 'transparent',
          border: '1px solid rgba(0, 0, 0, 0.2)',
          backdropFilter: 'blur(24px)',
        }}
        className="w-full max-w-md rounded-3xl shadow-2xl p-6 space-y-5"
      >
        <div className="flex items-start space-x-3.5">
          <div
            style={{ backgroundColor: 'transparent', border: '1px solid rgba(0, 0, 0, 0.2)' }}
            className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 text-slate-900 shadow-sm"
          >
            <AlertTriangle className="w-5 h-5" />
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-950">{title}</h3>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">{message}</p>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-2.5 pt-2">
          <button
            onClick={onCancel}
            style={{ backgroundColor: 'transparent', border: '1px solid rgba(0, 0, 0, 0.2)' }}
            className="px-4 py-2.5 rounded-2xl hover:bg-black/5 text-xs text-slate-900 font-bold transition-all shadow-sm active:scale-95"
          >
            {cancelLabel}
          </button>

          <button
            onClick={onConfirm}
            style={{
              backgroundColor: 'transparent',
              border: isDestructive ? '2px solid #b91c1c' : '2px solid #0f172a',
              color: isDestructive ? '#b91c1c' : '#0f172a',
            }}
            className="px-4 py-2.5 rounded-2xl text-xs font-extrabold hover:bg-black/5 transition-all active:scale-95 shadow-sm"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
