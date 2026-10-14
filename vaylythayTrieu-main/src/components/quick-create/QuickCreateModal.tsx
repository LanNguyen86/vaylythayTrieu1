import React from 'react';
import {
  X,
  FileQuestion,
  BookOpen,
  CheckSquare,
  FileSpreadsheet,
  Sparkles,
} from 'lucide-react';
import { ActiveTab } from '../common/Sidebar';

interface QuickCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: ActiveTab, action?: string) => void;
}

export const QuickCreateModal: React.FC<QuickCreateModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  if (!isOpen) return null;

  const quickActions = [
    {
      title: 'Tạo đề thi mới',
      desc: 'Soạn đề thi trắc nghiệm, tự luận hoặc tạo đề tự động bằng AI',
      icon: FileQuestion,
      color: 'bg-blue-50 text-blue-600 border-blue-200',
      tab: 'exams' as ActiveTab,
      action: 'create-exam',
    },
    {
      title: 'Soạn giáo án mới',
      desc: 'Thiết kế kế hoạch bài dạy theo Công văn 5512 (4 hoạt động)',
      icon: BookOpen,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      tab: 'lessons' as ActiveTab,
      action: 'create-lesson',
    },
    {
      title: 'Giao bài tập mới',
      desc: 'Ra bài tập về nhà phân hóa theo lớp và đặt hạn nộp',
      icon: CheckSquare,
      color: 'bg-amber-50 text-amber-600 border-amber-200',
      tab: 'assignments' as ActiveTab,
      action: 'create-assignment',
    },
    {
      title: 'Nhập điểm học sinh',
      desc: 'Mở sổ điểm điện tử Excel-like để ghi nhận điểm kiểm tra',
      icon: FileSpreadsheet,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-200',
      tab: 'gradebook' as ActiveTab,
      action: 'enter-grades',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Thao tác thêm nhanh</h3>
            <p className="text-xs text-slate-500">Chọn tác vụ sư phạm thầy/cô muốn thực hiện ngay</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <button
                key={idx}
                onClick={() => {
                  onClose();
                  onNavigate(action.tab, action.action);
                }}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 transition-all text-left flex flex-col gap-2 group"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${action.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {action.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                    {action.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5 text-blue-600">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="font-medium text-[11px]">Hỗ trợ trợ lý AI Gemini 3.8</span>
          </div>
          <button
            onClick={onClose}
            className="text-xs text-slate-600 hover:text-slate-900"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
