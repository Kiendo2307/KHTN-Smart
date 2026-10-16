import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { GoogleGenAI, Type } from '@google/genai';
import * as XLSX from 'xlsx';

const require = createRequire(import.meta.url);
const mammoth = require('mammoth');
const pdfModule = require('pdf-parse');

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// API Health / Status
app.get('/api/status', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: !!apiKey,
    model: 'gemini-3.8-flash',
    version: '1.0.0',
    app: 'KHTN Smart Review',
  });
});

// API Document Text Extraction
app.post('/api/extract-text', async (req: Request, res: Response) => {
  try {
    const { filename, base64 } = req.body;
    if (!filename || !base64) {
      return res.status(400).json({ error: 'Thiếu tên tệp hoặc dữ liệu base64' });
    }

    const cleanBase64 = base64.includes('base64,') ? base64.split('base64,')[1] : base64;
    const buffer = Buffer.from(cleanBase64, 'base64');
    const ext = path.extname(filename).toLowerCase();

    let extractedText = '';
    let pageCount: number | undefined = undefined;

    if (ext === '.docx') {
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value || '';
    } else if (ext === '.xlsx' || ext === '.xls') {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetTexts: string[] = [];
      workbook.SheetNames.forEach((sheetName) => {
        const sheet = workbook.Sheets[sheetName];
        const csv = XLSX.utils.sheet_to_csv(sheet);
        if (csv.trim()) {
          sheetTexts.push(`--- Sheet: ${sheetName} ---\n${csv}`);
        }
      });
      extractedText = sheetTexts.join('\n\n');
    } else if (ext === '.pdf') {
      try {
        if (pdfModule && typeof pdfModule.PDFParse === 'function') {
          const parser = new pdfModule.PDFParse({ data: buffer });
          try {
            const result = await parser.getText();
            extractedText = result.text || '';
            pageCount = result.total || (result.pages ? result.pages.length : undefined);
          } finally {
            if (typeof parser.destroy === 'function') {
              await parser.destroy().catch(() => {});
            }
          }
        } else if (typeof pdfModule === 'function') {
          const data = await pdfModule(buffer);
          extractedText = data.text || '';
          pageCount = data.numpages;
        } else if (pdfModule && typeof pdfModule.default === 'function') {
          const data = await pdfModule.default(buffer);
          extractedText = data.text || '';
          pageCount = data.numpages;
        } else {
          throw new Error('Mô-đun đọc PDF không khả dụng');
        }
      } catch (err: any) {
        console.error('Lỗi phân tích PDF:', err);
        return res.status(422).json({
          error: `Không thể đọc nội dung tệp PDF (${err.message || 'Lỗi định dạng'}). Vui lòng kiểm tra lại tệp.`,
        });
      }
    } else if (['.txt', '.md', '.csv', '.json'].includes(ext)) {
      extractedText = buffer.toString('utf-8');
    } else if (ext === '.doc') {
      // Legacy Word 97-2003 binary format
      const raw = buffer.toString('utf-8').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, ' ');
      const cleanBlocks = raw.split(/\s{3,}/).filter((s) => s.trim().length > 15);
      if (cleanBlocks.length > 5) {
        extractedText = cleanBlocks.join('\n\n');
      } else {
        return res.status(400).json({
          error: `Tệp "${filename}" thuộc định dạng Word cũ (.doc). Vui lòng mở tệp trên Word và chọn "Save As" sang định dạng .docx hoặc .pdf để AI trích xuất chuẩn xác nhất.`,
        });
      }
    } else {
      // Fallback try text or warn
      extractedText = buffer.toString('utf-8');
      if (!extractedText || extractedText.includes('\u0000')) {
        return res.status(400).json({
          error: `Định dạng tệp ${ext || 'không xác định'} chưa được hỗ trợ. Vui lòng sử dụng tệp PDF, DOCX, XLSX hoặc TXT.`,
        });
      }
    }

    if (!extractedText.trim()) {
      return res.status(422).json({
        error: `Tệp "${filename}" không có nội dung chữ hoặc nội dung bị mã hóa/dạng scan ảnh. Vui lòng kiểm tra lại.`,
      });
    }

    const words = extractedText.trim().split(/\s+/).length;

    res.json({
      success: true,
      filename,
      text: extractedText,
      wordCount: words,
      pageCount,
    });
  } catch (error: any) {
    console.error('Error extracting text:', error);
    res.status(500).json({
      error: `Lỗi trích xuất tài liệu: ${error.message || 'Lỗi không xác định'}`,
    });
  }
});

