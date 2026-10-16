import React, { useState, useEffect } from 'react';
import { Key, CheckCircle2, AlertCircle, X, ExternalLink, Loader2, Sparkles, ShieldCheck } from 'lucide-react';
import { getGeminiApiKey, setGeminiApiKey, testGeminiApiKey } from '../services/geminiClient';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyUpdated: (hasKey: boolean) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onKeyUpdated }) => {
  const [apiKey, setApiKey] = useState<string>('');
  const [showKey, setShowKey] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setApiKey(getGeminiApiKey());
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    setGeminiApiKey(apiKey.trim());
    onKeyUpdated(Boolean(apiKey.trim()));
    onClose();
  };

  const handleTest = async () => {
    if (!apiKey.trim()) {
      setTestResult({ success: false, message: 'Vui lòng nhập khóa API trước khi kiểm tra.' });
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testGeminiApiKey(apiKey.trim());
      setTestResult(res);
      if (res.success) {
        setGeminiApiKey(apiKey.trim());
        onKeyUpdated(true);
      }
    } finally {
      setIsTesting(false);
    }
  };

  const handleRemove = () => {
    setApiKey('');
    setGeminiApiKey('');
    setTestResult({ success: true, message: 'Đã xóa khóa API. Hệ thống sẽ sử dụng Bộ phân tích tài liệu nội bộ.' });
    onKeyUpdated(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Cài đặt Gemini AI API Key</h2>
              <p className="text-xs text-slate-500">Cấu hình cho Netlify và môi trường máy khách</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Google Gemini API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setTestResult(null);
                }}
                placeholder="AIzaSy..."
                className="w-full text-sm font-mono rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 pr-20 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-500 hover:text-slate-800 px-2 py-1 rounded-md"
              >
                {showKey ? 'Ẩn' : 'Hiện'}
              </button>
            </div>
          </div>

          {/* Test Status feedback */}
          {testResult && (
            <div
              className={`p-3 rounded-lg text-xs flex items-start space-x-2 border ${
                testResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <span className="leading-relaxed">{testResult.message}</span>
            </div>
          )}

          {/* Quick Info Box */}
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 space-y-2 text-xs text-slate-600">
            <div className="flex items-center space-x-1.5 font-semibold text-slate-800">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Hướng dẫn cấu hình trên Netlify:</span>
            </div>
            <ul className="list-disc pl-4 space-y-1 leading-relaxed">
              <li>
                <strong>Cách 1 (Nhanh nhất):</strong> Nhập khóa API tại đây. Khóa sẽ được lưu an toàn trong trình duyệt của bạn (Local Storage) để rà soát trực tiếp.
              </li>
              <li>
                <strong>Cách 2 (Trên Netlify):</strong> Vào <em>Netlify Dashboard &rarr; Site configuration &rarr; Environment variables</em> và tạo biến <code className="bg-slate-200 px-1 py-0.5 rounded text-blue-700">VITE_GEMINI_API_KEY</code>.
              </li>
              <li>
                <strong>Không có API Key?</strong> Ứng dụng vẫn tự động chạy Bộ phân tích đối chiếu tài liệu nội bộ dựa trực tiếp trên tài liệu bạn tải lên.
              </li>
            </ul>

            <div className="pt-1 flex items-center justify-between text-xs text-blue-600">
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1 hover:underline font-medium"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Lấy khóa Gemini API miễn phí tại Google AI Studio</span>
              </a>
              <div className="flex items-center space-x-1 text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Bảo mật</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
          {apiKey.trim() ? (
            <button
              type="button"
              onClick={handleRemove}
              className="text-xs text-rose-600 hover:text-rose-700 font-medium px-2 py-1.5"
            >
              Gỡ bỏ khóa
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleTest}
              disabled={isTesting || !apiKey.trim()}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              {isTesting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Kiểm tra kết nối</span>
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center space-x-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
            >
              <span>Lưu & Áp dụng</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
