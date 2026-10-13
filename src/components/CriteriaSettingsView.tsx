import React, { useState } from 'react';
import {
  SlidersHorizontal,
  Plus,
  Trash2,
  Edit2,
  RotateCcw,
  Check,
  Calculator,
  Laptop,
  Cpu,
  Atom,
  FlaskConical,
  Dna,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { Criterion, SubjectField, CriterionCategory } from '../types';
import { DEFAULT_CRITERIA } from '../data/defaultCriteria';

interface CriteriaSettingsViewProps {
  criteria: Criterion[];
  onUpdateCriteria: (updated: Criterion[]) => void;
  onResetDefaults: () => void;
}

export const CriteriaSettingsView: React.FC<CriteriaSettingsViewProps> = ({
  criteria,
  onUpdateCriteria,
  onResetDefaults,
}) => {
  const [activeSubjectTab, setActiveSubjectTab] = useState<SubjectField | 'Chung'>('Toán');

  // New criterion form state
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);
  const [newCritName, setNewCritName] = useState<string>('');
  const [newCritDesc, setNewCritDesc] = useState<string>('');
  const [newCritCategory, setNewCritCategory] = useState<CriterionCategory>('Đặc thù môn học');

  // Edit criterion state
  const [editingCritId, setEditingCritId] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>('');
  const [editDesc, setEditDesc] = useState<string>('');

  const subjectTabs: { key: SubjectField | 'Chung'; label: string; icon: any }[] = [
    { key: 'Chung', label: 'Tiêu chí chung', icon: SlidersHorizontal },
    { key: 'Toán', label: 'Toán', icon: Calculator },
    { key: 'Tin học', label: 'Tin học', icon: Laptop },
    { key: 'Robotics', label: 'Robotics', icon: Cpu },
    { key: 'Vật lí', label: 'Vật lí', icon: Atom },
    { key: 'Hóa học', label: 'Hóa học', icon: FlaskConical },
    { key: 'Sinh học', label: 'Sinh học', icon: Dna },
  ];

  const filteredCriteria = criteria.filter((c) => c.subject === activeSubjectTab);

  const handleToggle = (id: string) => {
    onUpdateCriteria(
      criteria.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c))
    );
  };

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa tiêu chí này khỏi danh sách?')) {
      onUpdateCriteria(criteria.filter((c) => c.id !== id));
    }
  };

  const handleStartEdit = (criterion: Criterion) => {
    setEditingCritId(criterion.id);
    setEditName(criterion.name);
    setEditDesc(criterion.description);
  };

  const handleSaveEdit = (id: string) => {
    if (!editName.trim()) return;
    onUpdateCriteria(
      criteria.map((c) =>
        c.id === id ? { ...c, name: editName.trim(), description: editDesc.trim() } : c
      )
    );
    setEditingCritId(null);
  };

  const handleAddNewCriterion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCritName.trim()) return;

    const newCriterion: Criterion = {
      id: `crit-custom-${Date.now()}`,
      subject: activeSubjectTab,
      name: newCritName.trim(),
      description: newCritDesc.trim() || 'Tiêu chí do giáo viên tự thiết lập bổ sung.',
      category: newCritCategory,
      enabled: true,
      isCustom: true,
    };

    onUpdateCriteria([...criteria, newCriterion]);
    setNewCritName('');
    setNewCritDesc('');
    setIsAddingNew(false);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <SlidersHorizontal className="w-5 h-5 text-blue-600" />
            <span>Thiết lập tiêu chí theo môn học (Tổ KHTN)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tùy biến bộ tiêu chí cho 6 lĩnh vực: Toán, Tin học, Robotics, Vật lí, Hóa học, Sinh học. Không áp dụng máy móc tiêu chí giữa các môn.
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <button
            onClick={() => {
              if (confirm('Khôi phục toàn bộ danh sách tiêu chí về mặc định của Tổ KHTN?')) {
                onResetDefaults();
              }
            }}
            className="text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 font-semibold px-3 py-2 rounded-xl transition-colors flex items-center space-x-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Khôi phục mặc định</span>
          </button>

          <button
            onClick={() => setIsAddingNew(true)}
            className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3.5 py-2 rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm tiêu chí mới</span>
          </button>
        </div>
      </div>

      {/* Subject Tabs */}
      <div className="flex overflow-x-auto space-x-2 pb-1 scrollbar-none">
        {subjectTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubjectTab === tab.key;
          const count = criteria.filter((c) => c.subject === tab.key).length;
          return (
            <button
              key={tab.key}
              onClick={() => {
                setActiveSubjectTab(tab.key);
                setIsAddingNew(false);
                setEditingCritId(null);
              }}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                isActive
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive ? 'bg-blue-800 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Guide Note Box for the Selected Subject */}
      <div className="bg-blue-50/50 border border-blue-200/80 rounded-xl p-4 flex items-start space-x-3 text-xs text-slate-700 leading-relaxed">
        <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-blue-900">Đặc thù lĩnh vực {activeSubjectTab}: </span>
          {activeSubjectTab === 'Chung' &&
            'Bộ 6 tiêu chí nền tảng áp dụng chung cho tất cả các môn: Tính thống nhất, Thời lượng, YCCĐ, Nội dung còn thiếu, Nội dung chưa thống nhất, và Căn cứ đối chiếu.'}
          {activeSubjectTab === 'Toán' &&
            'Tập trung vào tính logic mạch kiến thức (Đại số, Hình học, Thống kê), tỷ lệ tiết luyện tập/thực tế, và tính chuẩn xác của công thức/phép toán.'}
          {activeSubjectTab === 'Tin học' &&
            'Kiểm tra chuẩn kỹ năng số (DL, CS, ICT), ngôn ngữ lập trình/thuật toán, và phân bổ thời lượng thực hành phòng máy tính.'}
          {activeSubjectTab === 'Robotics' &&
            'Kiểm tra tính thống nhất về cấu phần robot (cảm biến, vi điều khiển, cơ cấu), quy trình thiết kế kỹ thuật và Rubric đánh giá sa bàn thi đấu.'}
          {activeSubjectTab === 'Vật lí' &&
            'Đơn vị đo chuẩn SI, công thức định luật, tỷ lệ tiết thực hành thí nghiệm và yêu cầu xử lý sai số số liệu.'}
          {activeSubjectTab === 'Hóa học' &&
            'Danh pháp IUPAC chuẩn chương trình 2018, phương trình phản ứng, nồng độ hóa chất và các quy tắc nghiêm ngặt về an toàn phòng lab.'}
          {activeSubjectTab === 'Sinh học' &&
            'Chuẩn xác thuật ngữ các cấp độ tổ chức sống, quy trình khảo sát thực địa sinh thái, làm tiêu bản hiển vi và phân tích số liệu.'}
        </div>
      </div>

      {/* Add New Criterion Form Modal / Inline */}
      {isAddingNew && (
        <form
          onSubmit={handleAddNewCriterion}
          className="bg-white rounded-2xl border-2 border-blue-400 p-5 shadow-sm space-y-4 animate-in fade-in"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
              <Plus className="w-4 h-4 text-blue-600" />
              <span>Thêm tiêu chí mới cho môn {activeSubjectTab}</span>
            </h3>
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="text-slate-400 hover:text-slate-600 text-xs"
            >
              Hủy bỏ
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tên tiêu chí <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={newCritName}
                onChange={(e) => setNewCritName(e.target.value)}
                placeholder="VD: Kiểm tra danh mục thí nghiệm bắt buộc..."
                className="w-full text-xs rounded-lg border border-slate-300 p-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phân loại
              </label>
              <select
                value={newCritCategory}
                onChange={(e) => setNewCritCategory(e.target.value as CriterionCategory)}
                className="w-full text-xs rounded-lg border border-slate-300 p-2 text-slate-800 focus:outline-hidden"
              >
                <option value="Đặc thù môn học">Đặc thù môn học</option>
                <option value="Tính thống nhất">Tính thống nhất</option>
                <option value="Thời lượng">Thời lượng</option>
                <option value="Yêu cầu cần đạt">Yêu cầu cần đạt</option>
                <option value="Nội dung còn thiếu">Nội dung còn thiếu</option>
                <option value="Căn cứ đối chiếu">Căn cứ đối chiếu</option>
              </select>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mô tả chi tiết cách AI đối chiếu
              </label>
              <textarea
                rows={2}
                value={newCritDesc}
                onChange={(e) => setNewCritDesc(e.target.value)}
                placeholder="Nêu rõ yêu cầu kiểm tra nội dung nào, dấu hiệu nhận biết hoặc quy định chuyên môn..."
                className="w-full text-xs rounded-lg border border-slate-300 p-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="text-xs px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-1.5 rounded-lg shadow-2xs"
            >
              Lưu tiêu chí
            </button>
          </div>
        </form>
      )}

      {/* Criteria List for Selected Subject */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {filteredCriteria.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            Chưa có tiêu chí nào cho môn này. Bạn có thể nhấn nút "Thêm tiêu chí mới" ở trên.
          </div>
        ) : (
          filteredCriteria.map((criterion, idx) => {
            const isEditing = editingCritId === criterion.id;
            return (
              <div
                key={criterion.id}
                className="p-4 hover:bg-slate-50/60 transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-3"
              >
                <div className="flex items-start space-x-3 min-w-0 flex-1">
                  {/* Toggle Checkbox */}
                  <div className="pt-0.5">
                    <input
                      type="checkbox"
                      checked={criterion.enabled}
                      onChange={() => handleToggle(criterion.id)}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      title={criterion.enabled ? 'Đang kích hoạt' : 'Đang tắt'}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    {isEditing ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full text-xs font-bold rounded-lg border border-slate-300 p-2 text-slate-800"
                        />
                        <textarea
                          rows={2}
                          value={editDesc}
                          onChange={(e) => setEditDesc(e.target.value)}
                          className="w-full text-xs rounded-lg border border-slate-300 p-2 text-slate-800"
                        />
                        <div className="flex items-center space-x-2 pt-1">
                          <button
                            onClick={() => handleSaveEdit(criterion.id)}
                            className="bg-emerald-600 text-white text-[11px] font-semibold px-3 py-1 rounded-md"
                          >
                            Lưu thay đổi
                          </button>
                          <button
                            onClick={() => setEditingCritId(null)}
                            className="text-slate-500 text-[11px] px-2 py-1"
                          >
                            Hủy
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs text-slate-400 font-semibold">
                            #{idx + 1}
                          </span>
                          <h4
                            className={`text-xs font-bold ${
                              criterion.enabled ? 'text-slate-900' : 'text-slate-400 line-through'
                            }`}
                          >
                            {criterion.name}
                          </h4>
                          <span className="text-[10.5px] bg-slate-100 text-slate-600 px-2 py-0.2 rounded font-medium">
                            {criterion.category}
                          </span>
                          {criterion.isCustom && (
                            <span className="text-[10.5px] bg-blue-100 text-blue-700 px-2 py-0.2 rounded font-semibold">
                              Tùy chỉnh
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          {criterion.description}
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {/* Edit / Delete actions */}
                {!isEditing && (
                  <div className="flex items-center space-x-1 shrink-0 self-end sm:self-auto">
                    <button
                      onClick={() => handleStartEdit(criterion)}
                      className="p-1.5 text-slate-400 hover:text-blue-700 hover:bg-slate-100 rounded-lg text-xs"
                      title="Chỉnh sửa tiêu chí"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {criterion.isCustom && (
                      <button
                        onClick={() => handleDelete(criterion.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg text-xs"
                        title="Xóa tiêu chí"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
