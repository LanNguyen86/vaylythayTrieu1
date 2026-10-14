import React, { useState } from 'react';
import {
  FileQuestion,
  Plus,
  Search,
  Filter,
  Download,
  Copy,
  Trash2,
  Edit,
  Eye,
  Shuffle,
  Sparkles,
  FileText,
  CheckCircle2,
  Clock,
  Layers,
  HelpCircle,
  X,
  FileCheck,
} from 'lucide-react';
import { Exam, Question, GradeLevel, ExamType, ExamStatus, CognitiveLevel, QuestionType } from '../../types';
import { exportExamDoc, exportAnswerKeyDoc } from '../../utils/exporter';
import { geminiApi } from '../../services/geminiApi';

interface ExamsViewProps {
  exams: Exam[];
  onSaveExam: (exam: Exam) => void;
  onDeleteExam: (id: string) => void;
  onNotify: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const ExamsView: React.FC<ExamsViewProps> = ({
  exams,
  onSaveExam,
  onDeleteExam,
  onNotify,
}) => {
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Modal states
  const [viewingExam, setViewingExam] = useState<Exam | null>(null);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [shuffledVariants, setShuffledVariants] = useState<{ code: string; questions: Question[] }[] | null>(null);

  // AI Generator form
  const [aiGrade, setAiGrade] = useState<GradeLevel>(10);
  const [aiTopic, setAiTopic] = useState('Chuyển động thẳng biến đổi đều');
  const [aiType, setAiType] = useState<ExamType>('Giữa kỳ');
  const [aiDuration, setAiDuration] = useState(45);
  const [aiMcCount, setAiMcCount] = useState(10);
  const [aiEssayCount, setAiEssayCount] = useState(2);
  const [aiPrompt, setAiPrompt] = useState('Đề thi phân bố đều 4 mức độ nhận thức, có hướng dẫn chấm chi tiết');
  const [isGenerating, setIsGenerating] = useState(false);

  // Filter logic
  const filteredExams = exams.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.topic.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = selectedGrade === 'all' || e.grade.toString() === selectedGrade;
    const matchesType = selectedType === 'all' || e.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || e.status === selectedStatus;
    return matchesSearch && matchesGrade && matchesType && matchesStatus;
  });

  // Duplicate exam
  const handleDuplicate = (exam: Exam) => {
    const duplicated: Exam = {
      ...exam,
      id: `exam-${Date.now()}`,
      code: `${exam.code}-BAN-SAO`,
      title: `${exam.title} (Bản sao)`,
      status: 'Bản nháp',
      createdAt: new Date().toISOString().split('T')[0],
    };
    onSaveExam(duplicated);
    onNotify('Đã nhân bản đề thi thành công', 'success');
  };

  // Shuffle questions to create 4 exam variants (Mã đề 101, 102, 103, 104)
  const handleShuffleExam = (exam: Exam) => {
    const codes = ['101', '102', '103', '104'];
    const variants = codes.map((code) => {
      // Fisher-Yates shuffle questions
      const shuffled = [...exam.questions].sort(() => Math.random() - 0.5);
      // For each question, shuffle options if multiple choice
      const randomized = shuffled.map((q, idx) => {
        if (q.type === 'multiple_choice' && q.options) {
          const shuffledOpts = [...q.options].sort(() => Math.random() - 0.5);
          return {
            ...q,
            id: `v-${code}-${idx + 1}`,
            options: shuffledOpts,
          };
        }
        return { ...q, id: `v-${code}-${idx + 1}` };
      });
      return { code, questions: randomized };
    });

    setShuffledVariants(variants);
    onNotify(`Đã trộn và tạo thành công 4 mã đề tương đương (101, 102, 103, 104)`, 'success');
  };

  // AI Exam Generator submit
  const handleGenerateAiExam = async () => {
    setIsGenerating(true);
    try {
      const draft = await geminiApi.generateExam({
        grade: aiGrade,
        topic: aiTopic,
        examType: aiType,
        multipleChoiceCount: aiMcCount,
        essayCount: aiEssayCount,
        duration: aiDuration,
        requirements: aiPrompt,
      });

      const newExam: Exam = {
        id: `exam-${Date.now()}`,
        code: `DT-${aiGrade}-AI-${Math.floor(100 + Math.random() * 900)}`,
        title: draft.title || `Đề kiểm tra Vật lý ${aiGrade} – ${aiTopic}`,
        grade: aiGrade,
        semester: 1,
        topic: aiTopic,
        type: aiType,
        durationMinutes: aiDuration,
        totalPoints: 10,
        createdAt: new Date().toISOString().split('T')[0],
        status: 'Bản nháp',
        questions: (draft.questions || []).map((q: any, idx: number) => ({
          id: `q-${idx + 1}`,
          type: q.type || 'multiple_choice',
          level: q.level || 'Thông hiểu',
          content: q.content,
          options: q.options || [],
          correctAnswer: q.correctAnswer || 'A',
          solution: q.solution || '',
          points: q.points || 0.5,
        })),
        note: draft.teacherNotes,
      };

      onSaveExam(newExam);
      setIsAiModalOpen(false);
      setEditingExam(newExam);
      onNotify('AI đã tạo bản nháp đề thi thành công. Thầy/cô hãy kiểm tra và chỉnh sửa trước khi hoàn tất.', 'success');
    } catch (e: any) {
      onNotify(e.message || 'Lỗi khi tạo đề thi', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Controls Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Grade filter */}
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">Tất cả khối lớp</option>
            <option value="10">Khối 10</option>
            <option value="11">Khối 11</option>
            <option value="12">Khối 12</option>
          </select>

          {/* Type filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">Tất cả loại đề</option>
            <option value="Thường xuyên">Thường xuyên (15p)</option>
            <option value="Giữa kỳ">Giữa học kỳ</option>
            <option value="Cuối kỳ">Cuối học kỳ</option>
            <option value="Ôn tập">Ôn tập chuyên đề</option>
            <option value="Thi thử">Thi thử THPT</option>
          </select>

          {/* Status filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="Bản nháp">Bản nháp</option>
            <option value="Đã hoàn thiện">Đã hoàn thiện</option>
            <option value="Đã sử dụng">Đã sử dụng</option>
          </select>

          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm theo mã, tên, chuyên đề..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-xs pl-8 pr-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg w-48 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 active:bg-blue-200 rounded-lg transition-colors border border-blue-200 shadow-2xs whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tạo đề thi bằng AI</span>
          </button>
          <button
            onClick={() => {
              const newExam: Exam = {
                id: `exam-${Date.now()}`,
                code: `DT-10-${Math.floor(100 + Math.random() * 900)}`,
                title: 'Đề kiểm tra Vật lý mới',
                grade: 10,
                semester: 1,
                topic: 'Động học chất điểm',
                type: 'Thường xuyên',
                durationMinutes: 45,
                totalPoints: 10,
                createdAt: new Date().toISOString().split('T')[0],
                status: 'Bản nháp',
                questions: [],
              };
              setEditingExam(newExam);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-2xs whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm đề thi</span>
          </button>
        </div>
      </div>

      {/* Exams Data Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Mã đề & Tên đề thi</th>
                <th className="py-3 px-3">Khối</th>
                <th className="py-3 px-3">Loại đề</th>
                <th className="py-3 px-3">Thời gian</th>
                <th className="py-3 px-3">Số câu</th>
                <th className="py-3 px-3">Trạng thái</th>
                <th className="py-3 px-3">Ngày tạo</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExams.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    Không tìm thấy đề thi nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredExams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{exam.title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                        <span className="font-mono text-blue-600 font-medium">{exam.code}</span>
                        <span>·</span>
                        <span className="truncate max-w-xs">{exam.topic}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-800">
                      Lớp {exam.grade}
                    </td>
                    <td className="py-3 px-3 text-slate-700">
                      {exam.type}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-700">
                      {exam.durationMinutes} phút
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-700">
                      {exam.questions.length} câu
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${
                          exam.status === 'Đã hoàn thiện'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : exam.status === 'Đã sử dụng'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {exam.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-500">
                      {exam.createdAt}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewingExam(exam)}
                          title="Xem chi tiết đề thi"
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleShuffleExam(exam)}
                          title="Trộn câu hỏi (Tạo mã đề 101, 102, 103, 104)"
                          className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-slate-100 rounded transition-colors"
                        >
                          <Shuffle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => exportExamDoc(exam, false)}
                          title="Xuất file Word đề thi"
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 rounded transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDuplicate(exam)}
                          title="Nhân bản đề thi"
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingExam(exam)}
                          title="Chỉnh sửa đề thi"
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Thầy/cô có chắc chắn muốn xóa đề thi ${exam.title}?`)) {
                              onDeleteExam(exam.id);
                              onNotify('Đã xóa đề thi', 'info');
                            }
                          }}
                          title="Xóa đề thi"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: VIEW EXAM DETAIL */}
      {viewingExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <span className="text-[10px] font-mono text-blue-600 font-bold uppercase">{viewingExam.code}</span>
                <h3 className="text-sm font-bold text-slate-900">{viewingExam.title}</h3>
                <p className="text-xs text-slate-500">
                  Lớp {viewingExam.grade} · {viewingExam.durationMinutes} phút · {viewingExam.type} · {viewingExam.questions.length} câu hỏi
                </p>
              </div>
              <button onClick={() => setViewingExam(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {viewingExam.questions.length === 0 ? (
                <p className="text-center py-8 text-slate-500">Đề thi chưa có câu hỏi nào. Nhấn Chỉnh sửa để thêm câu hỏi.</p>
              ) : (
                viewingExam.questions.map((q, idx) => (
                  <div key={q.id || idx} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-800">Câu {idx + 1} ({q.points} điểm)</span>
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-medium">{q.level}</span>
                    </div>
                    <p className="text-slate-900 font-medium leading-relaxed">{q.content}</p>
                    {q.options && q.options.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {q.options.map((opt, oIdx) => (
                          <div
                            key={oIdx}
                            className={`p-2 rounded border text-xs ${
                              q.correctAnswer && (opt.startsWith(q.correctAnswer) || opt.includes(` ${q.correctAnswer}.`))
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                                : 'bg-white border-slate-200 text-slate-700'
                            }`}
                          >
                            {opt}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="pt-2 border-t border-slate-200/80 text-slate-600">
                      <span className="font-semibold text-emerald-700">Đáp án: {q.correctAnswer}</span>
                      <p className="text-[11px] text-slate-500 mt-0.5">Lời giải: {q.solution}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => exportExamDoc(viewingExam, false)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Xuất đề thi Word</span>
                </button>
                <button
                  onClick={() => exportAnswerKeyDoc(viewingExam)}
                  className="px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-300 rounded-lg hover:bg-emerald-100 flex items-center gap-1.5"
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>Xuất đáp án riêng</span>
                </button>
              </div>
              <button
                onClick={() => setViewingExam(null)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: SHUFFLED VARIANTS */}
      {shuffledVariants && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full p-5 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Shuffle className="w-5 h-5 text-purple-600" />
                <h3 className="text-sm font-bold text-slate-900">Các mã đề thi sau khi trộn</h3>
              </div>
              <button onClick={() => setShuffledVariants(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-600">
              Hệ thống đã xáo trộn thứ tự các câu hỏi và các phương án A, B, C, D để đảm bảo tính công bằng khi tổ chức thi:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {shuffledVariants.map((v) => (
                <div key={v.code} className="p-3 rounded-lg border border-purple-200 bg-purple-50/50 text-center">
                  <div className="text-base font-bold text-purple-900 font-mono">Mã {v.code}</div>
                  <div className="text-[11px] text-purple-700 mt-1">{v.questions.length} câu hỏi</div>
                  <button
                    onClick={() => {
                      exportExamDoc(
                        {
                          ...exams[0],
                          code: `DE-THI-${v.code}`,
                          title: `Đề thi mã ${v.code}`,
                          questions: v.questions,
                        },
                        false
                      );
                      onNotify(`Đã tải xuống mã đề ${v.code}`, 'success');
                    }}
                    className="mt-2 w-full py-1 text-[11px] font-semibold bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                  >
                    Tải mã {v.code}
                  </button>
                </div>
              ))}
            </div>
            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShuffledVariants(null)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Hoàn tất
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: AI EXAM GENERATOR */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-5 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-blue-600">
                <Sparkles className="w-5 h-5" />
                <h3 className="text-sm font-bold text-slate-900">Trợ lý AI Soạn Đề thi Vật lý THPT</h3>
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
                    <option value={10}>Lớp 10 (Động học, Động lực học, Năng lượng)</option>
                    <option value={11}>Lớp 11 (Dao động, Sóng, Điện, Quang)</option>
                    <option value={12}>Lớp 12 (Nhiệt học, Khí, Hạt nhân)</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Loại đề thi</label>
                  <select
                    value={aiType}
                    onChange={(e) => setAiType(e.target.value as ExamType)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="Thường xuyên">Kiểm tra thường xuyên (15p)</option>
                    <option value="Giữa kỳ">Kiểm tra giữa kỳ (45p)</option>
                    <option value="Cuối kỳ">Kiểm tra cuối kỳ (50p)</option>
                    <option value="Ôn tập">Đề ôn tập chuyên đề</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Chuyên đề kiến thức trọng tâm</label>
                <input
                  type="text"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  placeholder="Ví dụ: Định luật bảo toàn cơ năng, Dao động điều hòa..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Số câu trắc nghiệm</label>
                  <input
                    type="number"
                    min={1}
                    max={40}
                    value={aiMcCount}
                    onChange={(e) => setAiMcCount(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Số câu tự luận</label>
                  <input
                    type="number"
                    min={0}
                    max={5}
                    value={aiEssayCount}
                    onChange={(e) => setAiEssayCount(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Thời gian (phút)</label>
                  <input
                    type="number"
                    value={aiDuration}
                    onChange={(e) => setAiDuration(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Yêu cầu bổ sung của giáo viên</label>
                <textarea
                  rows={2}
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Ví dụ: Chú trọng kiểm tra đơn vị SI, câu tự luận gắn với hiện tượng thực tế đời sống..."
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
                onClick={handleGenerateAiExam}
                disabled={isGenerating}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>AI đang tạo đề và kiểm tra đơn vị...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Tạo bản nháp đề thi</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: EDIT / CREATE EXAM */}
      {editingExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                {editingExam.id ? 'Chỉnh sửa đề thi' : 'Tạo đề thi mới'}
              </h3>
              <button onClick={() => setEditingExam(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Mã đề thi</label>
                  <input
                    type="text"
                    value={editingExam.code}
                    onChange={(e) => setEditingExam({ ...editingExam, code: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs"
                  />
                </div>
                <div className="col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">Tên đề thi</label>
                  <input
                    type="text"
                    value={editingExam.title}
                    onChange={(e) => setEditingExam({ ...editingExam, title: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Khối lớp</label>
                  <select
                    value={editingExam.grade}
                    onChange={(e) => setEditingExam({ ...editingExam, grade: Number(e.target.value) as GradeLevel })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value={10}>Lớp 10</option>
                    <option value={11}>Lớp 11</option>
                    <option value={12}>Lớp 12</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Loại đề</label>
                  <select
                    value={editingExam.type}
                    onChange={(e) => setEditingExam({ ...editingExam, type: e.target.value as ExamType })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="Thường xuyên">Thường xuyên</option>
                    <option value="Giữa kỳ">Giữa kỳ</option>
                    <option value="Cuối kỳ">Cuối kỳ</option>
                    <option value="Ôn tập">Ôn tập</option>
                    <option value="Thi thử">Thi thử</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Thời gian (phút)</label>
                  <input
                    type="number"
                    value={editingExam.durationMinutes}
                    onChange={(e) => setEditingExam({ ...editingExam, durationMinutes: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Trạng thái</label>
                  <select
                    value={editingExam.status}
                    onChange={(e) => setEditingExam({ ...editingExam, status: e.target.value as ExamStatus })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="Bản nháp">Bản nháp</option>
                    <option value="Đã hoàn thiện">Đã hoàn thiện</option>
                    <option value="Đã sử dụng">Đã sử dụng</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Chủ đề kiến thức</label>
                <input
                  type="text"
                  value={editingExam.topic}
                  onChange={(e) => setEditingExam({ ...editingExam, topic: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              {/* Questions list editor */}
              <div className="pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-800">Danh sách câu hỏi ({editingExam.questions.length})</span>
                  <button
                    onClick={() => {
                      const newQ: Question = {
                        id: `q-${Date.now()}`,
                        type: 'multiple_choice',
                        level: 'Nhận biết',
                        content: 'Nội dung câu hỏi mới...',
                        options: ['A. Lựa chọn 1', 'B. Lựa chọn 2', 'C. Lựa chọn 3', 'D. Lựa chọn 4'],
                        correctAnswer: 'A',
                        solution: 'Lời giải chi tiết...',
                        points: 0.5,
                      };
                      setEditingExam({ ...editingExam, questions: [...editingExam.questions, newQ] });
                    }}
                    className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm câu hỏi</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {editingExam.questions.map((q, idx) => (
                    <div key={q.id || idx} className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-700">Câu {idx + 1}</span>
                        <div className="flex items-center gap-2">
                          <select
                            value={q.level}
                            onChange={(e) => {
                              const updated = [...editingExam.questions];
                              updated[idx].level = e.target.value as CognitiveLevel;
                              setEditingExam({ ...editingExam, questions: updated });
                            }}
                            className="text-[11px] p-1 bg-white border border-slate-200 rounded"
                          >
                            <option value="Nhận biết">Nhận biết</option>
                            <option value="Thông hiểu">Thông hiểu</option>
                            <option value="Vận dụng">Vận dụng</option>
                            <option value="Vận dụng cao">Vận dụng cao</option>
                          </select>
                          <button
                            onClick={() => {
                              const updated = editingExam.questions.filter((_, qI) => qI !== idx);
                              setEditingExam({ ...editingExam, questions: updated });
                            }}
                            className="text-rose-500 hover:text-rose-700 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <textarea
                        rows={2}
                        value={q.content}
                        onChange={(e) => {
                          const updated = [...editingExam.questions];
                          updated[idx].content = e.target.value;
                          setEditingExam({ ...editingExam, questions: updated });
                        }}
                        className="w-full p-2 bg-white border border-slate-200 rounded text-xs"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] text-slate-500">Đáp án đúng</label>
                          <input
                            type="text"
                            value={q.correctAnswer}
                            onChange={(e) => {
                              const updated = [...editingExam.questions];
                              updated[idx].correctAnswer = e.target.value;
                              setEditingExam({ ...editingExam, questions: updated });
                            }}
                            className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs font-semibold"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-slate-500">Điểm số</label>
                          <input
                            type="number"
                            step="0.25"
                            value={q.points}
                            onChange={(e) => {
                              const updated = [...editingExam.questions];
                              updated[idx].points = Number(e.target.value);
                              setEditingExam({ ...editingExam, questions: updated });
                            }}
                            className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-500">Lời giải chi tiết</label>
                        <input
                          type="text"
                          value={q.solution}
                          onChange={(e) => {
                            const updated = [...editingExam.questions];
                            updated[idx].solution = e.target.value;
                            setEditingExam({ ...editingExam, questions: updated });
                          }}
                          className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                onClick={() => setEditingExam(null)}
                className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => {
                  onSaveExam(editingExam);
                  setEditingExam(null);
                  onNotify('Đã lưu đề thi thành công', 'success');
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
              >
                Lưu đề thi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
