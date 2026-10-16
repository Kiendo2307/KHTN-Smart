import * as XLSX from 'xlsx';
// @ts-ignore
import mammoth from 'mammoth';
import { Criterion, ReviewResultItem, SubjectField, GradeLevel } from '../types';

export interface ReviewApiResponse {
  success: boolean;
  isDemo?: boolean;
  isFallback?: boolean;
  fallbackNotice?: string;
  summaryOverview: string;
  counts: {
    total: number;
    phuHop: number;
    canKiemTra: number;
    chuaTimThay: number;
    chuaDuDuLieu: number;
  };
  items: ReviewResultItem[];
  error?: string;
}

export const checkServerStatus = async () => {
  try {
    const res = await fetch('/api/status');
    if (!res.ok) throw new Error('Server returned ' + res.status);
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return { status: 'ok', hasApiKey: true };
    }
    return await res.json();
  } catch (err: any) {
    return {
      status: 'error',
      hasApiKey: false,
      error: err.message,
    };
  }
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export const extractFileText = async (file: File): Promise<{
  text: string;
  wordCount: number;
  pageCount?: number;
}> => {
  const ext = file.name.split('.').pop()?.toLowerCase();

  // 1. Plain text formats: read directly in browser
  if (ext === 'txt' || ext === 'md' || ext === 'json' || ext === 'csv') {
    try {
      const text = await file.text();
      if (text.trim()) {
        const wordCount = text.trim().split(/\s+/).length;
        return { text, wordCount };
      }
    } catch (e) {
      console.warn('Direct text read failed, falling back:', e);
    }
  }

  // 2. Excel spreadsheets (.xlsx, .xls): extract directly in browser via XLSX
  if (ext === 'xlsx' || ext === 'xls') {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetTexts: string[] = [];

      workbook.SheetNames.forEach((sheetName) => {
        const sheet = workbook.Sheets[sheetName];
        if (sheet) {
          const csv = XLSX.utils.sheet_to_csv(sheet);
          if (csv && csv.trim()) {
            sheetTexts.push(`--- Sheet: ${sheetName} ---\n${csv}`);
          }
        }
      });

      const text = sheetTexts.join('\n\n');
      if (text.trim()) {
        const wordCount = text.trim().split(/\s+/).length;
        return { text, wordCount };
      }
    } catch (err: any) {
      console.warn('Client-side Excel parsing error, falling back to server:', err);
    }
  }

  // 3. Word documents (.docx): extract in browser via mammoth
  if (ext === 'docx') {
    try {
      const arrayBuffer = await file.arrayBuffer();
      if (mammoth && typeof mammoth.extractRawText === 'function') {
        const result = await mammoth.extractRawText({ arrayBuffer });
        if (result && result.value && result.value.trim()) {
          const text = result.value;
          const wordCount = text.trim().split(/\s+/).length;
          return { text, wordCount };
        }
      }
    } catch (err: any) {
      console.warn('Client-side DOCX parsing error, falling back to server:', err);
    }
  }

  // 4. Server-side extraction fallback (PDF, complex binary formats)
  try {
    const base64 = await fileToBase64(file);
    const response = await fetch('/api/extract-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: file.name,
        base64,
        mimeType: file.type,
      }),
    });

    const rawText = await response.text();
    let data: any = null;
    try {
      data = JSON.parse(rawText);
    } catch {
      console.error('Server returned non-JSON text:', rawText.slice(0, 300));
      if (rawText.trim().startsWith('<!DOCTYPE') || rawText.includes('<html')) {
        if (response.status === 413) {
          throw new Error(
            `Tệp "${file.name}" có dung lượng quá lớn (Mã 413 Payload Too Large). Vui lòng dùng tệp nhỏ hơn hoặc bấm nút "Dán/Sửa nội dung" để nhập trực tiếp.`
          );
        }
        if (response.status === 502 || response.status === 504) {
          throw new Error(
            `Máy chủ đang tạm thời bận hoặc kết nối mạng bị gián đoạn (Mã ${response.status}). Vui lòng thử lại sau giây lát.`
          );
        }
        throw new Error(
          `Máy chủ phản hồi trang web (HTML) thay vì dữ liệu JSON (Mã ${response.status}). Thường xảy ra khi tệp có định dạng phức tạp hoặc máy chủ đang khởi động lại. Bạn có thể bấm "Dán/Sửa nội dung" để dán nội dung trực tiếp.`
        );
      }
      throw new Error(`Dữ liệu máy chủ trả về không hợp lệ (Mã ${response.status}). Vui lòng thử lại.`);
    }

    if (!response.ok || !data.success) {
      throw new Error(data?.error || `Không thể trích xuất nội dung từ tệp "${file.name}"`);
    }

    return {
      text: data.text,
      wordCount: data.wordCount,
      pageCount: data.pageCount,
    };
  } catch (networkErr: any) {
    console.error('Extraction error:', networkErr);
    throw new Error(networkErr.message || 'Lỗi khi trích xuất nội dung tệp. Vui lòng thử lại.');
  }
};

export const runReviewAnalysis = async (params: {
  subject: SubjectField;
  grade: GradeLevel;
  scope: string;
  criteriaList: Criterion[];
  phuLucDoc: { name: string; content: string };
  syllabusDoc: { name: string; content: string };
  extraDocs?: { name: string; type: string; content: string }[];
  isDemoMode?: boolean;
  forceLocalFallback?: boolean;
}): Promise<ReviewApiResponse> => {
  const response = await fetch('/api/review', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const rawText = await response.text();
  let data: any = null;
  try {
    data = JSON.parse(rawText);
  } catch {
    console.error('Server returned non-JSON review text:', rawText.slice(0, 300));
    if (rawText.trim().startsWith('<!DOCTYPE') || rawText.includes('<html')) {
      throw new Error(
        `Máy chủ trả về trang web HTML thay vì dữ liệu đối chiếu JSON (Mã ${response.status}). Vui lòng thử lại hoặc bật "Chế độ phân tích dự phòng" để hoàn thành rà soát ngay lập tức.`
      );
    }
    throw new Error('Phản hồi đối chiếu từ máy chủ không hợp lệ. Vui lòng thử lại.');
  }

  if (!response.ok) {
    throw new Error(data?.error || 'Lỗi khi thực hiện phân tích đối chiếu');
  }

  return data;
};
