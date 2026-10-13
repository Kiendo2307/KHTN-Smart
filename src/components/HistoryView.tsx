import React, { useState } from 'react';
import {
  History,
  FileText,
  Calendar,
  Trash2,
  ExternalLink,
  GitCompare,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ShieldCheck,
  Search,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { ReviewSession } from '../types';
import { exportToExcel, exportToWordDoc } from '../utils/exportUtils';

interface HistoryViewProps {
  sessions: ReviewSession[];
  activeSessionId?: string;
  onSelectSession: (session: ReviewSession) => void;
  onDeleteSession: (sessionId: string) => void;
  onStartNewReview: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onDeleteSession,
  onStartNewReview,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');

  // Comparison modal between 2 sessions
  const [compareSessionA, setCompareSessionA] = useState<ReviewSession | null>(null);
  const [compareSessionB, setCompareSessionB] = useState<ReviewSession | null>(null);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState<boolean>(false);

  const filteredSessions = sessions.filter((s) => {
    if (subjectFilter !== 'all' && s.subject !== subjectFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        s.title.toLowerCase().includes(q) ||
        s.scope.toLowerCase().includes(q) ||
        s.subject.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenCompare = (session: ReviewSession) => {
    setCompareSessionA(session);
    // Auto pick another session of the same subject if available, or first other session
    const another = sessions.find((s) => s.id !== session.id && s.subject === session.subject) ||
      sessions.find((s) => s.id !== session.id);
    setCompareSessionB(another || null);
    setIsCompareModalOpen(true);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <History className="w-5 h-5 text-blue-600" />
            <span>Lịch sử rà soát hồ sơ chuyên môn</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý các đợt đối chiếu đã lưu, mở lại kết quả, so sánh các phiên bản và xuất báo cáo lưu trữ
          </p>
        </div>

        <button
          onClick={onStartNewReview}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          + Tạo đợt rà soát mới
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên đợt, môn, chủ đề..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-slate-800"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-medium">Lĩnh vực:</span>
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="text-xs rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-800 font-medium"
          >
            <option value="all">Tất cả môn học</option>
            <option value="Toán">Toán</option>
            <option value="Tin học">Tin học</option>
            <option value="Robotics">Robotics</option>
            <option value="Vật lí">Vật lí</option>
            <option value="Hóa học">Hóa học</option>
            <option value="Sinh học">Sinh học</option>
          </select>
        </div>
      </div>

      {/* Sessions Grid */}
      {filteredSessions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <History className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-700 text-sm">Chưa có đợt rà soát nào trong lịch sử</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Bắt đầu tải lên Phụ lục và Syllabus để thực hiện đối chiếu và lưu trữ kết quả rà soát.
          </p>
          <button
            onClick={onStartNewReview}
            className="bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-blue-700"
          >
            Bắt đầu đợt rà soát đầu tiên
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSessions.map((session) => {
            const isActive = session.id === activeSessionId;
            return (
              <div
                key={session.id}
                className={`bg-white rounded-2xl border p-5 transition-all flex flex-col justify-between ${
                  isActive
                    ? 'border-blue-400 ring-2 ring-blue-100 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-md border border-blue-200">
                        {session.subject} • {session.grade}
                      </span>
                      {isActive && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                          Đang mở
                        </span>
                      )}
                      {session.isDemo && (
                        <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                          Demo
                        </span>
                      )}
                    </div>

                    <span className="text-[11px] text-slate-400 flex items-center space-x-1 shrink-0">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(session.createdAt).toLocaleDateString('vi-VN')}</span>
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base mt-2.5 leading-snug">
                    {session.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                    Phạm vi: {session.scope}
                  </p>

                  {/* Documents & Counts */}
                  <div className="mt-3.5 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-emerald-50/70 p-2 rounded-lg border border-emerald-100">
                      <span className="text-[10.5px] text-emerald-700 block font-medium">Phù hợp</span>
                      <span className="font-bold text-emerald-800 text-sm">
                        {session.counts.phuHop}
                      </span>
                    </div>

                    <div className="bg-amber-50/70 p-2 rounded-lg border border-amber-100">
                      <span className="text-[10.5px] text-amber-700 block font-medium">Cần kiểm tra</span>
                      <span className="font-bold text-amber-800 text-sm">
                        {session.counts.canKiemTra}
                      </span>
                    </div>

                    <div className="bg-blue-50/70 p-2 rounded-lg border border-blue-100">
                      <span className="text-[10.5px] text-blue-700 block font-medium">Đã xác nhận</span>
                      <span className="font-bold text-blue-800 text-sm">
                        {session.counts.teacherConfirmed} / {session.counts.total}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => exportToExcel(session)}
                      className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-lg"
                      title="Tải Excel"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => exportToWordDoc(session)}
                      className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-slate-100 rounded-lg"
                      title="Tải Word"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenCompare(session)}
                      className="p-1.5 text-slate-600 hover:text-indigo-700 hover:bg-slate-100 rounded-lg"
                      title="So sánh với đợt khác"
                    >
                      <GitCompare className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Bạn có chắc chắn muốn xóa đợt rà soát "${session.title}"?`)) {
                          onDeleteSession(session.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                      title="Xóa đợt này"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => onSelectSession(session)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1.5 rounded-lg shadow-2xs transition-colors flex items-center space-x-1"
                  >
                    <span>Mở xem chi tiết</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Comparison Modal */}
      {isCompareModalOpen && compareSessionA && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2">
                <GitCompare className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  So sánh 2 đợt rà soát hồ sơ chuyên môn
                </h3>
              </div>
              <button
                onClick={() => setIsCompareModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {/* Selectors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/20">
                  <span className="text-[11px] font-bold uppercase text-blue-700">Đợt rà soát A:</span>
                  <select
                    value={compareSessionA.id}
                    onChange={(e) => {
                      const found = sessions.find((s) => s.id === e.target.value);
                      if (found) setCompareSessionA(found);
                    }}
                    className="w-full mt-1.5 text-xs font-semibold rounded-lg border border-slate-300 p-2 bg-white"
                  >
                    {sessions.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title} ({s.subject} - {new Date(s.createdAt).toLocaleDateString('vi-VN')})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/20">
                  <span className="text-[11px] font-bold uppercase text-indigo-700">Đợt rà soát B (So sánh đối chứng):</span>
                  <select
                    value={compareSessionB?.id || ''}
                    onChange={(e) => {
                      const found = sessions.find((s) => s.id === e.target.value);
                      if (found) setCompareSessionB(found);
                    }}
                    className="w-full mt-1.5 text-xs font-semibold rounded-lg border border-slate-300 p-2 bg-white"
                  >
                    {sessions.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title} ({s.subject} - {new Date(s.createdAt).toLocaleDateString('vi-VN')})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Side-by-Side Comparison Metrics */}
              {compareSessionB && (
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold">
                        <th className="p-2.5 text-left">Chỉ số so sánh</th>
                        <th className="p-2.5 text-center bg-blue-50/50">Đợt A ({compareSessionA.subject})</th>
                        <th className="p-2.5 text-center bg-indigo-50/50">Đợt B ({compareSessionB.subject})</th>
                        <th className="p-2.5 text-center">Chênh lệch / Tiến triển</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="p-2.5 font-medium">Tổng nội dung đối chiếu</td>
                        <td className="p-2.5 text-center font-bold">{compareSessionA.counts.total}</td>
                        <td className="p-2.5 text-center font-bold">{compareSessionB.counts.total}</td>
                        <td className="p-2.5 text-center text-slate-500">
                          {compareSessionB.counts.total - compareSessionA.counts.total} mục
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-medium text-emerald-700">Nội dung Phù hợp</td>
                        <td className="p-2.5 text-center font-bold text-emerald-700">
                          {compareSessionA.counts.phuHop}
                        </td>
                        <td className="p-2.5 text-center font-bold text-emerald-700">
                          {compareSessionB.counts.phuHop}
                        </td>
                        <td className="p-2.5 text-center font-semibold text-emerald-700">
                          {compareSessionB.counts.phuHop >= compareSessionA.counts.phuHop ? '▲ Tăng' : '▼ Giảm'}{' '}
                          {Math.abs(compareSessionB.counts.phuHop - compareSessionA.counts.phuHop)}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-medium text-amber-700">Nội dung Cần kiểm tra</td>
                        <td className="p-2.5 text-center font-bold text-amber-700">
                          {compareSessionA.counts.canKiemTra}
                        </td>
                        <td className="p-2.5 text-center font-bold text-amber-700">
                          {compareSessionB.counts.canKiemTra}
                        </td>
                        <td className="p-2.5 text-center font-semibold text-amber-700">
                          {compareSessionB.counts.canKiemTra <= compareSessionA.counts.canKiemTra
                            ? '▼ Giảm (Tốt)'
                            : '▲ Tăng'}{' '}
                          {Math.abs(compareSessionB.counts.canKiemTra - compareSessionA.counts.canKiemTra)}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-medium text-blue-700">Giáo viên đã xác nhận</td>
                        <td className="p-2.5 text-center font-bold text-blue-700">
                          {compareSessionA.counts.teacherConfirmed}
                        </td>
                        <td className="p-2.5 text-center font-bold text-blue-700">
                          {compareSessionB.counts.teacherConfirmed}
                        </td>
                        <td className="p-2.5 text-center font-semibold text-blue-700">
                          {compareSessionB.counts.teacherConfirmed - compareSessionA.counts.teacherConfirmed >= 0
                            ? '▲ Tăng'
                            : '▼ Giảm'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => setIsCompareModalOpen(false)}
                className="bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-lg"
              >
                Đóng so sánh
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
