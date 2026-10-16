import React from 'react';
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  TrendingUp,
  Sparkles,
  ArrowRight,
  BookOpen,
  Calculator,
  Laptop,
  Cpu,
  Atom,
  FlaskConical,
  Dna,
  ShieldCheck,
  History,
  FileSpreadsheet,
} from 'lucide-react';
import { ReviewSession, SubjectField } from '../types';
import { SAMPLE_BUNDLES, SampleBundle } from '../data/sampleDocs';

interface DashboardViewProps {
  sessions: ReviewSession[];
  activeSession: ReviewSession | null;
  onSelectSession: (session: ReviewSession) => void;
  onStartNewReview: (subject?: SubjectField) => void;
  onLoadSample: (sample: SampleBundle) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  sessions,
  activeSession,
  onSelectSession,
  onStartNewReview,
  onLoadSample,
}) => {
  // Aggregate stats across all sessions or use active session
  const totalSessions = sessions.length;
  const totalItems = sessions.reduce((acc, s) => acc + s.counts.total, 0);
  const totalPhuHop = sessions.reduce((acc, s) => acc + s.counts.phuHop, 0);
  const totalCanKiemTra = sessions.reduce((acc, s) => acc + s.counts.canKiemTra, 0);
  const totalChuaTimThay = sessions.reduce((acc, s) => acc + s.counts.chuaTimThay, 0);
  const totalConfirmed = sessions.reduce((acc, s) => acc + s.counts.teacherConfirmed, 0);

  const confirmRate = totalItems > 0 ? Math.round((totalConfirmed / totalItems) * 100) : 0;
  const phuHopRate = totalItems > 0 ? Math.round((totalPhuHop / totalItems) * 100) : 0;

  const subjectList: { name: SubjectField; icon: any; color: string; desc: string }[] = [
    {
      name: 'Toán',
      icon: Calculator,
      color: 'from-blue-600 to-indigo-600 text-blue-600 bg-blue-50',
      desc: 'Đại số, Hình học, Xác suất & Bất phương trình',
    },
    {
      name: 'Tin học',
      icon: Laptop,
      color: 'from-cyan-600 to-blue-600 text-cyan-700 bg-cyan-50',
      desc: 'Khoa học máy tính, Python & Kỹ năng số',
    },
    {
      name: 'Robotics',
      icon: Cpu,
      color: 'from-amber-600 to-orange-600 text-amber-700 bg-amber-50',
      desc: 'STEM Robot, Cảm biến, Sa bàn & Lập trình',
    },
    {
      name: 'Vật lí',
      icon: Atom,
      color: 'from-sky-600 to-indigo-600 text-sky-700 bg-sky-50',
      desc: 'Cơ - Nhiệt - Điện - Quang & Thí nghiệm đo lường',
    },
    {
      name: 'Hóa học',
      icon: FlaskConical,
      color: 'from-emerald-600 to-teal-600 text-emerald-700 bg-emerald-50',
      desc: 'IUPAC, Phản ứng hóa học & An toàn phòng lab',
    },
    {
      name: 'Sinh học',
      icon: Dna,
      color: 'from-green-600 to-emerald-700 text-green-700 bg-green-50',
      desc: 'Tế bào, Di truyền, Sinh thái & Tiêu bản thực nghiệm',
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900 via-blue-800 to-slate-900 text-white p-6 sm:p-8 shadow-md">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 bg-blue-500/20 backdrop-blur-xs px-3 py-1 rounded-full text-blue-200 text-xs font-semibold mb-3 border border-blue-400/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Trợ lý chuyên môn Tổ Khoa học Tự nhiên</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            KHTN Smart Review – Rà Soát Hồ Sơ Chuyên Môn
          </h1>
          <p className="mt-2 text-sm sm:text-base text-blue-100/90 leading-relaxed">
            Hỗ trợ giáo viên đối chiếu Phụ lục với Syllabus, kiểm tra tính thống nhất về số tiết, yêu cầu cần đạt, phát hiện nội dung chưa khớp và trích xuất nguồn căn cứ nguyên văn để giáo viên chủ động thẩm định.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onStartNewReview()}
              className="inline-flex items-center space-x-2 bg-white text-blue-900 hover:bg-blue-50 font-semibold px-4 py-2.5 rounded-xl text-sm shadow-sm transition-all"
            >
              <BookOpen className="w-4 h-4" />
              <span>Bắt đầu đối chiếu mới</span>
            </button>

            {activeSession && (
              <button
                onClick={() => onSelectSession(activeSession)}
                className="inline-flex items-center space-x-2 bg-blue-700/60 hover:bg-blue-700 text-white border border-blue-400/30 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
              >
                <FileText className="w-4 h-4" />
                <span>Mở kết quả hiện tại ({activeSession.subject})</span>
              </button>
            )}
          </div>
        </div>

        {/* Decorative background shapes */}
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* Overview Statistics Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span>Thống kê tổng hợp hồ sơ</span>
          </h2>
          <span className="text-xs text-slate-500">
            Dữ liệu từ {totalSessions} đợt rà soát đã thực hiện
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Tổng số mục rà soát */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Nội dung đối chiếu
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {totalItems > 0 ? totalItems : 12} <span className="text-sm font-normal text-slate-500">mục</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1 flex items-center space-x-1">
                <span>{totalSessions > 0 ? totalSessions : 1} đợt hồ sơ lưu trữ</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
          </div>

          {/* Card 2: Nội dung Phù hợp */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Phù hợp & Thống nhất
              </p>
              <h3 className="text-2xl font-bold text-emerald-700 mt-1">
                {totalItems > 0 ? totalPhuHop : 7}{' '}
                <span className="text-xs font-medium text-emerald-600">
                  ({totalItems > 0 ? phuHopRate : 58}%)
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">Khớp số tiết và YCCĐ</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          {/* Card 3: Cần kiểm tra */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Cần kiểm tra lại
              </p>
              <h3 className="text-2xl font-bold text-amber-600 mt-1">
                {totalItems > 0 ? totalCanKiemTra : 4}{' '}
                <span className="text-xs font-medium text-amber-700">mục</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">Lệch thời lượng, khác thuật ngữ</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>

          {/* Card 4: Tiến độ xác nhận của Giáo viên */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Giáo viên đã xác nhận
              </p>
              <h3 className="text-2xl font-bold text-blue-700 mt-1">
                {totalItems > 0 ? totalConfirmed : 5} / {totalItems > 0 ? totalItems : 12}
              </h3>
              <p className="text-xs text-blue-600 font-medium mt-1">
                Đạt {totalItems > 0 ? confirmRate : 42}% tiến độ thẩm định
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* 6 Subjects of Tổ KHTN */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Các lĩnh vực chuyên môn trong Tổ KHTN
            </h2>
            <p className="text-xs text-slate-500">
              Chọn lĩnh vực để thiết lập tiêu chí riêng và bắt đầu đối chiếu hồ sơ
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjectList.map((subj) => {
            const Icon = subj.icon;
            const countForSubject = sessions.filter((s) => s.subject === subj.name).length;
            return (
              <div
                key={subj.name}
                className="bg-white rounded-xl border border-slate-200 p-4.5 hover:shadow-sm hover:border-blue-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${subj.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">{subj.name}</h3>
                        <span className="text-[11px] text-slate-400">
                          {countForSubject > 0 ? `${countForSubject} đợt rà soát` : 'Chưa có hồ sơ'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">{subj.desc}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => onStartNewReview(subj.name)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center space-x-1"
                  >
                    <span>Tạo đợt rà soát</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium">
                    Chuẩn 2018
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sample Document Bundles Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Sparkles className="w-4.5 h-4.5 text-blue-600" />
              <span>Gói tài liệu mẫu thử nghiệm của Tổ KHTN</span>
            </h2>
            <p className="text-xs text-slate-500">
              Nạp sẵn cặp Phụ lục và Syllabus có sẵn các trường hợp lệch tiết, thiếu nội dung thực tế để giáo viên thử nghiệm
            </p>
          </div>
          <span className="text-xs bg-blue-50 text-blue-700 font-semibold px-2.5 py-1 rounded-full border border-blue-200 self-start sm:self-auto">
            4 gói chuyên đề
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SAMPLE_BUNDLES.map((sample) => (
            <div
              key={sample.id}
              className="border border-slate-200 rounded-xl p-4 hover:border-blue-300 hover:bg-blue-50/20 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center space-x-2 mb-1.5">
                  <span className="text-xs font-bold text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded-md">
                    {sample.subject} - {sample.grade}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">| {sample.scope}</span>
                </div>
                <h4 className="font-semibold text-slate-900 text-sm">{sample.title}</h4>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{sample.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="text-[11px] text-slate-400">
                  <span>PL: {sample.phuLucDoc.name.slice(0, 20)}...</span>
                </div>
                <button
                  onClick={() => onLoadSample(sample)}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-2xs transition-colors flex items-center space-x-1.5"
                >
                  <span>Nạp gói này</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7-Step Professional Review Workflow */}
      <div className="bg-slate-50/80 rounded-2xl border border-slate-200 p-6">
        <h2 className="text-base font-bold text-slate-900 mb-1 flex items-center space-x-2">
          <BookOpen className="w-4.5 h-4.5 text-blue-600" />
          <span>Quy trình 7 bước rà soát chuẩn của KHTN Smart Review</span>
        </h2>
        <p className="text-xs text-slate-500 mb-6">
          Quy trình bảo đảm AI chỉ đóng vai trò trợ lý trích xuất và đối chiếu ngữ nghĩa, quyết định cuối cùng thuộc về giáo viên
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200">
            <span className="inline-block w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-center leading-6 text-xs mb-2">
              1
            </span>
            <h4 className="font-bold text-slate-800">Đọc & Phân loại</h4>
            <p className="text-slate-500 mt-1">Trích xuất nội dung từ PDF, DOCX, XLSX; giữ lại mục, bảng và số trang.</p>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200">
            <span className="inline-block w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-center leading-6 text-xs mb-2">
              2
            </span>
            <h4 className="font-bold text-slate-800">Bóc tách cấu trúc</h4>
            <p className="text-slate-500 mt-1">Xác định các chủ đề, số tiết phân bổ và chuẩn yêu cầu cần đạt (YCCĐ).</p>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200">
            <span className="inline-block w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-center leading-6 text-xs mb-2">
              3
            </span>
            <h4 className="font-bold text-slate-800">Khớp ngữ nghĩa</h4>
            <p className="text-slate-500 mt-1">Ghép nội dung tương ứng theo bản chất, không chỉ dựa vào từ khóa máy móc.</p>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200">
            <span className="inline-block w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-center leading-6 text-xs mb-2">
              4
            </span>
            <h4 className="font-bold text-slate-800">Đối chiếu tiêu chí</h4>
            <p className="text-slate-500 mt-1">Kiểm tra thời lượng, nội dung còn thiếu, sai khác trình tự và công thức.</p>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200">
            <span className="inline-block w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-center leading-6 text-xs mb-2">
              5
            </span>
            <h4 className="font-bold text-slate-800">Phân loại 4 trạng thái</h4>
            <p className="text-slate-500 mt-1">Phù hợp, Cần kiểm tra, Chưa tìm thấy căn cứ, Chưa đủ dữ liệu.</p>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200">
            <span className="inline-block w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-center leading-6 text-xs mb-2">
              6
            </span>
            <h4 className="font-bold text-slate-800">Gắn nguồn tham chiếu</h4>
            <p className="text-slate-500 mt-1">Trích dẫn nguyên văn từ tài liệu nguồn; tuyệt đối không bịa đặt trích dẫn.</p>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 lg:col-span-2">
            <span className="inline-block w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-center leading-6 text-xs mb-2">
              7
            </span>
            <h4 className="font-bold text-slate-800">Giáo viên thẩm định & Xuất báo cáo</h4>
            <p className="text-slate-500 mt-1">
              Giáo viên xem xét từng dòng, đánh dấu xác nhận hoặc điều chỉnh, sau đó xuất file Word/Excel lưu vào hồ sơ chuyên môn.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
