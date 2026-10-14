import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Download,
  Copy,
  Trash2,
  Edit,
  Eye,
  Sparkles,
  Layers,
  Clock,
  Compass,
  X,
  CheckCircle,
} from 'lucide-react';
import { LessonPlan, GradeLevel } from '../../types';
import { exportLessonDoc } from '../../utils/exporter';
import { geminiApi } from '../../services/geminiApi';

interface LessonsViewProps {
  lessons: LessonPlan[];
  onSaveLesson: (lesson: LessonPlan) => void;
  onDeleteLesson: (id: string) => void;
  onNotify: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const LessonsView: React.FC<LessonsViewProps> = ({
  lessons,
  onSaveLesson,
  onDeleteLesson,
  onNotify,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedBook, setSelectedBook] = useState<string>('all');

  // Modals
  const [viewingLesson, setViewingLesson] = useState<LessonPlan | null>(null);
  const [editingLesson, setEditingLesson] = useState<LessonPlan | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // AI Form
  const [aiGrade, setAiGrade] = useState<GradeLevel>(10);
  const [aiLessonName, setAiLessonName] = useState('Định luật II Newton và Khái niệm khối lượng');
  const [aiBookSeries, setAiBookSeries] = useState('Kết nối tri thức');
  const [aiDuration, setAiDuration] = useState(2);
  const [aiObjectives, setAiObjectives] = useState('Nắm vững công thức F = ma, mối liên hệ giữa hợp lực, khối lượng và gia tốc');
  const [aiSpecialNeeds, setAiSpecialNeeds] = useState('Có thí nghiệm minh họa với xe lăn và cảm biến lực, câu hỏi liên hệ an toàn giao thông');
  const [isGenerating, setIsGenerating] = useState(false);

  const filteredLessons = lessons.filter((l) => {
    const matchesSearch =
      l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.topic.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = selectedGrade === 'all' || l.grade.toString() === selectedGrade;
    const matchesBook = selectedBook === 'all' || l.bookSeries === selectedBook;
    return matchesSearch && matchesGrade && matchesBook;
  });

  const handleDuplicate = (l: LessonPlan) => {
    const copy: LessonPlan = {
      ...l,
      id: `lesson-${Date.now()}`,
      code: `${l.code}-COPY`,
      title: `${l.title} (Bản sao)`,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    onSaveLesson(copy);
    onNotify('Đã sao chép giáo án thành công', 'success');
  };

  const handleGenerateAiLesson = async () => {
    setIsGenerating(true);
    try {
      const draft = await geminiApi.generateLesson({
        grade: aiGrade,
        lessonName: aiLessonName,
        bookSeries: aiBookSeries,
        durationPeriods: aiDuration,
        objectives: aiObjectives,
        specialNeeds: aiSpecialNeeds,
      });

      const newLesson: LessonPlan = {
        id: `lesson-${Date.now()}`,
        code: `GA-${aiGrade}-${Math.floor(10 + Math.random() * 90)}`,
        title: draft.title || aiLessonName,
        grade: aiGrade,
        chapter: `Chương theo phân phối SGK Lớp ${aiGrade}`,
        topic: aiLessonName,
        bookSeries: aiBookSeries as any,
        durationPeriods: aiDuration,
        objectives: {
          knowledge: draft.objectives?.knowledge || ['Mục tiêu kiến thức'],
          competencies: draft.objectives?.competencies || ['Năng lực vật lý'],
          qualities: draft.objectives?.qualities || ['Phẩm chất chăm chỉ, trung thực'],
        },
        keyKnowledge: [aiLessonName],
        equipment: draft.equipment || ['Dụng cụ thí nghiệm', 'Máy chiếu'],
        activities: (draft.activities || []).map((a: any) => ({
          name: a.name || 'Hoạt động',
          target: a.target || '',
          content: a.content || '',
          product: a.product || '',
          implementation: a.implementation || '',
        })),
        assessment: draft.assessment || 'Đánh giá qua phiếu học tập',
        references: [draft.references || `SGK Vật lý ${aiGrade}`],
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      };

      onSaveLesson(newLesson);
      setIsAiModalOpen(false);
      setEditingLesson(newLesson);
      onNotify('AI đã soạn giáo án theo Công văn 5512 thành công. Thầy/cô có thể duyệt và chỉnh sửa.', 'success');
    } catch (e: any) {
      onNotify(e.message || 'Lỗi khi soạn giáo án bằng AI', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Filters Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2">
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

          <select
            value={selectedBook}
            onChange={(e) => setSelectedBook(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">Tất cả bộ SGK</option>
            <option value="Kết nối tri thức">Kết nối tri thức</option>
            <option value="Cánh Diều">Cánh Diều</option>
            <option value="Chân trời sáng tạo">Chân trời sáng tạo</option>
          </select>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm tên bài, chương, mã..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-xs pl-8 pr-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg w-48 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200 shadow-2xs whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Soạn giáo án bằng AI</span>
          </button>
          <button
            onClick={() => {
              const newLesson: LessonPlan = {
                id: `lesson-${Date.now()}`,
                code: `GA-10-${Math.floor(10 + Math.random() * 90)}`,
                title: 'Kế hoạch bài dạy mới',
                grade: 10,
                chapter: 'Chương 1: Động học',
                topic: 'Chuyển động thẳng',
                bookSeries: 'Kết nối tri thức',
                durationPeriods: 2,
                objectives: {
                  knowledge: ['Nêu được khái niệm...'],
                  competencies: ['Vận dụng giải bài tập...'],
                  qualities: ['Cẩn thận, chính xác...'],
                },
                keyKnowledge: ['Kiến thức trọng tâm'],
                equipment: ['Thước đo, xe lăn'],
                activities: [
                  {
                    name: 'Hoạt động 1: Khởi động',
                    target: 'Tạo hứng thú học tập',
                    content: 'Nêu tình huống đời sống',
                    product: 'Ý kiến thảo luận',
                    implementation: 'Chiếu video và nêu câu hỏi',
                  },
                ],
                assessment: 'Đánh giá thường xuyên',
                references: ['SGK Vật lý 10'],
                createdAt: new Date().toISOString().split('T')[0],
                updatedAt: new Date().toISOString().split('T')[0],
              };
              setEditingLesson(newLesson);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-2xs whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm giáo án</span>
          </button>
        </div>
      </div>

      {/* Lesson Plans Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLessons.map((l) => (
          <div
            key={l.id}
            className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <span className="text-[11px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  {l.code}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  {l.durationPeriods} tiết · Lớp {l.grade}
                </span>
              </div>

              <h4 className="text-xs font-bold text-slate-900 mt-2 line-clamp-2 leading-relaxed">
                {l.title}
              </h4>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                {l.chapter}
              </p>

              <div className="mt-3 py-2 border-t border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                <span className="truncate max-w-[150px] font-medium">{l.bookSeries}</span>
                <span className="font-mono text-slate-500">{l.activities.length} hoạt động</span>
              </div>
            </div>

            <div className="mt-3 pt-1 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-mono">
                Cập nhật: {l.updatedAt}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setViewingLesson(l)}
                  title="Xem giáo án"
                  className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => exportLessonDoc(l)}
                  title="Xuất file Word giáo án"
                  className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 rounded"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDuplicate(l)}
                  title="Sao chép"
                  className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setEditingLesson(l)}
                  title="Chỉnh sửa"
                  className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`Xóa giáo án ${l.title}?`)) {
                      onDeleteLesson(l.id);
                      onNotify('Đã xóa giáo án', 'info');
                    }
                  }}
                  title="Xóa"
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* VIEW LESSON MODAL */}
      {viewingLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-blue-600 font-bold uppercase">{viewingLesson.code}</span>
                <h3 className="text-sm font-bold text-slate-900">{viewingLesson.title}</h3>
                <p className="text-xs text-slate-500">
                  Lớp {viewingLesson.grade} · {viewingLesson.durationPeriods} tiết · Bộ sách: {viewingLesson.bookSeries}
                </p>
              </div>
              <button onClick={() => setViewingLesson(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                <h4 className="font-bold text-blue-900 mb-1.5">I. MỤC TIÊU BÀI HỌC (THEO CHUẨN 5512)</h4>
                <div className="space-y-1 text-slate-700">
                  <p><strong className="text-slate-900">1. Kiến thức:</strong> {viewingLesson.objectives.knowledge.join('; ')}</p>
                  <p><strong className="text-slate-900">2. Năng lực:</strong> {viewingLesson.objectives.competencies.join('; ')}</p>
                  <p><strong className="text-slate-900">3. Phẩm chất:</strong> {viewingLesson.objectives.qualities.join('; ')}</p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-1.5">II. THIẾT BỊ DẠY HỌC & DỤNG CỤ THÍ NGHIỆM</h4>
                <ul className="list-disc list-inside text-slate-700 space-y-0.5">
                  {viewingLesson.equipment.map((e, idx) => (
                    <li key={idx}>{e}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-2">III. TIẾN TRÌNH TỔ CHỨC CÁC HOẠT ĐỘNG DẠY HỌC</h4>
                <div className="space-y-3">
                  {viewingLesson.activities.map((act, idx) => (
                    <div key={idx} className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                      <div className="font-bold text-blue-700">{act.name}</div>
                      <p><strong className="text-slate-800">a) Mục tiêu:</strong> {act.target}</p>
                      <p><strong className="text-slate-800">b) Nội dung:</strong> {act.content}</p>
                      <p><strong className="text-slate-800">c) Sản phẩm:</strong> {act.product}</p>
                      <p><strong className="text-slate-800">d) Tổ chức thực hiện:</strong> {act.implementation}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 text-slate-600">
                <p><strong className="text-slate-800">IV. Đánh giá:</strong> {viewingLesson.assessment}</p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => exportLessonDoc(viewingLesson)}
                className="px-3.5 py-1.5 text-xs font-semibold text-emerald-700 bg-white border border-emerald-300 rounded-lg hover:bg-emerald-50 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Xuất giáo án ra Word (.doc)</span>
              </button>
              <button
                onClick={() => setViewingLesson(null)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI LESSON GENERATOR MODAL */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-5 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-emerald-600">
                <Sparkles className="w-5 h-5" />
                <h3 className="text-sm font-bold text-slate-900">AI Soạn Giáo Án Vật Lý THPT (CV 5512)</h3>
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
                  <label className="font-semibold text-slate-700 block mb-1">Bộ sách giáo khoa</label>
                  <select
                    value={aiBookSeries}
                    onChange={(e) => setAiBookSeries(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="Kết nối tri thức">Kết nối tri thức với cuộc sống</option>
                    <option value="Cánh Diều">Cánh Diều</option>
                    <option value="Chân trời sáng tạo">Chân trời sáng tạo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tên bài học</label>
                <input
                  type="text"
                  value={aiLessonName}
                  onChange={(e) => setAiLessonName(e.target.value)}
                  placeholder="Ví dụ: Định luật bảo toàn cơ năng..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Mục tiêu cần đạt</label>
                <textarea
                  rows={2}
                  value={aiObjectives}
                  onChange={(e) => setAiObjectives(e.target.value)}
                  placeholder="Kiến thức, năng lực và phẩm chất cần hình thành..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Yêu cầu phương pháp & Thí nghiệm</label>
                <input
                  type="text"
                  value={aiSpecialNeeds}
                  onChange={(e) => setAiSpecialNeeds(e.target.value)}
                  placeholder="Gợi ý thí nghiệm mô phỏng, tình huống khởi động thực tế..."
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
                onClick={handleGenerateAiLesson}
                disabled={isGenerating}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>AI đang xây dựng tiến trình dạy học...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Tạo giáo án</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT / CREATE LESSON MODAL */}
      {editingLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                {editingLesson.id ? 'Chỉnh sửa kế hoạch bài dạy' : 'Tạo giáo án mới'}
              </h3>
              <button onClick={() => setEditingLesson(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Mã giáo án</label>
                  <input
                    type="text"
                    value={editingLesson.code}
                    onChange={(e) => setEditingLesson({ ...editingLesson, code: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs"
                  />
                </div>
                <div className="col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">Tên bài học</label>
                  <input
                    type="text"
                    value={editingLesson.title}
                    onChange={(e) => setEditingLesson({ ...editingLesson, title: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Khối lớp</label>
                  <select
                    value={editingLesson.grade}
                    onChange={(e) => setEditingLesson({ ...editingLesson, grade: Number(e.target.value) as GradeLevel })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value={10}>Lớp 10</option>
                    <option value={11}>Lớp 11</option>
                    <option value={12}>Lớp 12</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Bộ SGK</label>
                  <select
                    value={editingLesson.bookSeries}
                    onChange={(e) => setEditingLesson({ ...editingLesson, bookSeries: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="Kết nối tri thức">Kết nối tri thức</option>
                    <option value="Cánh Diều">Cánh Diều</option>
                    <option value="Chân trời sáng tạo">Chân trời sáng tạo</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Thời lượng (tiết)</label>
                  <input
                    type="number"
                    value={editingLesson.durationPeriods}
                    onChange={(e) => setEditingLesson({ ...editingLesson, durationPeriods: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Chương & Chủ đề</label>
                <input
                  type="text"
                  value={editingLesson.chapter}
                  onChange={(e) => setEditingLesson({ ...editingLesson, chapter: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Thiết bị dạy học & Thí nghiệm (phân cách bằng dấu chấm phẩy)</label>
                <input
                  type="text"
                  value={editingLesson.equipment.join('; ')}
                  onChange={(e) => setEditingLesson({ ...editingLesson, equipment: e.target.value.split(';').map((s) => s.trim()) })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Phương pháp đánh giá</label>
                <input
                  type="text"
                  value={editingLesson.assessment}
                  onChange={(e) => setEditingLesson({ ...editingLesson, assessment: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                onClick={() => setEditingLesson(null)}
                className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => {
                  onSaveLesson({
                    ...editingLesson,
                    updatedAt: new Date().toISOString().split('T')[0],
                  });
                  setEditingLesson(null);
                  onNotify('Đã lưu giáo án thành công', 'success');
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
              >
                Lưu giáo án
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
