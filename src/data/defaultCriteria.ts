import { Criterion } from '../types';

export const DEFAULT_CRITERIA: Criterion[] = [
  // 6 Tiêu chí chung mặc định (Mục 4)
  {
    id: 'crit-gen-1',
    subject: 'Chung',
    name: 'Tính thống nhất về nội dung',
    description:
      'Các chủ đề, kiến thức và nội dung được đề cập có tương ứng, nhất quán giữa hai tài liệu không?',
    category: 'Tính thống nhất',
    enabled: true,
  },
  {
    id: 'crit-gen-2',
    subject: 'Chung',
    name: 'Thời lượng & Phân bổ số tiết',
    description:
      'Số tiết, thời gian hoặc phân bổ thời lượng giữa lý thuyết, luyện tập, thực hành có khớp nhau không?',
    category: 'Thời lượng',
    enabled: true,
  },
  {
    id: 'crit-gen-3',
    subject: 'Chung',
    name: 'Yêu cầu cần đạt (YCCĐ)',
    description:
      'Các yêu cầu về kiến thức, kỹ năng và phẩm chất/năng lực có được thể hiện đầy đủ, nhất quán không?',
    category: 'Yêu cầu cần đạt',
    enabled: true,
  },
  {
    id: 'crit-gen-4',
    subject: 'Chung',
    name: 'Nội dung còn thiếu',
    description:
      'Có nội dung được nêu trong tài liệu này (Phụ lục) nhưng chưa tìm thấy trong tài liệu kia (Syllabus) không?',
    category: 'Nội dung còn thiếu',
    enabled: true,
  },
  {
    id: 'crit-gen-5',
    subject: 'Chung',
    name: 'Nội dung chưa thống nhất',
    description:
      'Có sự khác biệt về tên chủ đề, số tiết, trình tự giảng dạy hoặc yêu cầu chuyên môn không?',
    category: 'Nội dung chưa thống nhất',
    enabled: true,
  },
  {
    id: 'crit-gen-6',
    subject: 'Chung',
    name: 'Căn cứ đối chiếu & Trích dẫn',
    description:
      'Mỗi nhận định đối chiếu có trích dẫn nội dung cụ thể từ tài liệu nguồn và tài liệu đối chiếu không?',
    category: 'Căn cứ đối chiếu',
    enabled: true,
  },

  // 1. MÔN TOÁN (Mục 9)
  {
    id: 'crit-math-1',
    subject: 'Toán',
    name: 'Nội dung kiến thức & Yêu cầu cần đạt',
    description:
      'Đối chiếu chuẩn kiến thức, định lý, tính chất và các mức độ nhận thức (nhận biết, thông hiểu, vận dụng) theo mạch nội dung.',
    category: 'Đặc thù môn học',
    enabled: true,
  },
  {
    id: 'crit-math-2',
    subject: 'Toán',
    name: 'Trình tự chủ đề & Mạch kiến thức',
    description:
      'Kiểm tra tính logic, liên thông giữa các mạch Đại số & Giải tích, Hình học & Đo lường, Xác suất & Thống kê.',
    category: 'Đặc thù môn học',
    enabled: true,
  },
  {
    id: 'crit-math-3',
    subject: 'Toán',
    name: 'Phù hợp giữa nội dung, bài tập và thời lượng',
    description:
      'Tỷ lệ giữa tiết hình thành kiến thức mới và tiết luyện tập, ôn tập, bài tập ứng dụng thực tế có cân đối không.',
    category: 'Đặc thù môn học',
    enabled: true,
  },
  {
    id: 'crit-math-4',
    subject: 'Toán',
    name: 'Tính chính xác của công thức và phép tính',
    description:
      'Đảm bảo các ký hiệu toán học, công thức tính toán và số liệu ví dụ minh họa chính xác khi có đủ dữ liệu.',
    category: 'Đặc thù môn học',
    enabled: true,
  },

  // 2. MÔN TIN HỌC (Mục 9)
  {
    id: 'crit-cs-1',
    subject: 'Tin học',
    name: 'Nội dung kiến thức và kỹ năng số',
    description:
      'Các chuẩn kiến thức về khoa học máy tính, ứng dụng tin học và đạo đức/pháp luật trong môi trường số (DL, CS, ICT).',
    category: 'Đặc thù môn học',
    enabled: true,
  },
  {
    id: 'crit-cs-2',
    subject: 'Tin học',
    name: 'Yêu cầu về thuật toán, lập trình và sản phẩm',
    description:
      'Sự nhất quán về ngôn ngữ lập trình (Python/C++...), cấu trúc dữ liệu, thuật toán và tiêu chí sản phẩm thực hành.',
    category: 'Đặc thù môn học',
    enabled: true,
  },
  {
    id: 'crit-cs-3',
    subject: 'Tin học',
    name: 'Sự phù hợp giữa mục tiêu và hoạt động thực hành',
    description:
      'Phân bổ thời lượng phòng máy tính, mức độ khả thi của các bài tập dự án thực hành và sản phẩm số của học sinh.',
    category: 'Đặc thù môn học',
    enabled: true,
  },

  // 3. MÔN ROBOTICS (Mục 9)
  {
    id: 'crit-robo-1',
    subject: 'Robotics',
    name: 'Mục tiêu kỹ thuật và lập trình',
    description:
      'Mục tiêu về tư duy kỹ thuật (Engineering Design Process), giải thuật điều khiển và tự động hóa theo chuẩn STEM.',
    category: 'Đặc thù môn học',
    enabled: true,
  },
  {
    id: 'crit-robo-2',
    subject: 'Robotics',
    name: 'Cấu phần robot, cảm biến và nhiệm vụ thực thi',
    description:
      'Sự thống nhất về danh mục phần cứng (vi điều khiển, động cơ servo, cảm biến siêu âm/hồng ngoại, cơ cấu chấp hành) và nhiệm vụ sân đấu/sa bàn.',
    category: 'Đặc thù môn học',
    enabled: true,
  },
  {
    id: 'crit-robo-3',
    subject: 'Robotics',
    name: 'Thống nhất giữa yêu cầu, hoạt động và Rubric đánh giá',
    description:
      'Tiêu chí đánh giá sản phẩm (tính thẩm mỹ, độ ổn định, thuật toán điều khiển, báo cáo kỹ thuật) khớp giữa các tài liệu.',
    category: 'Đặc thù môn học',
    enabled: true,
  },

  // 4. MÔN VẬT LÍ (Mục 9)
  {
    id: 'crit-phy-1',
    subject: 'Vật lí',
    name: 'Kiến thức, công thức và đại lượng vật lí',
    description:
      'Sự chuẩn xác về đơn vị đo chuẩn SI, các định luật vật lí, ý nghĩa vật lí của công thức và điều kiện áp dụng.',
    category: 'Đặc thù môn học',
    enabled: true,
  },
  {
    id: 'crit-phy-2',
    subject: 'Vật lí',
    name: 'Thời lượng thực hành & Thí nghiệm',
    description:
      'Phân bổ thời gian cho bài thực hành thí nghiệm biểu diễn của giáo viên và thí nghiệm khảo sát trực tiếp của học sinh.',
    category: 'Đặc thù môn học',
    enabled: true,
  },
  {
    id: 'crit-phy-3',
    subject: 'Vật lí',
    name: 'Yêu cầu thí nghiệm, đo lường, xử lý số liệu',
    description:
      'Quy trình sử dụng dụng cụ đo, tính toán sai số phép đo, vẽ đồ thị quan hệ đại lượng và rút ra kết luận quy luật.',
    category: 'Đặc thù môn học',
    enabled: true,
  },

  // 5. MÔN HÓA HỌC (Mục 9)
  {
    id: 'crit-chem-1',
    subject: 'Hóa học',
    name: 'Kiến thức và phương trình hóa học',
    description:
      'Danh pháp hóa học theo chuẩn IUPAC mới, trạng thái chất, điều kiện phản ứng và tính chính xác của phương trình.',
    category: 'Đặc thù môn học',
    enabled: true,
  },
  {
    id: 'crit-chem-2',
    subject: 'Hóa học',
    name: 'Nội dung thực hành & Thí nghiệm hóa chất',
    description:
      'Khớp danh mục hóa chất, nồng độ dung dịch, dụng cụ thủy tinh và thao tác thí nghiệm giữa phân phối và kế hoạch bài dạy.',
    category: 'Đặc thù môn học',
    enabled: true,
  },
  {
    id: 'crit-chem-3',
    subject: 'Hóa học',
    name: 'Tính toán, số liệu và an toàn phòng thí nghiệm',
    description:
      'Quy định bảo hộ, xử lý hóa chất độc hại, chống cháy nổ và các bài toán tính theo phương trình phản ứng/nồng độ.',
    category: 'Đặc thù môn học',
    enabled: true,
  },

  // 6. MÔN SINH HỌC (Mục 9)
  {
    id: 'crit-bio-1',
    subject: 'Sinh học',
    name: 'Kiến thức và khái niệm sinh học',
    description:
      'Tính chuẩn xác của thuật ngữ sinh học các cấp độ tổ chức sống (phân tử, tế bào, cơ thể, quần thể, quần xã, hệ sinh thái).',
    category: 'Đặc thù môn học',
    enabled: true,
  },
  {
    id: 'crit-bio-2',
    subject: 'Sinh học',
    name: 'Yêu cầu quan sát, khảo sát và thực nghiệm',
    description:
      'Chuẩn bị tiêu bản hiển vi, mẫu vật tươi/tiêu bản ép, quy trình khảo sát thực địa sinh thái và thí nghiệm sinh học.',
    category: 'Đặc thù môn học',
    enabled: true,
  },
  {
    id: 'crit-bio-3',
    subject: 'Sinh học',
    name: 'Phù hợp nội dung, dữ liệu thu thập và kết luận',
    description:
      'Phương pháp thu thập dữ liệu sinh học, lập bảng biểu theo dõi và tính logic khi khái quát hóa kết luận.',
    category: 'Đặc thù môn học',
    enabled: true,
  },
];
