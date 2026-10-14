import React, { useState } from 'react';
import {
  Search,
  Bell,
  Plus,
  Atom,
  Sparkles,
  BookOpen,
  FileText,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  X
} from 'lucide-react';
import { UserProfile, AuditLog } from '../types';

interface HeaderProps {
  activeTabTitle: string;
  user: UserProfile;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onQuickAction: () => void;
  recentLogs: AuditLog[];
}

export const Header: React.FC<HeaderProps> = ({
  activeTabTitle,
  user,
  searchQuery,
  onSearchChange,
  onQuickAction,
  recentLogs
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 px-4 md:px-6 py-3 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center justify-center w-9 h-9 rounded-lg bg-blue-900 text-white font-bold shadow-xs">
          <Atom className="w-5 h-5 animate-spin-slow text-sky-400" />
        </div>
        <div>
          <h1 className="text-lg md:text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            {activeTabTitle}
          </h1>
          <p className="text-xs text-slate-500 hidden sm:block">
            GDPT 2018 • Khối 10, 11, 12 • Học kỳ I
          </p>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="flex-1 max-w-md mx-4 hidden lg:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm kiếm đề thi, giáo án, slide, học sinh..."
            className="w-full pl-9 pr-8 py-1.5 text-sm bg-slate-100 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-blue-600 rounded-lg outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Actions & User profile */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Quick Add Button */}
        <button
          onClick={onQuickAction}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 active:scale-95 text-white text-xs md:text-sm font-medium rounded-lg shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Thêm nhanh</span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-600 hover:text-blue-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Thông báo hoạt động"
          >
            <Bell className="w-5 h-5" />
            {recentLogs.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-3 text-slate-800">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-semibold text-sm">Nhật ký hoạt động hệ thống</span>
                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium">
                  {recentLogs.length} ghi nhận
                </span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 mt-2 text-xs">
                {recentLogs.slice(0, 6).map((log) => (
                  <div key={log.id} className="py-2 flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-blue-700 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-800">{log.action}: <span className="text-slate-600 font-normal">{log.detail}</span></p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{log.timestamp} • {log.module}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Teacher Avatar and Status */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <img
            src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100'}
            alt={user.name}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-700/20"
          />
          <div className="hidden xl:block text-left">
            <p className="text-xs font-bold text-slate-800 leading-tight">{user.name}</p>
            <p className="text-[10px] text-slate-500 leading-tight">{user.title}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
