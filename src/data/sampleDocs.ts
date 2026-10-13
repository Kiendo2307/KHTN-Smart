import { SubjectField, GradeLevel, ReviewResultItem } from '../types';

export interface SampleBundle {
  id: string;
  title: string;
  subject: SubjectField;
  grade: GradeLevel;
  scope: string;
  description: string;
  phuLucDoc: {
    name: string;
    content: string;
  };
  syllabusDoc: {
    name: string;
    content: string;
  };
  sampleResults: {
    summaryOverview: string;
    items: ReviewResultItem[];
  };
}

export const SAMPLE_BUNDLES: SampleBundle[] = [
  {
    id: 'sample-khtn8-chem',
    title: 'KHTN 8 (Hóa học) – Phản ứng hóa học & Định luật bảo toàn khối lượng',
    subject: 'Hóa học',
    grade: 'Lớp 8',
    scope: 'Chương 2: Phản ứng hóa học (Bài 5 - Bài 7)',
    description:
      'Gói dữ liệu đối chiếu giữa Phụ lục 1 (Kế hoạch dạy học môn KHTN 8) và Syllabus chi tiết (Kế hoạch bài dạy phân môn Hóa học). Phát hiện lệch 2 tiết và thiếu quy định an toàn hóa chất.',
    phuLucDoc: {
      name: 'PL1_KeHoachDayHoc_KHTN8_HoaHoc_2025.docx',
      content: `BỘ GIÁO DỤC VÀ ĐÀO TẠO - TRƯỜNG THCS NGUYỄN DU
PHỤ LỤC 1: KHUNG KẾ HOẠCH DẠY HỌC MÔN KHOA HỌC TỰ NHIÊN 8
NĂM HỌC 2025 - 2026
TỔ CHUYÊN MÔN: KHOA HỌC TỰ NHIÊN - PHÂN MÔN HÓA HỌC

I. PHÂN PHỐI CHƯƠNG TRÌNH CHI TIẾT
CHƯƠNG 2: PHẢN ỨNG HÓA HỌC (Tổng thời lượng: 10 tiết)

1. Bài 5: Biến đổi vật lí và biến đổi hóa học
- Thời lượng: 02 tiết (Tiết 1: Khái niệm biến đổi vật lí, biến đổi hóa học; Tiết 2: Thí nghiệm đun nóng đường, nến cháy, sắt tác dụng lưu huỳnh).
- Yêu cầu cần đạt (YCCĐ): Nêu được định nghĩa biến đổi vật lí và biến đổi hóa học; Phân biệt được hai hiện tượng dựa trên dấu hiệu có chất mới tạo thành hay không; Tiến hành được thí nghiệm đơn giản an toàn.

2. Bài 6: Phản ứng hóa học và năng lượng trong phản ứng hóa học
- Thời lượng: 04 tiết (Tiết 3: Khái niệm phản ứng hóa học, chất phản ứng, sản phẩm; Tiết 4: Diễn biến của phản ứng hóa học ở cấp độ nguyên tử; Tiết 5: Phản ứng tỏa nhiệt và thu nhiệt trong đời sống; Tiết 6: Luyện tập và bài tập vận dụng).
- YCCĐ: Trình bày được bản chất của phản ứng hóa học (liên kết giữa các nguyên tử thay đổi); Nêu được khái niệm phản ứng tỏa nhiệt, thu nhiệt; Đưa ra được ví dụ thực tiễn (than cháy, hòa tan vôi sống).

3. Bài 7: Định luật bảo toàn khối lượng và phương trình hóa học
- Thời lượng: 04 tiết (Tiết 7: Thí nghiệm kiểm chứng định luật bảo toàn khối lượng với dung dịch Barium chloride và Sodium sulfate; Tiết 8: Lập phương trình hóa học theo danh pháp IUPAC; Tiết 9: Ý nghĩa của phương trình hóa học; Tiết 10: Luyện tập cân bằng phương trình hóa học và tính toán bảo toàn khối lượng).
- YCCĐ: Phát biểu được định luật bảo toàn khối lượng; Thực hiện thí nghiệm chứng minh định luật trong hệ kín; Lập được phương trình hóa học của phản ứng; Sử dụng chuẩn danh pháp quốc tế IUPAC (Barium chloride, Sodium sulfate, Hydrochloric acid); Nhận thức quy tắc an toàn phòng thí nghiệm khi thao tác với muối Bari độc hại.`,
    },
    syllabusDoc: {
      name: 'Syllabus_KHBD_KHTN8_Chuong2_GV_TranVanHieu.pdf',
      content: `TRƯỜNG THCS NGUYỄN DU - GIÁO VIÊN: TRẦN VĂN HIỆU
SYLLABUS & KẾ HOẠCH BÀI DẠY CHI TIẾT
CHỦ ĐỀ: PHẢN ỨNG HÓA HỌC - KHTN 8 (KỲ 1)
THỜI LƯỢNG DỰ KIẾN: 08 TIẾT

MỤC I: PHÂN BỔ THỜI GIAN VÀ TIẾN TRÌNH DẠY HỌC
- Tiết 1-2: Bài 5 - Biến đổi vật lý và hiện tượng hóa học. Phân tích hiện tượng đá tan chảy, cồn cháy. Học sinh làm thí nghiệm đốt sợi dây magiê (magnesium ribbon).
- Tiết 3-5: Bài 6 - Phản ứng hóa học và sự tỏa nhiệt. Khái niệm chất tham gia và chất tạo thành. Nêu ví dụ phản ứng tôi vôi tỏa nhiệt.
- Tiết 6-8: Bài 7 - Định luật bảo toàn khối lượng và lập phương trình hóa học.
  + Tiết 6: Định luật bảo toàn khối lượng (Giáo viên làm thí nghiệm ảo mô phỏng trên máy chiếu phản ứng BaCl2 + Na2SO4).
  + Tiết 7: Phương trình phản ứng và cân bằng hệ số (Vẫn dùng tên gọi cũ: Bari clorua tác dụng Natri sunfat tạo thành Bari sunfat).
  + Tiết 8: Bài tập củng cố cuối chương.

MỤC II: YÊU CẦU CẦN ĐẠT VÀ TIÊU CHÍ ĐÁNH GIÁ
1. Năng lực nhận thức khoa học:
- Học sinh phân biệt được chất mới sinh ra.
- Học sinh tính được khối lượng một chất khi biết khối lượng các chất còn lại theo định luật bảo toàn.
- Học sinh cân bằng được các phương trình hóa học đơn giản của kim loại với phi kim, oxit bazơ với axit.
2. Hoạt động thực hành:
- Chủ yếu học sinh quan sát video mô phỏng hoặc giáo viên biểu diễn do phòng thí nghiệm thiếu hóa chất Bari clorua tinh khiết.`,
    },
    sampleResults: {
      summaryOverview:
        'Quá trình đối chiếu giữa Phụ lục 1 và Syllabus Chương 2 KHTN 8 ghi nhận: Tổng số 10 tiết ở Phụ lục bị rút ngắn thành 8 tiết trong Syllabus (thiếu 2 tiết luyện tập thực hành). Xuất hiện không thống nhất về danh pháp IUPAC (Syllabus còn dùng tên cũ Bari clorua thay vì Barium chloride) và chuyển đổi thí nghiệm thực hành của học sinh thành xem mô phỏng ảo mà chưa có phê duyệt điều chỉnh thiết bị.',
      items: [
        {
          id: 'khtn8-item-1',
          stt: 1,
          criterion: 'Thời lượng & Phân bổ số tiết',
          topic: 'Toàn bộ Chương 2: Phản ứng hóa học',
          phuLucContent: 'Tổng thời lượng quy định: 10 tiết (Bài 5: 02 tiết, Bài 6: 04 tiết, Bài 7: 04 tiết).',
          syllabusContent: 'Tổng thời lượng dự kiến: 08 tiết (Bài 5: 02 tiết, Bài 6: 03 tiết, Bài 7: 03 tiết).',
          resultStatus: 'Cần kiểm tra',
          checkPoint:
            'Chênh lệch 02 tiết giữa Phụ lục và Syllabus. Bài 6 thiếu 01 tiết (tiết luyện tập/ứng dụng) và Bài 7 thiếu 01 tiết (tiết luyện tập cân bằng nâng cao).',
          referenceSource: {
            phuLucDocName: 'PL1_KeHoachDayHoc_KHTN8_HoaHoc_2025.docx',
            phuLucLocation: 'Mục I. Phân phối chương trình, dòng 5',
            phuLucQuote: 'CHƯƠNG 2: PHẢN ỨNG HÓA HỌC (Tổng thời lượng: 10 tiết)',
            syllabusDocName: 'Syllabus_KHBD_KHTN8_Chuong2_GV_TranVanHieu.pdf',
            syllabusLocation: 'Tiêu đề Mục I, trang 1',
            syllabusQuote: 'CHỦ ĐỀ: PHẢN ỨNG HÓA HỌC - KHTN 8 (KỲ 1) THỜI LƯỢNG DỰ KIẾN: 08 TIẾT',
            reasonExplanation:
              'Phụ lục của nhà trường phân bổ khung 10 tiết nhằm đảm bảo đủ thời lượng rèn luyện kỹ năng cân bằng phản ứng và thực hành, nhưng Syllabus của giáo viên chỉ lập kế hoạch 8 tiết, gây thiếu hụt 2 tiết so với khung phân phối.',
          },
          teacherVerification: {
            status: 'Chưa xem xét',
            decision: 'none',
            notes: '',
            proposedAdjustment: '',
            updatedAt: null,
          },
        },
        {
          id: 'khtn8-item-2',
          stt: 2,
          criterion: 'Nội dung thực hành & Thí nghiệm hóa chất',
          topic: 'Bài 7: Thí nghiệm kiểm chứng định luật bảo toàn khối lượng',
          phuLucContent:
            'Thực hiện thí nghiệm chứng minh định luật trong hệ kín; Học sinh trực tiếp thao tác với dung dịch Barium chloride và Sodium sulfate.',
          syllabusContent:
            'Chủ yếu học sinh quan sát video mô phỏng hoặc giáo viên biểu diễn mô phỏng trên máy chiếu do phòng thí nghiệm thiếu hóa chất.',
          resultStatus: 'Cần kiểm tra',
          checkPoint:
            'Phụ lục yêu cầu học sinh làm thí nghiệm thực hành kiểm chứng trong hệ kín, trong khi Syllabus chuyển thành quan sát video mô phỏng.',
          referenceSource: {
            phuLucDocName: 'PL1_KeHoachDayHoc_KHTN8_HoaHoc_2025.docx',
            phuLucLocation: 'Mục 3. Bài 7, phần YCCĐ',
            phuLucQuote:
              'Thực hiện thí nghiệm chứng minh định luật trong hệ kín; Nhận thức quy tắc an toàn phòng thí nghiệm khi thao tác với muối Bari độc hại.',
            syllabusDocName: 'Syllabus_KHBD_KHTN8_Chuong2_GV_TranVanHieu.pdf',
            syllabusLocation: 'Mục II.2 Hoạt động thực hành, trang 2',
            syllabusQuote:
              'Chủ yếu học sinh quan sát video mô phỏng hoặc giáo viên biểu diễn do phòng thí nghiệm thiếu hóa chất Bari clorua tinh khiết.',
            reasonExplanation:
              'Mục tiêu môn KHTN CT 2018 chú trọng năng lực thực nghiệm khoa học. Giáo viên cần báo cáo Tổ chuyên môn và thiết bị để bổ sung hóa chất hoặc có phương án thay thế bằng phản ứng an toàn khác (như NaHCO3 + giấm ăn) thay vì chỉ xem video.',
          },
          teacherVerification: {
            status: 'Chưa xem xét',
            decision: 'none',
            notes: '',
            proposedAdjustment: '',
            updatedAt: null,
          },
        },
        {
          id: 'khtn8-item-3',
          stt: 3,
          criterion: 'Kiến thức và phương trình hóa học',
          topic: 'Danh pháp hóa học chuẩn Chương trình GDPT 2018',
          phuLucContent:
            'Sử dụng chuẩn danh pháp quốc tế IUPAC: Barium chloride, Sodium sulfate, Hydrochloric acid.',
          syllabusContent:
            'Vẫn dùng tên gọi cũ: Bari clorua tác dụng Natri sunfat tạo thành Bari sunfat, axit clohiđric.',
          resultStatus: 'Cần kiểm tra',
          checkPoint:
            'Syllabus chưa cập nhật danh pháp hóa học tiếng Anh theo chuẩn IUPAC của chương trình KHTN 2018.',
          referenceSource: {
            phuLucDocName: 'PL1_KeHoachDayHoc_KHTN8_HoaHoc_2025.docx',
            phuLucLocation: 'Bài 7, dòng 18',
            phuLucQuote: 'Sử dụng chuẩn danh pháp quốc tế IUPAC (Barium chloride, Sodium sulfate, Hydrochloric acid)',
            syllabusDocName: 'Syllabus_KHBD_KHTN8_Chuong2_GV_TranVanHieu.pdf',
            syllabusLocation: 'Tiết 7, trang 1',
            syllabusQuote:
              'Phương trình phản ứng và cân bằng hệ số (Vẫn dùng tên gọi cũ: Bari clorua tác dụng Natri sunfat tạo thành Bari sunfat)',
            reasonExplanation:
              'Theo quy định SGK và chương trình KHTN 2018, bắt buộc dùng thuật ngữ và danh pháp quốc tế để học sinh tiếp cận khoa học hiện đại, giáo viên cần chuẩn hóa lại các phiếu học tập.',
          },
          teacherVerification: {
            status: 'Chưa xem xét',
            decision: 'none',
            notes: '',
            proposedAdjustment: '',
            updatedAt: null,
          },
        },
        {
          id: 'khtn8-item-4',
          stt: 4,
          criterion: 'Tính thống nhất về nội dung',
          topic: 'Bài 5: Biến đổi vật lí và biến đổi hóa học',
          phuLucContent:
            'Nêu được định nghĩa biến đổi vật lí và biến đổi hóa học; Phân biệt được hai hiện tượng dựa trên dấu hiệu có chất mới tạo thành hay không.',
          syllabusContent:
            'Phân tích hiện tượng đá tan chảy, cồn cháy. Học sinh phân biệt được chất mới sinh ra.',
          resultStatus: 'Phù hợp',
          checkPoint:
            'Nội dung cơ bản và mục tiêu phân biệt hiện tượng vật lí - hóa học giữa 2 tài liệu tương thích và thống nhất cao.',
          referenceSource: {
            phuLucDocName: 'PL1_KeHoachDayHoc_KHTN8_HoaHoc_2025.docx',
            phuLucLocation: 'Mục 1. Bài 5, dòng 10',
            phuLucQuote:
              'Phân biệt được hai hiện tượng dựa trên dấu hiệu có chất mới tạo thành hay không; Tiến hành được thí nghiệm đơn giản an toàn.',
            syllabusDocName: 'Syllabus_KHBD_KHTN8_Chuong2_GV_TranVanHieu.pdf',
            syllabusLocation: 'Tiết 1-2 & Mục II.1',
            syllabusQuote: 'Bài 5 - Biến đổi vật lý và hiện tượng hóa học. Học sinh phân biệt được chất mới sinh ra.',
            reasonExplanation:
              'Các khái niệm cốt lõi về biến đổi vật lí và hóa học giữa Phụ lục khung và giáo án bài dạy tương ứng chặt chẽ.',
          },
          teacherVerification: {
            status: 'Chưa xem xét',
            decision: 'none',
            notes: '',
            proposedAdjustment: '',
            updatedAt: null,
          },
        },
        {
          id: 'khtn8-item-5',
          stt: 5,
          criterion: 'Tính toán, số liệu và an toàn phòng thí nghiệm',
          topic: 'Quy tắc an toàn khi tiếp xúc muối Bari độc hại',
          phuLucContent:
            'Nhận thức quy tắc an toàn phòng thí nghiệm khi thao tác với muối Bari độc hại và xử lý chất thải sau thí nghiệm.',
          syllabusContent: 'Không tìm thấy nội dung hướng dẫn an toàn hóa chất hoặc xử lý chất thải thí nghiệm.',
          resultStatus: 'Chưa tìm thấy căn cứ',
          checkPoint:
            'Phụ lục có yêu cầu an toàn phòng thí nghiệm và xử lý hóa chất độc hại, nhưng trong Syllabus không đề cập bất kỳ quy trình an toàn nào.',
          referenceSource: {
            phuLucDocName: 'PL1_KeHoachDayHoc_KHTN8_HoaHoc_2025.docx',
            phuLucLocation: 'Mục 3. Bài 7, dòng 20',
            phuLucQuote: 'Nhận thức quy tắc an toàn phòng thí nghiệm khi thao tác với muối Bari độc hại.',
            syllabusDocName: 'Syllabus_KHBD_KHTN8_Chuong2_GV_TranVanHieu.pdf',
            syllabusLocation: 'Chưa xác định được vị trí nguồn',
            syllabusQuote: 'Nội dung này hoàn toàn không xuất hiện trong Syllabus.',
            reasonExplanation:
              'An toàn phòng học bộ môn là yêu cầu bắt buộc đối với giáo viên KHTN. Giáo viên cần bổ sung mục lưu ý an toàn cho học sinh.',
          },
          teacherVerification: {
            status: 'Chưa xem xét',
            decision: 'none',
            notes: '',
            proposedAdjustment: '',
            updatedAt: null,
          },
        },
      ],
    },
  },
  {
    id: 'sample-math10',
    title: 'Toán 10 – Bất phương trình & Hệ bất phương trình bậc nhất hai ẩn',
    subject: 'Toán',
    grade: 'Lớp 10',
    scope: 'Chương 2: Bất phương trình bậc nhất hai ẩn (Bài 1 - Bài 2)',
    description:
      'Gói dữ liệu đối chiếu môn Toán lớp 10 giữa Phụ lục 4 (Khung phân phối chuyên môn) và Syllabus Kế hoạch giáo dục. Phát hiện thiếu nội dung bài toán quy hoạch tuyến tính thực tế.',
    phuLucDoc: {
      name: 'PL4_PhanPhoiChuongTrinh_Toan10_THPT.docx',
      content: `SỞ GIÁO DỤC VÀ ĐÀO TẠO - TRƯỜNG THPT CHUYÊN LÊ HỒNG PHONG
PHỤ LỤC 4: KẾ HOẠCH DẠY HỌC BỘ MÔN TOÁN LỚP 10
NĂM HỌC 2025 - 2026

CHƯƠNG II: BẤT PHƯƠNG TRÌNH VÀ HỆ BẤT PHƯƠNG TRÌNH BẬC NHẤT HAI ẨN (Thời lượng: 07 tiết)

1. Bài 1: Bất phương trình bậc nhất hai ẩn (03 tiết)
- Tiết 1: Khái niệm, dạng tổng quát ax + by < c. Biểu diễn miền nghiệm trên mặt phẳng tọa độ Oxy.
- Tiết 2: Phương pháp xác định miền nghiệm (đường thẳng bờ và điểm kiểm tra O(0;0)).
- Tiết 3: Luyện tập biểu diễn miền nghiệm và giải bài toán thực tế đơn giản.
- YCCĐ: Nhận biết được bất phương trình bậc nhất hai ẩn; Biểu diễn được miền nghiệm trên mặt phẳng tọa độ; Vận dụng vào bài toán kinh tế đời sống (chi phí sản xuất, dinh dưỡng).

2. Bài 2: Hệ bất phương trình bậc nhất hai ẩn (04 tiết)
- Tiết 4: Khái niệm hệ bất phương trình bậc nhất hai ẩn. Miền nghiệm của hệ.
- Tiết 5: Tìm giá trị lớn nhất, giá trị nhỏ nhất của biểu thức F(x;y) = ax + by trên một miền đa giác (Bài toán quy hoạch tuyến tính đơn giản).
- Tiết 6: Luyện tập giải bài toán tối ưu kinh tế thực tế (tối ưu hóa lợi nhuận nhà máy, bài toán phân bổ nguồn lực lao động).
- Tiết 7: Ôn tập và kiểm tra đánh giá thường xuyên Chương II.
- YCCĐ: Biểu diễn được miền nghiệm của hệ bất phương trình; Vận dụng tìm GTLN, GTNN của biểu thức mục tiêu trên miền đa giác lồi; Giải quyết các bài toán tối ưu kinh tế trong đời sống thực tiễn.`,
    },
    syllabusDoc: {
      name: 'Syllabus_GiaoAn_Toan10_Chuong2_KHTN.docx',
      content: `KẾ HOẠCH BÀI DẠY MÔN TOÁN 10 - TỔ TOÁN KHTN
CHƯƠNG II: BẤT PHƯƠNG TRÌNH BẬC NHẤT HAI ẨN
THỜI LƯỢNG: 06 TIẾT

TIẾN TRÌNH CHI TIẾT:
- Tiết 1-2: Bài 1. Bất phương trình bậc nhất hai ẩn và cách vẽ miền nghiệm trên hệ trục tọa độ Oxy. Học sinh làm các bài tập kiểm tra điểm thuộc hay không thuộc miền nghiệm.
- Tiết 3-4: Bài 2. Hệ bất phương trình bậc nhất hai ẩn. Giao của các nửa mặt phẳng để tìm miền nghiệm hình học.
- Tiết 5: Luyện tập vẽ miền nghiệm của hệ bất phương trình có 3 hoặc 4 điều kiện ràng buộc.
- Tiết 6: Tiết bài tập tổng hợp và kiểm tra 15 phút.

MỤC TIÊU CẦN ĐẠT:
- Kỹ năng vẽ đồ thị đường thẳng, xác định bờ và gạch bỏ phần không thuộc miền nghiệm.
- Học sinh làm thành thạo các câu hỏi trắc nghiệm khách quan trong đề thi định kỳ.`,
    },
    sampleResults: {
      summaryOverview:
        'Đối chiếu môn Toán 10: Syllabus thiếu 01 tiết so với Phụ lục (6 tiết thay vì 7 tiết). Đặc biệt, Syllabus bỏ sót hoàn toàn phần kiến thức trọng tâm là Bài toán tối ưu thực tế (tìm GTLN/GTNN trên miền đa giác lồi - quy hoạch tuyến tính), làm giảm tính ứng dụng thực tiễn của chương trình 2018.',
      items: [
        {
          id: 'math10-item-1',
          stt: 1,
          criterion: 'Thời lượng & Phân bổ số tiết',
          topic: 'Chương II: Bất phương trình bậc nhất hai ẩn',
          phuLucContent: 'Quy định 07 tiết (Bài 1: 03 tiết; Bài 2: 04 tiết).',
          syllabusContent: 'Thời lượng phân bổ: 06 tiết (Bài 1: 02 tiết; Bài 2: 04 tiết).',
          resultStatus: 'Cần kiểm tra',
          checkPoint: 'Thiếu 01 tiết ở Bài 1 (tiết giải bài toán thực tế đơn giản).',
          referenceSource: {
            phuLucDocName: 'PL4_PhanPhoiChuongTrinh_Toan10_THPT.docx',
            phuLucLocation: 'Dòng 5, Mục Chương II',
            phuLucQuote: 'CHƯƠNG II: BẤT PHƯƠNG TRÌNH VÀ HỆ BẤT PHƯƠNG TRÌNH BẬC NHẤT HAI ẨN (Thời lượng: 07 tiết)',
            syllabusDocName: 'Syllabus_GiaoAn_Toan10_Chuong2_KHTN.docx',
            syllabusLocation: 'Dòng 3',
            syllabusQuote: 'THỜI LƯỢNG: 06 TIẾT',
            reasonExplanation:
              'Phụ lục yêu cầu 7 tiết để đảm bảo có thời gian cho học sinh tiếp cận bài toán ứng dụng thực tế. Syllabus rút còn 6 tiết sẽ gây quá tải hoặc bỏ sót nội dung.',
          },
          teacherVerification: {
            status: 'Chưa xem xét',
            decision: 'none',
            notes: '',
            proposedAdjustment: '',
            updatedAt: null,
          },
        },
        {
          id: 'math10-item-2',
          stt: 2,
          criterion: 'Nội dung còn thiếu',
          topic: 'Bài toán quy hoạch tuyến tính và tối ưu kinh tế thực tế',
          phuLucContent:
            'Tiết 5 & Tiết 6: Tìm GTLN, GTNN của biểu thức F(x;y) = ax + by trên miền đa giác lồi; Vận dụng giải bài toán kinh tế đời sống (chi phí, lợi nhuận).',
          syllabusContent: 'Không có nội dung tìm GTLN/GTNN trên miền đa giác hay bài toán tối ưu kinh tế.',
          resultStatus: 'Chưa tìm thấy căn cứ',
          checkPoint:
            'Phụ lục yêu cầu rõ ràng bài toán tối ưu thực tế (quy hoạch tuyến tính cơ bản), nhưng Syllabus chỉ dừng lại ở kỹ năng thuần vẽ hình học, thiếu toàn bộ phần ứng dụng thực tế.',
          referenceSource: {
            phuLucDocName: 'PL4_PhanPhoiChuongTrinh_Toan10_THPT.docx',
            phuLucLocation: 'Tiết 5 & 6, Bài 2',
            phuLucQuote:
              'Tìm giá trị lớn nhất, giá trị nhỏ nhất của biểu thức F(x;y) = ax + by trên một miền đa giác (Bài toán quy hoạch tuyến tính đơn giản); Luyện tập giải bài toán tối ưu kinh tế thực tế.',
            syllabusDocName: 'Syllabus_GiaoAn_Toan10_Chuong2_KHTN.docx',
            syllabusLocation: 'Chưa xác định được vị trí nguồn',
            syllabusQuote: 'Không tìm thấy nội dung tương ứng trong toàn bộ Syllabus.',
            reasonExplanation:
              'Chương trình Toán 2018 nhấn mạnh mô hình hóa toán học. Việc bỏ qua bài toán tối ưu thực tế là thiếu sót lớn về yêu cầu cần đạt.',
          },
          teacherVerification: {
            status: 'Chưa xem xét',
            decision: 'none',
            notes: '',
            proposedAdjustment: '',
            updatedAt: null,
          },
        },
      ],
    },
  },
  {
    id: 'sample-cs11-python',
    title: 'Tin học 11 – Thuật toán sắp xếp & Tìm kiếm bằng Python',
    subject: 'Tin học',
    grade: 'Lớp 11',
    scope: 'Chủ đề F: Lập trình nâng cao với Python (Thuật toán sắp xếp và tìm kiếm)',
    description:
      'Gói dữ liệu đối chiếu môn Tin học 11 định hướng Khoa học máy tính (CS). Phát hiện chưa thống nhất về tỷ lệ thực hành phòng máy và sản phẩm dự án.',
    phuLucDoc: {
      name: 'PL_TinHoc11_PhanPhoiChuongTrinh_CS.xlsx',
      content: `TRƯỜNG THPT CHUYÊN KHTN - TỔ TIN HỌC
PHỤ LỤC: PHÂN PHỐI CHƯƠNG TRÌNH TIN HỌC 11 (ĐỊNH HƯỚNG KHOA HỌC MÁY TÍNH - CS)

CHỦ ĐỀ F: LẬP TRÌNH VÀ GIẢI QUYẾT VẤN ĐỀ VỚI PYTHON (8 TIẾT)
- Tiết 1-2: Thuật toán tìm kiếm tuần tự (Linear Search) và tìm kiếm nhị phân (Binary Search). Cài đặt trên Python.
- Tiết 3-4: Thuật toán sắp xếp chọn (Selection Sort) và sắp xếp nổi bọt (Bubble Sort).
- Tiết 5-6: Thuật toán sắp xếp chèn (Insertion Sort) và so sánh độ phức tạp thời gian O(n^2) với các trường hợp tốt nhất/xấu nhất.
- Tiết 7-8: Thực hành dự án mini: Xây dựng module tìm kiếm và sắp xếp danh sách học sinh theo điểm thi.
YCCĐ: Cài đặt và thực thi đúng thuật toán trên máy tính; Phân tích được sự khác biệt giữa Linear Search và Binary Search (điều kiện mảng đã sắp xếp); Đánh giá được sản phẩm thực hành theo rubric chuẩn.`,
    },
    syllabusDoc: {
      name: 'Syllabus_Tin11_GiaoAn_Python.pdf',
      content: `KẾ HOẠCH BÀI DẠY TIN HỌC 11 - NĂM HỌC 2025-2026
CHỦ ĐỀ: THUẬT TOÁN TÌM KIẾM VÀ SẮP XẾP
THỜI LƯỢNG: 08 TIẾT (LÝ THUYẾT TRÊN LỚP: 6 TIẾT; THỰC HÀNH PHÒNG MÁY: 2 TIẾT)

CHI TIẾT TIẾN TRÌNH:
- Tiết 1-2: Giới thiệu thuật toán tìm kiếm trên bảng viết. Học sinh chạy tay từng bước trên giấy.
- Tiết 3-4: Thuật toán sắp xếp nổi bọt và sắp xếp chọn. Phân tích vòng lặp for lồng nhau trên bảng.
- Tiết 5-6: Thuật toán sắp xếp chèn và giải bài tập tự luận trong vở.
- Tiết 7-8: Học sinh lên phòng máy tính thực hành gõ lại mã nguồn mẫu có sẵn của giáo viên. Không yêu cầu làm bài tập dự án.`,
    },
    sampleResults: {
      summaryOverview:
        'Đối chiếu môn Tin học 11: Mặc dù tổng số tiết khớp (8 tiết), nhưng có sự mất cân đối nghiêm trọng về phương pháp dạy học. Phụ lục yêu cầu thực hành và dự án mini, trong khi Syllabus dành tới 6 tiết dạy lý thuyết viết bảng và chỉ 2 tiết gõ lại code mẫu.',
      items: [
        {
          id: 'cs11-item-1',
          stt: 1,
          criterion: 'Sự phù hợp giữa mục tiêu và hoạt động thực hành',
          topic: 'Phân bổ thời lượng phòng máy tính và phương pháp thực hành',
          phuLucContent:
            'Thực hành xuyên suốt kết hợp dự án mini (Tiết 7-8 xây dựng module quản lý danh sách học sinh theo điểm).',
          syllabusContent:
            'Lý thuyết trên lớp 6 tiết (chạy tay trên giấy), chỉ có 2 tiết thực hành phòng máy gõ lại mã nguồn mẫu.',
          resultStatus: 'Cần kiểm tra',
          checkPoint:
            'Tỷ lệ thời lượng thực hành phòng máy quá thấp (2/8 tiết), không đáp ứng yêu cầu phát triển kỹ năng số và sản phẩm lập trình của chương trình GDPT 2018.',
          referenceSource: {
            phuLucDocName: 'PL_TinHoc11_PhanPhoiChuongTrinh_CS.xlsx',
            phuLucLocation: 'Dòng 8-10',
            phuLucQuote:
              'Thực hành dự án mini: Xây dựng module tìm kiếm và sắp xếp danh sách học sinh theo điểm thi; Cài đặt và thực thi đúng thuật toán trên máy tính.',
            syllabusDocName: 'Syllabus_Tin11_GiaoAn_Python.pdf',
            syllabusLocation: 'Mục Thời lượng & Tiết 7-8',
            syllabusQuote:
              'THỜI LƯỢNG: 08 TIẾT (LÝ THUYẾT TRÊN LỚP: 6 TIẾT; THỰC HÀNH PHÒNG MÁY: 2 TIẾT) ... gõ lại mã nguồn mẫu có sẵn của giáo viên.',
            reasonExplanation:
              'Môn Tin học là môn học công nghệ thực hành. Tổ chuyên môn khuyến nghị tối thiểu 50% thời lượng phải trên phòng máy tính để học sinh viết code và gỡ lỗi (debug).',
          },
          teacherVerification: {
            status: 'Chưa xem xét',
            decision: 'none',
            notes: '',
            proposedAdjustment: '',
            updatedAt: null,
          },
        },
      ],
    },
  },
  {
    id: 'sample-robo-stem',
    title: 'Robotics – Chế tạo & Lập trình Robot dò đường bằng cảm biến hồng ngoại',
    subject: 'Robotics',
    grade: 'Lớp 8',
    scope: 'Dự án STEM Robotics: Thiết kế robot tự hành dò line theo vạch sa bàn',
    description:
      'Gói dữ liệu đối chiếu chuyên đề Robotics STEM. Phát hiện sai lệch về cấu phần phần cứng cảm biến và rubric đánh giá sản phẩm thi đấu.',
    phuLucDoc: {
      name: 'PL_STEM_Robotics_LineFollower_2025.docx',
      content: `TRƯỜNG THCS & THPT NGUYỄN TẤT THÀNH - TỔ KHTN
KẾ HOẠCH DẠY HỌC CHỦ ĐỀ STEM ROBOTICS LỚP 8
TÊN DỰ ÁN: THIẾT KẾ VÀ LẬP TRÌNH ROBOT DÒ LINE VƯỢT SA BÀN (Thời lượng: 6 tiết)

1. CẤU PHẦN KỸ THUẬT VÀ PHẦN CỨNG:
- Bộ điều khiển: Arduino Uno R3 hoặc ESP32.
- Cảm biến: Cụm 4 mắt cảm biến hồng ngoại (TCRT5000) chống nhiễu ánh sáng môi trường.
- Động cơ: 02 động cơ giảm tốc DC kèm mạch điều khiển cầu H L298N.
- Khung gầm: Khung mica 2 tầng tự thiết kế, bánh xe đa hướng.
2. TIÊU CHÍ ĐÁNH GIÁ SẢN PHẨM (RUBRIC):
- Tiêu chí 1: Xe chạy bám vạch liên tục không bị chệch vạch quá 3 lần (40 điểm).
- Tiêu chí 2: Tối ưu thuật toán PID điều khiển vận tốc mượt mà (30 điểm).
- Tiêu chí 3: Bản vẽ thiết kế kỹ thuật và báo cáo nhật ký làm việc nhóm (30 điểm).`,
    },
    syllabusDoc: {
      name: 'Syllabus_Robotics_GV_DoanThiMai.pdf',
      content: `KẾ HOẠCH BÀI DẠY DỰ ÁN ROBOTICS - GIÁO VIÊN: ĐOÀN THỊ MAI
DỰ ÁN: XE ROBOT TỰ HÀNH
THỜI LƯỢNG: 6 TIẾT

CẤU HÌNH THIẾT BỊ SỬ DỤNG TRONG GIÁO ÁN:
- Khung xe 3 bánh lắp sẵn mua thương mại.
- Cảm biến: Sử dụng 02 cảm biến siêu âm HC-SR04 tránh vật cản thay cho cảm biến dò line.
- Thuật toán: Nếu khoảng cách < 15cm thì rẽ phải, không lập trình dò line và không áp dụng giải thuật PID.
TIÊU CHÍ ĐÁNH GIÁ:
- Xe di chuyển được không đâm vào tường. Học sinh nộp video quay lại hoạt động.`,
    },
    sampleResults: {
      summaryOverview:
        'Đối chiếu chuyên đề Robotics STEM: Sự không nhất quán hoàn toàn về cấu phần kỹ thuật và nhiệm vụ dự án. Phụ lục quy định dự án dò line (Line Follower) dùng 4 mắt cảm biến hồng ngoại TCRT5000 và thuật toán PID, trong khi Syllabus lại chuyển thành xe tránh vật cản dùng cảm biến siêu âm HC-SR04.',
      items: [
        {
          id: 'robo-item-1',
          stt: 1,
          criterion: 'Cấu phần robot, cảm biến và nhiệm vụ thực thi',
          topic: 'Cảm biến và cơ cấu chấp hành dự án robot',
          phuLucContent:
            'Cụm 4 mắt cảm biến hồng ngoại TCRT5000 chống nhiễu; Nhiệm vụ chạy bám vạch sa bàn thi đấu.',
          syllabusContent:
            '02 cảm biến siêu âm HC-SR04 tránh vật cản; Nhiệm vụ di chuyển tránh đâm tường trong phòng học.',
          resultStatus: 'Cần kiểm tra',
          checkPoint:
            'Khác biệt hoàn toàn về phần cứng cảm biến và nhiệm vụ thực thi giữa tài liệu Phụ lục khung và Syllabus bài dạy.',
          referenceSource: {
            phuLucDocName: 'PL_STEM_Robotics_LineFollower_2025.docx',
            phuLucLocation: 'Mục 1. Cấu phần kỹ thuật, dòng 8',
            phuLucQuote:
              'Cảm biến: Cụm 4 mắt cảm biến hồng ngoại (TCRT5000) chống nhiễu ánh sáng môi trường; Xe chạy bám vạch liên tục.',
            syllabusDocName: 'Syllabus_Robotics_GV_DoanThiMai.pdf',
            syllabusLocation: 'Mục Cấu hình thiết bị, trang 1',
            syllabusQuote:
              'Cảm biến: Sử dụng 02 cảm biến siêu âm HC-SR04 tránh vật cản thay cho cảm biến dò line.',
            reasonExplanation:
              'Hai bài toán kỹ thuật hoàn toàn khác nhau (bài toán bám quỹ đạo dò vạch vs bài toán đo cự ly né chướng ngại vật). Cần thống nhất lại mục tiêu đề cương chung của nhà trường.',
          },
          teacherVerification: {
            status: 'Chưa xem xét',
            decision: 'none',
            notes: '',
            proposedAdjustment: '',
            updatedAt: null,
          },
        },
      ],
    },
  },
];
