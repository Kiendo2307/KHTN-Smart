export type SubjectField = 'Toán' | 'Tin học' | 'Robotics' | 'Vật lí' | 'Hóa học' | 'Sinh học';

export type GradeLevel =
  | 'Lớp 6'
  | 'Lớp 7'
  | 'Lớp 8'
  | 'Lớp 9'
  | 'Lớp 10'
  | 'Lớp 11'
  | 'Lớp 12';

export type DocumentType =
  | 'Phụ lục'
  | 'Syllabus'
  | 'Kế hoạch bài dạy'
  | 'Phân phối chương trình'
  | 'Rubric đánh giá'
  | 'Tài liệu khác';

export interface DocumentItem {
  id: string;
  name: string;
  type: DocumentType;
  size: number;
  format: string; // pdf, docx, xlsx, txt
  status: 'ready' | 'processing' | 'error';
  content: string;
  wordCount: number;
  pageCount?: number;
  errorMessage?: string;
  isMandatory?: boolean;
  uploadedAt: string;
}

export type CriterionCategory =
  | 'Tính thống nhất'
  | 'Thời lượng'
  | 'Yêu cầu cần đạt'
  | 'Nội dung còn thiếu'
  | 'Nội dung chưa thống nhất'
  | 'Căn cứ đối chiếu'
  | 'Đặc thù môn học';

export interface Criterion {
  id: string;
  subject: SubjectField | 'Chung';
  name: string;
  description: string;
  category: CriterionCategory;
  enabled: boolean;
  isCustom?: boolean;
}

export type ResultStatus = 'Phù hợp' | 'Cần kiểm tra' | 'Chưa tìm thấy căn cứ' | 'Chưa đủ dữ liệu';

export type TeacherDecision = 'none' | 'confirmed' | 'recheck' | 'ai_incorrect';

export type TeacherReviewStatus = 'Chưa xem xét' | 'Đang kiểm tra' | 'Đã xác nhận' | 'Đã xử lý';

export interface ReferenceSource {
  phuLucDocName: string;
  phuLucLocation: string; // Số trang, mục hoặc "Chưa xác định được vị trí nguồn"
  phuLucQuote: string; // Đoạn trích nguyên văn từ Phụ lục
  syllabusDocName: string;
  syllabusLocation: string; // Số trang, mục
  syllabusQuote: string; // Đoạn trích nguyên văn từ Syllabus
  reasonExplanation: string; // Giải thích ngắn gọn vì sao AI đưa ra nhận định
}

export interface TeacherVerification {
  status: TeacherReviewStatus;
  decision: TeacherDecision;
  notes: string;
  proposedAdjustment: string;
  updatedAt: string | null;
  teacherName?: string;
}

export interface ReviewResultItem {
  id: string;
  stt: number;
  criterion: string;
  topic: string;
  phuLucContent: string;
  syllabusContent: string;
  resultStatus: ResultStatus;
  checkPoint: string;
  referenceSource: ReferenceSource;
  teacherVerification: TeacherVerification;
}

export interface ReviewSessionCounts {
  total: number;
  phuHop: number;
  canKiemTra: number;
  chuaTimThay: number;
  chuaDuDuLieu: number;
  teacherConfirmed: number;
}

export interface ReviewSession {
  id: string;
  title: string;
  createdAt: string;
  subject: SubjectField;
  grade: GradeLevel;
  scope: string;
  documents: {
    id: string;
    name: string;
    type: DocumentType;
    wordCount: number;
  }[];
  criteriaApplied: string[];
  summaryOverview: string;
  counts: ReviewSessionCounts;
  items: ReviewResultItem[];
  isDemo?: boolean;
  isFallback?: boolean;
  fallbackNotice?: string;
  teacherAuthor?: string;
}
