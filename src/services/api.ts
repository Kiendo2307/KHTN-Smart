import * as XLSX from 'xlsx';
// @ts-ignore
import mammoth from 'mammoth';
import { Criterion, ReviewResultItem, SubjectField, GradeLevel } from '../types';
import { getGeminiApiKey, runClientGeminiReview } from './geminiClient';
import { analyzeDocumentsLocally } from './localAnalyzer';

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

export const checkServerStatus = async (): Promise<{
  status: string;
  hasApiKey: boolean;
  isClientKey?: boolean;
  isStaticDeployment?: boolean;
  error?: string;
}> => {
  const clientKey = getGeminiApiKey();

  try {
    const res = await fetch('/api/status', { signal: AbortSignal.timeout(3000) });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      return {
        ...data,
        hasApiKey: Boolean(data.hasApiKey || clientKey),
        isClientKey: !data.hasApiKey && Boolean(clientKey),
      };
    }
  } catch (err: any) {
    // Expected on static hosting like Netlify (no Express backend)
  }

  // On Netlify / static deployment
  return {
    status: 'ok',
    hasApiKey: Boolean(clientKey),
    isClientKey: Boolean(clientKey),
    isStaticDeployment: true,
  };
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

// Client-side PDF extraction using pdfjs-dist
export const extractPdfInBrowser = async (file: File): Promise<{ text: string; wordCount: number; pageCount: number }> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdfjs = await import('pdfjs-dist');

  // Configure worker for browser environment
  if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version || '4.10.38'}/pdf.worker.min.mjs`;
  }

  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(arrayBuffer),
    useSystemFonts: true,
  });

  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;
  const pageTexts: string[] = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const strings = textContent.items
      .map((item: any) => item.str || '')
      .filter((s: string) => s.trim().length > 0);
    if (strings.length > 0) {
      pageTexts.push(`--- Trang ${pageNum} ---\n` + strings.join(' '));
    }
  }

  const fullText = pageTexts.join('\n\n').trim();
  const wordCount = fullText ? fullText.split(/\s+/).length : 0;

  return {
    text: fullText,
    wordCount,
    pageCount: numPages,
  };
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
      console.warn('Client-side Excel parsing error, falling back:', err);
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
      console.warn('Client-side DOCX parsing error, falling back:', err);
    }
  }

  // 4. PDF documents (.pdf): extract in browser via pdfjs-dist
  if (ext === 'pdf') {
    try {
      const result = await extractPdfInBrowser(file);
      if (result.text && result.text.length > 20) {
        return result;
      }
    } catch (pdfErr) {
      console.warn('Client-side PDF parsing error, trying backend server:', pdfErr);
    }
  }

  // 5. Server-side extraction fallback (if backend server is available)
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
      // HTML response (e.g. Netlify 404 or SPA index.html)
      if (rawText.trim().startsWith('<!DOCTYPE') || rawText.includes('<html')) {
        throw new Error(
          `Ứng dụng đang chạy ở môi trường Netlify tĩnh không có máy chủ nền để giải mã tệp "${file.name}". Vui lòng chuyển tệp sang định dạng .docx, .xlsx hoặc .txt để trích xuất trực tiếp trong trình duyệt, hoặc bấm "Dán/Sửa nội dung" để dán trực tiếp.`
        );
      }
      throw new Error(`Dữ liệu máy chủ trả về không hợp lệ. Vui lòng thử lại.`);
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
  // If force local fallback requested, run local analyzer on actual documents immediately
  if (params.forceLocalFallback) {
    return analyzeDocumentsLocally(params);
  }

  // Check if user has configured client Gemini API key
  const clientApiKey = getGeminiApiKey();

  // Try server endpoint first if available
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch('/api/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const contentType = response.headers.get('content-type') || '';
    if (response.ok && contentType.includes('application/json')) {
      const data = await response.json();
      return data;
    }
  } catch (e) {
    // Server endpoint not reachable or timed out (e.g. Netlify static hosting)
    console.log('Backend /api/review unavailable, using client-side execution path.');
  }

  // If client API key is available, run Gemini directly from browser!
  if (clientApiKey) {
    try {
      return await runClientGeminiReview({
        ...params,
        apiKey: clientApiKey,
      });
    } catch (geminiErr: any) {
      console.warn('Client Gemini AI call failed, falling back to local document analyzer:', geminiErr);
      const fallbackResult = analyzeDocumentsLocally(params);
      fallbackResult.fallbackNotice = `Không thể kết nối Gemini API (${geminiErr.message}). Đã tự động chuyển sang Bộ phân tích tài liệu cục bộ để đối chiếu trực tiếp tài liệu của bạn.`;
      return fallbackResult;
    }
  }

  // If no Gemini API key (e.g. Netlify static deployment without key):
  // Run the intelligent local document cross-check analyzer ON THE ACTUAL USER DOCUMENTS!
  return analyzeDocumentsLocally(params);
};
