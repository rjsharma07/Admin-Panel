"use client";

import { useState, useEffect } from "react";
import { uploadPolicyAction } from "@/app/actions/policy";

interface PolicyUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  userId: string;
}

export default function PolicyUploadModal({ isOpen, onClose, onSave, userId }: PolicyUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<any>(null);

  // useEffect to handle parent state updates after successful submission
  useEffect(() => {
    if (successData) {
      onSave(successData);
      onClose();
      // Clear local state
      setSuccessData(null);
    }
  }, [successData, onSave, onClose]);

  // Reset state on open/close
  useEffect(() => {
    if (!isOpen) {
      setFile(null);
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    if (!file || !userId) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", userId);

      // Call the Server Action
      const result = await uploadPolicyAction(formData);

      if (result.success) {
        setSuccessData(result);
      } else {
        setError(result.error || "Failed to upload document.");
      }
    } catch (err: any) {
      setError("An unexpected network error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
        
        {/* Compact Header */}
        <div className="px-6 py-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Upload Policy</h2>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-[11px] font-bold text-red-600 animate-in slide-in-from-top-1">
              {error}
            </div>
          )}
          
          <label className={`block border-2 border-dashed rounded-xl transition-all duration-300 relative ${
            file ? 'border-indigo-200 bg-indigo-50/30 p-5' : 'border-slate-200 bg-slate-50 hover:bg-slate-100 p-10 cursor-pointer'
          }`}>
            {!file ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 text-slate-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-xs font-black text-slate-700">Select Document</p>
                  <p className="text-[10px] text-slate-400 font-bold tracking-tight">PDF or Word</p>
                </div>
                <input 
                  type="file" 
                  onChange={(e) => setFile(e.target.files?.[0] || null)} 
                  className="hidden" 
                  accept=".pdf,.doc,.docx" 
                />
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3 animate-in fade-in zoom-in-95 duration-300">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-100">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="truncate">
                    <p className="text-[11px] font-black text-slate-900 truncate">{file.name}</p>
                    <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Selected</p>
                  </div>
                </div>
                <button 
                  onClick={() => setFile(null)} 
                  className="text-[9px] font-black text-red-500 hover:text-red-700 uppercase tracking-widest px-2"
                >
                  Change
                </button>
              </div>
            )}
          </label>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-5 bg-slate-50/50 border-t border-slate-50 flex justify-end gap-2">
          <button 
            onClick={onClose} 
            disabled={isSubmitting}
            className="px-5 py-2 text-xs font-black text-slate-400 hover:text-slate-700 uppercase tracking-widest"
          >
            Cancel
          </button>
          <button 
            disabled={!file || isSubmitting}
            onClick={handleConfirm}
            className="px-8 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black disabled:opacity-20 flex items-center gap-2 active:scale-95 transition-all shadow-xl shadow-slate-200"
          >
            {isSubmitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Publishing...</span>
              </>
            ) : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}
