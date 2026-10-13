import * as XLSX from 'xlsx';
import { ReviewSession } from '../types';

export const exportToExcel = (session: ReviewSession) => {
  // Sheet 1: Detailed 7-column table + teacher verification
  const tableData = session.items.map((item) => ({
    'STT': item.stt,
    'Tiêu chí': item.criterion,
    'Chủ đề/Mục': item.topic,
    'Nội dung Phụ lục': item.phuLucContent,
    'Nội dung Syllabus': item.syllabusContent,
    'Kết quả AI': item.resultStatus,
    'Nội dung cần kiểm tra': item.checkPoint,
    'Nguồn Phụ lục': `${item.referenceSource.phuLucDocName} (${item.referenceSource.phuLucLocation})`,
    'Trích dẫn Phụ lục': item.referenceSource.phuLucQuote,
    'Nguồn Syllabus': `${item.referenceSource.syllabusDocName} (${item.referenceSource.syllabusLocation})`,
    'Trích dẫn Syllabus': item.referenceSource.syllabusQuote,
    'Giải thích AI': item.referenceSource.reasonExplanation,
    'Trạng thái GV': item.teacherVerification.status,
    'Quyết định GV':
      item.teacherVerification.decision === 'confirmed'
        ? 'Đã xác nhận'
        : item.teacherVerification.decision === 'recheck'
        ? 'Yêu cầu kiểm tra lại'
        : item.teacherVerification.decision === 'ai_incorrect'
        ? 'AI nhận định chưa chính xác'
        : 'Chưa có',
    'Ghi chú GV': item.teacherVerification.notes || '',
    'Đề xuất điều chỉnh': item.teacherVerification.proposedAdjustment || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(tableData);

  // Column widths
  worksheet['!cols'] = [
    { wch: 6 }, // STT
    { wch: 26 }, // Tiêu chí
    { wch: 22 }, // Chủ đề
    { wch: 35 }, // Phụ lục
    { wch: 35 }, // Syllabus
    { wch: 18 }, // Kết quả AI
    { wch: 35 }, // Cần kiểm tra
    { wch: 25 }, // Nguồn PL
    { wch: 40 }, // Trích dẫn PL
    { wch: 25 }, // Nguồn Syl
    { wch: 40 }, // Trích dẫn Syl
    { wch: 35 }, // Giải thích AI
    { wch: 16 }, // Trạng thái GV
    { wch: 20 }, // Quyết định GV
    { wch: 30 }, // Ghi chú GV
    { wch: 30 }, // Đề xuất
  ];

  // Sheet 2: Summary overview
  const summaryData = [
    { 'Chỉ số': 'Tên đợt rà soát', 'Giá trị': session.title },
    { 'Chỉ số': 'Thời điểm thực hiện', 'Giá trị': new Date(session.createdAt).toLocaleString('vi-VN') },
    { 'Chỉ số': 'Môn học / Lĩnh vực', 'Giá trị': session.subject },
    { 'Chỉ số': 'Khối lớp', 'Giá trị': session.grade },
    { 'Chỉ số': 'Phạm vi rà soát', 'Giá trị': session.scope },
    { 'Chỉ số': 'Người thực hiện', 'Giá trị': session.teacherAuthor || 'Giáo viên bộ môn' },
    { 'Chỉ số': 'Tổng số nội dung đối chiếu', 'Giá trị': session.counts.total },
    { 'Chỉ số': 'Số nội dung Phù hợp', 'Giá trị': session.counts.phuHop },
    { 'Chỉ số': 'Số nội dung Cần kiểm tra', 'Giá trị': session.counts.canKiemTra },
    { 'Chỉ số': 'Số nội dung Chưa tìm thấy căn cứ', 'Giá trị': session.counts.chuaTimThay },
    { 'Chỉ số': 'Số nội dung Chưa đủ dữ liệu', 'Giá trị': session.counts.chuaDuDuLieu },
    { 'Chỉ số': 'Số nội dung GV đã xác nhận', 'Giá trị': session.counts.teacherConfirmed },
    { 'Chỉ số': 'Đánh giá tổng quan', 'Giá trị': session.summaryOverview },
  ];
  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  summarySheet['!cols'] = [{ wch: 30 }, { wch: 60 }];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Bảng Kết Quả Đối Chiếu');
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Tổng Hợp & Đánh Giá');

  const fileName = `KHTN_Smart_Review_${session.subject}_${session.grade}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};

export const exportToWordDoc = (session: ReviewSession) => {
  const dateFormatted = new Date(session.createdAt).toLocaleDateString('vi-VN');
  const confirmedRatio = session.counts.total > 0
    ? Math.round((session.counts.teacherConfirmed / session.counts.total) * 100)
    : 0;

  const htmlContent = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>Báo Cáo Rà Soát Hồ Sơ Chuyên Môn KHTN</title>
  <style>
    body { font-family: 'Times New Roman', Times, serif; font-size: 13pt; line-height: 1.4; color: #111; margin: 20mm; }
    .header-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .header-table td { border: none; vertical-align: top; text-align: center; font-size: 11pt; }
    h1 { font-size: 16pt; font-weight: bold; text-align: center; text-transform: uppercase; margin-top: 15px; margin-bottom: 6px; }
    h2 { font-size: 13pt; text-align: center; font-style: italic; font-weight: normal; margin-bottom: 20px; }
    .meta-box { background-color: #f8fafc; border: 1px solid #cbd5e1; padding: 12px; margin-bottom: 20px; }
    .meta-box p { margin: 4px 0; }
    table.data-table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 11pt; }
    table.data-table th, table.data-table td { border: 1px solid #334155; padding: 6px 8px; vertical-align: top; }
    table.data-table th { background-color: #e2e8f0; font-weight: bold; text-align: center; }
    .status-badge { font-weight: bold; }
    .status-phuhop { color: #047857; }
    .status-kiemtra { color: #b45309; }
    .status-chuatimthay { color: #b91c1c; }
    .footer-signatures { width: 100%; border-collapse: collapse; margin-top: 40px; page-break-inside: avoid; }
    .footer-signatures td { border: none; text-align: center; vertical-align: top; width: 50%; }
    .citation-box { font-size: 10pt; color: #334155; margin-top: 4px; padding-top: 4px; border-top: 1px dashed #cbd5e1; }
    .disclaimer { font-size: 10.5pt; font-style: italic; color: #475569; margin-top: 25px; border-top: 1px solid #cbd5e1; padding-top: 10px; }
  </style>
</head>
<body>
  <table class="header-table">
    <tr>
      <td style="width: 45%;">
        TRƯỜNG PHỔ THÔNG LIÊN CẤP<br>
        <strong>TỔ KHOA HỌC TỰ NHIÊN</strong><br>
        Số: ......./BC-KHTN
      </td>
      <td style="width: 55%;">
        <strong>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong><br>
        Độc lập – Tự do – Hạnh phúc<br>
        ------------------------<br>
        <em>Ngày ${dateFormatted}</em>
      </td>
    </tr>
  </table>

  <h1>BÁO CÁO KẾT QUẢ ĐỐI CHIẾU VÀ RÀ SOÁT HỒ SƠ CHUYÊN MÔN</h1>
  <h2>(Phụ lục phân phối chương trình và Kế hoạch bài dạy / Syllabus)</h2>

  <div class="meta-box">
    <p><strong>• Đợt rà soát:</strong> ${session.title}</p>
    <p><strong>• Môn học / Lĩnh vực:</strong> ${session.subject} &nbsp;&nbsp;|&nbsp;&nbsp; <strong>Khối lớp:</strong> ${session.grade}</p>
    <p><strong>• Phạm vi đối chiếu:</strong> ${session.scope}</p>
    <p><strong>• Tài liệu sử dụng:</strong> ${session.documents.map((d) => `${d.name} (${d.type})`).join(', ')}</p>
    <p><strong>• Thống kê kết quả:</strong> Tổng cộng ${session.counts.total} nội dung đối chiếu:
      <span class="status-phuhop">${session.counts.phuHop} Phù hợp</span> |
      <span class="status-kiemtra">${session.counts.canKiemTra} Cần kiểm tra</span> |
      <span class="status-chuatimthay">${session.counts.chuaTimThay} Chưa tìm thấy căn cứ</span>
      (Giáo viên đã xác nhận: ${session.counts.teacherConfirmed}/${session.counts.total} mục - ${confirmedRatio}%)
    </p>
    <p><strong>• Tóm tắt đánh giá chuyên môn:</strong> ${session.summaryOverview}</p>
  </div>

  <table class="data-table">
    <thead>
      <tr>
        <th style="width: 4%;">STT</th>
        <th style="width: 14%;">Tiêu chí</th>
        <th style="width: 22%;">Nội dung Phụ lục</th>
        <th style="width: 22%;">Nội dung Syllabus</th>
        <th style="width: 12%;">Kết quả AI</th>
        <th style="width: 26%;">Nội dung cần kiểm tra & Nguồn tham chiếu</th>
      </tr>
    </thead>
    <tbody>
      ${session.items
        .map(
          (item) => `
      <tr>
        <td style="text-align: center;">${item.stt}</td>
        <td><strong>${item.criterion}</strong><br><small style="color: #64748b;">${item.topic}</small></td>
        <td>${item.phuLucContent}</td>
        <td>${item.syllabusContent}</td>
        <td style="text-align: center;">
          <span class="status-badge ${
            item.resultStatus === 'Phù hợp'
              ? 'status-phuhop'
              : item.resultStatus === 'Cần kiểm tra'
              ? 'status-kiemtra'
              : 'status-chuatimthay'
          }">
            ${item.resultStatus}
          </span>
          <br>
          <small style="color: #475569;">[GV: ${item.teacherVerification.status}]</small>
        </td>
        <td>
          <strong>${item.checkPoint}</strong>
          <div class="citation-box">
            <strong>Nguồn trích Phụ lục:</strong> <em>"${item.referenceSource.phuLucQuote}"</em> (${item.referenceSource.phuLucLocation})<br>
            <strong>Nguồn trích Syllabus:</strong> <em>"${item.referenceSource.syllabusQuote}"</em> (${item.referenceSource.syllabusLocation})<br>
            <strong>Giải thích:</strong> ${item.referenceSource.reasonExplanation}
            ${
              item.teacherVerification.notes
                ? `<br><strong style="color: #0369a1;">Ghi chú của GV:</strong> ${item.teacherVerification.notes}`
                : ''
            }
            ${
              item.teacherVerification.proposedAdjustment
                ? `<br><strong style="color: #0369a1;">Đề xuất điều chỉnh:</strong> ${item.teacherVerification.proposedAdjustment}`
                : ''
            }
          </div>
        </td>
      </tr>
      `
        )
        .join('')}
    </tbody>
  </table>

  <div class="disclaimer">
    * Ghi chú chuyên môn: Báo cáo này do ứng dụng KHTN Smart Review hỗ trợ tổng hợp và trích xuất căn cứ đối chiếu. Kết luận cuối cùng căn cứ trên phê duyệt và xác nhận của Giáo viên bộ môn cùng Tổ trưởng chuyên môn Tổ KHTN.
  </div>

  <table class="footer-signatures">
    <tr>
      <td>
        <strong>GIÁO VIÊN BỘ MÔN RÀ SOÁT</strong><br>
        <em>(Ký, ghi rõ họ tên)</em>
        <br><br><br><br>
        ...................................................
      </td>
      <td>
        <strong>TỔ TRƯỞNG CHUYÊN MÔN KHTN</strong><br>
        <em>(Ký, duyệt và ghi rõ họ tên)</em>
        <br><br><br><br>
        ...................................................
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const blob = new Blob(['\ufeff' + htmlContent], {
    type: 'application/msword;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Bao_Cao_Ra_Soat_KHTN_${session.subject}_${session.grade}_${new Date().toISOString().slice(0, 10)}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
