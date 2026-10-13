import React from 'react';
import {
  LayoutDashboard,
  GitCompare,
  ClipboardCheck,
  History,
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  FileCheck2,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  hasActiveResults: boolean;
  historyCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  hasActiveResults,
  historyCount,
}) => {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Tổng quan',
      icon: LayoutDashboard,
      description: 'Chỉ số & tiến trình KHTN',
    },
    {
      id: 'compare',
      label: 'Đối chiếu Phụ lục – Syllabus',
      icon: GitCompare,
      description: 'Tải tài liệu & chạy rà soát',
    },
    {
      id: 'results',
      label: 'Rà soát hồ sơ',
      icon: ClipboardCheck,
      badge: hasActiveResults ? 'Đang mở' : undefined,
      description: 'Bảng 7 cột & xác nhận của GV',
    },
    {
      id: 'history',
      label: 'Lịch sử rà soát',
      icon: History,
      count: historyCount > 0 ? historyCount : undefined,
      description: 'Lưu trữ & so sánh đợt rà soát',
    },
    {
      id: 'criteria',
      label: 'Thiết lập tiêu chí theo môn học',
      icon: SlidersHorizontal,
      description: 'Toán, Tin, Robo, Lý, Hóa, Sinh',
    },
  ];

  return (
    <aside className="w-full lg:w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 lg:min-h-[calc(100vh-4rem)]">
      {/* Navigation Links */}
      <div className="p-3 space-y-1">
        <div className="px-3 py-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          Chức năng chính
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all text-sm font-medium ${
                isActive
                  ? 'bg-blue-50 text-blue-700 shadow-xs ring-1 ring-blue-100'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center space-x-3 min-w-0">
                <div
                  className={`p-1.5 rounded-lg shrink-0 ${
                    isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <div className="truncate font-semibold">{item.label}</div>
                  <div className="text-[11px] text-slate-400 truncate font-normal">
                    {item.description}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-1 shrink-0 ml-2">
                {item.badge && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
                {item.count !== undefined && (
                  <span className="text-[11px] bg-slate-200 text-slate-700 font-semibold px-2 py-0.5 rounded-full">
                    {item.count}
                  </span>
                )}
                {isActive && <ChevronRight className="w-4 h-4 text-blue-600 shrink-0" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Professional Guidance Card */}
      <div className="mt-auto p-4 border-t border-slate-200 bg-slate-50/60 m-3 rounded-xl border">
        <div className="flex items-start space-x-2.5">
          <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-600 space-y-1">
            <p className="font-semibold text-slate-900">Nguyên tắc chuyên môn</p>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              KHTN Smart Review là công cụ hỗ trợ đối chiếu có căn cứ trích dẫn. Kết quả do giáo viên bộ môn và tổ chuyên môn thẩm định và quyết định.
            </p>
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center space-x-1">
            <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Chuẩn GDPT 2018</span>
          </span>
          <span className="font-medium text-slate-400">Tổ KHTN</span>
        </div>
      </div>
    </aside>
  );
};
