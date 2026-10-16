import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  Trash2,
  RefreshCw,
  Eye,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Sparkles,
  Sliders,
  ChevronDown,
  Info,
  Layers,
  ArrowRight,
  BookOpen,
  Edit3,
} from 'lucide-react';
import {
  SubjectField,
  GradeLevel,
  DocumentType,
  DocumentItem,
  Criterion,
  ReviewSession,
} from '../types';
import { extractFileText, runReviewAnalysis } from '../services/api';
import { SAMPLE_BUNDLES } from '../data/sampleDocs';

interface ComparisonSetupViewProps {
  allCriteria: Criterion[];
  hasApiKey: boolean;
  onReviewCompleted: (session: ReviewSession) => void;
  initialSubject?: SubjectField;
}

export const ComparisonSetupView: React.FC<ComparisonSetupViewProps> = ({
  allCriteria,
  hasApiKey,
  onReviewCompleted,
  initialSubject = 'Hóa học',
}) => {
  // Scope selection states
  const [subject, setSubject] = useState<SubjectField>(initialSubject);
  const [grade, setGrade] = useState<GradeLevel>('Lớp 8');
  const [scope, setScope] = useState<string>('');
  const [sessionTitle, setSessionTitle] = useState<string>('Đợt rà soát định kỳ Học kỳ I - Tổ KHTN');
  const [teacherAuthor, setTeacherAuthor] = useState<string>('Giáo viên Bộ môn');

  // Document list states
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const [editingContentDoc, setEditingContentDoc] = useState<DocumentItem | null>(null);
  const [editingContentText, setEditingContentText] = useState<string>('');

  const handleAddNewManualDoc = (type: DocumentType = 'Syllabus') => {
    const newDoc: DocumentItem = {
      id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: `${type}_VanBan.txt`,
      type,
      size: 0,
      format: 'txt',
      status: 'error',
      content: '',
      wordCount: 0,
      errorMessage: 'Chưa có nội dung. Nhấp "Dán / Sửa nội dung" để nhập dữ liệu.',
      uploadedAt: new Date().toISOString(),
    };
    setDocuments((prev) => [...prev, newDoc]);
    setEditingContentDoc(newDoc);
    setEditingContentText('');
  };

  const handleSaveDocContent = () => {
    if (!editingContentDoc) return;
    const text = editingContentText.trim();
    const wordCount = text ? text.split(/\s+/).length : 0;
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === editingContentDoc.id
          ? {
              ...d,
              content: text,
              wordCount,
              status: text ? 'ready' : 'error',
              errorMessage: text ? undefined : 'Chưa có nội dung',
              size: text.length * 2,
            }
          : d
      )
    );
    setEditingContentDoc(null);
  };

  // Active criteria filter
  const [selectedCriteriaIds, setSelectedCriteriaIds] = useState<string[]>(() =>
    allCriteria.map((c) => c.id)
  );

  // Processing state
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStep, setProcessingStep] = useState<number>(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // File upload input refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const [replacingDocId, setReplacingDocId] = useState<string | null>(null);

  const documentTypesList: DocumentType[] = [
    'Phụ lục',
    'Syllabus',
    'Kế hoạch bài dạy',
    'Phân phối chương trình',
    'Rubric đánh giá',
    'Tài liệu khác',
  ];

  // Check mandatory docs
  const hasPhuLuc = documents.some((d) => d.type === 'Phụ lục' && d.status === 'ready');
  const hasSyllabus = documents.some(
    (d) => (d.type === 'Syllabus' || d.type === 'Kế hoạch bài dạy') && d.status === 'ready'
  );
  const canStartReview = hasPhuLuc && hasSyllabus;

  // Handle file upload
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setErrorMessage(null);

    const newDocs: DocumentItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split('.').pop()?.toLowerCase() || '';

      // Determine default doc type based on filename
      let inferredType: DocumentType = 'Tài liệu khác';
      const lower = file.name.toLowerCase();
      if (lower.includes('phu luc') || lower.includes('phuluc') || lower.includes('pl')) {
        inferredType = 'Phụ lục';
      } else if (lower.includes('syllabus') || lower.includes('de cuong') || lower.includes('khbd') || lower.includes('ke hoach')) {
        inferredType = 'Syllabus';
      } else if (lower.includes('phan phoi') || lower.includes('ppct')) {
        inferredType = 'Phân phối chương trình';
      } else if (lower.includes('rubric') || lower.includes('tieu chi')) {
        inferredType = 'Rubric đánh giá';
      } else if (!hasPhuLuc && i === 0) {
        inferredType = 'Phụ lục';
      } else if (!hasSyllabus) {
        inferredType = 'Syllabus';
      }

      const tempDoc: DocumentItem = {
        id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        name: file.name,
        type: inferredType,
        size: file.size,
        format: ext,
        status: 'processing',
        content: '',
        wordCount: 0,
        uploadedAt: new Date().toISOString(),
      };

      newDocs.push(tempDoc);
    }

    setDocuments((prev) => [...prev, ...newDocs]);

    // Extract content for each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const docId = newDocs[i].id;

      try {
        const result = await extractFileText(file);
        setDocuments((prev) =>
          prev.map((d) =>
            d.id === docId
              ? {
                  ...d,
                  status: 'ready',
                  content: result.text,
                  wordCount: result.wordCount,
                  pageCount: result.pageCount,
                }
              : d
          )
        );
      } catch (err: any) {
        setDocuments((prev) =>
          prev.map((d) =>
            d.id === docId
              ? {
                  ...d,
                  status: 'error',
                  errorMessage: err.message || 'Lỗi đọc tệp',
                }
              : d
          )
        );
      }
    }
  };

  // Replace document file
  const handleReplaceFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !replacingDocId) return;

    setDocuments((prev) =>
      prev.map((d) =>
        d.id === replacingDocId
          ? {
              ...d,
              name: file.name,
              size: file.size,
              format: file.name.split('.').pop()?.toLowerCase() || '',
              status: 'processing',
              errorMessage: undefined,
            }
          : d
      )
    );

    try {
      const result = await extractFileText(file);
      setDocuments((prev) =>
        prev.map((d) =>
          d.id === replacingDocId
            ? {
                ...d,
                status: 'ready',
                content: result.text,
                wordCount: result.wordCount,
                pageCount: result.pageCount,
              }
            : d
        )
      );
    } catch (err: any) {
      setDocuments((prev) =>
        prev.map((d) =>
          d.id === replacingDocId
            ? {
                ...d,
                status: 'error',
                errorMessage: err.message || 'Lỗi đọc tệp thay thế',
              }
            : d
        )
      );
    } finally {
      setReplacingDocId(null);
      if (replaceInputRef.current) replaceInputRef.current.value = '';
    }
  };



  // Toggle criterion
  const toggleCriterion = (id: string) => {
    setSelectedCriteriaIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Criteria relevant to this subject
  const relevantCriteria = allCriteria.filter(
    (c) => c.subject === 'Chung' || c.subject === subject
  );

  // Execute AI Review
  const handleExecuteReview = async (forceDemo: boolean = false, forceLocalFallback: boolean = false) => {
    if (!canStartReview) {
      setErrorMessage(
        'Vui lòng tải lên ít nhất 1 tài liệu "Phụ lục" và 1 tài liệu "Syllabus" (hoặc Kế hoạch bài dạy) ở trạng thái sẵn sàng để đối chiếu.'
      );
      return;
    }

    const phuLuc = documents.find((d) => d.type === 'Phụ lục' && d.status === 'ready');
    const syllabus = documents.find(
      (d) => (d.type === 'Syllabus' || d.type === 'Kế hoạch bài dạy') && d.status === 'ready'
    );

    if (!phuLuc || !syllabus) return;

    const extraDocs = documents
      .filter((d) => d.id !== phuLuc.id && d.id !== syllabus.id && d.status === 'ready')
      .map((d) => ({
        name: d.name,
        type: d.type,
        content: d.content,
      }));

    const activeCriteria = relevantCriteria.filter((c) => selectedCriteriaIds.includes(c.id));

    setIsProcessing(true);
    setErrorMessage(null);
    setProcessingStep(1);

    // Processing animation ticker
    const interval = setInterval(() => {
      setProcessingStep((prev) => (prev < 7 ? prev + 1 : prev));
    }, 1200);

    try {
      // If forceDemo or no API key, check if we have a matching sample bundle or generate structured demo review
      if (forceDemo || !hasApiKey) {
        // Wait a realistic delay for review experience
        await new Promise((resolve) => setTimeout(resolve, 1500));
        clearInterval(interval);

        // Find if matches a known sample
        const matchedSample = SAMPLE_BUNDLES.find((s) => s.subject === subject);
        const sampleResults = matchedSample ? matchedSample.sampleResults : SAMPLE_BUNDLES[0].sampleResults;

        const newSession: ReviewSession = {
          id: `session-${Date.now()}`,
          title: sessionTitle || `Đợt rà soát ${subject} ${grade}`,
          createdAt: new Date().toISOString(),
          subject,
          grade,
          scope: scope || 'Toàn bộ nội dung cung cấp',
          documents: documents.map((d) => ({
            id: d.id,
            name: d.name,
            type: d.type,
            wordCount: d.wordCount,
          })),
          criteriaApplied: activeCriteria.map((c) => c.name),
          summaryOverview: sampleResults.summaryOverview,
          counts: {
            total: sampleResults.items.length,
            phuHop: sampleResults.items.filter((i) => i.resultStatus === 'Phù hợp').length,
            canKiemTra: sampleResults.items.filter((i) => i.resultStatus === 'Cần kiểm tra').length,
            chuaTimThay: sampleResults.items.filter((i) => i.resultStatus === 'Chưa tìm thấy căn cứ').length,
            chuaDuDuLieu: sampleResults.items.filter((i) => i.resultStatus === 'Chưa đủ dữ liệu').length,
            teacherConfirmed: 0,
          },
          items: sampleResults.items,
          isDemo: true,
          teacherAuthor,
        };

        onReviewCompleted(newSession);
        return;
      }

      // Call server review API
      const res = await runReviewAnalysis({
        subject,
        grade,
        scope,
        criteriaList: activeCriteria,
        phuLucDoc: { name: phuLuc.name, content: phuLuc.content },
        syllabusDoc: { name: syllabus.name, content: syllabus.content },
        extraDocs,
        isDemoMode: false,
        forceLocalFallback,
      });

      clearInterval(interval);

      const newSession: ReviewSession = {
        id: `session-${Date.now()}`,
        title: sessionTitle || `Đợt rà soát ${subject} ${grade}`,
        createdAt: new Date().toISOString(),
        subject,
        grade,
        scope: scope || 'Toàn bộ tài liệu',
        documents: documents.map((d) => ({
          id: d.id,
          name: d.name,
          type: d.type,
          wordCount: d.wordCount,
        })),
        criteriaApplied: activeCriteria.map((c) => c.name),
        summaryOverview: res.summaryOverview,
        counts: {
          total: res.counts.total,
          phuHop: res.counts.phuHop,
          canKiemTra: res.counts.canKiemTra,
          chuaTimThay: res.counts.chuaTimThay,
          chuaDuDuLieu: res.counts.chuaDuDuLieu,
          teacherConfirmed: 0,
        },
        items: res.items,
        isDemo: res.isDemo ?? false,
        isFallback: res.isFallback ?? false,
        fallbackNotice: res.fallbackNotice,
        teacherAuthor,
      };

      onReviewCompleted(newSession);
    } catch (err: any) {
      clearInterval(interval);
      console.error('Review execution error:', err);
      setErrorMessage(
        err.message || 'Lỗi khi gọi mô hình AI rà soát. Bạn có thể bấm Thử lại hoặc chọn Chế độ phân tích dự phòng.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Hidden inputs for file upload & replace */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.docx,.doc,.xlsx,.xls,.txt,.md"
        className="hidden"
        onChange={(e) => handleFileUpload(e.target.files)}
      />
      <input
        ref={replaceInputRef}
        type="file"
        accept=".pdf,.docx,.doc,.xlsx,.xls,.txt,.md"
        className="hidden"
        onChange={handleReplaceFile}
      />

      {/* Title & Introduction */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
              <FileCheck className="w-5 h-5 text-blue-600" />
              <span>Thiết lập đối chiếu Phụ lục – Syllabus</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Nhập thông tin đợt rà soát, tải lên ít nhất 2 tài liệu chính và tùy chọn bộ tiêu chí chuyên môn
            </p>
          </div>
        </div>

        {/* Form: Scope parameters */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-slate-100">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Lĩnh vực / Môn học <span className="text-rose-500">*</span>
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value as SubjectField)}
              className="w-full text-sm rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="Toán">Toán</option>
              <option value="Tin học">Tin học</option>
              <option value="Robotics">Robotics</option>
              <option value="Vật lí">Vật lí</option>
              <option value="Hóa học">Hóa học</option>
              <option value="Sinh học">Sinh học</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Khối lớp <span className="text-rose-500">*</span>
            </label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value as GradeLevel)}
              className="w-full text-sm rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="Lớp 6">Lớp 6 (THCS)</option>
              <option value="Lớp 7">Lớp 7 (THCS)</option>
              <option value="Lớp 8">Lớp 8 (THCS)</option>
              <option value="Lớp 9">Lớp 9 (THCS)</option>
              <option value="Lớp 10">Lớp 10 (THPT)</option>
              <option value="Lớp 11">Lớp 11 (THPT)</option>
              <option value="Lớp 12">Lớp 12 (THPT)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Giáo viên thực hiện rà soát
            </label>
            <input
              type="text"
              value={teacherAuthor}
              onChange={(e) => setTeacherAuthor(e.target.value)}
              placeholder="VD: Thầy Nguyễn Văn A - Giáo viên bộ môn"
              className="w-full text-sm rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Phạm vi đối chiếu / Tên chủ đề hoặc chương <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              placeholder="VD: Học kỳ I, Chương 1 hoặc toàn bộ Kế hoạch GD năm học"
              className="w-full text-sm rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Tên đợt rà soát
            </label>
            <input
              type="text"
              value={sessionTitle}
              onChange={(e) => setSessionTitle(e.target.value)}
              placeholder="VD: Đợt rà soát định kỳ Học kỳ I"
              className="w-full text-sm rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Section 1: Upload and Manage Documents */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Upload className="w-4.5 h-4.5 text-blue-600" />
              <span>Tài liệu rà soát chuyên môn</span>
            </h2>
            <p className="text-xs text-slate-500">
              Hỗ trợ PDF, DOCX, XLSX, TXT. Yêu cầu bắt buộc phải có ít nhất 1 tệp <span className="font-semibold text-blue-700">Phụ lục</span> và 1 tệp <span className="font-semibold text-blue-700">Syllabus</span>.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => handleAddNewManualDoc(hasSyllabus ? 'Phụ lục' : 'Syllabus')}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-xl transition-colors flex items-center space-x-1"
              title="Nhập hoặc dán nội dung văn bản trực tiếp"
            >
              <span>+ Nhập văn bản trực tiếp</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Tải tài liệu lên</span>
            </button>
          </div>
        </div>

        {/* Upload Dropzone */}
        {documents.length === 0 && (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/20 rounded-2xl p-8 text-center cursor-pointer transition-all"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">
              Nhấp để chọn tệp hoặc kéo thả tài liệu vào đây
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Tải lên Phụ lục phân phối chương trình, Kế hoạch bài dạy (Syllabus), Phân phối chi tiết, Rubric đánh giá (PDF, DOCX, XLSX, TXT).
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                DOCX
              </span>
              <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                PDF
              </span>
              <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                XLSX
              </span>
            </div>
          </div>
        )}

        {/* Document List */}
        {documents.length > 0 && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3">
              {documents.map((doc) => {
                return (
                  <div
                    key={doc.id}
                    className={`border rounded-xl p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      doc.status === 'ready'
                        ? 'border-slate-200 bg-white hover:border-blue-200'
                        : doc.status === 'processing'
                        ? 'border-blue-200 bg-blue-50/30'
                        : 'border-rose-200 bg-rose-50/30'
                    }`}
                  >
                    <div className="flex items-start space-x-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                          doc.format === 'docx' || doc.format === 'doc'
                            ? 'bg-blue-100 text-blue-700'
                            : doc.format === 'xlsx' || doc.format === 'xls'
                            ? 'bg-emerald-100 text-emerald-700'
                            : doc.format === 'pdf'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        <FileText className="w-5 h-5" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold text-slate-900 text-sm truncate max-w-sm">
                            {doc.name}
                          </h4>
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                            {doc.format}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
                          {/* Type Selector Dropdown */}
                          <div className="flex items-center space-x-1">
                            <span className="text-slate-400">Loại:</span>
                            <select
                              value={doc.type}
                              onChange={(e) => {
                                const newType = e.target.value as DocumentType;
                                setDocuments((prev) =>
                                  prev.map((d) => (d.id === doc.id ? { ...d, type: newType } : d))
                                );
                              }}
                              className="text-xs font-semibold rounded-md border border-slate-300 bg-slate-50 px-2 py-0.5 text-slate-700 focus:outline-hidden"
                            >
                              {documentTypesList.map((t) => (
                                <option key={t} value={t}>
                                  {t}
                                </option>
                              ))}
                            </select>
                          </div>

                          <span>•</span>
                          <span>{(doc.size / 1024).toFixed(1)} KB</span>

                          {doc.status === 'ready' && (
                            <>
                              <span>•</span>
                              <span className="text-emerald-700 font-medium">
                                {doc.wordCount.toLocaleString()} từ trích xuất
                                {doc.pageCount ? ` (${doc.pageCount} trang)` : ''}
                              </span>
                            </>
                          )}

                          {doc.status === 'processing' && (
                            <span className="text-blue-600 font-medium flex items-center space-x-1">
                              <RefreshCw className="w-3 h-3 animate-spin" />
                              <span>Đang trích xuất nội dung...</span>
                            </span>
                          )}

                          {doc.status === 'error' && (
                            <span className="text-rose-600 font-medium flex items-center space-x-1">
                              <AlertCircle className="w-3 h-3" />
                              <span>{doc.errorMessage || 'Lỗi đọc tệp'}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center space-x-1.5 shrink-0 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingContentDoc(doc);
                          setEditingContentText(doc.content || '');
                        }}
                        className="p-1.5 text-blue-700 hover:bg-blue-50 rounded-lg text-xs flex items-center space-x-1 font-medium"
                        title="Dán hoặc sửa nội dung văn bản trực tiếp"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Dán/Sửa nội dung</span>
                      </button>

                      {doc.content && (
                        <button
                          onClick={() => setPreviewDoc(doc)}
                          className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-slate-100 rounded-lg text-xs flex items-center space-x-1"
                          title="Xem nội dung trích xuất"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Xem nội dung</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setReplacingDocId(doc.id);
                          replaceInputRef.current?.click();
                        }}
                        className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg text-xs flex items-center space-x-1"
                        title="Thay thế tệp"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Thay thế</span>
                      </button>

                      <button
                        onClick={() => {
                          setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg text-xs"
                        title="Xóa tệp"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Verification checklist banner */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between text-xs gap-2">
              <div className="flex items-center space-x-4">
                <span className="flex items-center space-x-1.5 font-medium">
                  {hasPhuLuc ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                  )}
                  <span className={hasPhuLuc ? 'text-slate-800' : 'text-amber-700'}>
                    Tài liệu Phụ lục: {hasPhuLuc ? 'Đã có' : 'Chưa có'}
                  </span>
                </span>

                <span className="flex items-center space-x-1.5 font-medium">
                  {hasSyllabus ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                  )}
                  <span className={hasSyllabus ? 'text-slate-800' : 'text-amber-700'}>
                    Tài liệu Syllabus: {hasSyllabus ? 'Đã có' : 'Chưa có'}
                  </span>
                </span>
              </div>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-blue-600 hover:text-blue-800 font-semibold"
              >
                + Thêm tài liệu bổ trợ (Kế hoạch, Rubric...)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Section 2: Criteria Configuration */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Sliders className="w-4.5 h-4.5 text-blue-600" />
              <span>Tiêu chí đối chiếu áp dụng ({subject})</span>
            </h2>
            <p className="text-xs text-slate-500">
              Bao gồm 6 tiêu chí chung và các tiêu chí chuyên sâu theo đặc thù môn {subject}. Bạn có thể bật hoặc tắt từng tiêu chí.
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <button
              onClick={() => setSelectedCriteriaIds(relevantCriteria.map((c) => c.id))}
              className="text-blue-600 hover:underline font-medium"
            >
              Chọn tất cả
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={() => setSelectedCriteriaIds([])}
              className="text-slate-500 hover:underline font-medium"
            >
              Bỏ chọn tất cả
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {relevantCriteria.map((criterion) => {
            const isChecked = selectedCriteriaIds.includes(criterion.id);
            return (
              <label
                key={criterion.id}
                className={`flex items-start space-x-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isChecked
                    ? 'border-blue-200 bg-blue-50/20 shadow-2xs'
                    : 'border-slate-200 bg-slate-50/40 opacity-70'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleCriterion(criterion.id)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-900">{criterion.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                        criterion.subject === 'Chung'
                          ? 'bg-slate-100 text-slate-600'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {criterion.category}
                    </span>
                  </div>
                  <p className="text-[11.5px] text-slate-500 mt-1 leading-relaxed">
                    {criterion.description}
                  </p>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Error alert with Action Buttons */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex flex-col sm:flex-row items-start justify-between gap-3 animate-in fade-in">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold">Thông báo rà soát</h4>
              <p className="text-xs text-rose-700 leading-relaxed">{errorMessage}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0 self-end sm:self-center">
            <button
              onClick={() => handleExecuteReview(false, false)}
              disabled={isProcessing}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xs transition-colors flex items-center space-x-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Thử lại bằng AI</span>
            </button>

            <button
              onClick={() => handleExecuteReview(false, true)}
              disabled={isProcessing}
              className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xs transition-colors flex items-center space-x-1"
              title="Sử dụng bộ đối chiếu thông minh cục bộ trực tiếp trên tệp Phụ lục & Syllabus"
            >
              <span>Phân tích dự phòng</span>
            </button>
          </div>
        </div>
      )}

      {/* Processing Animation Modal / Box */}
      {isProcessing && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl text-center space-y-5 animate-in fade-in duration-200">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
              <RefreshCw className="w-8 h-8 animate-spin" />
            </div>

            <div>
              <h3 className="font-bold text-slate-900 text-lg">
                Đang thực hiện rà soát chuyên môn bằng AI
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Vui lòng đợi mô hình AI phân tích và đối chiếu tài liệu theo quy trình 7 bước
              </p>
            </div>

            {/* Stepper indication */}
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-left text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500 font-semibold mb-1">
                <span>Tiến trình xử lý:</span>
                <span className="text-blue-600">Bước {processingStep} / 7</span>
              </div>

              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full transition-all duration-500 rounded-full"
                  style={{ width: `${(processingStep / 7) * 100}%` }}
                />
              </div>

              <p className="text-slate-700 font-medium pt-1">
                {processingStep === 1 && '1. Đọc và bóc tách cấu trúc tài liệu...'}
                {processingStep === 2 && '2. Xác định các mục, chủ đề, số tiết và YCCĐ...'}
                {processingStep === 3 && '3. Ghép các nội dung tương ứng theo ngữ nghĩa...'}
                {processingStep === 4 && '4. Đối chiếu theo các tiêu chí chuyên môn...'}
                {processingStep === 5 && '5. Phân loại kết quả và tìm nguyên nhân sai lệch...'}
                {processingStep === 6 && '6. Trích xuất nguồn tham chiếu nguyên văn...'}
                {processingStep === 7 && '7. Tổng hợp báo cáo để giáo viên thẩm định...'}
              </p>
            </div>

            <p className="text-[11px] text-slate-400 italic">
              AI tuân thủ nguyên tắc không bịa đặt trích dẫn hoặc số trang ngoài tài liệu.
            </p>
          </div>
        </div>
      )}

      {/* Document Text Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{previewDoc.name}</h3>
                  <p className="text-xs text-slate-500">
                    {previewDoc.type} • {previewDoc.wordCount.toLocaleString()} từ
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-500"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto font-mono text-xs text-slate-800 leading-relaxed bg-white whitespace-pre-wrap select-text">
              {previewDoc.content}
            </div>

            <div className="p-3 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => setPreviewDoc(null)}
                className="bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-slate-700"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Text Edit / Paste Modal */}
      {editingContentDoc && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[88vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Nhập / Dán nội dung: {editingContentDoc.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Bạn có thể sao chép và dán toàn bộ nội dung từ tệp Word, Excel hoặc đề cương vào đây
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingContentDoc(null)}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-500"
              >
                ✕
              </button>
            </div>

            <div className="p-4 flex-1 flex flex-col min-h-0 bg-white">
              <textarea
                value={editingContentText}
                onChange={(e) => setEditingContentText(e.target.value)}
                placeholder="Dán nội dung Phụ lục hoặc Syllabus vào đây (bao gồm danh mục bài học, số tiết, yêu cầu cần đạt)..."
                className="w-full flex-1 min-h-[300px] text-xs font-mono p-3.5 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-800 leading-relaxed resize-none"
              />
              <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
                <span>
                  Số từ:{' '}
                  {editingContentText.trim()
                    ? editingContentText.trim().split(/\s+/).length.toLocaleString()
                    : 0}{' '}
                  từ
                </span>
                <span>Nội dung sẽ được bóc tách và đối chiếu trực tiếp</span>
              </div>
            </div>

            <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end space-x-2">
              <button
                onClick={() => setEditingContentDoc(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveDocContent}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-2xs"
              >
                Lưu nội dung tài liệu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Execution Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
        <div className="text-xs text-slate-500">
          {canStartReview ? (
            <span className="text-emerald-700 font-medium flex items-center space-x-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Đã đủ tài liệu Phụ lục và Syllabus. Bạn có thể bắt đầu rà soát.</span>
            </span>
          ) : (
            <span className="text-amber-700 font-medium flex items-center space-x-1">
              <Info className="w-4 h-4 text-amber-600" />
              <span>Cần thêm ít nhất 1 Phụ lục và 1 Syllabus để bắt đầu rà soát.</span>
            </span>
          )}
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          {/* Demo Button if available */}
          <button
            onClick={() => handleExecuteReview(true)}
            disabled={!canStartReview || isProcessing}
            className="flex-1 sm:flex-none bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold px-4 py-3 rounded-xl transition-colors disabled:opacity-50"
            title="Chạy mô phỏng không cần gọi API"
          >
            Chế độ Demo (Minh họa)
          </button>

          {/* Primary AI Execution Button */}
          <button
            onClick={() => handleExecuteReview(false)}
            disabled={!canStartReview || isProcessing}
            className={`flex-1 sm:flex-none text-white text-sm font-semibold px-6 py-3 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 ${
              canStartReview && !isProcessing
                ? 'bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-800 hover:to-blue-700 shadow-blue-500/20 ring-2 ring-blue-500/20'
                : 'bg-slate-300 cursor-not-allowed text-slate-500 shadow-none'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Thực hiện AI rà soát</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
