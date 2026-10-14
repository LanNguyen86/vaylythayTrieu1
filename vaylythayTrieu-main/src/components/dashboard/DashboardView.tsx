import React from 'react';
import {
  Users,
  GraduationCap,
  FileQuestion,
  BookOpen,
  Presentation,
  CheckSquare,
  Award,
  Calendar,
  Clock,
  ArrowRight,
  TrendingUp,
  Sparkles,
  AlertCircle,
  PlusCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  SchoolClass,
  Student,
  Exam,
  LessonPlan,
  SlideDeck,
  Assignment,
  StudentGradeRecord,
  AuditLog,
} from '../../types';
import { ActiveTab } from '../common/Sidebar';

interface DashboardViewProps {
  classes: SchoolClass[];
  students: Student[];
  exams: Exam[];
  lessons: LessonPlan[];
  slides: SlideDeck[];
  assignments: Assignment[];
  grades: StudentGradeRecord[];
  logs: AuditLog[];
  onNavigate: (tab: ActiveTab, action?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  classes,
  students,
  exams,
  lessons,
  slides,
  assignments,
  grades,
  logs,
  onNavigate,
}) => {
  // Compute overall average
  const validScores = grades
    .map((g) => g.averageScore)
    .filter((s): s is number => typeof s === 'number' && !isNaN(s) && s > 0);
  const overallAvg =
    validScores.length > 0
      ? Math.round((validScores.reduce((a, b) => a + b, 0) / validScores.length) * 10) / 10
      : 0;

  // Grade distribution buckets: < 5, 5 - <6.5, 6.5 - <8, >=8
  const dist = {
    under5: 0,
    from5to65: 0,
    from65to8: 0,
    above8: 0,
  };

  validScores.forEach((score) => {
    if (score < 5.0) dist.under5++;
    else if (score < 6.5) dist.from5to65++;
    else if (score < 8.0) dist.from65to8++;
    else dist.above8++;
  });

  const gradeDistData = [
    { name: '< 5.0 (Chưa đạt)', count: dist.under5, fill: '#ef4444' },
    { name: '5.0 - < 6.5 (Đạt)', count: dist.from5to65, fill: '#f59e0b' },
    { name: '6.5 - < 8.0 (Khá)', count: dist.from65to8, fill: '#3b82f6' },
    { name: '≥ 8.0 (Giỏi/XS)', count: dist.above8, fill: '#10b981' },
  ];

  // Class average chart data
  const classAvgData = classes.map((cls) => {
    const classGrades = grades.filter((g) => g.classId === cls.id);
    const scores = classGrades
      .map((g) => g.averageScore)
      .filter((s): s is number => typeof s === 'number' && s > 0);
    const avg =
      scores.length > 0
        ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
        : 0;
    return {
      className: cls.code,
      average: avg,
      studentsCount: cls.studentsCount,
    };
  });

  // Resource distribution
  const resourceData = [
    { name: 'Đề thi', count: exams.length, color: '#3b82f6' },
    { name: 'Giáo án', count: lessons.length, color: '#10b981' },
    { name: 'Slide', count: slides.length, color: '#8b5cf6' },
    { name: 'Bài tập', count: assignments.length, color: '#f59e0b' },
  ];

  // Homework completion rate
  const totalSubmissions = assignments.reduce((acc, a) => acc + (a.submissionsCount || 0), 0);
  const totalExpected = assignments.reduce((acc, a) => {
    const target = classes.find((c) => c.id === a.targetClassId);
    return acc + (target ? target.studentsCount : 8);
  }, 0);
  const completionRate = totalExpected > 0 ? Math.round((totalSubmissions / totalExpected) * 100) : 85;

  const homeworkData = [
    { name: 'Đã nộp bài', value: totalSubmissions, color: '#10b981' },
    { name: 'Chưa nộp', value: Math.max(0, totalExpected - totalSubmissions), color: '#cbd5e1' },
  ];

  // Upcoming items
  const upcomingAssignments = assignments.slice(0, 3);
  const upcomingExams = exams.slice(0, 3);

  return (
    <div className="space-y-6 pb-12">
      {/* Hero Welcome Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-900 text-white shadow-md border border-slate-800">
        <img
          src="/src/assets/images/hero_physics_lab_1791939902344.jpg"
          alt="Phòng thí nghiệm Vật lý THPT"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-luminosity"
        />
        <div className="relative p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-slate-950/90 via-slate-900/80 to-transparent">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 text-xs font-medium text-blue-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Năm học 2025 – 2026 · Học kỳ 1</span>
            </div>
            <h1 className="mt-2 text-xl md:text-2xl font-bold tracking-tight text-white">
              Chào mừng Thầy Triệu Vật Lý
            </h1>
            <p className="mt-1.5 text-xs md:text-sm text-slate-300 leading-relaxed">
              Hệ thống trợ lý Vật lý THPT đang đồng bộ 3 khối lớp (10, 11, 12). Tất cả học liệu, ngân hàng câu hỏi và biểu điểm đã sẵn sàng theo chương trình GDPT 2018.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => onNavigate('exams', 'create-exam')}
              className="px-3.5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Tạo đề thi mới</span>
            </button>
            <button
              onClick={() => onNavigate('gradebook')}
              className="px-3.5 py-2 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors border border-white/20 backdrop-blur-xs flex items-center gap-1.5"
            >
              <Award className="w-4 h-4" />
              <span>Vào sổ điểm</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Lớp dạy</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900 tabular-nums">
            {classes.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Khối 10, 11, 12</div>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Học sinh</span>
            <GraduationCap className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900 tabular-nums">
            {students.length}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-0.5">100% chuyên cần</div>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Đề thi</span>
            <FileQuestion className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900 tabular-nums">
            {exams.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Đã chuẩn hóa ma trận</div>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Giáo án</span>
            <BookOpen className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900 tabular-nums">
            {lessons.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Chuẩn CV 5512</div>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Slide bài giảng</span>
            <Presentation className="w-4 h-4 text-purple-500" />
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900 tabular-nums">
            {slides.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">PPTX & PDF</div>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Bài tập</span>
            <CheckSquare className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900 tabular-nums">
            {assignments.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Phân hóa 3 cấp độ</div>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">ĐTB Chung</span>
            <Award className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 text-xl font-bold text-blue-600 tabular-nums">
            {overallAvg}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-0.5">Đạt yêu cầu GDPT</div>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Grade distribution */}
        <div className="p-5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Phân bố điểm học sinh toàn trường
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Thống kê theo 4 mức đánh giá kết quả học tập môn Vật lý
              </p>
            </div>
            <span className="text-xs font-mono font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
              Tổng {validScores.length} HS
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gradeDistData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  formatter={(val: any) => [`${val} học sinh`, 'Số lượng']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {gradeDistData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Average Score per Class */}
        <div className="p-5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Điểm trung bình theo từng lớp
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                So sánh mặt bằng chất lượng giữa các khối 10, 11 và 12
              </p>
            </div>
            <button
              onClick={() => onNavigate('gradebook')}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              <span>Xem sổ điểm</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classAvgData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="className" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(val: any) => [`${val} / 10`, 'Điểm trung bình']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="average" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Secondary Analytics Row: Resource breakdown & Homework Completion */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Homework completion rate */}
        <div className="p-5 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Tỷ lệ hoàn thành bài tập
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Đã thu {totalSubmissions} / {totalExpected} lượt làm bài
            </p>
          </div>
          <div className="h-44 my-2 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={homeworkData}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={68}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {homeworkData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center">
            <span className="text-2xl font-bold text-emerald-600 tabular-nums">
              {completionRate}%
            </span>
            <p className="text-[11px] text-slate-500">Tỷ lệ nộp bài đúng hạn trung bình</p>
          </div>
        </div>

        {/* Resources by type */}
        <div className="p-5 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Cơ cấu kho học liệu số
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Tổng cộng {exams.length + lessons.length + slides.length + assignments.length} học liệu điện tử
            </p>
          </div>
          <div className="space-y-3 my-4">
            {resourceData.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700">{item.name}</span>
                  <span className="font-mono text-slate-900 font-semibold">{item.count}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(item.count / 30) * 100}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => onNavigate('lessons')}
            className="w-full py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50/50 hover:bg-blue-50 rounded-lg transition-colors text-center"
          >
            Quản lý kho học liệu
          </button>
        </div>

        {/* Quick Assistant Callout */}
        <div className="p-5 bg-gradient-to-br from-blue-900 to-indigo-950 text-white rounded-xl shadow-2xs flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-blue-300 mb-3">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">
              Trợ lý AI Vật lý THPT
            </h3>
            <p className="mt-1 text-xs text-blue-200 leading-relaxed">
              Giải bài tập từng bước, kiểm tra đơn vị SI, gợi ý thí nghiệm thực hành trực quan và soạn đề thi tự động.
            </p>
          </div>
          <div className="pt-4 border-t border-white/10">
            <button
              onClick={() => onNavigate('ai-assistant')}
              className="w-full py-2 text-xs font-semibold bg-white text-slate-900 hover:bg-blue-50 rounded-lg transition-colors shadow-xs flex items-center justify-center gap-1.5"
            >
              <span>Trò chuyện cùng AI ngay</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Lists: Upcoming deadlines & Recent operations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming assignments & exams */}
        <div className="p-5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>Bài tập sắp đến hạn & Kế hoạch kiểm tra</span>
            </h3>
            <button
              onClick={() => onNavigate('assignments')}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              Tất cả
            </button>
          </div>
          <div className="divide-y divide-slate-100 mt-2">
            {upcomingAssignments.map((a) => (
              <div key={a.id} className="py-2.5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-900 truncate">
                    {a.title}
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                    <span>Lớp {a.targetClassName}</span>
                    <span>·</span>
                    <span className="text-amber-600 font-medium">Hạn nộp: {a.dueDate}</span>
                  </div>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 font-mono text-slate-700 shrink-0">
                  Đã nộp {a.submissionsCount}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Audit Activities */}
        <div className="p-5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span>Nhật ký hoạt động sư phạm gần đây</span>
            </h3>
            <button
              onClick={() => onNavigate('settings')}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              Lịch sử
            </button>
          </div>
          <div className="divide-y divide-slate-100 mt-2">
            {logs.slice(0, 4).map((log) => (
              <div key={log.id} className="py-2.5 flex items-start justify-between gap-3 text-xs">
                <div>
                  <p className="font-semibold text-slate-800">{log.action}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{log.details}</p>
                </div>
                <span className="text-[10px] text-slate-400 font-mono shrink-0 whitespace-nowrap">
                  {log.timestamp}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
