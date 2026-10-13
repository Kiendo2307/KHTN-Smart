import React from 'react';
import { Microscope, Sparkles, CheckCircle2, AlertCircle, BookOpen } from 'lucide-react';
import { SubjectField } from '../types';

interface HeaderProps {
  currentSubject?: SubjectField;
  hasApiKey: boolean;
  activeTab: string;
  onNavigate: (tab: string) => void;
  activeSessionTitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  hasApiKey,
  activeTab,
  onNavigate,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-blue-500 flex items-center justify-center text-white shadow-sm ring-2 ring-blue-100">
              <Microscope className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">KHTN Smart Review</span>
                <span className="text-xs bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded-full border border-blue-200">
                  Tổ Tự Nhiên
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Trợ lý rà soát hồ sơ chuyên môn & đối chiếu Phụ lục – Syllabus</p>
            </div>
          </div>



          {/* Right Status Indicators & Actions */}
          <div className="flex items-center space-x-3">
            {/* AI Status Badge */}
            <div
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                hasApiKey
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
              title={
                hasApiKey
                  ? 'Gemini 3.8 Flash AI đã sẵn sàng'
                  : 'Chưa có GEMINI_API_KEY. Bạn vẫn có thể sử dụng chế độ Demo minh họa.'
              }
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">AI Engine:</span>
              <span className="font-semibold">{hasApiKey ? 'Gemini 3.8 Flash' : 'Chế độ Demo'}</span>
              {hasApiKey ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              )}
            </div>

            {/* Quick action to run review */}
            {activeTab !== 'compare' && (
              <button
                onClick={() => onNavigate('compare')}
                className="inline-flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-xs transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Rà soát mới</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
