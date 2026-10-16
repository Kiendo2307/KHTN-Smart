// Client-side Gemini AI Review Service for Netlify / Static hosting
// Uses @google/genai or REST API with user's Gemini API Key

import { Criterion, ReviewResultItem, SubjectField, GradeLevel } from '../types';
import { ReviewApiResponse } from './api';

const STORAGE_KEY_GEMINI_KEY = 'khtn_gemini_api_key';

export const getGeminiApiKey = (): string => {
  try {
    const local = localStorage.getItem(STORAGE_KEY_GEMINI_KEY);
    if (local && local.trim()) return local.trim();
  } catch (e) {
    console.warn('Cannot read localStorage for API key:', e);
  }

  // Vite environment variable
  const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
  if (envKey && typeof envKey === 'string' && envKey.trim()) {
    return envKey.trim();
  }

  return '';
};

export const setGeminiApiKey = (key: string): void => {
  try {
    if (key.trim()) {
      localStorage.setItem(STORAGE_KEY_GEMINI_KEY, key.trim());
    } else {
      localStorage.removeItem(STORAGE_KEY_GEMINI_KEY);
    }
  } catch (e) {
    console.error('Cannot save API key to localStorage:', e);
  }
};

export const testGeminiApiKey = async (key: string): Promise<{ success: boolean; message: string }> => {
  if (!key.trim()) {
    return { success: false, message: 'Vui lòng nhập khóa API Gemini.' };
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(key.trim())}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Trả về chuỗi ngắn "OK" để xác thực kết nối.' }] }],
      }),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => null);
      const msg = errJson?.error?.message || `Lỗi máy chủ Google (${res.status})`;
      return { success: false, message: msg };
    }

    return { success: true, message: 'Khóa API Gemini hợp lệ và sẵn sàng hoạt động!' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Lỗi mạng khi kiểm tra API Key.' };
  }
};

