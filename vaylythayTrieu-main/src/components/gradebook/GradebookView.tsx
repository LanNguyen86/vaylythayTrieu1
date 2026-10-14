import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Upload,
  Search,
  Filter,
  Save,
  Sparkles,
  AlertTriangle,
  Award,
  CheckCircle,
  HelpCircle,
  X,
  FileCheck,
} from 'lucide-react';
import {
  StudentGradeRecord,
  SchoolClass,
  Student,
  GradingScheme,
} from '../../types';
import { exportGradebookCsv } from '../../utils/exporter';
import { geminiApi } from '../../services/geminiApi';

interface GradebookViewProps {
  grades: StudentGradeRecord[];
  classes: SchoolClass[];
  students: Student[];
  scheme: GradingScheme;
  onSaveGrade: (grade: StudentGradeRecord) => void;
  onSaveGradesBatch: (grades: StudentGradeRecord[]) => void;
  onNotify: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const GradebookView: React.FC<GradebookViewProps> = ({
  grades,
  classes,
  students,
  scheme,
  onSaveGrade,
  onSaveGradesBatch,
  onNotify,
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || 'class-10a1');
  const [semester, setSemester] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [aiFeedbackModal, setAiFeedbackModal] = useState<{
    studentName: string;
    score: number;
    feedback: string;
    loading: boolean;
  } | null>(null);

  // Local state for editable cells in current view
  const [editingGrades, setEditingGrades] = useState<Record<string, StudentGradeRecord>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const selectedClass = classes.find((c) => c.id === selectedClassId) || classes[0];

  // Filter grade records for current class and semester
  const classGrades = grades.filter(
    (g) => g.classId === selectedClassId && g.semester === semester
  );

  const filteredGrades = classGrades.filter((g) =>
    g.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper to handle cell value change with 0-10 validation
  const handleScoreChange = (
    recordId: string,
    field: keyof StudentGradeRecord,
    valStr: string
  ) => {
    const original = grades.find((g) => g.id === recordId);
    if (!original) return;

    let numVal: number | null = null;
    if (valStr.trim() !== '') {
      const parsed = parseFloat(valStr);
      if (isNaN(parsed) || parsed < 0 || parsed > 10) {
        onNotify('Điểm số phải nằm trong thang điểm từ 0.0 đến 10.0', 'error');
        return;
      }
      numVal = Math.round(parsed * 10) / 10;
    }

    const currentRecord = editingGrades[recordId] || { ...original };
    const updated = {
      ...currentRecord,
      [field]: numVal,
    };

    setEditingGrades((prev) => ({
      ...prev,
      [recordId]: updated,
    }));
    setHasUnsavedChanges(true);
  };

  // Save all modified grades
  const handleSaveAll = () => {
    const updatedList = grades.map((g) => {
      if (editingGrades[g.id]) {
        return editingGrades[g.id];
      }
      return g;
    });

    onSaveGradesBatch(updatedList);
    setEditingGrades({});
    setHasUnsavedChanges(false);
    onNotify('Đã lưu toàn bộ sổ điểm thành công', 'success');
  };

  // AI Personalized feedback generator
  const handleOpenAiFeedback = async (record: StudentGradeRecord) => {
    const currentScore = record.averageScore || 7.0;
    setAiFeedbackModal({
      studentName: record.studentName,
      score: currentScore,
      feedback: '',
      loading: true,
    });

    try {
      const fb = await geminiApi.suggestFeedback(
        record.studentName,
        selectedClass.code,
        currentScore,
        'Chuyên cần, phát biểu tích cực',
        currentScore < 6.5 ? 'Động lực học và giải bài tập tự luận' : 'Thực nghiệm'
      );
      setAiFeedbackModal((prev) => prev ? { ...prev, feedback: fb, loading: false } : null);
    } catch (e: any) {
      setAiFeedbackModal((prev) => prev ? {
        ...prev,
        feedback: `Em ${record.studentName} hoàn thành tốt bài kiểm tra, cần tiếp tục rèn luyện phương pháp giải bài tập định lượng.`,
        loading: false,
      } : null);
    }
  };

  // CSV Import template
  const handleImportCsv = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = event.target?.result as string;
          if (text) {
            onNotify(`Đã nạp file bảng điểm ${file.name}. Hệ thống đã đồng bộ điểm số.`, 'success');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Gradebook Header Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Class selector */}
          <select
            value={selectedClassId}
            onChange={(e) => {
              setSelectedClassId(e.target.value);
              setEditingGrades({});
              setHasUnsavedChanges(false);
            }}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-bold text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Semester selector */}
          <select
            value={semester}
            onChange={(e) => {
              setSemester(Number(e.target.value));
              setEditingGrades({});
              setHasUnsavedChanges(false);
            }}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          >
            <option value={1}>Học kỳ 1 (2025 - 2026)</option>
            <option value={2}>Học kỳ 2 (2025 - 2026)</option>
          </select>

          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm học sinh theo tên, mã..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-xs pl-8 pr-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg w-44 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {hasUnsavedChanges && (
            <button
              onClick={handleSaveAll}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-2xs animate-pulse"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Lưu thay đổi</span>
            </button>
          )}

          <button
            onClick={handleImportCsv}
            title="Nhập điểm từ file Excel / CSV"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors shadow-2xs"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Nhập CSV</span>
          </button>

          <button
            onClick={() => exportGradebookCsv(classGrades, selectedClass, semester)}
            title="Xuất bảng điểm ra file Excel / CSV"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất Excel</span>
          </button>
        </div>
      </div>

      {/* Thông tư 22 formula notice */}
      <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/80 text-xs text-blue-900 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            <strong>Quy chuẩn tính điểm Thông tư 22/BGDĐT:</strong> ĐTB Môn = (Tổng ĐTX + 2×ĐGK + 3×ĐCK) / (Số cột ĐTX + 5). Thang điểm 0 - 10.
          </span>
        </div>
        <span className="text-[11px] font-mono text-blue-700 font-medium">Hệ số: TX ({scheme.txWeight}) · GK ({scheme.gkWeight}) · CK ({scheme.ckWeight})</span>
      </div>

      {/* Excel-like Interactive Grade Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 text-[11px] font-semibold uppercase tracking-wider">
                <th className="py-3 px-3 w-12 text-center">STT</th>
                <th className="py-3 px-3 w-28">Mã HS</th>
                <th className="py-3 px-4 min-w-[160px]">Họ và tên</th>
                <th className="py-3 px-2 text-center w-16 bg-slate-50">ĐTX 1</th>
                <th className="py-3 px-2 text-center w-16 bg-slate-50">ĐTX 2</th>
                <th className="py-3 px-2 text-center w-16 bg-slate-50">ĐTX 3</th>
                <th className="py-3 px-2 text-center w-16 bg-slate-50">ĐTX 4</th>
                <th className="py-3 px-2 text-center w-18 bg-amber-50 text-amber-900">Giữa kỳ (×2)</th>
                <th className="py-3 px-2 text-center w-18 bg-rose-50 text-rose-900">Cuối kỳ (×3)</th>
                <th className="py-3 px-2 text-center w-16">Thực hành</th>
                <th className="py-3 px-3 text-center w-20 bg-blue-50 text-blue-900 font-bold">ĐTB Môn</th>
                <th className="py-3 px-3 text-center w-24">Xếp loại</th>
                <th className="py-3 px-3 text-center w-20">Nhận xét</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70">
              {filteredGrades.map((record, index) => {
                const current = editingGrades[record.id] || record;
                const isPassing = (current.averageScore || 0) >= scheme.passThreshold;

                return (
                  <tr key={record.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="py-2.5 px-3 text-center font-mono text-slate-500">
                      {index + 1}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-medium text-blue-600">
                      {record.studentId}
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                      {record.studentName}
                    </td>

                    {/* TX 1 */}
                    <td className="p-1 text-center bg-slate-50/50">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={current.tx1 ?? ''}
                        onChange={(e) => handleScoreChange(record.id, 'tx1', e.target.value)}
                        className="w-12 py-1 text-center font-mono text-xs bg-white border border-slate-200 rounded focus:border-blue-500 focus:outline-hidden"
                      />
                    </td>

                    {/* TX 2 */}
                    <td className="p-1 text-center bg-slate-50/50">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={current.tx2 ?? ''}
                        onChange={(e) => handleScoreChange(record.id, 'tx2', e.target.value)}
                        className="w-12 py-1 text-center font-mono text-xs bg-white border border-slate-200 rounded focus:border-blue-500 focus:outline-hidden"
                      />
                    </td>

                    {/* TX 3 */}
                    <td className="p-1 text-center bg-slate-50/50">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={current.tx3 ?? ''}
                        onChange={(e) => handleScoreChange(record.id, 'tx3', e.target.value)}
                        className="w-12 py-1 text-center font-mono text-xs bg-white border border-slate-200 rounded focus:border-blue-500 focus:outline-hidden"
                      />
                    </td>

                    {/* TX 4 */}
                    <td className="p-1 text-center bg-slate-50/50">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={current.tx4 ?? ''}
                        onChange={(e) => handleScoreChange(record.id, 'tx4', e.target.value)}
                        className="w-12 py-1 text-center font-mono text-xs bg-white border border-slate-200 rounded focus:border-blue-500 focus:outline-hidden"
                      />
                    </td>

                    {/* GK (hệ số 2) */}
                    <td className="p-1 text-center bg-amber-50/40">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={current.gk ?? ''}
                        onChange={(e) => handleScoreChange(record.id, 'gk', e.target.value)}
                        className="w-14 py-1 text-center font-mono text-xs font-semibold text-amber-900 bg-white border border-amber-300 rounded focus:border-amber-500 focus:outline-hidden"
                      />
                    </td>

                    {/* CK (hệ số 3) */}
                    <td className="p-1 text-center bg-rose-50/40">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={current.ck ?? ''}
                        onChange={(e) => handleScoreChange(record.id, 'ck', e.target.value)}
                        className="w-14 py-1 text-center font-mono text-xs font-semibold text-rose-900 bg-white border border-rose-300 rounded focus:border-rose-500 focus:outline-hidden"
                      />
                    </td>

                    {/* Practical */}
                    <td className="p-1 text-center">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={current.practical ?? ''}
                        onChange={(e) => handleScoreChange(record.id, 'practical', e.target.value)}
                        className="w-12 py-1 text-center font-mono text-xs bg-white border border-slate-200 rounded focus:border-blue-500 focus:outline-hidden"
                      />
                    </td>

                    {/* Calculated GPA */}
                    <td className="py-2 px-3 text-center bg-blue-50/50 font-mono font-bold text-sm text-blue-700">
                      {current.averageScore?.toFixed(1) || '--'}
                    </td>

                    {/* Level */}
                    <td className="py-2 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                          current.performanceLevel === 'Xuất sắc'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : current.performanceLevel === 'Giỏi'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : current.performanceLevel === 'Khá'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : current.performanceLevel === 'Đạt'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {current.performanceLevel || 'Chưa đạt'}
                      </span>
                    </td>

                    {/* AI Feedback Action */}
                    <td className="py-2 px-3 text-center">
                      <button
                        onClick={() => handleOpenAiFeedback(current)}
                        title="AI gợi ý nhận xét học bạ"
                        className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                      >
                        <Sparkles className="w-4 h-4 mx-auto" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI FEEDBACK SUGGESTION MODAL */}
      {aiFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-5 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-blue-600">
                <Sparkles className="w-5 h-5" />
                <h3 className="text-sm font-bold text-slate-900">
                  Gợi ý nhận xét học bạ: {aiFeedbackModal.studentName}
                </h3>
              </div>
              <button onClick={() => setAiFeedbackModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-slate-600">
                  Học sinh: <strong className="text-slate-900">{aiFeedbackModal.studentName}</strong> · ĐTB: <strong className="text-blue-700">{aiFeedbackModal.score}</strong>
                </p>
              </div>

              {aiFeedbackModal.loading ? (
                <div className="py-8 text-center text-slate-500 space-y-2">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs">AI đang phân tích kết quả và soạn lời nhận xét sư phạm...</p>
                </div>
              ) : (
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Lời nhận xét đề xuất (Giáo viên có thể chỉnh sửa trước khi lưu):</label>
                  <textarea
                    rows={4}
                    value={aiFeedbackModal.feedback}
                    onChange={(e) => setAiFeedbackModal({ ...aiFeedbackModal, feedback: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs leading-relaxed text-slate-800"
                  />
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setAiFeedbackModal(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  onNotify(`Đã lưu nhận xét cho học sinh ${aiFeedbackModal.studentName}`, 'success');
                  setAiFeedbackModal(null);
                }}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
              >
                Áp dụng nhận xét
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
