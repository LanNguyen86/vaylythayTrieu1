import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Download,
  Trash2,
  Edit,
  Eye,
  Sparkles,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  Award,
  X,
  FileText,
} from 'lucide-react';
import { Assignment, SchoolClass, GradeLevel } from '../../types';
import { downloadFile } from '../../utils/exporter';
import { geminiApi } from '../../services/geminiApi';

interface AssignmentsViewProps {
  assignments: Assignment[];
  classes: SchoolClass[];
  onSaveAssignment: (assignment: Assignment) => void;
  onDeleteAssignment: (id: string) => void;
  onNotify: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AssignmentsView: React.FC<AssignmentsViewProps> = ({
  assignments,
  classes,
  onSaveAssignment,
  onDeleteAssignment,
  onNotify,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedTier, setSelectedTier] = useState<string>('all');

  // Modals
  const [viewingAssignment, setViewingAssignment] = useState<Assignment | null>(null);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // AI Form
  const [aiGrade, setAiGrade] = useState<GradeLevel>(10);
  const [aiTopic, setAiTopic] = useState('Định luật bảo toàn cơ năng');
  const [aiTitle, setAiTitle] = useState('Bài tập Tàu lượn siêu tốc và Va chạm');
  const [aiTier, setAiTier] = useState('Đầy đủ 3 cấp độ (Cơ bản, Vận dụng, Nâng cao)');
  const [isGenerating, setIsGenerating] = useState(false);

  const filteredAssignments = assignments.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.topic.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === 'all' || a.targetClassId === selectedClass;
    const matchesStatus = selectedStatus === 'all' || a.status === selectedStatus;
    const matchesTier = selectedTier === 'all' || a.differentiationTier === selectedTier;
    return matchesSearch && matchesClass && matchesStatus && matchesTier;
  });

  const exportAssignmentCsv = (a: Assignment) => {
    const BOM = '\uFEFF';
    let csv = BOM;
    csv += `"Mã bài tập","Tên bài tập","Lớp","Chủ đề","Hạn nộp","Tổng điểm","Phân hóa","Đã nộp","Đã chấm"\n`;
    csv += `"${a.code}","${a.title}","${a.targetClassName}","${a.topic}","${a.dueDate}","${a.totalPoints}","${a.differentiationTier}","${a.submissionsCount}","${a.gradedCount}"\n`;

    downloadFile(csv, `Ket_qua_${a.code}.csv`, 'text/csv;charset=utf-8');
    onNotify(`Đã xuất kết quả bài tập ${a.code} ra CSV`, 'success');
  };

  const handleGenerateAiAssignment = async () => {
    setIsGenerating(true);
    try {
      const draft = await geminiApi.generateAssignment({
        grade: aiGrade,
        topic: aiTopic,
        title: aiTitle,
        differentiationLevel: aiTier,
      });

      const targetClass = classes.find((c) => c.grade === aiGrade) || classes[0];

      const newAssignment: Assignment = {
        id: `asg-${Date.now()}`,
        code: `BT-${aiGrade}-${Math.floor(10 + Math.random() * 90)}`,
        title: draft.title || aiTitle,
        description: `Bài tập phân hóa theo 3 cấp độ: Cơ bản, Vận dụng và Nâng cao cho chuyên đề ${aiTopic}.`,
        targetClassId: targetClass.id,
        targetClassName: targetClass.code,
        grade: aiGrade,
        topic: aiTopic,
        dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        createdAt: new Date().toISOString().split('T')[0],
        totalPoints: draft.totalPoints || 10,
        status: 'Đang mở',
        differentiationTier: 'Đại trà',
        questionsSummary: `${draft.tasks ? draft.tasks.length : 3} bài tập phân hóa`,
        guidelines: draft.guidanceForStudents || 'Làm bài ra vở hoặc nộp bài trực tuyến kèm hình vẽ sơ đồ.',
        teacherAnswerKey: (draft.tasks || [])
          .map((t: any) => `[${t.tier}]: ${t.solutionSteps?.join('; ')}`)
          .join('\n'),
        submissionsCount: 0,
        gradedCount: 0,
      };

      onSaveAssignment(newAssignment);
      setIsAiModalOpen(false);
      setEditingAssignment(newAssignment);
      onNotify('AI đã sinh bài tập phân hóa thành công. Thầy/cô hãy kiểm tra và lưu lại.', 'success');
    } catch (e: any) {
      onNotify(e.message || 'Lỗi khi tạo bài tập', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">Tất cả lớp học</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                Lớp {c.code}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="Đang mở">Đang mở (chưa hết hạn)</option>
            <option value="Đã đóng">Đã đóng hạn</option>
            <option value="Đã chấm">Đã chấm xong</option>
          </select>

          <select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">Tất cả phân hóa</option>
            <option value="Đại trà">Đại trà</option>
            <option value="Cơ bản (hỗ trợ)">Cơ bản (hỗ trợ)</option>
            <option value="Nâng cao (chọn lọc)">Nâng cao (chọn lọc)</option>
          </select>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm bài tập, chủ đề..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-xs pl-8 pr-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg w-44 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors border border-amber-200 shadow-2xs whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Sinh bài tập phân hóa</span>
          </button>
          <button
            onClick={() => {
              const newAsg: Assignment = {
                id: `asg-${Date.now()}`,
                code: `BT-10-${Math.floor(10 + Math.random() * 90)}`,
                title: 'Bài tập Vật lý mới',
                description: 'Yêu cầu làm bài tập và nộp đúng hạn',
                targetClassId: classes[0].id,
                targetClassName: classes[0].code,
                grade: 10,
                topic: 'Chuyển động thẳng',
                dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
                createdAt: new Date().toISOString().split('T')[0],
                totalPoints: 10,
                status: 'Đang mở',
                differentiationTier: 'Đại trà',
                questionsSummary: '5 bài tập trắc nghiệm và tự luận',
                guidelines: 'Ghi rõ các bước đổi đơn vị và vẽ sơ đồ lực',
                teacherAnswerKey: 'Đáp án chi tiết',
                submissionsCount: 0,
                gradedCount: 0,
              };
              setEditingAssignment(newAsg);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-2xs whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Giao bài tập</span>
          </button>
        </div>
      </div>

      {/* Assignments Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-600 text-[11px] uppercase">
              <tr>
                <th className="py-3 px-4">Mã & Tên bài tập</th>
                <th className="py-3 px-3">Lớp được giao</th>
                <th className="py-3 px-3">Phân hóa</th>
                <th className="py-3 px-3">Hạn nộp</th>
                <th className="py-3 px-3">Tiến độ nộp</th>
                <th className="py-3 px-3">Trạng thái</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAssignments.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{a.title}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                      <span className="font-mono text-blue-600 font-medium">{a.code}</span>
                      <span>·</span>
                      <span className="truncate max-w-xs">{a.topic}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-800">
                    Lớp {a.targetClassName}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${
                        a.differentiationTier === 'Nâng cao (chọn lọc)'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : a.differentiationTier === 'Cơ bản (hỗ trợ)'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {a.differentiationTier}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono font-medium text-amber-700">
                    {a.dueDate}
                  </td>
                  <td className="py-3 px-3">
                    <div className="text-slate-800 font-mono font-medium">
                      {a.submissionsCount} / 8 HS ({a.gradedCount} đã chấm)
                    </div>
                    <div className="w-24 bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full"
                        style={{ width: `${(a.submissionsCount / 8) * 100}%` }}
                      />
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${
                        a.status === 'Đang mở'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : a.status === 'Đã chấm'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {a.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setViewingAssignment(a)}
                        title="Xem chi tiết & Chấm bài"
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => exportAssignmentCsv(a)}
                        title="Xuất bảng điểm nộp bài ra CSV"
                        className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 rounded"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingAssignment(a)}
                        title="Chỉnh sửa bài tập"
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Xóa bài tập ${a.title}?`)) {
                            onDeleteAssignment(a.id);
                            onNotify('Đã xóa bài tập', 'info');
                          }
                        }}
                        title="Xóa bài tập"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIEW / GRADING MODAL */}
      {viewingAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-blue-600 font-bold uppercase">{viewingAssignment.code}</span>
                <h3 className="text-sm font-bold text-slate-900">{viewingAssignment.title}</h3>
                <p className="text-xs text-slate-500">
                  Lớp {viewingAssignment.targetClassName} · Hạn nộp: {viewingAssignment.dueDate} · Tổng điểm: {viewingAssignment.totalPoints}
                </p>
              </div>
              <button onClick={() => setViewingAssignment(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <p className="font-semibold text-slate-900">Mô tả & Hướng dẫn làm bài:</p>
                <p className="text-slate-700">{viewingAssignment.description}</p>
                <p className="text-slate-600 italic mt-1">{viewingAssignment.guidelines}</p>
              </div>

              {/* Teacher Answer Key (Protected) */}
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-900">
                <div className="font-bold flex items-center gap-1.5 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-amber-700" />
                  <span>Đáp án & Biểu điểm tham khảo (Dành riêng cho giáo viên):</span>
                </div>
                <pre className="text-xs font-sans whitespace-pre-wrap leading-relaxed text-amber-950">
                  {viewingAssignment.teacherAnswerKey}
                </pre>
              </div>

              {/* Submission tracker list */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-slate-900">Tiến độ nộp bài của học sinh ({viewingAssignment.targetClassName})</h4>
                  <span className="text-[11px] text-slate-500">
                    Đã nộp: {viewingAssignment.submissionsCount} · Đã chấm: {viewingAssignment.gradedCount}
                  </span>
                </div>
                <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 max-h-48 overflow-y-auto">
                  {['Trần Bảo Anh', 'Nguyễn Đăng Khôi', 'Lê Hoàng Nam', 'Phạm Thu Phương', 'Vũ Đức Thành', 'Đặng Mai Chi'].map((name, i) => (
                    <div key={i} className="p-2.5 flex items-center justify-between text-xs hover:bg-slate-50">
                      <div>
                        <span className="font-semibold text-slate-800">{name}</span>
                        <span className="text-[11px] text-slate-400 ml-2">Nộp lúc: 2026-10-24 19:30</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium text-[10px]">
                          {i < viewingAssignment.gradedCount ? `Điểm: ${(8 + (i % 3) * 0.5).toFixed(1)}` : 'Chờ chấm'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => exportAssignmentCsv(viewingAssignment)}
                className="px-3.5 py-1.5 text-xs font-semibold text-emerald-700 bg-white border border-emerald-300 rounded-lg hover:bg-emerald-50 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Xuất danh sách điểm nộp</span>
              </button>
              <button
                onClick={() => setViewingAssignment(null)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI ASSIGNMENT GENERATOR MODAL */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-5 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-amber-600">
                <Sparkles className="w-5 h-5" />
                <h3 className="text-sm font-bold text-slate-900">AI Sinh Bộ Bài Tập Phân Hóa</h3>
              </div>
              <button onClick={() => setIsAiModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Khối lớp</label>
                  <select
                    value={aiGrade}
                    onChange={(e) => setAiGrade(Number(e.target.value) as GradeLevel)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value={10}>Lớp 10</option>
                    <option value={11}>Lớp 11</option>
                    <option value={12}>Lớp 12</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Mức độ phân hóa</label>
                  <select
                    value={aiTier}
                    onChange={(e) => setAiTier(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="Đầy đủ 3 cấp độ (Cơ bản, Vận dụng, Nâng cao)">Đầy đủ 3 cấp độ</option>
                    <option value="Củng cố cơ bản (dành cho HS yếu/trung bình)">Củng cố cơ bản</option>
                    <option value="Nâng cao & Vận dụng thực tiễn (dành cho HS khá/giỏi)">Nâng cao & Thực tiễn</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Chủ đề kiến thức</label>
                <input
                  type="text"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  placeholder="Ví dụ: Định luật bảo toàn cơ năng..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tiêu đề bài tập</label>
                <input
                  type="text"
                  value={aiTitle}
                  onChange={(e) => setAiTitle(e.target.value)}
                  placeholder="Ví dụ: Bài tập Năng lượng và Va chạm..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsAiModalOpen(false)}
                disabled={isGenerating}
                className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleGenerateAiAssignment}
                disabled={isGenerating}
                className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>AI đang phân hóa độ khó & giải từng bước...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Tạo bài tập</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT / CREATE ASSIGNMENT MODAL */}
      {editingAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                {editingAssignment.id ? 'Chỉnh sửa bài tập' : 'Giao bài tập mới'}
              </h3>
              <button onClick={() => setEditingAssignment(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Mã bài tập</label>
                  <input
                    type="text"
                    value={editingAssignment.code}
                    onChange={(e) => setEditingAssignment({ ...editingAssignment, code: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs"
                  />
                </div>
                <div className="col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">Tên bài tập</label>
                  <input
                    type="text"
                    value={editingAssignment.title}
                    onChange={(e) => setEditingAssignment({ ...editingAssignment, title: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Lớp được giao</label>
                  <select
                    value={editingAssignment.targetClassId}
                    onChange={(e) => {
                      const selected = classes.find((c) => c.id === e.target.value);
                      setEditingAssignment({
                        ...editingAssignment,
                        targetClassId: e.target.value,
                        targetClassName: selected ? selected.code : '10A1',
                      });
                    }}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        Lớp {c.code}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Phân hóa</label>
                  <select
                    value={editingAssignment.differentiationTier}
                    onChange={(e) => setEditingAssignment({ ...editingAssignment, differentiationTier: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="Đại trà">Đại trà</option>
                    <option value="Cơ bản (hỗ trợ)">Cơ bản (hỗ trợ)</option>
                    <option value="Nâng cao (chọn lọc)">Nâng cao (chọn lọc)</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Hạn nộp</label>
                  <input
                    type="date"
                    value={editingAssignment.dueDate}
                    onChange={(e) => setEditingAssignment({ ...editingAssignment, dueDate: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Chủ đề kiến thức</label>
                <input
                  type="text"
                  value={editingAssignment.topic}
                  onChange={(e) => setEditingAssignment({ ...editingAssignment, topic: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Mô tả & Hướng dẫn học sinh</label>
                <textarea
                  rows={2}
                  value={editingAssignment.description}
                  onChange={(e) => setEditingAssignment({ ...editingAssignment, description: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Đáp án & Lời giải (Giáo viên)</label>
                <textarea
                  rows={3}
                  value={editingAssignment.teacherAnswerKey}
                  onChange={(e) => setEditingAssignment({ ...editingAssignment, teacherAnswerKey: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                />
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                onClick={() => setEditingAssignment(null)}
                className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => {
                  onSaveAssignment(editingAssignment);
                  setEditingAssignment(null);
                  onNotify('Đã lưu bài tập thành công', 'success');
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
              >
                Lưu bài tập
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
