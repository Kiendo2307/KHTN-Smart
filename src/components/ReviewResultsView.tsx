import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  FileText,
  Printer,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  XCircle,
  ExternalLink,
  ChevronDown,
  ArrowUpDown,
  Edit3,
  ShieldCheck,
  Check,
  Sparkles,
  RefreshCw,
  SlidersHorizontal,
  Info,
} from 'lucide-react';
import {
  ReviewSession,
  ReviewResultItem,
  ResultStatus,
  TeacherDecision,
  TeacherReviewStatus,
} from '../types';
import { CitationModal } from './CitationModal';
import { exportToExcel, exportToWordDoc } from '../utils/exportUtils';

interface ReviewResultsViewProps {
  session: ReviewSession;
  onUpdateSession: (updatedSession: ReviewSession) => void;
  onReopenSetup: () => void;
}

export const ReviewResultsView: React.FC<ReviewResultsViewProps> = ({
  session,
  onUpdateSession,
  onReopenSetup,
}) => {
  // Filters & Search
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [teacherStatusFilter, setTeacherStatusFilter] = useState<string>('all');
  const [criterionFilter, setCriterionFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'stt' | 'status' | 'topic'>('stt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Active citation modal item
  const [selectedItemForCitation, setSelectedItemForCitation] = useState<ReviewResultItem | null>(
    null
  );

  // Quick inline edit state for teacher notes
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [tempNoteText, setTempNoteText] = useState<string>('');

  // Handle teacher verification update
  const handleUpdateItemVerification = (
    itemId: string,
    verification: {
      status: TeacherReviewStatus;
      decision: TeacherDecision;
      notes: string;
      proposedAdjustment: string;
    }
  ) => {
    const updatedItems = session.items.map((item) => {
      if (item.id === itemId) {
        return {
          ...item,
          teacherVerification: {
            ...item.teacherVerification,
            ...verification,
            updatedAt: new Date().toISOString(),
          },
        };
      }
      return item;
    });

    const teacherConfirmedCount = updatedItems.filter(
      (i) => i.teacherVerification.status === 'Đã xác nhận' || i.teacherVerification.decision === 'confirmed'
    ).length;

    const updatedSession: ReviewSession = {
      ...session,
      items: updatedItems,
      counts: {
        ...session.counts,
        teacherConfirmed: teacherConfirmedCount,
      },
    };

    onUpdateSession(updatedSession);
  };

  // Quick teacher decision click from row
  const handleQuickDecision = (itemId: string, decision: TeacherDecision) => {
    const status: TeacherReviewStatus = decision === 'confirmed' ? 'Đã xác nhận' : 'Đang kiểm tra';
    handleUpdateItemVerification(itemId, {
      status,
      decision,
      notes: '',
      proposedAdjustment: '',
    });
  };

  // Unique criteria in this session for filter dropdown
  const uniqueCriteria = useMemo(() => {
    const set = new Set<string>();
    session.items.forEach((item) => set.add(item.criterion));
    return Array.from(set);
  }, [session.items]);

  // Filtered and sorted items
  const filteredItems = useMemo(() => {
    return session.items
      .filter((item) => {
        // Status filter
        if (statusFilter !== 'all' && item.resultStatus !== statusFilter) return false;
        // Teacher status filter
        if (teacherStatusFilter !== 'all' && item.teacherVerification.status !== teacherStatusFilter)
          return false;
        // Criterion filter
        if (criterionFilter !== 'all' && item.criterion !== criterionFilter) return false;
        // Search query
        if (searchTerm.trim()) {
          const query = searchTerm.toLowerCase();
          const matchPhuLuc = item.phuLucContent.toLowerCase().includes(query);
          const matchSyllabus = item.syllabusContent.toLowerCase().includes(query);
          const matchCheck = item.checkPoint.toLowerCase().includes(query);
          const matchTopic = item.topic.toLowerCase().includes(query);
          const matchCrit = item.criterion.toLowerCase().includes(query);
          const matchQuote =
            item.referenceSource.phuLucQuote.toLowerCase().includes(query) ||
            item.referenceSource.syllabusQuote.toLowerCase().includes(query);
          if (!matchPhuLuc && !matchSyllabus && !matchCheck && !matchTopic && !matchCrit && !matchQuote) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        let comp = 0;
        if (sortBy === 'stt') {
          comp = a.stt - b.stt;
        } else if (sortBy === 'topic') {
          comp = a.topic.localeCompare(b.topic);
        } else if (sortBy === 'status') {
          comp = a.resultStatus.localeCompare(b.resultStatus);
        }
        return sortDirection === 'asc' ? comp : -comp;
      });
  }, [
    session.items,
    statusFilter,
    teacherStatusFilter,
    criterionFilter,
    searchTerm,
    sortBy,
    sortDirection,
  ]);

  const confirmedRate =
    session.counts.total > 0
      ? Math.round((session.counts.teacherConfirmed / session.counts.total) * 100)
      : 0;

  const getStatusBadge = (res: ResultStatus) => {
    switch (res) {
      case 'Phù hợp':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Phù hợp</span>
          </span>
        );
      case 'Cần kiểm tra':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            <span>Cần kiểm tra</span>
          </span>
        );
      case 'Chưa tìm thấy căn cứ':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <HelpCircle className="w-3 h-3 text-rose-600" />
            <span>Chưa thấy căn cứ</span>
          </span>
        );
      case 'Chưa đủ dữ liệu':
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <XCircle className="w-3 h-3 text-slate-500" />
            <span>Chưa đủ dữ liệu</span>
          </span>
        );
    }
  };

  const getTeacherBadge = (item: ReviewResultItem) => {
    const st = item.teacherVerification.status;
    const dec = item.teacherVerification.decision;
    if (dec === 'confirmed' || st === 'Đã xác nhận') {
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10.5px] font-semibold bg-emerald-100 text-emerald-800">
          <Check className="w-3 h-3 text-emerald-600" />
          <span>Đã duyệt</span>
        </span>
      );
    }
    if (dec === 'recheck') {
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10.5px] font-semibold bg-amber-100 text-amber-800">
          <span>Cần sửa</span>
        </span>
      );
    }
    if (dec === 'ai_incorrect') {
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10.5px] font-semibold bg-rose-100 text-rose-800">
          <span>AI sai</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10.5px] font-medium bg-slate-100 text-slate-600">
        <span>Chờ xem</span>
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Overview & Session Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-blue-700 bg-blue-100/60 px-2.5 py-0.5 rounded-md">
                {session.subject} • {session.grade}
              </span>
              <span className="text-xs text-slate-500">
                Ngày: {new Date(session.createdAt).toLocaleDateString('vi-VN')}
              </span>
              {session.isDemo && (
                <span className="text-[11px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                  Dữ liệu minh họa (Demo)
                </span>
              )}
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-1">{session.title}</h1>
            <p className="text-xs text-slate-500 mt-1">
              Phạm vi: <span className="font-semibold text-slate-700">{session.scope}</span> • Người rà soát:{' '}
              <span className="font-medium text-slate-700">{session.teacherAuthor || 'Giáo viên bộ môn'}</span>
            </p>
          </div>

          {/* Export & Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => exportToExcel(session)}
              className="inline-flex items-center space-x-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold px-3 py-2 rounded-xl transition-colors shadow-2xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
              <span>Xuất Excel (.xlsx)</span>
            </button>

            <button
              onClick={() => exportToWordDoc(session)}
              className="inline-flex items-center space-x-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-semibold px-3 py-2 rounded-xl transition-colors shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5 text-blue-700" />
              <span>Xuất Word (.doc)</span>
            </button>

            <button
              onClick={() => window.print()}
              className="inline-flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-xl transition-colors"
              title="In báo cáo"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In</span>
            </button>

            <button
              onClick={onReopenSetup}
              className="inline-flex items-center space-x-1 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-colors shadow-2xs ml-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Đối chiếu lại</span>
            </button>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <span className="text-slate-500 font-medium">Tổng nội dung</span>
            <div className="text-xl font-bold text-slate-900 mt-0.5">{session.counts.total} mục</div>
          </div>

          <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-200/60">
            <span className="text-emerald-700 font-medium flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Phù hợp</span>
            </span>
            <div className="text-xl font-bold text-emerald-800 mt-0.5">
              {session.counts.phuHop}{' '}
              <span className="text-xs font-normal text-emerald-600">
                ({Math.round((session.counts.phuHop / session.counts.total) * 100 || 0)}%)
              </span>
            </div>
          </div>

          <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-200/60">
            <span className="text-amber-700 font-medium flex items-center space-x-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Cần kiểm tra</span>
            </span>
            <div className="text-xl font-bold text-amber-800 mt-0.5">
              {session.counts.canKiemTra}{' '}
              <span className="text-xs font-normal text-amber-600">
                ({Math.round((session.counts.canKiemTra / session.counts.total) * 100 || 0)}%)
              </span>
            </div>
          </div>

          <div className="bg-rose-50/60 p-3 rounded-xl border border-rose-200/60">
            <span className="text-rose-700 font-medium flex items-center space-x-1">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Chưa thấy căn cứ</span>
            </span>
            <div className="text-xl font-bold text-rose-800 mt-0.5">
              {session.counts.chuaTimThay}
            </div>
          </div>

          <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-200/60 col-span-2 sm:col-span-1">
            <span className="text-blue-700 font-medium flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>GV đã xác nhận</span>
            </span>
            <div className="text-xl font-bold text-blue-900 mt-0.5">
              {session.counts.teacherConfirmed} / {session.counts.total}{' '}
              <span className="text-xs font-normal text-blue-600">({confirmedRate}%)</span>
            </div>
          </div>
        </div>

        {/* AI Summary Overview Box */}
        {session.summaryOverview && (
          <div className="mt-4 bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-700 leading-relaxed flex items-start space-x-2.5">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900">Đánh giá tổng quan: </span>
              <span>{session.summaryOverview}</span>
            </div>
          </div>
        )}

        {/* Fallback Notice Banner */}
        {session.fallbackNotice && (
          <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 leading-relaxed flex items-start space-x-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-950">Ghi chú đối chiếu: </span>
              <span>{session.fallbackNotice}</span>
            </div>
          </div>
        )}
      </div>

      {/* Toolbar: Search, Filters, Sorting */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm nội dung, chủ đề, từ khóa, trích dẫn..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-800"
            />
          </div>

          {/* Filter: Result Status */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Kết quả AI: Tất cả trạng thái</option>
              <option value="Phù hợp">Phù hợp ({session.counts.phuHop})</option>
              <option value="Cần kiểm tra">Cần kiểm tra ({session.counts.canKiemTra})</option>
              <option value="Chưa tìm thấy căn cứ">Chưa tìm thấy căn cứ ({session.counts.chuaTimThay})</option>
              <option value="Chưa đủ dữ liệu">Chưa đủ dữ liệu ({session.counts.chuaDuDuLieu})</option>
            </select>
          </div>

          {/* Filter: Teacher Verification Status */}
          <div>
            <select
              value={teacherStatusFilter}
              onChange={(e) => setTeacherStatusFilter(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Thẩm định GV: Tất cả</option>
              <option value="Chưa xem xét">Chưa xem xét</option>
              <option value="Đang kiểm tra">Đang kiểm tra</option>
              <option value="Đã xác nhận">Đã xác nhận</option>
              <option value="Đã xử lý">Đã xử lý</option>
            </select>
          </div>

          {/* Filter: Criterion */}
          <div>
            <select
              value={criterionFilter}
              onChange={(e) => setCriterionFilter(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tiêu chí: Tất cả</option>
              {uniqueCriteria.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filter Tags & Quick Reset */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-1">
          <div className="flex items-center space-x-2">
            <span>Hiển thị: </span>
            <span className="font-bold text-slate-800">{filteredItems.length}</span>
            <span>/ {session.items.length} nội dung</span>

            {(statusFilter !== 'all' ||
              teacherStatusFilter !== 'all' ||
              criterionFilter !== 'all' ||
              searchTerm) && (
              <button
                onClick={() => {
                  setStatusFilter('all');
                  setTeacherStatusFilter('all');
                  setCriterionFilter('all');
                  setSearchTerm('');
                }}
                className="text-blue-600 hover:underline font-semibold ml-2"
              >
                Đặt lại bộ lọc
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <span>Sắp xếp:</span>
            <button
              onClick={() => {
                if (sortBy === 'stt') {
                  setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
                } else {
                  setSortBy('stt');
                  setSortDirection('asc');
                }
              }}
              className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                sortBy === 'stt' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-50 border-slate-200'
              }`}
            >
              STT {sortBy === 'stt' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
            </button>

            <button
              onClick={() => {
                if (sortBy === 'topic') {
                  setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
                } else {
                  setSortBy('topic');
                  setSortDirection('asc');
                }
              }}
              className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                sortBy === 'topic' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-50 border-slate-200'
              }`}
            >
              Chủ đề {sortBy === 'topic' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
            </button>

            <button
              onClick={() => {
                if (sortBy === 'status') {
                  setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
                } else {
                  setSortBy('status');
                  setSortDirection('asc');
                }
              }}
              className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                sortBy === 'status' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-50 border-slate-200'
              }`}
            >
              Trạng thái {sortBy === 'status' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
            </button>
          </div>
        </div>
      </div>

      {/* Main 7-Column Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold tracking-tight uppercase text-[11px]">
                <th className="py-3 px-3 w-12 text-center">STT</th>
                <th className="py-3 px-4 w-44">Tiêu chí</th>
                <th className="py-3 px-4 w-64">Nội dung Phụ lục</th>
                <th className="py-3 px-4 w-64">Nội dung Syllabus</th>
                <th className="py-3 px-3 w-32 text-center">Kết quả</th>
                <th className="py-3 px-4 min-w-[240px]">Nội dung cần kiểm tra</th>
                <th className="py-3 px-3 w-40 text-center">Nguồn tham chiếu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Không tìm thấy nội dung đối chiếu nào phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 transition-colors group align-top"
                    >
                      {/* Cột 1: STT */}
                      <td className="py-3.5 px-3 text-center font-mono font-semibold text-slate-500">
                        {item.stt}
                      </td>

                      {/* Cột 2: Tiêu chí */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 leading-snug">{item.criterion}</div>
                        <div className="text-[11px] text-slate-500 mt-1 font-medium">{item.topic}</div>
                      </td>

                      {/* Cột 3: Nội dung Phụ lục */}
                      <td className="py-3.5 px-4 leading-relaxed text-slate-800">
                        <div className="line-clamp-4 hover:line-clamp-none transition-all">
                          {item.phuLucContent}
                        </div>
                      </td>

                      {/* Cột 4: Nội dung Syllabus */}
                      <td className="py-3.5 px-4 leading-relaxed text-slate-800">
                        <div className="line-clamp-4 hover:line-clamp-none transition-all">
                          {item.syllabusContent}
                        </div>
                      </td>

                      {/* Cột 5: Kết quả */}
                      <td className="py-3.5 px-3 text-center">
                        <div className="flex flex-col items-center space-y-1">
                          {getStatusBadge(item.resultStatus)}
                          <div className="mt-1">{getTeacherBadge(item)}</div>
                        </div>
                      </td>

                      {/* Cột 6: Nội dung cần kiểm tra */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 leading-snug">
                          {item.checkPoint}
                        </div>

                        {/* Inline Teacher Notes & Actions */}
                        <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1.5">
                          {/* Teacher quick actions */}
                          <div className="flex items-center space-x-1.5">
                            <button
                              onClick={() => handleQuickDecision(item.id, 'confirmed')}
                              className={`px-2 py-0.5 rounded text-[10.5px] font-semibold transition-all ${
                                item.teacherVerification.decision === 'confirmed'
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              }`}
                              title="Xác nhận kết quả đối chiếu này"
                            >
                              ✓ Xác nhận
                            </button>

                            <button
                              onClick={() => handleQuickDecision(item.id, 'recheck')}
                              className={`px-2 py-0.5 rounded text-[10.5px] font-semibold transition-all ${
                                item.teacherVerification.decision === 'recheck'
                                  ? 'bg-amber-600 text-white'
                                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                              }`}
                              title="Yêu cầu kiểm tra lại nội dung này"
                            >
                              ⚠ Cần soát lại
                            </button>

                            <button
                              onClick={() => setSelectedItemForCitation(item)}
                              className="px-2 py-0.5 rounded text-[10.5px] font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center space-x-1"
                            >
                              <Edit3 className="w-2.5 h-2.5" />
                              <span>Ghi chú</span>
                            </button>
                          </div>

                          {/* Show Teacher note if exists */}
                          {item.teacherVerification.notes && (
                            <div className="text-[11px] text-blue-700 bg-blue-50/60 rounded px-2 py-1 font-medium">
                              <span className="font-semibold">Ghi chú GV:</span> {item.teacherVerification.notes}
                            </div>
                          )}

                          {item.teacherVerification.proposedAdjustment && (
                            <div className="text-[11px] text-slate-700 bg-slate-100/70 rounded px-2 py-1">
                              <span className="font-semibold">Đề xuất:</span> {item.teacherVerification.proposedAdjustment}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Cột 7: Nguồn tham chiếu */}
                      <td className="py-3.5 px-3 text-center">
                        <button
                          onClick={() => setSelectedItemForCitation(item)}
                          className="w-full inline-flex flex-col items-center justify-center p-2 rounded-xl bg-blue-50/70 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-all group-hover:shadow-2xs text-[11px] font-semibold space-y-1"
                        >
                          <span className="flex items-center space-x-1">
                            <span>Chi tiết nguồn</span>
                            <ExternalLink className="w-3 h-3" />
                          </span>
                          <span className="text-[10px] text-slate-500 font-normal truncate max-w-[130px]">
                            {item.referenceSource.phuLucLocation || 'Trích dẫn 2 bên'}
                          </span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Citation & Teacher Verification Modal */}
      {selectedItemForCitation && (
        <CitationModal
          item={selectedItemForCitation}
          isOpen={!!selectedItemForCitation}
          onClose={() => setSelectedItemForCitation(null)}
          onUpdateVerification={(itemId, verification) => {
            handleUpdateItemVerification(itemId, verification);
            // update currently opened item in modal
            setSelectedItemForCitation((prev) =>
              prev ? { ...prev, teacherVerification: { ...prev.teacherVerification, ...verification } } : null
            );
          }}
        />
      )}
    </div>
  );
};