export const runClientGeminiReview = async (params: {
  apiKey: string;
  subject: SubjectField;
  grade: GradeLevel;
  scope: string;
  criteriaList: Criterion[];
  phuLucDoc: { name: string; content: string };
  syllabusDoc: { name: string; content: string };
  extraDocs?: { name: string; type: string; content: string }[];
}): Promise<ReviewApiResponse> => {
  const { apiKey, subject, grade, scope, criteriaList, phuLucDoc, syllabusDoc, extraDocs = [] } = params;

  const criteriaPrompt = (criteriaList || [])
    .map((c, index) => `${index + 1}. [${c.category || 'Chung'}] ${c.name}: ${c.description}`)
    .join('\n');

  const promptText = `
Bạn là trợ lý AI chuyên môn cao cấp của Tổ Khoa học Tự nhiên (KHTN), hỗ trợ giáo viên đối chiếu Phụ lục với Syllabus theo chương trình giáo dục phổ thông 2018.

LĨNH VỰC/MÔN HỌC: ${subject}
KHỐI LỚP: ${grade}
PHẠM VI/CHỦ ĐỀ: ${scope || 'Toàn bộ nội dung cung cấp'}

TÀI LIỆU 1 - PHỤ LỤC (KHUNG KẾ HOẠCH / PHÂN PHỐI CHƯƠNG TRÌNH):
Tên tệp: ${phuLucDoc.name}
Nội dung:
"""
${phuLucDoc.content.slice(0, 30000)}
"""

TÀI LIỆU 2 - SYLLABUS / KẾ HOẠCH BÀI DẠY (CHI TIẾT):
Tên tệp: ${syllabusDoc.name}
Nội dung:
"""
${syllabusDoc.content.slice(0, 30000)}
"""

${
  extraDocs.length > 0
    ? `TÀI LIỆU BỔ TRỢ:
${extraDocs
  .map(
    (d) => `Tên: ${d.name} (${d.type})
Nội dung:
"""
${d.content.slice(0, 8000)}
"""`
  )
  .join('\n\n')}`
    : ''
}

CÁC TIÊU CHÍ CẦN ĐỐI CHIẾU:
${criteriaPrompt}

HƯỚNG DẪN ĐỐI CHIẾU VÀ NGUYÊN TẮC:
1. Đọc và phân loại từng mục, chủ đề, số tiết, yêu cầu cần đạt (YCCĐ).
2. Ghép nội dung tương ứng theo ngữ cảnh và ý nghĩa thực tế (semantic match), KHÔNG chỉ dựa vào tên gọi chữ cái giống nhau.
3. Phân biệt rõ 4 trạng thái:
   - "Phù hợp": Có căn cứ cho thấy nội dung tương ứng và nhất quán.
   - "Cần kiểm tra": Phát hiện khác biệt về thời lượng số tiết, sai lệch tên/trình tự, thiếu yêu cầu chuyên môn, khác biệt công thức/thí nghiệm/sản phẩm.
   - "Chưa tìm thấy căn cứ": Một bên có nêu nhưng bên kia hoàn toàn không tìm thấy nội dung tương ứng.
   - "Chưa đủ dữ liệu": Thiếu thông tin trong tài liệu để kết luận.
4. NGUỒN THAM CHIẾU: Phải trích dẫn ĐOẠN VĂN NGUYÊN VĂN từ Phụ lục và Syllabus đã cung cấp ở trên. KHÔNG ĐƯỢC TỰ BỊA ĐẶT trích dẫn hoặc số trang. Nếu không rõ số trang, ghi rõ "Chưa xác định được vị trí nguồn".
5. Giải thích ngắn gọn và khách quan vì sao AI đưa ra nhận định, đề xuất điểm giáo viên cần rà soát.

Hãy trả về DUY NHẤT một chuỗi JSON hợp lệ tuân thủ cấu trúc sau:
{
  "summaryOverview": "Đoạn văn tóm tắt tổng quan quá trình đối chiếu chuyên môn giữa Phụ lục và Syllabus",
  "items": [
    {
      "criterionName": "Tên tiêu chí",
      "topicOrItem": "Tên bài hoặc chủ đề",
      "phuLucContent": "Nội dung phản ánh trong Phụ lục",
      "syllabusContent": "Nội dung phản ánh trong Syllabus",
      "resultStatus": "Phù hợp" | "Cần kiểm tra" | "Chưa tìm thấy căn cứ" | "Chưa đủ dữ liệu",
      "checkPoint": "Nhận xét đối chiếu cụ thể",
      "referenceSource": {
        "phuLucDocName": "${phuLucDoc.name}",
        "phuLucLocation": "Vị trí trong Phụ lục",
        "phuLucQuote": "Trích đoạn nguyên văn Phụ lục",
        "syllabusDocName": "${syllabusDoc.name}",
        "syllabusLocation": "Vị trí trong Syllabus",
        "syllabusQuote": "Trích đoạn nguyên văn Syllabus",
        "reasonExplanation": "Lý do và khuyến nghị sư phạm"
      }
    }
  ]
}
Chỉ xuất JSON, không bọc trong backticks nếu có thể, hoặc bọc trong \`\`\`json.
`;

  const models = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.0-flash'];
  let lastError: any = null;

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey.trim())}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json',
          },
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.error?.message || `Lỗi gọi API Google (${response.status})`);
      }

      const resData = await response.json();
      const rawText = resData.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) throw new Error('Không nhận được văn bản phản hồi từ Gemini');

      let clean = rawText.trim();
      if (clean.startsWith('```json')) clean = clean.slice(7);
      if (clean.startsWith('```')) clean = clean.slice(3);
      if (clean.endsWith('```')) clean = clean.slice(0, -3);
      clean = clean.trim();

      const parsed = JSON.parse(clean);
      const items: ReviewResultItem[] = (parsed.items || []).map((item: any, idx: number) => ({
        id: `client-item-${Date.now()}-${idx + 1}`,
        stt: idx + 1,
        criterion: item.criterionName || 'Tiêu chí chung',
        topic: item.topicOrItem || 'Mục đối chiếu',
        phuLucContent: item.phuLucContent || 'Nội dung Phụ lục',
        syllabusContent: item.syllabusContent || 'Nội dung Syllabus',
        resultStatus: ['Phù hợp', 'Cần kiểm tra', 'Chưa tìm thấy căn cứ', 'Chưa đủ dữ liệu'].includes(item.resultStatus)
          ? item.resultStatus
          : 'Cần kiểm tra',
        checkPoint: item.checkPoint || 'Cần rà soát lại thông tin.',
        referenceSource: {
          phuLucDocName: item.referenceSource?.phuLucDocName || phuLucDoc.name,
          phuLucLocation: item.referenceSource?.phuLucLocation || 'Chưa xác định',
          phuLucQuote: item.referenceSource?.phuLucQuote || 'Trích từ Phụ lục',
          syllabusDocName: item.referenceSource?.syllabusDocName || syllabusDoc.name,
          syllabusLocation: item.referenceSource?.syllabusLocation || 'Chưa xác định',
          syllabusQuote: item.referenceSource?.syllabusQuote || 'Trích từ Syllabus',
          reasonExplanation: item.referenceSource?.reasonExplanation || 'Đối chiếu ngữ nghĩa nội dung.',
        },
        teacherVerification: {
          status: 'Chưa xem xét',
          decision: 'none',
          notes: '',
          proposedAdjustment: '',
          updatedAt: null,
        },
      }));

      const counts = {
        total: items.length,
        phuHop: items.filter((i) => i.resultStatus === 'Phù hợp').length,
        canKiemTra: items.filter((i) => i.resultStatus === 'Cần kiểm tra').length,
        chuaTimThay: items.filter((i) => i.resultStatus === 'Chưa tìm thấy căn cứ').length,
        chuaDuDuLieu: items.filter((i) => i.resultStatus === 'Chưa đủ dữ liệu').length,
      };

      return {
        success: true,
        summaryOverview: parsed.summaryOverview || 'Hoàn tất rà soát đối chiếu chuyên môn với AI Gemini.',
        counts,
        items,
      };
    } catch (err: any) {
      console.warn(`Attempt with ${model} failed:`, err);
      lastError = err;
    }
  }

  throw lastError || new Error('Không thể kết nối đến AI Gemini.');
};