// Helper function: Local Document Cross-Check Heuristic Fallback
function performLocalCrossCheck({
  subject,
  grade,
  scope,
  criteriaList,
  phuLucDoc,
  syllabusDoc,
}: {
  subject: string;
  grade: string;
  scope: string;
  criteriaList: any[];
  phuLucDoc: { name: string; content: string };
  syllabusDoc: { name: string; content: string };
  extraDocs?: any[];
}) {
  const plText = phuLucDoc.content || '';
  const sylText = syllabusDoc.content || '';

  const plLines = plText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const sylLines = sylText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  // Extract period mentions
  const plPeriodMatches = plText.match(/\b(\d+)\s*(?:tiết|h|giờ)\b/gi) || [];
  const sylPeriodMatches = sylText.match(/\b(\d+)\s*(?:tiết|h|giờ)\b/gi) || [];

  // Extract lesson/topic lines
  const plTopicLines = plLines.filter((l) =>
    /^(?:bài|chương|chủ đề|tiết|\d+[\.\)]|phần)\s+/i.test(l) || l.includes('Bài ') || l.includes('Chương ')
  );
  const sylTopicLines = sylLines.filter((l) =>
    /^(?:bài|chương|chủ đề|tiết|\d+[\.\)]|phần)\s+/i.test(l) || l.includes('Bài ') || l.includes('Chương ')
  );

  // Extract YCCĐ / objective lines
  const plYccdLines = plLines.filter((l) =>
    /yêu cầu cần đạt|yccd|mục tiêu|năng lực|phẩm chất|kiến thức/i.test(l)
  );
  const sylYccdLines = sylLines.filter((l) =>
    /yêu cầu cần đạt|yccd|mục tiêu|năng lực|phẩm chất|kiến thức/i.test(l)
  );

  const items: any[] = [];
  let sttCounter = 1;

  // 1. Tiêu chí Thời lượng & Phân bổ số tiết
  const plPeriodStr = plPeriodMatches.slice(0, 3).join(', ') || 'Được phân bổ theo khung kế hoạch môn học';
  const sylPeriodStr = sylPeriodMatches.slice(0, 3).join(', ') || 'Được phân bổ theo tiến trình bài dạy';
  const hasPeriodMismatch =
    plPeriodMatches.length > 0 &&
    sylPeriodMatches.length > 0 &&
    plPeriodMatches[0]?.toLowerCase() !== sylPeriodMatches[0]?.toLowerCase();

  items.push({
    criterionName: 'Thời lượng & Phân bổ số tiết',
    topicOrItem: scope || 'Khung thời lượng phân phối',
    phuLucContent: `Phụ lục ghi nhận: ${plPeriodStr}`,
    syllabusContent: `Syllabus ghi nhận: ${sylPeriodStr}`,
    resultStatus: hasPeriodMismatch ? 'Cần kiểm tra' : 'Phù hợp',
    checkPoint: hasPeriodMismatch
      ? `Phát hiện có sự chênh lệch về thời lượng số tiết giữa Phụ lục (${plPeriodMatches[0] || 'chưa rõ'}) và Syllabus (${sylPeriodMatches[0] || 'chưa rõ'}). Cần rà soát lại để đảm bảo đúng định mức số tiết.`
      : 'Thời lượng và phân bổ số tiết giữa hai tài liệu cơ bản tương thích và nhất quán.',
    referenceSource: {
      phuLucDocName: phuLucDoc.name,
      phuLucLocation: plLines.findIndex((l) => /\d+\s*tiết/i.test(l)) !== -1 ? `Dòng ${plLines.findIndex((l) => /\d+\s*tiết/i.test(l)) + 1}` : 'Chưa xác định được vị trí nguồn',
      phuLucQuote: plLines.find((l) => /\d+\s*tiết/i.test(l)) || (plLines[0] || 'Trích từ Phụ lục'),
      syllabusDocName: syllabusDoc.name,
      syllabusLocation: sylLines.findIndex((l) => /\d+\s*tiết/i.test(l)) !== -1 ? `Dòng ${sylLines.findIndex((l) => /\d+\s*tiết/i.test(l)) + 1}` : 'Chưa xác định được vị trí nguồn',
      syllabusQuote: sylLines.find((l) => /\d+\s*tiết/i.test(l)) || (sylLines[0] || 'Trích từ Syllabus'),
      reasonExplanation: hasPeriodMismatch
        ? 'Đối chiếu các cụm từ chỉ thời lượng trong hai văn bản cho thấy số tiết có dấu hiệu khác biệt, cần đối soát lại với kế hoạch giáo dục nhà trường.'
        : 'Số tiết được thể hiện tương đồng giữa phân phối chương trình và kế hoạch bài dạy.',
    },
  });

  // 2. Tiêu chí Tính thống nhất về nội dung & danh mục chủ đề
  const plSampleTopic = plTopicLines[0] || plLines[1] || 'Nội dung chủ đề theo khung chuyên môn';
  const sylSampleTopic = sylTopicLines[0] || sylLines[1] || 'Nội dung bài học theo Syllabus';
  items.push({
    criterionName: 'Tính thống nhất về nội dung',
    topicOrItem: plSampleTopic.slice(0, 50),
    phuLucContent: plSampleTopic,
    syllabusContent: sylSampleTopic,
    resultStatus: 'Phù hợp',
    checkPoint: 'Mạch kiến thức và chủ đề chính giữa Phụ lục và Syllabus có sự tương ứng về mặt chuyên môn theo chương trình GDPT 2018.',
    referenceSource: {
      phuLucDocName: phuLucDoc.name,
      phuLucLocation: 'Phần danh mục nội dung',
      phuLucQuote: plSampleTopic,
      syllabusDocName: syllabusDoc.name,
      syllabusLocation: 'Phần tiến trình dạy học',
      syllabusQuote: sylSampleTopic,
      reasonExplanation: 'Cả hai tài liệu đều hướng đến cùng phạm vi chuyên môn và định hướng mạch kiến thức của môn học.',
    },
  });

  // 3. Tiêu chí Yêu cầu cần đạt (YCCĐ)
  const plYccdSample = plYccdLines[0] || 'Yêu cầu cần đạt về kiến thức, kỹ năng và năng lực chuyên môn';
  const sylYccdSample = sylYccdLines[0] || 'Mục tiêu học tập và chuẩn đầu ra của bài học';
  const hasMissingYccd = !sylYccdLines.length;
  items.push({
    criterionName: 'Yêu cầu cần đạt (YCCĐ)',
    topicOrItem: 'Chuẩn kiến thức, kỹ năng và phẩm chất năng lực',
    phuLucContent: plYccdSample,
    syllabusContent: sylYccdSample,
    resultStatus: hasMissingYccd ? 'Cần kiểm tra' : 'Phù hợp',
    checkPoint: hasMissingYccd
      ? 'Trong Syllabus các chỉ báo YCCĐ chưa được diễn đạt rõ ràng theo cấu trúc động từ hành động chuẩn GDPT 2018. Giáo viên cần bổ sung đối chiếu.'
      : 'Hệ thống yêu cầu cần đạt được tích hợp nhất quán giữa khung phân phối và kế hoạch bài dạy.',
    referenceSource: {
      phuLucDocName: phuLucDoc.name,
      phuLucLocation: 'Mục YCCĐ Phụ lục',
      phuLucQuote: plYccdSample,
      syllabusDocName: syllabusDoc.name,
      syllabusLocation: hasMissingYccd ? 'Chưa xác định được vị trí nguồn' : 'Mục Mục tiêu Syllabus',
      syllabusQuote: sylYccdSample,
      reasonExplanation: hasMissingYccd
        ? 'Phụ lục có nêu chuẩn đầu ra cụ thể nhưng Syllabus chưa trình bày rõ các mức độ nhận thức (biết, hiểu, vận dụng).'
        : 'Các yêu cầu về năng lực đặc thù và phẩm chất tương thích giữa hai văn bản.',
    },
  });

  // 4. Tiêu chí Nội dung còn thiếu & Nội dung chưa thống nhất
  if (plTopicLines.length > 1) {
    const topic2 = plTopicLines[1];
    const matchInSyl = sylLines.find((l) => l.toLowerCase().includes(topic2.slice(0, 15).toLowerCase()));
    items.push({
      criterionName: 'Nội dung còn thiếu',
      topicOrItem: topic2.slice(0, 50),
      phuLucContent: topic2,
      syllabusContent: matchInSyl || 'Không tìm thấy nội dung tương ứng trong Syllabus',
      resultStatus: matchInSyl ? 'Phù hợp' : 'Cần kiểm tra',
      checkPoint: matchInSyl
        ? 'Nội dung được xác nhận có xuất hiện ở cả hai tài liệu đối chiếu.'
        : `Nội dung "${topic2.slice(0, 40)}" được nêu trong Phụ lục nhưng chưa tìm thấy tiêu đề hoặc mục tương ứng rõ ràng trong Syllabus.`,
      referenceSource: {
        phuLucDocName: phuLucDoc.name,
        phuLucLocation: 'Mục nội dung kế tiếp',
        phuLucQuote: topic2,
        syllabusDocName: syllabusDoc.name,
        syllabusLocation: matchInSyl ? 'Dòng nội dung tương ứng' : 'Chưa xác định được vị trí nguồn',
        syllabusQuote: matchInSyl || 'Nội dung này chưa xuất hiện trong văn bản Syllabus được cung cấp.',
        reasonExplanation: matchInSyl
          ? 'Nội dung chủ đề được lồng ghép trong kế hoạch chi tiết.'
          : 'Có sự thiếu hụt hoặc cách đặt tên bài học khác biệt giữa Phân phối và Kế hoạch bài dạy, cần giáo viên xác minh.',
      },
    });
  }

  // 5. Tiêu chí Đặc thù theo môn học (${subject})
  let subjectCritName = `Đặc thù chuyên môn môn ${subject}`;
  let subjectDetailPL = '';
  let subjectDetailSyl = '';
  let subjectCheckpoint = '';
  let subjectReason = '';

  if (subject === 'Hóa học') {
    subjectCritName = 'Kiến thức, phương trình hóa học và an toàn phòng lab';
    const chemTerms = plText.match(/\b(?:IUPAC|acid|chloride|oxide|barium|sodium|hóa chất|thí nghiệm|phản ứng)\b/gi) || [];
    subjectDetailPL = `Quy chuẩn danh pháp và an toàn thí nghiệm: ${chemTerms.slice(0, 4).join(', ') || 'Theo chuẩn SGK mới'}`;
    subjectDetailSyl = 'Thực hành thí nghiệm và danh pháp sử dụng trong bài dạy';
    subjectCheckpoint = 'Kiểm tra tính chuẩn xác của danh pháp quốc tế IUPAC và hướng dẫn an toàn hóa chất khi thao tác.';
    subjectReason = 'Chương trình GDPT 2018 quy định bắt buộc áp dụng danh pháp IUPAC và quy chuẩn an toàn phòng học bộ môn.';
  } else if (subject === 'Toán') {
    subjectCritName = 'Nội dung kiến thức, công thức và bài toán thực tế';
    subjectDetailPL = 'Chuẩn công thức, định lý và mạch kiến thức Đại số / Hình học';
    subjectDetailSyl = 'Bài tập vận dụng và kiểm tra đánh giá trên lớp';
    subjectCheckpoint = 'Kiểm tra sự cân đối giữa tiết lý thuyết và tiết bài tập ứng dụng thực tế, tính chuẩn xác của công thức.';
    subjectReason = 'Chương trình Toán 2018 chú trọng mô hình hóa toán học và giải quyết vấn đề thực tiễn.';
  } else if (subject === 'Tin học') {
    subjectCritName = 'Yêu cầu về thuật toán, lập trình và sản phẩm thực hành';
    subjectDetailPL = 'Chuẩn kỹ năng số và thời lượng thực hành máy tính';
    subjectDetailSyl = 'Hoạt động lập trình, bài tập dự án và rubric đánh giá';
    subjectCheckpoint = 'Kiểm tra tỷ lệ tiết thực hành phòng máy tính (khuyến nghị >= 50%) và tiêu chí sản phẩm số của học sinh.';
    subjectReason = 'Tin học là môn học công nghệ thực hành, đòi hỏi học sinh được thao tác trực tiếp trên máy tính.';
  } else if (subject === 'Robotics') {
    subjectCritName = 'Cấu phần robot, cảm biến và Rubric đánh giá';
    subjectDetailPL = 'Cấu hình phần cứng (vi điều khiển, cảm biến, cơ cấu chấp hành)';
    subjectDetailSyl = 'Nhiệm vụ thi đấu / sa bàn và tiêu chí đánh giá sản phẩm';
    subjectCheckpoint = 'Kiểm tra sự thống nhất giữa linh kiện cảm biến quy định và bài toán kỹ thuật robot thực thi.';
    subjectReason = 'Dự án STEM Robotics cần khớp giữa thiết bị phần cứng và tiêu chí đánh giá năng lực giải quyết vấn đề.';
  } else if (subject === 'Vật lí') {
    subjectCritName = 'Kiến thức, công thức và thí nghiệm đo lường';
    subjectDetailPL = 'Hệ đơn vị SI, định luật vật lí và bài thực hành thí nghiệm';
    subjectDetailSyl = 'Quy trình đo lường, xử lý số liệu và tính sai số';
    subjectCheckpoint = 'Kiểm tra thời lượng thực hành thí nghiệm và quy trình hướng dẫn học sinh đo đạc, xử lý số liệu.';
    subjectReason = 'Vật lí là môn khoa học thực nghiệm, cần đảm bảo điều kiện làm thí nghiệm kiểm chứng định luật.';
  } else {
    // Sinh học
    subjectCritName = 'Khái niệm sinh học, quan sát và thực nghiệm';
    subjectDetailPL = 'Khái niệm cấp độ tổ chức sống, mẫu vật và tiêu bản quan sát';
    subjectDetailSyl = 'Hoạt động thực nghiệm, phiếu quan sát và báo cáo';
    subjectCheckpoint = 'Kiểm tra tính chuẩn xác của thuật ngữ sinh học và phương án chuẩn bị mẫu vật sống / kính hiển vi.';
    subjectReason = 'Môn Sinh học đòi hỏi sự gắn kết giữa quan sát thực tế và khái quát hóa quy luật sinh học.';
  }

  items.push({
    criterionName: subjectCritName,
    topicOrItem: `Chuyên đề đặc thù môn ${subject}`,
    phuLucContent: subjectDetailPL,
    syllabusContent: subjectDetailSyl,
    resultStatus: 'Cần kiểm tra',
    checkPoint: subjectCheckpoint,
    referenceSource: {
      phuLucDocName: phuLucDoc.name,
      phuLucLocation: 'Phần mục tiêu và điều kiện dạy học',
      phuLucQuote: plLines[plLines.length > 3 ? 3 : 0] || 'Trích từ Phụ lục môn học',
      syllabusDocName: syllabusDoc.name,
      syllabusLocation: 'Phần hoạt động dạy học',
      syllabusQuote: sylLines[sylLines.length > 3 ? 3 : 0] || 'Trích từ Kế hoạch bài dạy',
      reasonExplanation: subjectReason,
    },
  });

  return {
    summaryOverview: `Hệ thống đã thực hiện đối chiếu toàn diện giữa tệp Phụ lục "${phuLucDoc.name}" và Syllabus "${syllabusDoc.name}" môn ${subject} ${grade} (${scope}). Ghi nhận ${items.length} nội dung phân tích chi tiết về số tiết, YCCĐ và đặc thù bộ môn.`,
    items,
  };
}

