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
  // If plain text file, we can also read directly in browser for fast response
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext === 'txt' || ext === 'md' || ext === 'csv' || ext === 'json') {
    const text = await file.text();
    const wordCount = text.trim().split(/\s+/).length;
    return { text, wordCount };
  }

  // For binary/docx/xlsx/pdf, send to server
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

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Không thể trích xuất nội dung từ tệp');
  }

  return {
    text: data.text,
    wordCount: data.wordCount,
    pageCount: data.pageCount,
  };
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

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Lỗi khi thực hiện phân tích đối chiếu bằng AI');
  }

  return data;
};
