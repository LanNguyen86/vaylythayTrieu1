import React, { useState } from 'react';
import {
  GraduationCap,
  CheckSquare,
  FileSpreadsheet,
  BookOpen,
  Award,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Upload,
  UserCheck,
  RotateCcw,
} from 'lucide-react';
import { Assignment, StudentGradeRecord, SlideDeck, Student, UserRole } from '../../types';

interface StudentPortalViewProps {
  students: Student[];
  assignments: Assignment[];
  grades: StudentGradeRecord[];
  slides: SlideDeck[];
  onRoleChange: (r: UserRole) => void;
  onNotify: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const StudentPortalView: React.FC<StudentPortalViewProps> = ({
  students,
  assignments,
  grades,
  slides,
  onRoleChange,
  onNotify,
}) => {
  // Demo student profile
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || 'hs-1001');
  const currentStudent = students.find((s) => s.id === selectedStudentId) || students[0];

  const currentGrade = grades.find((g) => g.studentId === currentStudent.id);
  const studentAssignments = assignments.filter((a) => a.grade === currentStudent.grade);
  const studentSlides = slides.filter((s) => s.grade === currentStudent.grade);

  const [submittedTasks, setSubmittedTasks] = useState<Record<string, string>>({});

  const handleStudentSubmit = (assignmentId: string) => {
    setSubmittedTasks((prev) => ({
      ...prev,
      [assignmentId]: new Date().toLocaleTimeString('vi-VN'),
    }));
    onNotify('Em đã nộp bài tập thành công cho Thầy giáo bộ môn!', 'success');
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Student Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-6 shadow-md border border-blue-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-500/20 border-2 border-blue-400 flex items-center justify-center text-xl font-bold">
            {currentStudent.fullName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded bg-blue-800 text-blue-200 font-mono">
                {currentStudent.code}
              </span>
              <span className="text-xs text-blue-300">Lớp {currentStudent.className}</span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1">
              {currentStudent.fullName}
            </h2>
            <p className="text-xs text-blue-200">
              Cổng học tập trực tuyến học sinh THPT · Môn Vật lý
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-xs text-blue-300">Đổi học sinh demo:</span>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="block mt-1 text-xs bg-blue-950 border border-blue-700 rounded-lg px-2 py-1 text-white"
            >
              {students.slice(0, 8).map((st) => (
                <option key={st.id} value={st.id}>
                  {st.fullName} ({st.className})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => onRoleChange('teacher')}
            className="px-3.5 py-2 text-xs font-semibold bg-white text-blue-950 hover:bg-blue-50 rounded-lg shadow-sm whitespace-nowrap"
          >
            Quay lại vai trò Giáo viên
          </button>
        </div>
      </div>

      {/* Grade Card */}
      {currentGrade && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-600" />
              <span>Kết quả học tập môn Vật lý (Học kỳ 1)</span>
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
              Xếp loại: {currentGrade.performanceLevel || 'Đạt'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-center">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-[11px] text-slate-500 block">ĐTX 1</span>
              <span className="text-sm font-bold font-mono text-slate-800">{currentGrade.tx1 ?? '--'}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-[11px] text-slate-500 block">ĐTX 2</span>
              <span className="text-sm font-bold font-mono text-slate-800">{currentGrade.tx2 ?? '--'}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200">
              <span className="text-[11px] text-amber-800 block font-medium">Giữa kỳ (×2)</span>
              <span className="text-sm font-bold font-mono text-amber-900">{currentGrade.gk ?? '--'}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200">
              <span className="text-[11px] text-rose-800 block font-medium">Cuối kỳ (×3)</span>
              <span className="text-sm font-bold font-mono text-rose-900">{currentGrade.ck ?? '--'}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-[11px] text-slate-500 block">Thực hành</span>
              <span className="text-sm font-bold font-mono text-slate-800">{currentGrade.practical ?? '--'}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200">
              <span className="text-[11px] text-blue-800 block font-bold">ĐTB Môn</span>
              <span className="text-base font-bold font-mono text-blue-700">{currentGrade.averageScore?.toFixed(1) || '--'}</span>
            </div>
          </div>

          {currentGrade.teacherNote && (
            <div className="p-3 bg-blue-50/50 rounded-lg text-xs text-blue-900 border border-blue-100">
              <strong>Lời nhắn của Thầy/Cô:</strong> {currentGrade.teacherNote}
            </div>
          )}
        </div>
      )}

      {/* Assignments Todo */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-amber-600" />
          <span>Bài tập về nhà được giao ({studentAssignments.length})</span>
        </h3>

        <div className="space-y-3">
          {studentAssignments.map((asg) => {
            const isSubmitted = Boolean(submittedTasks[asg.id]);
            return (
              <div
                key={asg.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
                      {asg.code}
                    </span>
                    <span className="text-xs text-slate-500">Chủ đề: {asg.topic}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 mt-1">{asg.title}</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">{asg.description}</p>
                  <p className="text-[11px] text-amber-700 font-medium mt-1">Hạn nộp: {asg.dueDate}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isSubmitted ? (
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Đã nộp bài</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleStudentSubmit(asg.id)}
                      className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Nộp bài làm</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Available Slide Resources */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-purple-600" />
          <span>Tài liệu bài giảng trực tuyến lớp {currentStudent.grade}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {studentSlides.slice(0, 4).map((sl) => (
            <div key={sl.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-mono text-purple-700 font-bold">{sl.fileFormat}</span>
                <h5 className="text-xs font-semibold text-slate-900 mt-0.5 line-clamp-1">{sl.title}</h5>
                <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{sl.topic}</p>
              </div>
              <button
                onClick={() => onNotify(`Đang mở tài liệu ${sl.title}`, 'info')}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap p-1"
              >
                Xem
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