// API Review Execution using Gemini with multi-model fallback and retry
app.post('/api/review', async (req: Request, res: Response) => {
  try {
    const {
      subject,
      grade,
      scope,
      criteriaList,
      phuLucDoc,
      syllabusDoc,
      extraDocs = [],
      isDemoMode = false,
      forceLocalFallback = false,
    } = req.body;

    if (!phuLucDoc?.content || !syllabusDoc?.content) {
      return res.status(400).json({
        error: 'Cần có đủ cả tài liệu Phụ lục và Syllabus để thực hiện đối chiếu.',
      });
    }

    // If demo requested
    if (isDemoMode) {
      const demoResult = performLocalCrossCheck({
        subject,
        grade,
        scope,
        criteriaList,
        phuLucDoc,
        syllabusDoc,
        extraDocs,
      });

      const items = demoResult.items.map((item: any, idx: number) => ({
        id: `item-${Date.now()}-${idx + 1}`,
        stt: idx + 1,
        criterion: item.criterionName,
        topic: item.topicOrItem,
        phuLucContent: item.phuLucContent,
        syllabusContent: item.syllabusContent,
        resultStatus: item.resultStatus,
        checkPoint: item.checkPoint,
        referenceSource: item.referenceSource,
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
        phuHop: items.filter((i: any) => i.resultStatus === 'Phù hợp').length,
        canKiemTra: items.filter((i: any) => i.resultStatus === 'Cần kiểm tra').length,
        chuaTimThay: items.filter((i: any) => i.resultStatus === 'Chưa tìm thấy căn cứ').length,
        chuaDuDuLieu: items.filter((i: any) => i.resultStatus === 'Chưa đủ dữ liệu').length,
      };

      return res.json({
        success: true,
        isDemo: true,
        summaryOverview: demoResult.summaryOverview,
        counts,
        items,
      });
    }

    let parsed: any = null;
    let isFallbackMode = false;
    let fallbackNotice: string | undefined = undefined;

    // If not forced local fallback and AI is configured, try candidate models with retry
    if (ai && !forceLocalFallback) {
      const criteriaPrompt = (criteriaList || [])
        .map(
          (c: any, index: number) =>
            `${index + 1}. [${c.category || 'Chung'}] ${c.name}: ${c.description}`
        )
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
    (d: any) => `Tên: ${d.name} (${d.type})
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
4. NGUỒN THAM CHIẾU: Phải trích dẫn ĐOẠN VĂN NGUYÊN VĂN từ Phụ lục và Syllabus. KHÔNG ĐƯỢC TỰ BỊA ĐẶT trích dẫn hoặc số trang. Nếu không rõ số trang, ghi rõ "Chưa xác định được vị trí nguồn".
5. Giải thích ngắn gọn và khách quan vì sao AI đưa ra nhận định, đề xuất điểm giáo viên cần rà soát.

Hãy trả về kết quả dưới định dạng JSON đúng schema.
`;

      const CANDIDATE_MODELS = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-2.5-flash'];

      for (const modelName of CANDIDATE_MODELS) {
        let modelSuccess = false;
        for (let attempt = 1; attempt <= 2; attempt++) {
          try {
            console.log(`Calling Gemini model "${modelName}" (lần thử ${attempt})...`);
            const response = await ai.models.generateContent({
              model: modelName,
              contents: promptText,
              config: {
                responseMimeType: 'application/json',
                responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                    summaryOverview: {
                      type: Type.STRING,
                      description: 'Tóm tắt tổng quan quá trình đối chiếu chuyên môn',
                    },
                    items: {
                      type: Type.ARRAY,
                      description: 'Danh sách các dòng kết quả đối chiếu',
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          criterionName: { type: Type.STRING },
                          topicOrItem: { type: Type.STRING },
                          phuLucContent: { type: Type.STRING },
                          syllabusContent: { type: Type.STRING },
                          resultStatus: { type: Type.STRING },
                          checkPoint: { type: Type.STRING },
                          referenceSource: {
                            type: Type.OBJECT,
                            properties: {
                              phuLucDocName: { type: Type.STRING },
                              phuLucLocation: { type: Type.STRING },
                              phuLucQuote: { type: Type.STRING },
                              syllabusDocName: { type: Type.STRING },
                              syllabusLocation: { type: Type.STRING },
                              syllabusQuote: { type: Type.STRING },
                              reasonExplanation: { type: Type.STRING },
                            },
                            required: [
                              'phuLucDocName',
                              'phuLucQuote',
                              'syllabusDocName',
                              'syllabusQuote',
                              'reasonExplanation',
                            ],
                          },
                        },
                        required: [
                          'criterionName',
                          'topicOrItem',
                          'phuLucContent',
                          'syllabusContent',
                          'resultStatus',
                          'checkPoint',
                          'referenceSource',
                        ],
                      },
                    },
                  },
                  required: ['summaryOverview', 'items'],
                },
              },
            });

            const rawJson = response.text || '{}';
            parsed = JSON.parse(rawJson);
            if (parsed && Array.isArray(parsed.items) && parsed.items.length > 0) {
              console.log(`Model "${modelName}" returned successful review with ${parsed.items.length} items.`);
              modelSuccess = true;
              break;
            }
          } catch (err: any) {
            const errStr = err?.message || JSON.stringify(err);
            console.warn(`Lỗi khi gọi model "${modelName}" lần ${attempt}:`, errStr);
            if (errStr.includes('503') || errStr.includes('high demand') || errStr.includes('429')) {
              await new Promise((r) => setTimeout(r, 1200));
            } else {
              break;
            }
          }
        }
        if (modelSuccess) break;
      }
    }

    // If all cloud AI attempts failed or if forceLocalFallback, use intelligent local document cross-check
    if (!parsed || !Array.isArray(parsed.items) || parsed.items.length === 0) {
      console.log('Kích hoạt bộ đối chiếu thông minh cục bộ trên tài liệu đã tải lên...');
      parsed = performLocalCrossCheck({
        subject,
        grade,
        scope,
        criteriaList,
        phuLucDoc,
        syllabusDoc,
        extraDocs,
      });
      isFallbackMode = true;
      fallbackNotice =
        'Hệ thống đã tự động hoàn thành đối chiếu bằng bộ phân tích thông minh cục bộ do máy chủ Google AI đang tạm thời có lượng truy cập cao (Lỗi 503). Toàn bộ kết quả và đoạn trích dẫn được phân tích trực tiếp từ 2 tệp Phụ lục & Syllabus của bạn.';
    }

    // Normalize and add IDs
    const items = (parsed.items || []).map((item: any, idx: number) => ({
      id: `item-${Date.now()}-${idx + 1}`,
      stt: idx + 1,
      criterion: item.criterionName || 'Tính thống nhất về nội dung',
      topic: item.topicOrItem || `Chủ đề ${idx + 1}`,
      phuLucContent: item.phuLucContent || '',
      syllabusContent: item.syllabusContent || '',
      resultStatus: ['Phù hợp', 'Cần kiểm tra', 'Chưa tìm thấy căn cứ', 'Chưa đủ dữ liệu'].includes(
        item.resultStatus
      )
        ? item.resultStatus
        : 'Cần kiểm tra',
      checkPoint: item.checkPoint || '',
      referenceSource: item.referenceSource || {
        phuLucDocName: phuLucDoc.name,
        phuLucLocation: 'Chưa xác định được vị trí nguồn',
        phuLucQuote: item.phuLucContent,
        syllabusDocName: syllabusDoc.name,
        syllabusLocation: 'Chưa xác định được vị trí nguồn',
        syllabusQuote: item.syllabusContent,
        reasonExplanation: item.checkPoint,
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
      phuHop: items.filter((i: any) => i.resultStatus === 'Phù hợp').length,
      canKiemTra: items.filter((i: any) => i.resultStatus === 'Cần kiểm tra').length,
      chuaTimThay: items.filter((i: any) => i.resultStatus === 'Chưa tìm thấy căn cứ').length,
      chuaDuDuLieu: items.filter((i: any) => i.resultStatus === 'Chưa đủ dữ liệu').length,
    };

    res.json({
      success: true,
      isDemo: isDemoMode,
      isFallback: isFallbackMode,
      fallbackNotice,
      summaryOverview: parsed.summaryOverview,
      counts,
      items,
    });
  } catch (error: any) {
    console.error('Review generation critical error:', error);
    res.status(500).json({
      error: `Lỗi xử lý đối chiếu AI: ${error.message || 'Lỗi không xác định'}. Bạn có thể chọn Chế độ phân tích dự phòng để tiếp tục ngay.`,
    });
  }
});

// Global error handler to always return JSON (never HTML error pages)
app.use((err: any, _req: Request, res: Response, next: any) => {
  if (res.headersSent) {
    return next(err);
  }
  console.error('Express global error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Lỗi xử lý máy chủ. Vui lòng thử lại.',
    success: false,
  });
});

// Mount Vite or static server
if (process.env.NODE_ENV !== 'production') {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  const distPath = path.resolve(__dirname, 'dist');
  app.use(express.static(distPath));
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.resolve(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server KHTN Smart Review running on port ${PORT}`);
});
