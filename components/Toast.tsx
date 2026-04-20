"use client";

import { useEffect, useState } from "react";

export type ToastType = 'success' | 'error';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type, onClose, duration = 4000 }: ToastProps) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const step = 100 / (duration / 10);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(interval);
          onClose();
          return 0;
        }
        return prev - step;
      });
    }, 10);

    return () => clearInterval(interval);
  }, [duration, onClose]);

  const isSuccess = type === 'success';

  return (
    <div className="fixed top-6 right-6 z-[9999] animate-in slide-in-from-right-full fade-in duration-300">
      <div className="relative bg-white border border-slate-200 rounded-2xl shadow-2xl shadow-slate-200/50 p-5 flex items-center gap-4 min-w-[320px] overflow-hidden">
        {/* Icon */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
          isSuccess ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
        }`}>
          {isSuccess ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )}
        </div>

        {/* Content */}
        <div className="flex-1">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-0.5">
            {isSuccess ? 'Success' : 'Attention'}
          </p>
          <p className="text-sm font-bold text-slate-700 leading-tight">
            {message}
          </p>
        </div>

        {/* Close */}
        <button 
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 transition-colors p-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 h-1 bg-slate-100 w-full">
          <div 
            className={`h-full transition-all linear ${isSuccess ? 'bg-emerald-500' : 'bg-rose-500'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
