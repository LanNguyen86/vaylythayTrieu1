import React, { useState } from 'react';
import {
  Presentation,
  Plus,
  Search,
  Download,
  Trash2,
  Edit,
  Eye,
  Sparkles,
  LayoutGrid,
  List,
  Upload,
  FileText,
  Clock,
  Tag,
  CheckCircle,
  X,
} from 'lucide-react';
import { SlideDeck, GradeLevel } from '../../types';
import { downloadFile } from '../../utils/exporter';
import { geminiApi } from '../../services/geminiApi';

interface SlidesViewProps {
  slides: SlideDeck[];
  onSaveSlide: (slide: SlideDeck) => void;
  onDeleteSlide: (id: string) => void;
  onNotify: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const SlidesView: React.FC<SlidesViewProps> = ({
  slides,
  onSaveSlide,
  onDeleteSlide,
  onNotify,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedFormat, setSelectedFormat] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modals
  const [viewingSlide, setViewingSlide] = useState<SlideDeck | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // AI Form
  const [aiGrade, setAiGrade] = useState<GradeLevel>(10);
  const [aiTopic, setAiTopic] = useState('Chuyển động thẳng biến đổi đều');
  const [aiLessonTitle, setAiLessonTitle] = useState('Vận tốc, Gia tốc và Đồ thị v - t');
  const [aiSlideCount, setAiSlideCount] = useState(8);
  const [isGenerating, setIsGenerating] = useState(false);

  // Upload Form
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadGrade, setUploadGrade] = useState<GradeLevel>(10);
  const [uploadChapter, setUploadChapter] = useState('');
  const [uploadTopic, setUploadTopic] = useState('');
  const [uploadFormat, setUploadFormat] = useState<'PPTX' | 'PDF'>('PPTX');
  const [uploadDesc, setUploadDesc] = useState('');

