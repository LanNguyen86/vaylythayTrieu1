import React, { useState } from 'react';
import {
  GraduationCap,
  Users,
  Plus,
  Search,
  Edit3,
  Trash2,
  Eye,
  Mail,
  Phone,
  BookOpen,
  X,
  UserPlus
} from 'lucide-react';
import { Classroom, Student, GradeLevel } from '../types';

interface ClassroomsViewProps {
  classes: Classroom[];
  students: Student[];
  onSaveClass: (c: Classroom) => void;
  onDeleteClass: (id: string) => void;
  onSaveStudent: (s: Student) => void;
  onDeleteStudent: (id: string) => void;
  onLog: (action: string, module: string, detail: string) => void;
}

export const ClassroomsView: React.FC<ClassroomsViewProps> = ({
  classes,
  students,
  onSaveClass,
  onDeleteClass,
  onSaveStudent,
  onDeleteStudent,
  onLog
}) => {
  const [selectedClass, setSelectedClass] = useState<Classroom>(classes[0] || {} as Classroom);
  const [isEditingClass, setIsEditingClass] = useState(false);
  const [editClassForm, setEditClassForm] = useState<Partial<Classroom>>({});

  // Student modal
  const [isEditingStudent, setIsEditingStudent] = useState(false);
  const [studentForm, setStudentForm] = useState<Partial<Student>>({});

  const classStudents = students.filter((s) => s.classId === selectedClass?.id);

  const handleOpenAddClass = () => {
    setEditClassForm({
      id: 'cls-' + Date.now(),
      code: '10A' + (classes.length + 1),
      name: `Lớp 10A${classes.length + 1} - Tự nhiên`,
      grade: 10,
      schoolYear: '2026-2027',
      studentCount: 0,
      homeroomTeacher: 'Nguyễn Văn Hùng',
      physicsTeacher: 'Nguyễn Văn Hùng',
      roomNumber: 'P.301'
    });
    setIsEditingClass(true);
  };

  const handleSaveClass = () => {
    if (!editClassForm.name || !editClassForm.code) {
      alert('Vui lòng nhập tên lớp và mã lớp!');
      return;
    }
    const toSave = editClassForm as Classroom;
    onSaveClass(toSave);
    setSelectedClass(toSave);
    setIsEditingClass(false);
    onLog('Lưu lớp học', 'Lớp học', `Lưu thông tin lớp: ${toSave.name}`);
  };

  const handleOpenAddStudent = () => {
    setStudentForm({
      id: 'std-' + Date.now(),
      studentCode: `HS${Math.floor(1000 + Math.random() * 9000)}`,
      fullName: '',
      classId: selectedClass.id,
      className: selectedClass.code,
      grade: selectedClass.grade,
      gender: 'Nam',
      dob: '2011-01-01',
      status: 'Đang học'
    });
    setIsEditingStudent(true);
  };

  const handleSaveStudent = () => {
    if (!studentForm.fullName || !studentForm.studentCode) {
      alert('Vui lòng nhập họ tên và mã học sinh!');
      return;
    }
    const toSave: Student = {
      ...(studentForm as Student),
      classId: selectedClass.id,
      className: selectedClass.code,
      grade: selectedClass.grade
    };
    onSaveStudent(toSave);
    setIsEditingStudent(false);
    onLog('Lưu học sinh', 'Học sinh', `Lưu học sinh: ${toSave.fullName} (${toSave.studentCode})`);
  };

  return (
    <div className="space-y-6">
      {/* Class Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {classes.map((cls) => {
          const isSelected = cls.id === selectedClass?.id;
          const count = students.filter((s) => s.classId === cls.id).length;

          return (
            <div
              key={cls.id}
              onClick={() => setSelectedClass(cls)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer relative ${
                isSelected
                  ? 'bg-gradient-to-tr from-blue-900 to-indigo-900 text-white border-blue-700 shadow-md scale-[1.01]'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-blue-300 hover:shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    isSelected
                      ? 'bg-white/20 text-sky-200'
                      : 'bg-blue-50 text-blue-700'
                  }`}
                >
                  {cls.code} • Khối {cls.grade}
                </span>
                <span
                  className={`text-xs ${
                    isSelected ? 'text-slate-300' : 'text-slate-400'
                  }`}
                >
                  {cls.schoolYear}
                </span>
              </div>

              <h3 className="font-bold text-base leading-snug">{cls.name}</h3>

              <div className="mt-4 pt-3 border-t border-slate-100/20 flex items-center justify-between text-xs">
                <span className={isSelected ? 'text-slate-300' : 'text-slate-500'}>
                  Sĩ số: <strong>{count} học sinh</strong>
                </span>
                <span className={isSelected ? 'text-sky-300' : 'text-blue-700 font-semibold'}>
                  {cls.roomNumber}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Class Detail & Student Roster */}
      {selectedClass && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-5 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-800">{selectedClass.name}</h3>
                <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-bold font-mono">
                  {selectedClass.code}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Giáo viên chủ nhiệm: <strong>{selectedClass.homeroomTeacher}</strong> • Giáo viên Vật lý: <strong>{selectedClass.physicsTeacher}</strong> • Phòng học: <strong>{selectedClass.roomNumber}</strong>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setEditClassForm(JSON.parse(JSON.stringify(selectedClass)));
                  setIsEditingClass(true);
                }}
                className="px-3 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs md:text-sm font-medium flex items-center gap-1.5"
              >
                <Edit3 className="w-4 h-4" />
                Sửa lớp
              </button>
              <button
                onClick={handleOpenAddStudent}
                className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs md:text-sm font-semibold flex items-center gap-1.5 shadow-xs"
              >
                <UserPlus className="w-4 h-4" />
                Thêm học sinh vào lớp
              </button>
            </div>
          </div>

          {/* Student Roster Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-3 px-4 w-12 text-center">STT</th>
                  <th className="py-3 px-3 w-28">Mã HS</th>
                  <th className="py-3 px-4">Họ và tên</th>
                  <th className="py-3 px-3 text-center">Giới tính</th>
                  <th className="py-3 px-3">Ngày sinh</th>
                  <th className="py-3 px-3">Điện thoại phụ huynh</th>
                  <th className="py-3 px-3">Trạng thái</th>
                  <th className="py-3 px-3">Ghi chú sư phạm</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {classStudents.map((std, idx) => (
                  <tr key={std.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 text-center text-slate-400 font-medium">{idx + 1}</td>
                    <td className="py-3 px-3 font-mono font-bold text-blue-700">{std.studentCode}</td>
                    <td className="py-3 px-4 font-bold text-slate-800">{std.fullName}</td>
                    <td className="py-3 px-3 text-center text-slate-600">{std.gender}</td>
                    <td className="py-3 px-3 text-slate-500">{std.dob}</td>
                    <td className="py-3 px-3 text-slate-600">{std.parentPhone || '-'}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          std.status === 'Đang học'
                            ? 'bg-emerald-50 text-emerald-700'
                            : std.status === 'Cần hỗ trợ'
                            ? 'bg-amber-50 text-amber-700 font-bold'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {std.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-500 max-w-xs truncate">{std.notes || '-'}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setStudentForm(JSON.parse(JSON.stringify(std)));
                            setIsEditingStudent(true);
                          }}
                          className="p-1.5 text-slate-600 hover:text-amber-700 hover:bg-slate-100 rounded-lg"
                          title="Sửa học sinh"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Bạn có chắc muốn xóa học sinh "${std.fullName}"?`)) {
                              onDeleteStudent(std.id);
                              onLog('Xóa học sinh', 'Học sinh', `Xóa: ${std.fullName}`);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                          title="Xóa học sinh"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* EDIT STUDENT MODAL */}
      {isEditingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 space-y-4 text-xs md:text-sm">
            <h3 className="text-base font-bold text-slate-800 pb-2 border-b border-slate-100">
              {studentForm.id ? 'Cập nhật thông tin học sinh' : 'Thêm học sinh mới'}
            </h3>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mã học sinh *</label>
                  <input
                    type="text"
                    value={studentForm.studentCode || ''}
                    onChange={(e) => setStudentForm({ ...studentForm, studentCode: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Giới tính</label>
                  <select
                    value={studentForm.gender || 'Nam'}
                    onChange={(e) => setStudentForm({ ...studentForm, gender: e.target.value as any })}
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Họ và tên *</label>
                <input
                  type="text"
                  value={studentForm.fullName || ''}
                  onChange={(e) => setStudentForm({ ...studentForm, fullName: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ngày sinh</label>
                  <input
                    type="date"
                    value={studentForm.dob || ''}
                    onChange={(e) => setStudentForm({ ...studentForm, dob: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Trạng thái</label>
                  <select
                    value={studentForm.status || 'Đang học'}
                    onChange={(e) => setStudentForm({ ...studentForm, status: e.target.value as any })}
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none"
                  >
                    <option value="Đang học">Đang học</option>
                    <option value="Cần hỗ trợ">Cần hỗ trợ</option>
                    <option value="Nghỉ học">Nghỉ học</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">SĐT Phụ huynh</label>
                <input
                  type="text"
                  value={studentForm.parentPhone || ''}
                  onChange={(e) => setStudentForm({ ...studentForm, parentPhone: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ghi chú năng lực / hỗ trợ</label>
                <textarea
                  rows={2}
                  value={studentForm.notes || ''}
                  onChange={(e) => setStudentForm({ ...studentForm, notes: e.target.value })}
                  placeholder="Ghi chú điểm mạnh, điểm yếu cần kèm cặp..."
                  className="w-full p-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsEditingStudent(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveStudent}
                className="px-4 py-2 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800"
              >
                Lưu học sinh
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT CLASS MODAL */}
      {isEditingClass && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 space-y-4 text-xs md:text-sm">
            <h3 className="text-base font-bold text-slate-800 pb-2 border-b border-slate-100">
              Chỉnh sửa thông tin lớp học
            </h3>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mã lớp *</label>
                  <input
                    type="text"
                    value={editClassForm.code || ''}
                    onChange={(e) => setEditClassForm({ ...editClassForm, code: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Khối lớp *</label>
                  <select
                    value={editClassForm.grade || 10}
                    onChange={(e) => setEditClassForm({ ...editClassForm, grade: Number(e.target.value) as GradeLevel })}
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none"
                  >
                    <option value={10}>Khối 10</option>
                    <option value={11}>Khối 11</option>
                    <option value={12}>Khối 12</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tên lớp *</label>
                <input
                  type="text"
                  value={editClassForm.name || ''}
                  onChange={(e) => setEditClassForm({ ...editClassForm, name: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phòng học</label>
                <input
                  type="text"
                  value={editClassForm.roomNumber || ''}
                  onChange={(e) => setEditClassForm({ ...editClassForm, roomNumber: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsEditingClass(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveClass}
                className="px-4 py-2 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800"
              >
                Lưu lớp học
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
