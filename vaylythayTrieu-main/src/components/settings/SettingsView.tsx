import React, { useState } from 'react';
import {
  Settings,
  ShieldCheck,
  Save,
  RotateCcw,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { GradingScheme, UserRole } from '../../types';
import { storage } from '../../services/storage';

interface SettingsViewProps {
  role: UserRole;
  onRoleChange: (r: UserRole) => void;
  scheme: GradingScheme;
  onSaveScheme: (scheme: GradingScheme) => void;
  onResetDemo: () => void;
  onNotify: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  role,
  onRoleChange,
  scheme,
  onSaveScheme,
  onResetDemo,
  onNotify,
}) => {
  const [localScheme, setLocalScheme] = useState<GradingScheme>({ ...scheme });

  const handleExportBackup = () => {
    const json = storage.exportBackupJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Sao_luu_Physics_Assistant_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onNotify('Đã xuất file sao lưu JSON thành công', 'success');
  };

  const handleImportBackup = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          if (content && storage.importBackupJson(content)) {
            onNotify('Phục hồi dữ liệu từ bản sao lưu thành công!', 'success');
            setTimeout(() => window.location.reload(), 800);
          } else {
            onNotify('Tệp sao lưu không hợp lệ', 'error');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      {/* Role Selection */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Phân quyền và Vai trò người dùng (Role Management)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Chuyển đổi góc nhìn vai trò để trải nghiệm cách hệ thống kiểm soát quyền truy cập dữ liệu
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <button
            onClick={() => {
              onRoleChange('teacher');
              onNotify('Đã chuyển sang vai trò: Giáo viên bộ môn', 'info');
            }}
            className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
              role === 'teacher'
                ? 'bg-blue-50/70 border-blue-500 ring-1 ring-blue-500 shadow-2xs'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div>
              <span className="text-xs font-bold text-blue-900">Giáo viên bộ môn</span>
              <p className="text-[11px] text-slate-600 mt-1">
                Toàn quyền quản lý lớp học phụ trách, đề thi, giáo án, chấm bài tập và vào sổ điểm.
              </p>
            </div>
            {role === 'teacher' && (
              <span className="text-[10px] font-semibold text-blue-700 mt-2 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Đang hoạt động
              </span>
            )}
          </button>

          <button
            onClick={() => {
              onRoleChange('admin');
              onNotify('Đã chuyển sang vai trò: Tổ trưởng / Quản trị', 'info');
            }}
            className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
              role === 'admin'
                ? 'bg-purple-50/70 border-purple-500 ring-1 ring-purple-500 shadow-2xs'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div>
              <span className="text-xs font-bold text-purple-900">Tổ trưởng / Quản trị</span>
              <p className="text-[11px] text-slate-600 mt-1">
                Xem toàn diện báo cáo thống kê tất cả các khối, cấu hình trọng số tính điểm chung của trường.
              </p>
            </div>
            {role === 'admin' && (
              <span className="text-[10px] font-semibold text-purple-700 mt-2 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Đang hoạt động
              </span>
            )}
          </button>

          <button
            onClick={() => {
              onRoleChange('student');
              onNotify('Đã chuyển sang vai trò: Cổng học sinh', 'info');
            }}
            className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
              role === 'student'
                ? 'bg-emerald-50/70 border-emerald-500 ring-1 ring-emerald-500 shadow-2xs'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div>
              <span className="text-xs font-bold text-emerald-900">Cổng học sinh (Student Portal)</span>
              <p className="text-[11px] text-slate-600 mt-1">
                Chỉ xem bài tập được giao, xem điểm và nhận xét cá nhân. Bảo vệ tuyệt mật đề thi và đáp án.
              </p>
            </div>
            {role === 'student' && (
              <span className="text-[10px] font-semibold text-emerald-700 mt-2 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Đang hoạt động
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Grading Scheme Settings */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-4 h-4 text-blue-600" />
            <span>Cấu hình trọng số và Thang điểm đánh giá (Thông tư 22/BGDĐT)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Hệ thống cho phép tùy biến trọng số kiểm tra thường xuyên, giữa kỳ và cuối kỳ theo quy định của trường
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Hệ số ĐTX (Thường xuyên)</label>
            <input
              type="number"
              min={1}
              max={3}
              value={localScheme.txWeight}
              onChange={(e) => setLocalScheme({ ...localScheme, txWeight: Number(e.target.value) })}
              className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
            />
            <span className="text-[11px] text-slate-500">Mặc định hệ số 1 (Kiểm tra 15p, bài tập)</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Hệ số ĐGK (Giữa kỳ)</label>
            <input
              type="number"
              min={1}
              max={5}
              value={localScheme.gkWeight}
              onChange={(e) => setLocalScheme({ ...localScheme, gkWeight: Number(e.target.value) })}
              className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
            />
            <span className="text-[11px] text-slate-500">Mặc định hệ số 2 (Kiểm tra 45 - 60p)</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Hệ số ĐCK (Cuối kỳ)</label>
            <input
              type="number"
              min={1}
              max={5}
              value={localScheme.ckWeight}
              onChange={(e) => setLocalScheme({ ...localScheme, ckWeight: Number(e.target.value) })}
              className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
            />
            <span className="text-[11px] text-slate-500">Mặc định hệ số 3 (Đề thi sở / trường)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Ngưỡng Đạt (Pass)</label>
            <input
              type="number"
              step="0.5"
              value={localScheme.passThreshold}
              onChange={(e) => setLocalScheme({ ...localScheme, passThreshold: Number(e.target.value) })}
              className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
            />
            <span className="text-[11px] text-slate-500">Từ 5.0 trở lên</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Ngưỡng Khá</label>
            <input
              type="number"
              step="0.5"
              value={localScheme.goodThreshold}
              onChange={(e) => setLocalScheme({ ...localScheme, goodThreshold: Number(e.target.value) })}
              className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
            />
            <span className="text-[11px] text-slate-500">Từ 6.5 trở lên</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Ngưỡng Giỏi</label>
            <input
              type="number"
              step="0.5"
              value={localScheme.excellentThreshold}
              onChange={(e) => setLocalScheme({ ...localScheme, excellentThreshold: Number(e.target.value) })}
              className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
            />
            <span className="text-[11px] text-slate-500">Từ 8.0 trở lên</span>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={() => {
              onSaveScheme(localScheme);
              onNotify('Đã lưu cấu hình biểu điểm thành công', 'success');
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-2xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Lưu cấu hình biểu điểm</span>
          </button>
        </div>
      </div>

      {/* Data Management & Backup */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Sao lưu dữ liệu & Quản lý bộ nhớ</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Xuất toàn bộ đề thi, giáo án, slide, bài tập và bảng điểm ra tệp JSON để lưu trữ hoặc nạp sang máy khác
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleExportBackup}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Tải file sao lưu (JSON)</span>
          </button>

          <button
            onClick={handleImportBackup}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors shadow-2xs"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Phục hồi từ file sao lưu</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('Khôi phục toàn bộ hệ thống về dữ liệu mẫu ban đầu? Tất cả dữ liệu tạm thời sẽ được làm mới.')) {
                onResetDemo();
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors shadow-2xs ml-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Nạp lại bộ dữ liệu mẫu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
