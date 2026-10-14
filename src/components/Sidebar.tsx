import React from 'react';
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  FileCheck2,
  BookOpenCheck,
  Presentation,
  CheckSquare,
  Award,
  Sparkles,
  BarChart3,
  Settings,
  Atom,
  ChevronRight,
  Database
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'classes'
  | 'students'
  | 'exams'
  | 'lessons'
  | 'slides'
  | 'assignments'
  | 'gradebook'
  | 'ai-assistant'
  | 'analytics'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  badgeCounts: {
    exams: number;
    lessons: number;
    slides: number;
    assignments: number;
    students: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  badgeCounts
}) => {
  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'classes' as NavTab, label: 'Quản lý lớp học', icon: GraduationCap },
    { id: 'students' as NavTab, label: 'Quản lý học sinh', icon: Users, badge: badgeCounts.students },
    { id: 'exams' as NavTab, label: 'Quản lý đề thi', icon: FileCheck2, badge: badgeCounts.exams },
    { id: 'lessons' as NavTab, label: 'Quản lý giáo án', icon: BookOpenCheck, badge: badgeCounts.lessons },
    { id: 'slides' as NavTab, label: 'Slide bài giảng', icon: Presentation, badge: badgeCounts.slides },
    { id: 'assignments' as NavTab, label: 'Quản lý bài tập', icon: CheckSquare, badge: badgeCounts.assignments },
    { id: 'gradebook' as NavTab, label: 'Quản lý điểm', icon: Award },
    { id: 'ai-assistant' as NavTab, label: 'Trợ lý AI Vật lý', icon: Sparkles, isHighlight: true },
    { id: 'analytics' as NavTab, label: 'Báo cáo thống kê', icon: BarChart3 },
    { id: 'settings' as NavTab, label: 'Cài đặt hệ thống', icon: Settings },
  ];

  return (
    <aside
      className={`bg-slate-900 text-slate-200 transition-all duration-300 flex flex-col shrink-0 border-r border-slate-800 select-none ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center px-4 border-b border-slate-800 justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-500 flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
            <Atom className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="truncate">
              <span className="font-bold text-sm tracking-wide text-white block">PHYSICS ASSISTANT</span>
              <span className="text-[10px] text-sky-400 font-medium block">Trợ lý Giáo viên THPT</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs md:text-sm font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : item.isHighlight
                  ? 'text-amber-300 hover:bg-slate-800/80 hover:text-amber-200'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  isActive
                    ? 'text-white'
                    : item.isHighlight
                    ? 'text-amber-400 animate-pulse'
                    : 'text-slate-400'
                }`}
              />
              {!collapsed && (
                <span className="flex-1 text-left truncate flex items-center justify-between">
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-1 ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {item.isHighlight && !isActive && (
                    <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1 rounded uppercase tracking-wider font-semibold">
                      AI 3.8
                    </span>
                  )}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Status / Mode card */}
      {!collapsed && (
        <div className="p-3 m-2 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="flex items-center gap-1.5 text-slate-300 font-semibold text-[11px]">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              Chế độ Dữ liệu THPT
            </span>
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <p className="text-[10px] text-slate-400 leading-normal">
            Lưu trữ cục bộ &amp; Sẵn sàng đồng bộ Firebase Cloud Firestore.
          </p>
        </div>
      )}

      {/* Collapse Toggle */}
      <div className="p-2 border-t border-slate-800 flex justify-end">
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors w-full flex items-center justify-center cursor-pointer"
          title={collapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
        >
          <ChevronRight
            className={`w-4 h-4 transition-transform duration-300 ${
              collapsed ? '' : 'rotate-180'
            }`}
          />
        </button>
      </div>
    </aside>
  );
};
