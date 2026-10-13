import React, { useState } from 'react';
import {
  FileText,
  Quote,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  XCircle,
  ShieldCheck,
  Edit3,
  Save,
  X,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';
import {
  ReviewResultItem,
  ResultStatus,
  TeacherDecision,
  TeacherReviewStatus,
} from '../types';

interface CitationModalProps {
  item: ReviewResultItem;
  isOpen: boolean;
  onClose: () => void;
  onUpdateVerification: (
    itemId: string,
    verification: {
      status: TeacherReviewStatus;
      decision: TeacherDecision;
      notes: string;
      proposedAdjustment: string;
    }
  ) => void;
}

export const CitationModal: React.FC<CitationModalProps> = ({
  item,
  isOpen,
  onClose,
  onUpdateVerification,
}) => {
  if (!isOpen) return null;

  // Local state for teacher input inside modal
  const [status, setStatus] = useState<TeacherReviewStatus>(
    item.teacherVerification.status || 'Chưa xem xét'
  );
  const [decision, setDecision] = useState<TeacherDecision>(
    item.teacherVerification.decision || 'none'
  );
  const [notes, setNotes] = useState<string>(item.teacherVerification.notes || '');
  const [proposedAdjustment, setProposedAdjustment] = useState<string>(
    item.teacherVerification.proposedAdjustment || ''
  );
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleSave = () => {
    onUpdateVerification(item.id, {
      status,
      decision,
      notes,
      proposedAdjustment,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  const getStatusBadge = (res: ResultStatus) => {
    switch (res) {
      case 'Phù hợp':
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Phù hợp & Thống nhất</span>
          </span>
        );
      case 'Cần kiểm tra':
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Cần kiểm tra lại</span>
          </span>
        );
      case 'Chưa tìm thấy căn cứ':
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <HelpCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Chưa tìm thấy căn cứ</span>
          </span>
        );
      case 'Chưa đủ dữ liệu':
      default:
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
            <XCircle className="w-3.5 h-3.5 text-slate-600" />
            <span>Chưa đủ dữ liệu</span>
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
              #{item.stt}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900 text-base">{item.criterion}</span>
                <span className="text-xs text-slate-500 font-normal">| {item.topic}</span>
              </div>
              <p className="text-xs text-slate-500">Đối chiếu nguồn tham chiếu và thẩm định của giáo viên</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {getStatusBadge(item.resultStatus)}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* AI Checkpoint & Explanation */}
          <div className="bg-blue-50/50 border border-blue-200/80 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <ShieldCheck className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900">
                  Nhận định của AI & Điểm cần kiểm tra:
                </h4>
                <p className="text-sm font-semibold text-slate-900">{item.checkPoint}</p>
                <p className="text-xs text-slate-600 pt-1 leading-relaxed">
                  <span className="font-semibold text-slate-800">Lý giải căn cứ: </span>
                  {item.referenceSource.reasonExplanation}
                </p>
              </div>
            </div>
          </div>

          {/* Side-by-Side Verbatim Quotations */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center space-x-1.5">
              <Quote className="w-3.5 h-3.5 text-blue-600" />
              <span>Đối chiếu trích dẫn nguyên văn 2 bên</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column: Phụ lục */}
              <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                    <span className="text-xs font-bold text-blue-700 flex items-center space-x-1.5">
                      <FileText className="w-4 h-4" />
                      <span>TÀI LIỆU PHỤ LỤC</span>
                    </span>
                    <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-mono truncate max-w-[180px]">
                      {item.referenceSource.phuLucLocation || 'Chưa xác định được vị trí nguồn'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 font-medium truncate mb-2">
                    Tệp: {item.referenceSource.phuLucDocName}
                  </p>

                  <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3 text-xs text-slate-800 font-serif leading-relaxed italic border-l-4 border-l-blue-600">
                    "{item.referenceSource.phuLucQuote || item.phuLucContent || 'Không tìm thấy trích đoạn'}"
                  </div>
                </div>

                <div className="mt-3 pt-2 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Trích dẫn đối chiếu</span>
                  <span>Phụ lục khung</span>
                </div>
              </div>

              {/* Right Column: Syllabus */}
              <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                    <span className="text-xs font-bold text-indigo-700 flex items-center space-x-1.5">
                      <FileText className="w-4 h-4" />
                      <span>TÀI LIỆU SYLLABUS / KẾ HOẠCH</span>
                    </span>
                    <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-mono truncate max-w-[180px]">
                      {item.referenceSource.syllabusLocation || 'Chưa xác định được vị trí nguồn'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 font-medium truncate mb-2">
                    Tệp: {item.referenceSource.syllabusDocName}
                  </p>

                  <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3 text-xs text-slate-800 font-serif leading-relaxed italic border-l-4 border-l-indigo-600">
                    "{item.referenceSource.syllabusQuote || item.syllabusContent || 'Không tìm thấy trích đoạn'}"
                  </div>
                </div>

                <div className="mt-3 pt-2 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Trích dẫn đối chiếu</span>
                  <span>Syllabus giáo viên</span>
                </div>
              </div>
            </div>
          </div>

          {/* Teacher Verification Section */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-2">
                <Edit3 className="w-4 h-4 text-blue-600" />
                <span>Giáo viên kiểm tra và xác nhận (Teacher Verification)</span>
              </h4>
              <span className="text-xs text-slate-500">
                Quyết định chuyên môn có thẩm quyền
              </span>
            </div>

            {/* Quick Action Decision Buttons */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">
                Quyết định của giáo viên:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setDecision('confirmed');
                    setStatus('Đã xác nhận');
                  }}
                  className={`p-2.5 rounded-xl text-xs font-semibold border flex items-center justify-center space-x-2 transition-all ${
                    decision === 'confirmed'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Xác nhận kết quả</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDecision('recheck');
                    setStatus('Đang kiểm tra');
                  }}
                  className={`p-2.5 rounded-xl text-xs font-semibold border flex items-center justify-center space-x-2 transition-all ${
                    decision === 'recheck'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Yêu cầu kiểm tra lại</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDecision('ai_incorrect');
                    setStatus('Đang kiểm tra');
                  }}
                  className={`p-2.5 rounded-xl text-xs font-semibold border flex items-center justify-center space-x-2 transition-all ${
                    decision === 'ai_incorrect'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <XCircle className="w-4 h-4" />
                  <span>AI nhận định chưa đúng</span>
                </button>
              </div>
            </div>

            {/* Teacher Notes & Proposal Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ghi chú của giáo viên:
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ghi rõ lý do xác nhận hoặc nhận xét của bạn về nhận định này..."
                  className="w-full text-xs rounded-lg border border-slate-300 p-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Đề xuất nội dung cần điều chỉnh (nếu có):
                </label>
                <textarea
                  rows={2}
                  value={proposedAdjustment}
                  onChange={(e) => setProposedAdjustment(e.target.value)}
                  placeholder="VD: Điều chỉnh tăng thêm 1 tiết luyện tập ở Syllabus, cập nhật danh pháp IUPAC..."
                  className="w-full text-xs rounded-lg border border-slate-300 p-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
            </div>

            {/* Status Select */}
            <div className="flex items-center space-x-3 pt-1 text-xs">
              <span className="font-semibold text-slate-700">Trạng thái rà soát hồ sơ:</span>
              {(['Chưa xem xét', 'Đang kiểm tra', 'Đã xác nhận', 'Đã xử lý'] as TeacherReviewStatus[]).map(
                (st) => (
                  <label key={st} className="flex items-center space-x-1 cursor-pointer">
                    <input
                      type="radio"
                      name="teacherStatus"
                      value={st}
                      checked={status === st}
                      onChange={() => setStatus(st)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span
                      className={`text-xs ${
                        status === st ? 'font-bold text-slate-900' : 'text-slate-500'
                      }`}
                    >
                      {st}
                    </span>
                  </label>
                )
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {savedSuccess ? (
              <span className="text-emerald-600 font-semibold flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Đã lưu xác nhận thành công!</span>
              </span>
            ) : (
              <span>Thay đổi được lưu vào hồ sơ rà soát này</span>
            )}
          </span>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
            >
              Đóng
            </button>
            <button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Lưu thẩm định</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
