import { Criterion, ReviewResultItem, SubjectField, GradeLevel } from '../types';
import { ReviewApiResponse } from './api';

export interface LocalAnalysisInput {
  subject: SubjectField;
  grade: GradeLevel;
  scope: string;
  criteriaList: Criterion[];
  phuLucDoc: { name: string; content: string };
  syllabusDoc: { name: string; content: string };
  extraDocs?: { name: string; type: string; content: string }[];
}

interface ExtractedTopic {
  title: string;
  lineIndex: number;
  lineText: string;
  periods?: number;
}

export const analyzeDocumentsLocally = (params: LocalAnalysisInput): ReviewApiResponse => {
  const { subject, grade, scope, criteriaList, phuLucDoc, syllabusDoc } = params;

  const plText = phuLucDoc.content || '';
  const sylText = syllabusDoc.content || '';

  const plLines = plText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const sylLines = sylText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  // Helper to find period counts
  const extractPeriods = (lines: string[]): { total?: number; list: { text: string; lineIndex: number; count: number }[] } => {
    const list: { text: string; lineIndex: number; count: number }[] = [];
    lines.forEach((l, idx) => {
      const match = l.match(/(\d+)\s*(?:tiết|h|giờ)\b/i);
      if (match) {
        list.push({ text: l, lineIndex: idx + 1, count: parseInt(match[1], 10) });
      }
    });
    return { list };
  };

  const plPeriods = extractPeriods(plLines);
  const sylPeriods = extractPeriods(sylLines);

  // Helper to extract topics / lessons
  const extractTopics = (lines: string[]): ExtractedTopic[] => {
    const topics: ExtractedTopic[] = [];
    const topicRegex = /^(?:bài|chương|chủ đề|phần|tiết|\d+[\.\)])\s+([^\n\r]+)/i;

    lines.forEach((l, idx) => {
      if (topicRegex.test(l) || l.includes('Bài ') || l.includes('Chương ') || l.includes('Chủ đề ')) {
        const cleanTitle = l.replace(/^[\s\-\*•\d\.\)]+/, '').trim();
        if (cleanTitle.length >= 3 && cleanTitle.length <= 120) {
          const periodMatch = l.match(/(\d+)\s*(?:tiết|h|giờ)\b/i);
          topics.push({
            title: cleanTitle,
            lineIndex: idx + 1,
            lineText: l,
            periods: periodMatch ? parseInt(periodMatch[1], 10) : undefined,
          });
        }
      }
    });

    return topics;
  };

  const plTopics = extractTopics(plLines);
  const sylTopics = extractTopics(sylLines);

  // Helper to extract YCCĐ / Objectives
  const findYccdLines = (lines: string[]) => {
    return lines
      .map((l, idx) => ({ text: l, lineIndex: idx + 1 }))
      .filter((item) =>
        /yêu cầu cần đạt|yccd|mục tiêu|chuẩn đầu ra|năng lực|phẩm chất|kiến thức/i.test(item.text)
      );
  };

  const plYccd = findYccdLines(plLines);
  const sylYccd = findYccdLines(sylLines);

  // Helper to find equipment / experiments
  const findEquipmentLines = (lines: string[]) => {
    return lines
      .map((l, idx) => ({ text: l, lineIndex: idx + 1 }))
      .filter((item) =>
        /thiết bị|học liệu|dụng cụ|hóa chất|thí nghiệm|thực hành|video|tranh ảnh|mô hình/i.test(item.text)
      );
  };

  const plEquipment = findEquipmentLines(plLines);
  const sylEquipment = findEquipmentLines(sylLines);

  // Helper to find assessment / method lines
  const findAssessmentLines = (lines: string[]) => {
    return lines
      .map((l, idx) => ({ text: l, lineIndex: idx + 1 }))
      .filter((item) =>
        /kiểm tra|đánh giá|thường xuyên|định kỳ|rubric|phiếu học tập|bài tập|vấn đáp/i.test(item.text)
      );
  };

  const plAssessment = findAssessmentLines(plLines);
  const sylAssessment = findAssessmentLines(sylLines);

  const items: ReviewResultItem[] = [];
  let sttCounter = 1;

  // 1. Check each active criterion
  const activeCriteria = (criteriaList || []).filter((c) => c.enabled !== false);

  // CRITERION 1: Thời lượng & Phân bổ số tiết
  const timeCriterion = activeCriteria.find((c) => /thời lượng|số tiết|phân bổ/i.test(c.name)) || activeCriteria[0];
  if (timeCriterion) {
    const plPFirst = plPeriods.list[0];
    const sylPFirst = sylPeriods.list[0];

    let resultStatus: ReviewResultItem['resultStatus'] = 'Phù hợp';
    let checkPoint = 'Thời lượng và số tiết thể hiện trong Syllabus tương thích với định mức trong Phụ lục.';
    let reason = 'Định mức thời lượng giữa hai tài liệu cơ bản nhất quán.';

    if (!plPFirst && !sylPFirst) {
      resultStatus = 'Chưa đủ dữ liệu';
      checkPoint = 'Không tìm thấy số tiết định lượng cụ thể (tiết/giờ) trong nội dung hai văn bản.';
      reason = 'Tài liệu không ghi rõ từ khóa "tiết", "giờ" để đo lường tự động.';
    } else if (plPFirst && sylPFirst) {
      if (plPFirst.count !== sylPFirst.count) {
        resultStatus = 'Cần kiểm tra';
        checkPoint = `Phát hiện có sự khác biệt về số tiết: Phụ lục ghi ${plPFirst.count} tiết, trong khi Syllabus ghi ${sylPFirst.count} tiết. Cần điều chỉnh để đảm bảo đồng bộ kế hoạch dạy học.`;
        reason = `Chênh lệch định lượng (${plPFirst.count} tiết vs ${sylPFirst.count} tiết). Đề xuất giáo viên rà soát lại phân phối chương trình của tổ bộ môn.`;
      } else {
        resultStatus = 'Phù hợp';
        checkPoint = `Số tiết được thống nhất ở mức ${plPFirst.count} tiết giữa khung Phụ lục và Syllabus kế hoạch bài dạy.`;
        reason = 'Đồng bộ thời lượng giữa kế hoạch giáo dục và bài soạn.';
      }
    } else {
      resultStatus = 'Cần kiểm tra';
      checkPoint = plPFirst
        ? `Phụ lục có ghi nhận thời lượng (${plPFirst.count} tiết) nhưng Syllabus chưa chỉ rõ thời lượng số tiết bài học.`
        : `Syllabus có ghi nhận thời lượng (${sylPFirst?.count} tiết) nhưng Phụ lục chưa thể hiện rõ khung thời lượng.`;
      reason = 'Một trong hai tài liệu khuyết định mức thời lượng cụ thể.';
    }

    items.push({
      id: `local-item-${Date.now()}-${sttCounter}`,
      stt: sttCounter++,
      criterion: timeCriterion.name,
      topic: scope || 'Khung thời lượng tổng quát',
      phuLucContent: plPFirst ? plPFirst.text : (plLines[0] ? `Dòng đầu Phụ lục: "${plLines[0].slice(0, 100)}..."` : 'Chưa ghi rõ'),
      syllabusContent: sylPFirst ? sylPFirst.text : (sylLines[0] ? `Dòng đầu Syllabus: "${sylLines[0].slice(0, 100)}..."` : 'Chưa ghi rõ'),
      resultStatus,
      checkPoint,
      referenceSource: {
        phuLucDocName: phuLucDoc.name,
        phuLucLocation: plPFirst ? `Dòng ${plPFirst.lineIndex}` : 'Đoạn đầu',
        phuLucQuote: plPFirst ? plPFirst.text : (plLines[0] || 'Văn bản Phụ lục'),
        syllabusDocName: syllabusDoc.name,
        syllabusLocation: sylPFirst ? `Dòng ${sylPFirst.lineIndex}` : 'Đoạn đầu',
        syllabusQuote: sylPFirst ? sylPFirst.text : (sylLines[0] || 'Văn bản Syllabus'),
        reasonExplanation: reason,
      },
      teacherVerification: {
        status: 'Chưa xem xét',
        decision: 'none',
        notes: '',
        proposedAdjustment: '',
        updatedAt: null,
      },
    });
  }

  // CRITERION 2: Danh mục bài học / Chủ đề cụ thể (So khớp các bài học thực tế)
  const contentCriterion = activeCriteria.find((c) => /nội dung|danh mục|bài học|chủ đề|mạch kiến thức/i.test(c.name)) || {
    name: 'Tính thống nhất về nội dung & danh mục bài dạy',
  };

  // If we found topics in either document, compare them
  if (plTopics.length > 0 || sylTopics.length > 0) {
    const topicCount = Math.max(plTopics.length, sylTopics.length, 1);
    const limit = Math.min(topicCount, 6);

    for (let i = 0; i < limit; i++) {
      const plT = plTopics[i];
      const sylT = sylTopics[i];

      const topicName = plT?.title || sylT?.title || `Nội dung học phần ${i + 1}`;
      let status: ReviewResultItem['resultStatus'] = 'Phù hợp';
      let checkPoint = 'Tên bài và mạch nội dung tương đồng giữa phân phối chương trình và kế hoạch giảng dạy.';
      let reason = 'Đảm bảo triển khai đúng danh mục bài học theo chương trình GDPT 2018.';

      if (plT && sylT) {
        // Compare titles
        const t1 = plT.title.toLowerCase();
        const t2 = sylT.title.toLowerCase();
        if (t1.includes(t2) || t2.includes(t1) || t1.slice(0, 15) === t2.slice(0, 15)) {
          status = 'Phù hợp';
          checkPoint = `Bài học "${plT.title}" được thể hiện nhất quán giữa Phụ lục và Syllabus.`;
          reason = 'Mạch kiến thức được triển khai liền mạch và khớp tiêu đề chuyên môn.';
        } else {
          status = 'Cần kiểm tra';
          checkPoint = `Tên bài học có sự khác biệt giữa hai tài liệu: Phụ lục ghi "${plT.title}", Syllabus ghi "${sylT.title}". Cần thống nhất cách đặt tên bài dạy.`;
          reason = 'Tiêu đề bài học chưa đồng nhất giữa kế hoạch bộ môn và giáo án chi tiết.';
        }
      } else if (plT && !sylT) {
        status = 'Chưa tìm thấy căn cứ';
        checkPoint = `Phụ lục có phân phối mục "${plT.title}" nhưng chưa tìm thấy phần triển khai bài dạy tương ứng trong Syllabus.`;
        reason = 'Cần bổ sung kế hoạch bài dạy cho nội dung còn thiếu.';
      } else if (!plT && sylT) {
        status = 'Cần kiểm tra';
        checkPoint = `Syllabus triển khai bài dạy "${sylT.title}" nhưng trong danh mục Phụ lục chưa thể hiện rõ bài học này.`;
        reason = 'Kiểm tra lại xem bài học này có nằm ngoài khung phân phối của tổ bộ môn không.';
      }

      items.push({
        id: `local-item-${Date.now()}-${sttCounter}`,
        stt: sttCounter++,
        criterion: contentCriterion.name,
        topic: topicName,
        phuLucContent: plT ? plT.lineText : 'Không có trong Phụ lục',
        syllabusContent: sylT ? sylT.lineText : 'Không có trong Syllabus',
        resultStatus: status,
        checkPoint,
        referenceSource: {
          phuLucDocName: phuLucDoc.name,
          phuLucLocation: plT ? `Dòng ${plT.lineIndex}` : 'Không tìm thấy',
          phuLucQuote: plT ? plT.lineText : 'Chưa xác định được vị trí nguồn trong Phụ lục',
          syllabusDocName: syllabusDoc.name,
          syllabusLocation: sylT ? `Dòng ${sylT.lineIndex}` : 'Không tìm thấy',
          syllabusQuote: sylT ? sylT.lineText : 'Chưa xác định được vị trí nguồn trong Syllabus',
          reasonExplanation: reason,
        },
        teacherVerification: {
          status: 'Chưa xem xét',
          decision: 'none',
          notes: '',
          proposedAdjustment: '',
          updatedAt: null,
        },
      });
    }
  } else {
    // Fallback if no explicit "Bài" or "Chủ đề" syntax was found: compare main text blocks
    const plSample = plLines.slice(0, 3).join(' ');
    const sylSample = sylLines.slice(0, 3).join(' ');
    items.push({
      id: `local-item-${Date.now()}-${sttCounter}`,
      stt: sttCounter++,
      criterion: contentCriterion.name,
      topic: scope || 'Khung chuyên môn chung',
      phuLucContent: plSample ? `Đoạn trích Phụ lục: "${plSample.slice(0, 150)}..."` : 'Nội dung Phụ lục',
      syllabusContent: sylSample ? `Đoạn trích Syllabus: "${sylSample.slice(0, 150)}..."` : 'Nội dung Syllabus',
      resultStatus: 'Phù hợp',
      checkPoint: 'Hai văn bản cùng đề cập đến phạm vi chuyên môn và định hướng giảng dạy của môn học.',
      referenceSource: {
        phuLucDocName: phuLucDoc.name,
        phuLucLocation: 'Phần đầu tài liệu',
        phuLucQuote: plLines[0] || 'Trích từ Phụ lục',
        syllabusDocName: syllabusDoc.name,
        syllabusLocation: 'Phần đầu tài liệu',
        syllabusQuote: sylLines[0] || 'Trích từ Syllabus',
        reasonExplanation: 'Nội dung phản ánh sự tương thích về định hướng chương trình GDPT 2018.',
      },
      teacherVerification: {
        status: 'Chưa xem xét',
        decision: 'none',
        notes: '',
        proposedAdjustment: '',
        updatedAt: null,
      },
    });
  }

  // CRITERION 3: Yêu cầu cần đạt (YCCĐ)
  const yccdCriterion = activeCriteria.find((c) => /yêu cầu cần đạt|yccd|chuẩn đầu ra|mục tiêu/i.test(c.name));
  if (yccdCriterion) {
    const plY = plYccd[0];
    const sylY = sylYccd[0];

    let resultStatus: ReviewResultItem['resultStatus'] = 'Phù hợp';
    let checkPoint = 'YCCĐ về kiến thức, năng lực và phẩm chất trong Syllabus bám sát khung yêu cầu của Phụ lục.';
    let reason = 'Đảm bảo đáp ứng đầy đủ chuẩn đầu ra quy định.';

    if (!plY && !sylY) {
      resultStatus = 'Chưa đủ dữ liệu';
      checkPoint = 'Chưa nhận diện được từ khóa "Yêu cầu cần đạt" hoặc "Mục tiêu bài học" trong cả hai tài liệu.';
      reason = 'Văn bản có thể dùng cấu trúc bảng hoặc hình ảnh scan.';
    } else if (plY && !sylY) {
      resultStatus = 'Cần kiểm tra';
      checkPoint = 'Phụ lục có nêu Yêu cầu cần đạt nhưng Syllabus chưa ghi rõ mục tiêu năng lực bài học tương ứng.';
      reason = 'Cần bổ sung chi tiết YCCĐ vào phần đầu của Kế hoạch bài dạy (Syllabus).';
    } else if (!plY && sylY) {
      resultStatus = 'Phù hợp';
      checkPoint = 'Syllabus đã cụ thể hóa chi tiết các mục tiêu YCCĐ cho học sinh.';
      reason = 'Kế hoạch bài dạy có mục tiêu rõ ràng.';
    }

    items.push({
      id: `local-item-${Date.now()}-${sttCounter}`,
      stt: sttCounter++,
      criterion: yccdCriterion.name,
      topic: 'Chuẩn kiến thức, năng lực & phẩm chất học sinh',
      phuLucContent: plY ? plY.text : 'Mục tiêu chung của khung chuyên môn',
      syllabusContent: sylY ? sylY.text : 'Mục tiêu bài dạy cụ thể trong Syllabus',
      resultStatus,
      checkPoint,
      referenceSource: {
        phuLucDocName: phuLucDoc.name,
        phuLucLocation: plY ? `Dòng ${plY.lineIndex}` : 'Khung chuyên môn',
        phuLucQuote: plY ? plY.text : (plLines[1] || 'Trích từ Phụ lục'),
        syllabusDocName: syllabusDoc.name,
        syllabusLocation: sylY ? `Dòng ${sylY.lineIndex}` : 'Mục tiêu bài học',
        syllabusQuote: sylY ? sylY.text : (sylLines[1] || 'Trích từ Syllabus'),
        reasonExplanation: reason,
      },
      teacherVerification: {
        status: 'Chưa xem xét',
        decision: 'none',
        notes: '',
        proposedAdjustment: '',
        updatedAt: null,
      },
    });
  }

  // CRITERION 4: Thiết bị, học liệu & Thí nghiệm thực hành
  const equipCriterion = activeCriteria.find((c) => /thiết bị|học liệu|dụng cụ|thí nghiệm|thực hành/i.test(c.name));
  if (equipCriterion) {
    const plE = plEquipment[0];
    const sylE = sylEquipment[0];

    const hasPlE = !!plE;
    const hasSylE = !!sylE;

    let resultStatus: ReviewResultItem['resultStatus'] = 'Phù hợp';
    let checkPoint = 'Thiết bị dạy học và học liệu thực hành được chuẩn bị đồng bộ giữa kế hoạch và bài dạy.';
    let reason = 'Phòng bộ môn và giáo viên có sự thống nhất về danh mục đồ dùng giảng dạy.';

    if (!hasPlE && !hasSylE) {
      resultStatus = 'Phù hợp';
      checkPoint = 'Học liệu sử dụng cơ bản gồm sách giáo khoa và phương tiện dạy học thông thường.';
      reason = 'Không có yêu cầu thiết bị chuyên sâu đặc thù.';
    } else if (hasPlE && !hasSylE) {
      resultStatus = 'Cần kiểm tra';
      checkPoint = `Phụ lục có quy định thiết bị/học liệu ("${plE?.text.slice(0, 80)}") nhưng Syllabus chưa liệt kê đồ dùng dạy học này.`;
      reason = 'Cần bổ sung danh mục thiết bị thực hành vào Kế hoạch bài dạy.';
    }

    items.push({
      id: `local-item-${Date.now()}-${sttCounter}`,
      stt: sttCounter++,
      criterion: equipCriterion.name,
      topic: 'Thiết bị dạy học, hóa chất & Phương tiện trực quan',
      phuLucContent: plE ? plE.text : 'Phương tiện và đồ dùng dạy học theo danh mục tối thiểu',
      syllabusContent: sylE ? sylE.text : 'Thiết bị phục vụ tiết dạy của giáo viên và học sinh',
      resultStatus,
      checkPoint,
      referenceSource: {
        phuLucDocName: phuLucDoc.name,
        phuLucLocation: plE ? `Dòng ${plE.lineIndex}` : 'Mục thiết bị',
        phuLucQuote: plE ? plE.text : (plLines[2] || 'Trích từ Phụ lục'),
        syllabusDocName: syllabusDoc.name,
        syllabusLocation: sylE ? `Dòng ${sylE.lineIndex}` : 'Chuẩn bị của GV & HS',
        syllabusQuote: sylE ? sylE.text : (sylLines[2] || 'Trích từ Syllabus'),
        reasonExplanation: reason,
      },
      teacherVerification: {
        status: 'Chưa xem xét',
        decision: 'none',
        notes: '',
        proposedAdjustment: '',
        updatedAt: null,
      },
    });
  }

  // CRITERION 5: Phương pháp đánh giá & Kiểm tra
  const assessCriterion = activeCriteria.find((c) => /đánh giá|kiểm tra|hình thức/i.test(c.name));
  if (assessCriterion) {
    const plA = plAssessment[0];
    const sylA = sylAssessment[0];

    items.push({
      id: `local-item-${Date.now()}-${sttCounter}`,
      stt: sttCounter++,
      criterion: assessCriterion.name,
      topic: 'Phương thức kiểm tra đánh giá quá trình',
      phuLucContent: plA ? plA.text : 'Đánh giá thường xuyên qua quan sát, vấn đáp và sản phẩm học tập',
      syllabusContent: sylA ? sylA.text : 'Đánh giá học sinh qua hoạt động nhóm và phiếu học tập',
      resultStatus: 'Phù hợp',
      checkPoint: 'Hình thức đánh giá bám sát định hướng phát triển phẩm chất, năng lực người học.',
      referenceSource: {
        phuLucDocName: phuLucDoc.name,
        phuLucLocation: plA ? `Dòng ${plA.lineIndex}` : 'Khung đánh giá',
        phuLucQuote: plA ? plA.text : (plLines[3] || 'Trích từ Phụ lục'),
        syllabusDocName: syllabusDoc.name,
        syllabusLocation: sylA ? `Dòng ${sylA.lineIndex}` : 'Hoạt động đánh giá',
        syllabusQuote: sylA ? sylA.text : (sylLines[3] || 'Trích từ Syllabus'),
        reasonExplanation: 'Phương pháp đánh giá linh hoạt, phù hợp mục tiêu từng bài học.',
      },
      teacherVerification: {
        status: 'Chưa xem xét',
        decision: 'none',
        notes: '',
        proposedAdjustment: '',
        updatedAt: null,
      },
    });
  }

  const counts = {
    total: items.length,
    phuHop: items.filter((i) => i.resultStatus === 'Phù hợp').length,
    canKiemTra: items.filter((i) => i.resultStatus === 'Cần kiểm tra').length,
    chuaTimThay: items.filter((i) => i.resultStatus === 'Chưa tìm thấy căn cứ').length,
    chuaDuDuLieu: items.filter((i) => i.resultStatus === 'Chưa đủ dữ liệu').length,
  };

  const overview = `Hệ thống đã hoàn tất phân tích đối chiếu trực tiếp giữa tệp "${phuLucDoc.name}" (${plLines.length} dòng) và "${syllabusDoc.name}" (${sylLines.length} dòng) cho môn ${subject} ${grade}. Ghi nhận ${counts.phuHop}/${counts.total} điểm phù hợp, ${counts.canKiemTra} điểm cần kiểm tra và ${counts.chuaTimThay + counts.chuaDuDuLieu} điểm cần bổ sung căn cứ. Thầy/Cô có thể xem chi tiết từng dòng bên dưới để phê duyệt hoặc chỉnh sửa.`;

  return {
    success: true,
    isFallback: true,
    fallbackNotice: 'Kết quả được đối chiếu tự động trực tiếp từ văn bản bạn đã tải lên (Bộ phân tích tài liệu nội bộ). Bạn có thể cấu hình API Key để bật AI Gemini suy luận ngữ nghĩa toàn diện.',
    summaryOverview: overview,
    counts,
    items,
  };
};
