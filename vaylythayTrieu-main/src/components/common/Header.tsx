import React, { useState } from 'react';
import {
  Search,
  Plus,
  Bell,
  Sparkles,
  UserCheck,
  RotateCcw,
  BookOpen,
  FileQuestion,
  CheckSquare,
  FileSpreadsheet,
} from 'lucide-react';
import { ActiveTab } from './Sidebar';
import { UserRole } from '../../types';

interface HeaderProps {
  activeTab: ActiveTab;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenQuickCreate: () => void;
  onResetDemo: () => void;
  role: UserRole;
  onRoleChange: (r: UserRole) => void;
  upcomingCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  searchQuery,
  onSearchChange,
  onOpenQuickCreate,
  onResetDemo,
  role,
  onRoleChange,
  upcomingCount = 3,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

  const tabTitles: Record<ActiveTab, { title: string; subtitle: string }> = {
    dashboard: { title: 'Tổng quan giảng dạy', subtitle: 'Hệ thống chỉ số, tiến độ học tập và học liệu Vật lý' },
    classes: { title: 'Quản lý lớp học', subtitle: 'Danh sách các khối lớp 10, 11 và 12 đang phụ trách' },
    students: { title: 'Quản lý học sinh', subtitle: 'Hồ sơ học sinh, thông tin phụ huynh và tình hình học tập' },
    exams: { title: 'Ngân hàng đề thi', subtitle: 'Tổ chức đề kiểm tra, ma trận kiến thức và trộn đề trắc nghiệm' },
    lessons: { title: 'Quản lý giáo án điện tử', subtitle: 'Kế hoạch bài dạy theo Công văn 5512/BGDĐT' },
    slides: { title: 'Thư viện slide bài giảng', subtitle: 'Kho bài giảng trình chiếu PPTX và tài liệu tương tác' },
    assignments: { title: 'Quản lý bài tập học sinh', subtitle: 'Giao bài tập phân hóa, thu bài và chấm điểm nhận xét' },
    gradebook: { title: 'Sổ điểm điện tử', subtitle: 'Bảng điểm thường xuyên, giữa kỳ và cuối kỳ theo Thông tư 22' },
    'ai-assistant': { title: 'Trợ lý AI Vật lý', subtitle: 'Giải đáp học thuật, kiểm tra đơn vị SI và soạn bài tự động' },
    reports: { title: 'Báo cáo & Thống kê', subtitle: 'Biểu đồ phân bố điểm, tỷ lệ hoàn thành và học sinh cần phụ đạo' },
    settings: { title: 'Cài đặt hệ thống', subtitle: 'Cấu hình trọng số điểm, phân quyền và sao lưu dữ liệu' },
  };

  const current = tabTitles[activeTab] || { title: 'Hệ thống', subtitle: '' };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-2xs">
      {/* Title zone */}
      <div className="flex flex-col min-w-0">
        <h2 className="text-sm md:text-base font-bold text-slate-900 tracking-tight leading-tight truncate">
          {current.title}
        </h2>
        <p className="text-[11px] text-slate-500 leading-none truncate hidden sm:block">
          {current.subtitle}
        </p>
      </div>

      {/* Center Search Zone */}
      <div className="flex-1 max-w-md hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Tìm kiếm nhanh đề thi, giáo án, bài tập, học sinh..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs px-1"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Right Action Zone */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Reset Demo button for quick evaluation */}
        <button
          onClick={onResetDemo}
          title="Nạp lại bộ dữ liệu mẫu ban đầu"
          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1 text-xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden xl:inline text-[11px]">Nạp lại mẫu</span>
        </button>

        {/* Notifications toggle */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors relative"
            aria-label="Thông báo"
          >
            <Bell className="w-4 h-4" />
            {upcomingCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in slide-in-from-top-1">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-semibold text-slate-900">Thông báo sư phạm</span>
                <span className="text-[10px] text-slate-500">Học kỳ 1</span>
              </div>
              <div className="mt-2 space-y-2 text-xs">
                <div className="p-2 bg-amber-50 rounded-lg border border-amber-100 text-amber-900">
                  <p className="font-medium text-[11px]">Hạn nộp bài tập sắp tới</p>
                  <p className="text-[10px] text-amber-700 mt-0.5">Bài tập 01 (Lớp 10A1) đến hạn vào ngày 25/10/2026</p>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg border border-blue-100 text-blue-900">
                  <p className="font-medium text-[11px]">Lịch kiểm tra định kỳ</p>
                  <p className="text-[10px] text-blue-700 mt-0.5">Kiểm tra giữa kỳ Vật lý 11 dự kiến tuần 9</p>
                </div>
              </div>
              <button
                onClick={() => setShowNotifications(false)}
                className="mt-2 w-full py-1 text-center text-[11px] text-slate-500 hover:text-slate-800"
              >
                Đóng
              </button>
            </div>
          )}
        </div>

        {/* Quick Add Button */}
        <button
          onClick={onOpenQuickCreate}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg transition-colors shadow-2xs whitespace-nowrap shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Thêm nhanh</span>
        </button>
      </div>
    </header>
  );
};
