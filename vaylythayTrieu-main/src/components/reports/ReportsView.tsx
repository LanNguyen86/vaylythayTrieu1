import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  Filter,
  AlertTriangle,
  Award,
  Users,
  CheckCircle2,
  TrendingUp,
  FileSpreadsheet,
  Printer,
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
  LineChart,
  Line,
} from 'recharts';
import { SchoolClass, StudentGradeRecord, Student, Assignment, Exam } from '../../types';
import { downloadFile } from '../../utils/exporter';

interface ReportsViewProps {
  classes: SchoolClass[];
  grades: StudentGradeRecord[];
  students: Student[];
  assignments: Assignment[];
  exams: Exam[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  classes,
  grades,
  students,
  assignments,
  exams,
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [selectedGradeLevel, setSelectedGradeLevel] = useState<string>('all');
  const [selectedSemester, setSelectedSemester] = useState<number>(1);

  // Filter records
  const filteredGrades = grades.filter((g) => {
    const matchesClass = selectedClassId === 'all' || g.classId === selectedClassId;
    const student = students.find((s) => s.id === g.studentId);
    const matchesGradeLevel =
      selectedGradeLevel === 'all' || (student && student.grade.toString() === selectedGradeLevel);
    const matchesSemester = g.semester === selectedSemester;
    return matchesClass && matchesGradeLevel && matchesSemester;
  });

  const validScores = filteredGrades
    .map((g) => g.averageScore)
    .filter((s): s is number => typeof s === 'number' && !isNaN(s) && s > 0);

  const avgScore =
    validScores.length > 0
      ? Math.round((validScores.reduce((a, b) => a + b, 0) / validScores.length) * 10) / 10
      : 0;

  // Buckets
  const countUnder5 = validScores.filter((s) => s < 5.0).length;
  const countFrom5To65 = validScores.filter((s) => s >= 5.0 && s < 6.5).length;
  const countFrom65To8 = validScores.filter((s) => s >= 6.5 && s < 8.0).length;
  const countAbove8 = validScores.filter((s) => s >= 8.0).length;

  const passRate =
    validScores.length > 0
      ? Math.round(((validScores.length - countUnder5) / validScores.length) * 100)
      : 100;

  const distData = [
    { name: '< 5.0 (Chưa đạt)', value: countUnder5, color: '#ef4444' },
    { name: '5.0 - < 6.5 (Đạt)', value: countFrom5To65, color: '#f59e0b' },
    { name: '6.5 - < 8.0 (Khá)', value: countFrom65To8, color: '#3b82f6' },
    { name: '≥ 8.0 (Giỏi/XS)', value: countAbove8, color: '#10b981' },
  ];

  // At-risk students (score < 6.5)
  const atRiskStudents = filteredGrades
    .filter((g) => (g.averageScore || 0) < 6.5)
    .sort((a, b) => (a.averageScore || 0) - (b.averageScore || 0));

  // Export report to CSV
  const handleExportReport = () => {
    const BOM = '\uFEFF';
    let csv = BOM;
    csv += `"BÁO CÁO THỐNG KÊ KẾT QUẢ HỌC TẬP MÔN VẬT LÝ THPT"\n`;
    csv += `"Năm học","2025 - 2026","Học kỳ",${selectedSemester}\n`;
    csv += `"Tổng số học sinh được đánh giá",${validScores.length},"Điểm trung bình chung",${avgScore}\n`;
    csv += `"Tỷ lệ đạt yêu cầu",${passRate}%\n\n`;
    csv += `"DANH SÁCH HỌC SINH CẦN HỖ TRỢ PHỤ ĐẠO"\n`;
    csv += `"Mã HS","Họ và tên","Lớp","ĐTB Môn","Mức đánh giá","Khuyến nghị"\n`;

    atRiskStudents.forEach((st) => {
      csv += `"${st.studentId}","${st.studentName}","${st.classId}",${st.averageScore},"${st.performanceLevel}","Cần phụ đạo thêm phần Động học và Động lực học"\n`;
    });

    downloadFile(csv, `Bao_cao_thong_ke_Vat_ly_HK${selectedSemester}.csv`, 'text/csv;charset=utf-8');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedGradeLevel}
            onChange={(e) => setSelectedGradeLevel(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-hidden"
          >
            <option value="all">Tất cả khối lớp</option>
            <option value="10">Khối 10</option>
            <option value="11">Khối 11</option>
            <option value="12">Khối 12</option>
          </select>

          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-hidden"
          >
            <option value="all">Tất cả lớp học</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(Number(e.target.value))}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-hidden"
          >
            <option value={1}>Học kỳ 1</option>
            <option value={2}>Học kỳ 2</option>
          </select>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>In báo cáo</span>
          </button>
          <button
            onClick={handleExportReport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất báo cáo Excel</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Học sinh được đánh giá</span>
          <div className="mt-1.5 text-xl font-bold text-slate-900 tabular-nums">
            {validScores.length} HS
          </div>
          <span className="text-[11px] text-slate-500">100% có điểm kiểm tra</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Điểm trung bình môn</span>
          <div className="mt-1.5 text-xl font-bold text-blue-600 tabular-nums">
            {avgScore} / 10
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">Mặt bằng khá - giỏi</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Tỷ lệ đạt yêu cầu (≥ 5.0)</span>
          <div className="mt-1.5 text-xl font-bold text-emerald-600 tabular-nums">
            {passRate}%
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">Chuẩn kiểm định chất lượng</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Học sinh cần phụ đạo</span>
          <div className="mt-1.5 text-xl font-bold text-amber-600 tabular-nums">
            {atRiskStudents.length} HS
          </div>
          <span className="text-[11px] text-amber-700 font-medium">Điểm dưới 6.5</span>
        </div>
      </div>

      {/* Charts Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie distribution */}
        <div className="p-5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
            Biểu đồ phân bố chất lượng học tập
          </h3>
          <p className="text-[11px] text-slate-500 mb-4">
            Tỷ lệ học sinh theo các khung điểm quy định của Bộ Giáo dục và Đào tạo
          </p>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }: any) => `${name.split(' ')[0]} (${(percent * 100).toFixed(0)}%)`}
                >
                  {distData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quality Bar */}
        <div className="p-5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
            Số lượng học sinh theo từng mức
          </h3>
          <p className="text-[11px] text-slate-500 mb-4">
            So sánh số lượng học sinh giữa các mức điểm
          </p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  formatter={(val: any) => [`${val} học sinh`, 'Số lượng']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {distData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* At-Risk Students Action List */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-700">
            <AlertTriangle className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Danh sách học sinh cần hỗ trợ & phụ đạo đặc biệt
            </h3>
          </div>
          <span className="text-xs font-mono font-medium text-slate-500">
            {atRiskStudents.length} học sinh
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px] uppercase">
              <tr>
                <th className="py-2.5 px-4">Mã HS</th>
                <th className="py-2.5 px-4">Họ và tên</th>
                <th className="py-2.5 px-3">Lớp</th>
                <th className="py-2.5 px-3 text-center">ĐTB Hiện tại</th>
                <th className="py-2.5 px-3">Đánh giá nguy cơ</th>
                <th className="py-2.5 px-4">Giải pháp sư phạm đề xuất</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {atRiskStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-500">
                    Tuyệt vời! Không có học sinh nào dưới mức 6.5 trong phạm vi lọc hiện tại.
                  </td>
                </tr>
              ) : (
                atRiskStudents.map((st) => (
                  <tr key={st.id} className="hover:bg-amber-50/30">
                    <td className="py-2.5 px-4 font-mono font-semibold text-blue-600">
                      {st.studentId}
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-slate-900">
                      {st.studentName}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-700">
                      {st.classId.replace('class-', '').toUpperCase()}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-amber-700">
                      {st.averageScore?.toFixed(1)}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-medium">
                        {(st.averageScore || 0) < 5.0 ? 'Nguy cơ lưu ban' : 'Cần củng cố kiến thức'}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-600 text-[11px]">
                      Giao thêm bài tập củng cố mức độ cơ bản; ghép đôi học tập với bạn khá trong lớp; ôn tập kỹ đổi đơn vị SI.
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