  const filteredSlides = slides.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.chapter.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.topic.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = selectedGrade === 'all' || s.grade.toString() === selectedGrade;
    const matchesFormat = selectedFormat === 'all' || s.fileFormat === selectedFormat;
    return matchesSearch && matchesGrade && matchesFormat;
  });

  // Download slide deck package
  const handleDownloadSlide = (slide: SlideDeck) => {
    let content = `BÀI GIẢNG ĐIỆN TỬ: ${slide.title.toUpperCase()}\n`;
    content += `Khối: ${slide.grade} | Định dạng: ${slide.fileFormat} | Số trang: ${slide.slidesCount}\n`;
    content += `Chương: ${slide.chapter} | Chủ đề: ${slide.topic}\n`;
    content += `Mô tả: ${slide.description}\n`;
    content += `Từ khóa: ${slide.keywords.join(', ')}\n\n`;
    content += `==================================================\n`;
    content += `DÀN Ý TRÌNH CHIẾU & SPEAKER NOTES CHO GIÁO VIÊN\n`;
    content += `==================================================\n\n`;

    if (slide.slidesPreview && slide.slidesPreview.length > 0) {
      slide.slidesPreview.forEach((sp) => {
        content += `SLIDE ${sp.slideNumber}: ${sp.title}\n`;
        sp.bulletPoints.forEach((b) => {
          content += `  - ${b}\n`;
        });
        if (sp.notes) {
          content += `  [Lời giảng giáo viên]: ${sp.notes}\n`;
        }
        content += `\n`;
      });
    } else {
      content += `Trang 1: Giới thiệu và mục tiêu bài học\nTrang 2: Khám phá hiện tượng thực tế\nTrang 3: Xây dựng công thức và giải thích đơn vị SI\nTrang 4: Câu hỏi trắc nghiệm tương tác tại lớp\nTrang 5: Củng cố và giao bài tập về nhà\n`;
    }

    const filename = `${slide.title.replace(/\s+/g, '_')}.${slide.fileFormat.toLowerCase() === 'pdf' ? 'txt' : 'ppt'}`;
    downloadFile(content, filename, 'text/plain;charset=utf-8');
    onNotify(`Đã tải xuống bài giảng: ${slide.title}`, 'success');
  };

  const handleGenerateAiSlide = async () => {
    setIsGenerating(true);
    try {
      const outline = await geminiApi.generateSlideOutline({
        grade: aiGrade,
        topic: aiTopic,
        lessonTitle: aiLessonTitle,
        slideCount: aiSlideCount,
      });

      const newSlide: SlideDeck = {
        id: `slide-${Date.now()}`,
        title: outline.deckTitle || `Slide: ${aiLessonTitle}`,
        grade: aiGrade,
        chapter: `Chương: ${aiTopic}`,
        topic: aiTopic,
        description: `Bộ slide PowerPoint thiết kế bởi AI gồm ${aiSlideCount} trang, có câu hỏi tương tác và speaker notes.`,
        fileFormat: 'PPTX',
        fileSizeMb: Math.round((12 + Math.random() * 15) * 10) / 10,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        keywords: [aiTopic, 'Slide Vật lý', `Lớp ${aiGrade}`],
        slidesCount: outline.slides ? outline.slides.length : aiSlideCount,
        slidesPreview: (outline.slides || []).map((s: any, idx: number) => ({
          slideNumber: s.slideNumber || idx + 1,
          title: s.title || `Trang ${idx + 1}`,
          bulletPoints: s.bulletPoints || ['Nội dung slide'],
          notes: s.speakerNotes || s.interactiveQuestion || '',
        })),
      };

      onSaveSlide(newSlide);
      setIsAiModalOpen(false);
      setViewingSlide(newSlide);
      onNotify('AI đã tạo dàn ý slide bài giảng thành công!', 'success');
    } catch (e: any) {
      onNotify(e.message || 'Lỗi khi tạo dàn ý slide', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUploadSubmit = () => {
    if (!uploadTitle.trim()) {
      onNotify('Vui lòng nhập tên bài giảng', 'error');
      return;
    }

    const newSlide: SlideDeck = {
      id: `slide-${Date.now()}`,
      title: uploadTitle,
      grade: uploadGrade,
      chapter: uploadChapter || 'Chương học',
      topic: uploadTopic || 'Chủ đề',
      description: uploadDesc || 'Tài liệu bài giảng tải lên từ máy tính của giáo viên',
      fileFormat: uploadFormat,
      fileSizeMb: Math.round((5 + Math.random() * 20) * 10) / 10,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      keywords: [uploadTopic, uploadFormat, `Lớp ${uploadGrade}`],
      slidesCount: uploadFormat === 'PPTX' ? 20 : 15,
    };

    onSaveSlide(newSlide);
    setUploadModalOpen(false);
    setUploadTitle('');
    onNotify('Đã tải lên và lưu bài giảng vào hệ thống thành công', 'success');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Controls bar */}
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
            value={selectedFormat}
            onChange={(e) => setSelectedFormat(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">Tất cả định dạng</option>
            <option value="PPTX">PowerPoint (.PPTX)</option>
            <option value="PDF">Tài liệu PDF</option>
          </select>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm bài giảng, chủ đề..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-xs pl-8 pr-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg w-44 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center rounded-lg border border-slate-200 p-0.5 bg-slate-50 ml-auto sm:ml-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1 rounded ${viewMode === 'grid' ? 'bg-white shadow-2xs text-blue-600' : 'text-slate-400'}`}
              title="Xem dạng lưới"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1 rounded ${viewMode === 'list' ? 'bg-white shadow-2xs text-blue-600' : 'text-slate-400'}`}
              title="Xem dạng danh sách"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors border border-purple-200 shadow-2xs whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Tạo dàn ý slide</span>
          </button>
          <button
            onClick={() => setUploadModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-2xs whitespace-nowrap"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Tải lên slide (PPTX/PDF)</span>
          </button>
        </div>
      </div>

      {/* Grid or List Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSlides.map((slide) => (
            <div
              key={slide.id}
              className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      slide.fileFormat === 'PPTX'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {slide.fileFormat} · {slide.fileSizeMb} MB
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Lớp {slide.grade} · {slide.slidesCount} trang
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-900 mt-2.5 line-clamp-2 leading-relaxed">
                  {slide.title}
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {slide.description}
                </p>

                <div className="mt-3 flex flex-wrap gap-1">
                  {slide.keywords.slice(0, 3).map((kw, i) => (
                    <span key={i} className="text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                      #{kw}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono">
                  {slide.createdAt}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setViewingSlide(slide)}
                    title="Xem trước slide"
                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDownloadSlide(slide)}
                    title="Tải xuống tệp bài giảng"
                    className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 rounded"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Xóa slide ${slide.title}?`)) {
                        onDeleteSlide(slide.id);
                        onNotify('Đã xóa slide', 'info');
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
      ) : (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-600 text-[11px] uppercase">
              <tr>
                <th className="py-3 px-4">Tên bài giảng</th>
                <th className="py-3 px-3">Khối</th>
                <th className="py-3 px-3">Định dạng</th>
                <th className="py-3 px-3">Dung lượng</th>
                <th className="py-3 px-3">Số slide</th>
                <th className="py-3 px-3">Ngày tạo</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSlides.map((slide) => (
                <tr key={slide.id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{slide.title}</div>
                    <div className="text-[11px] text-slate-500">{slide.topic}</div>
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-800">Lớp {slide.grade}</td>
                  <td className="py-3 px-3 font-mono font-medium">{slide.fileFormat}</td>
                  <td className="py-3 px-3 font-mono text-slate-600">{slide.fileSizeMb} MB</td>
                  <td className="py-3 px-3 font-mono text-slate-600">{slide.slidesCount}</td>
                  <td className="py-3 px-3 font-mono text-slate-400">{slide.createdAt}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => setViewingSlide(slide)} className="p-1.5 text-slate-500 hover:text-blue-600">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDownloadSlide(slide)} className="p-1.5 text-slate-500 hover:text-emerald-600">
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Xóa slide ${slide.title}?`)) {
                            onDeleteSlide(slide.id);
                            onNotify('Đã xóa', 'info');
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600"
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
      )}

      {/* VIEW SLIDE DECK PREVIEW MODAL */}
      {viewingSlide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-purple-600 font-bold uppercase">{viewingSlide.fileFormat} · {viewingSlide.fileSizeMb} MB</span>
                <h3 className="text-sm font-bold text-slate-900">{viewingSlide.title}</h3>
                <p className="text-xs text-slate-500">Khối {viewingSlide.grade} · {viewingSlide.slidesCount} slide trình chiếu</p>
              </div>
              <button onClick={() => setViewingSlide(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                <p className="font-semibold text-purple-900">Mô tả bài giảng:</p>
                <p className="text-slate-700 mt-1">{viewingSlide.description}</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-2">DÀN Ý CÁC TRANG TRÌNH CHIẾU & SPEAKER NOTES</h4>
                {viewingSlide.slidesPreview && viewingSlide.slidesPreview.length > 0 ? (
                  <div className="space-y-3">
                    {viewingSlide.slidesPreview.map((sp) => (
                      <div key={sp.slideNumber} className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-purple-700">Slide {sp.slideNumber}: {sp.title}</span>
                        </div>
                        <ul className="list-disc list-inside text-slate-700 space-y-0.5">
                          {sp.bulletPoints.map((bp, i) => (
                            <li key={i}>{bp}</li>
                          ))}
                        </ul>
                        {sp.notes && (
                          <div className="p-2 bg-amber-50/70 border border-amber-200/60 rounded text-[11px] text-amber-900 mt-1">
                            <strong className="text-amber-800">Lời giảng gợi ý:</strong> {sp.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 py-4 text-center">Tệp bài giảng sẵn sàng tải xuống hoặc xem trực tiếp bằng phần mềm trình chiếu.</p>
                )}
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => handleDownloadSlide(viewingSlide)}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải xuống tệp bài giảng</span>
              </button>
              <button
                onClick={() => setViewingSlide(null)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI SLIDE GENERATOR MODAL */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-5 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-purple-600">
                <Sparkles className="w-5 h-5" />
                <h3 className="text-sm font-bold text-slate-900">AI Soạn Dàn Ý Slide Bài Giảng</h3>
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
                  <label className="font-semibold text-slate-700 block mb-1">Số lượng slide</label>
                  <input
                    type="number"
                    min={4}
                    max={25}
                    value={aiSlideCount}
                    onChange={(e) => setAiSlideCount(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tên bài học</label>
                <input
                  type="text"
                  value={aiLessonTitle}
                  onChange={(e) => setAiLessonTitle(e.target.value)}
                  placeholder="Ví dụ: Định luật bảo toàn cơ năng..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Chủ đề kiến thức</label>
                <input
                  type="text"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  placeholder="Ví dụ: Năng lượng và công cơ học..."
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
                onClick={handleGenerateAiSlide}
                disabled={isGenerating}
                className="px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>AI đang tạo dàn ý và câu hỏi tương tác...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Tạo dàn ý slide</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD MODAL */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-5 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-blue-600">
                <Upload className="w-5 h-5" />
                <h3 className="text-sm font-bold text-slate-900">Tải lên bài giảng PowerPoint / PDF</h3>
              </div>
              <button onClick={() => setUploadModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tên bài giảng</label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="Ví dụ: Slide Bài 4: Các định luật Newton..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Khối lớp</label>
                  <select
                    value={uploadGrade}
                    onChange={(e) => setUploadGrade(Number(e.target.value) as GradeLevel)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value={10}>Lớp 10</option>
                    <option value={11}>Lớp 11</option>
                    <option value={12}>Lớp 12</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Định dạng tệp</label>
                  <select
                    value={uploadFormat}
                    onChange={(e) => setUploadFormat(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="PPTX">PowerPoint (.pptx)</option>
                    <option value="PDF">Tài liệu (.pdf)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Chương & Chủ đề</label>
                <input
                  type="text"
                  value={uploadTopic}
                  onChange={(e) => setUploadTopic(e.target.value)}
                  placeholder="Ví dụ: Động lực học chất điểm"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Mô tả ngắn</label>
                <textarea
                  rows={2}
                  value={uploadDesc}
                  onChange={(e) => setUploadDesc(e.target.value)}
                  placeholder="Ghi chú về nội dung slide hoặc phương pháp thuyết trình..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setUploadModalOpen(false)}
                className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                onClick={handleUploadSubmit}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
              >
                Lưu vào thư viện
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
