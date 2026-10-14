import React from 'react';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  FileQuestion,
  BookOpen,
  Presentation,
  CheckSquare,
  FileSpreadsheet,
  Sparkles,
  BarChart3,
  Settings,
  Atom,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { UserRole } from '../../types';

export type ActiveTab =
  | 'dashboard'
  | 'classes'
  | 'students'
  | 'exams'
  | 'lessons'
  | 'slides'
  | 'assignments'
  | 'gradebook'
  | 'ai-assistant'
  | 'reports'
  | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  role: UserRole;
  counts: {
    classes: number;
    exams: number;
    lessons: number;
    slides: number;
    assignments: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  role,
  counts,
}) => {
  const navItems: {
    id: ActiveTab;
    label: string;
    icon: React.ElementType;
    badge?: number;
    roles?: UserRole[];
  }[] = [
    { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'classes', label: 'Quản lý lớp học', icon: Users, badge: counts.classes },
    { id: 'students', label: 'Quản lý học sinh', icon: GraduationCap },
    { id: 'exams', label: 'Quản lý đề thi', icon: FileQuestion, badge: counts.exams },
    { id: 'lessons', label: 'Quản lý giáo án', icon: BookOpen, badge: counts.lessons },
    { id: 'slides', label: 'Quản lý slide bài giảng', icon: Presentation, badge: counts.slides },
    { id: 'assignments', label: 'Quản lý bài tập', icon: CheckSquare, badge: counts.assignments },
    { id: 'gradebook', label: 'Quản lý sổ điểm', icon: FileSpreadsheet },
    { id: 'ai-assistant', label: 'Trợ lý AI Vật lý', icon: Sparkles },
    { id: 'reports', label: 'Báo cáo thống kê', icon: BarChart3 },
    { id: 'settings', label: 'Cài đặt hệ thống', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 shrink-0 flex flex-col h-screen border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
          <Atom className="w-5 h-5 animate-spin-slow" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-bold text-white tracking-tight leading-none truncate">
            Physics Assistant
          </h1>
          <p className="text-[11px] text-slate-400 mt-1 truncate">
            Trợ lý Vật lý THPT (GDPT 2018)
          </p>
        </div>
      </div>

      {/* Role Indicator Banner */}
      <div className="px-4 py-2.5 bg-slate-800/50 border-b border-slate-800/60 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-300">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          <span className="font-medium">
            {role === 'teacher' ? 'Giáo viên bộ môn' : role === 'admin' ? 'Tổ trưởng / Quản trị' : 'Cổng học sinh'}
          </span>
        </div>
        <span className="text-[10px] text-blue-400 font-mono uppercase tracking-wider">
          Demo v1.0
        </span>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-3.5 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-all text-left group ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {typeof item.badge === 'number' && item.badge > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold ${
                      isActive
                        ? 'bg-blue-700/80 text-blue-100'
                        : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Bottom User Card */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-900/80 border border-slate-800/80">
          <img
            src="/src/assets/images/teacher_avatar_minh_1791939902666.jpg"
            alt="Thầy Triệu Vật Lý"
            referrerPolicy="no-referrer"
            className="w-9 h-9 rounded-full object-cover ring-1 ring-blue-500/30 shrink-0"
            onError={(e) => {
              // styled fallback container if image fails
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">
              Thầy Triệu Vật Lý
            </p>
            <p className="text-[10px] text-slate-400 truncate">
              trieu.vatly@thpt.edu.vn
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
