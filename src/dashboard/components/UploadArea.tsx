import React, { useState, useRef } from 'react';
import { ParseProgress } from '../../types/instagram';
import { UploadCloud, FileArchive, CheckCircle2, AlertTriangle, ChevronDown, ChevronUp, Sparkles, HelpCircle, ArrowRight, X } from '../../lib/icons';

interface UploadAreaProps {
  onFileSelected: (file: File) => void;
  progress: ParseProgress | null;
  onLoadDemoData: () => void;
  onCancel?: () => void;
  hasExistingAnalysis?: boolean;
}

export const UploadArea: React.FC<UploadAreaProps> = ({
  onFileSelected,
  progress,
  onLoadDemoData,
  onCancel,
  hasExistingAnalysis,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);
  const [showErrorDetails, setShowErrorDetails] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.name.toLowerCase().endsWith('.zip') || file.type.includes('zip')) {
        onFileSelected(file);
      } else {
        alert('Please drop a valid Instagram data export .zip file.');
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      onFileSelected(file);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const isProcessing = progress && progress.stage !== 'idle' && progress.stage !== 'error';
  const isError = progress && progress.stage === 'error';

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-fade-in">
      <input
        ref={fileInputRef}
        type="file"
        accept=".zip,application/zip,application/x-zip-compressed"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Cancel button if user already has an active analysis */}
      {hasExistingAnalysis && onCancel && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onCancel}
            style={{ backgroundColor: 'transparent', border: '1.5px solid #000000' }}
            className="liquid-hover px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold text-black flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <X className="w-3.5 h-3.5 text-black stroke-[2.5]" />
            <span>Cancel & Back to Dashboard</span>
          </button>
        </div>
      )}

      {/* Main Drag and Drop Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={!isProcessing ? triggerFileInput : undefined}
        style={{
          backgroundColor: 'transparent',
          border: isDragging ? '2px dashed #000000' : '1.5px dashed #000000',
        }}
        className="relative p-8 sm:p-12 rounded-3xl transition-all duration-300 flex flex-col items-center justify-center text-center cursor-pointer overflow-hidden shadow-sm"
      >
        {isProcessing ? (
          <div className="space-y-6 w-full max-w-md relative z-10">
            <div
              style={{ backgroundColor: 'transparent', border: '1.5px solid #000000' }}
              className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-black shadow-sm"
            >
              <div className="w-8 h-8 border-3 border-black/30 border-t-black rounded-full animate-spin" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-extrabold text-black font-mono">Analyzing your Instagram data...</h3>
              <p className="text-xs text-black/80 font-mono font-medium">{progress.message}</p>
            </div>

            <div className="w-full h-2 bg-black/10 rounded-full overflow-hidden border border-black/20">
              <div
                className="h-full bg-black transition-all duration-300"
                style={{ width: `${progress.percent}%` }}
              />
            </div>

            <div
              style={{ backgroundColor: 'transparent', border: '1.5px solid #000000' }}
              className="space-y-2 text-left p-4 rounded-2xl text-xs font-mono shadow-sm"
            >
              <div className="flex items-center space-x-2 text-black font-bold">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-black" />
                <span>ZIP archive loaded</span>
              </div>
              <div className={`flex items-center space-x-2 ${progress.percent >= 35 ? 'text-black font-bold' : 'text-black/40'}`}>
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>Scanning followers & following files</span>
              </div>
              {progress.followersFound !== undefined && (
                <div className="flex items-center space-x-2 text-black font-bold">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{progress.followersFound.toLocaleString()} followers extracted</span>
                </div>
              )}
              {progress.followingFound !== undefined && (
                <div className="flex items-center space-x-2 text-black font-bold">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{progress.followingFound.toLocaleString()} following extracted</span>
                </div>
              )}
              <div className={`flex items-center space-x-2 ${progress.percent >= 85 ? 'text-black font-bold' : 'text-black/40'}`}>
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>Comparing account sets</span>
              </div>
            </div>
          </div>
        ) : isError ? (
          <div className="space-y-4 relative z-10">
            <div
              style={{ backgroundColor: 'transparent', border: '1.5px solid #000000' }}
              className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center text-rose-600 shadow-sm"
            >
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-rose-600 font-mono">We couldn't analyze this file</h3>
              <p className="text-xs text-black/80 max-w-md mx-auto leading-relaxed font-mono font-medium">
                {progress.message}
              </p>
            </div>

            {progress.errorDetails && (
              <div className="text-left">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowErrorDetails(!showErrorDetails);
                  }}
                  className="text-[11px] text-black hover:opacity-75 flex items-center gap-1 font-mono mx-auto font-bold"
                >
                  <span>Technical details</span>
                  {showErrorDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
                {showErrorDetails && (
                  <pre
                    style={{ backgroundColor: 'transparent', border: '1.5px solid #000000' }}
                    className="mt-2 p-3 rounded-xl text-[10px] text-rose-600 font-mono overflow-x-auto max-w-md shadow-sm"
                  >
                    {progress.errorDetails}
                  </pre>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                triggerFileInput();
              }}
              style={{ backgroundColor: 'transparent', border: '1.5px solid #000000' }}
              className="liquid-hover mt-2 px-5 py-2.5 rounded-2xl text-black font-mono text-xs font-extrabold shadow-sm cursor-pointer"
            >
              Select Another ZIP File
            </button>
          </div>
        ) : (
          <div className="space-y-4 relative z-10">
            <div
              style={{ backgroundColor: 'transparent', border: '1.5px solid #000000' }}
              className="liquid-hover w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-black shadow-sm group-hover:scale-105 transition-transform"
            >
              <UploadCloud className="w-8 h-8 text-black stroke-[2.2]" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-extrabold text-black font-mono">
                Drop your Instagram data export ZIP here
              </h3>
            </div>

            <div className="pt-2">
              <span
                style={{ backgroundColor: 'transparent', border: '1.5px solid #000000' }}
                className="liquid-hover inline-flex items-center space-x-2 px-6 py-3 rounded-2xl text-black font-mono font-extrabold text-xs shadow-sm cursor-pointer"
              >
                <FileArchive className="w-4 h-4 text-black stroke-[2.5]" />
                <span>SELECT ZIP FILE</span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Alternative Options / How To */}
      <div className="flex items-center justify-center text-xs text-black font-mono w-full">
        <button
          type="button"
          onClick={() => setShowHowTo(!showHowTo)}
          style={{ backgroundColor: 'transparent', border: '1.5px solid #000000', background: 'transparent' }}
          className="liquid-hover px-4 py-2 rounded-xl text-black font-bold flex items-center space-x-2 shadow-sm cursor-pointer"
        >
          <HelpCircle className="w-4 h-4 text-black stroke-[2.5]" />
          <span>How to download your Instagram data?</span>
          {showHowTo ? <ChevronUp className="w-4 h-4 text-black stroke-[2.5]" /> : <ChevronDown className="w-4 h-4 text-black stroke-[2.5]" />}
        </button>
      </div>

      {/* How to Guide Accordion */}
      {showHowTo && (
        <div
          style={{ backgroundColor: 'transparent', border: '1.5px solid #000000' }}
          className="p-6 sm:p-7 rounded-2xl space-y-4 text-xs text-black font-mono shadow-sm animate-fade-in"
        >
          <h4 className="font-extrabold text-sm text-black">
            How to export your data from Instagram:
          </h4>
          <ol className="list-decimal pl-6 sm:pl-7 space-y-3 text-black font-medium leading-relaxed">
            <li className="pl-1.5">
              <strong>Log in to Instagram on this desktop first</strong> — to make it easier.
            </li>
            <li className="pl-1.5">
              <strong>Open Instagram or go to{' '}
              <a
                href="https://accountscenter.instagram.com"
                target="_blank"
                rel="noreferrer"
                className="underline hover:opacity-75 font-bold"
              >
                Meta Accounts Center
              </a></strong>
            </li>
            <li className="pl-1.5">
              <strong>Navigate to Your information and permissions &rarr; Download your information</strong>
            </li>
            <li className="pl-1.5">
              <strong>Choose Download or transfer information &rarr; Some of your information</strong>
            </li>
            <li className="pl-1.5">
              <strong>Scroll down and select Followers and following</strong>
            </li>
            <li className="pl-1.5">
              <strong>Select Download to device &rarr; Format: JSON or HTML &rarr; Date range: All time</strong>
            </li>
            <li className="pl-1.5">
              <strong>Once Meta emails you the link, download the .ZIP file and drop it here!</strong>
            </li>
          </ol>
        </div>
      )}
    </div>
  );
};
