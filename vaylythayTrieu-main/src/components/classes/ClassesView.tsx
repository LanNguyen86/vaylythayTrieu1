import React, { useState } from 'react';
import {
  Users,
  GraduationCap,
  Plus,
  Search,
  Trash2,
  Edit,
  Phone,
  Calendar,
  X,
  Award,
} from 'lucide-react';
import { SchoolClass, Student, GradeLevel } from '../../types';

interface ClassesViewProps {
  classes: SchoolClass[];
  students: Student[];
  onSaveClass: (cls: SchoolClass) => void;
  onDeleteClass: (id: string) => void;
  onSaveStudent: (st: Student) => void;
  onDeleteStudent: (id: string) => void;
  onNotify: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const ClassesView: React.FC<ClassesViewProps> = ({
  classes,
  students,
  onSaveClass,
  onDeleteClass,
  onSaveStudent,
  onDeleteStudent,
  onNotify,
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || 'class-10a1');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);

  const currentClass = classes.find((c) => c.id === selectedClassId) || classes[0];
  const classStudents = students.filter((s) => s.classId === selectedClassId);

  const filteredStudents = classStudents.filter((s) =>
    s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Classes Cards Navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {classes.map((cls) => {
          const isSelected = cls.id === selectedClassId;
          const count = students.filter((s) => s.classId === cls.id).length;

          return (
            <div
              key={cls.id}
              onClick={() => setSelectedClassId(cls.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-blue-50/60 border-blue-500 shadow-xs ring-1 ring-blue-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                    {cls.code}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium font-mono">
                    Khối {cls.grade}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 mt-2">
                  {cls.name}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  GV: {cls.teacherInCharge} · {cls.academicYear}
                </p>
              </div>

              <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">
                  {count} học sinh
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingClass(cls);
                  }}
                  className="p-1 text-slate-400 hover:text-blue-600 rounded"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Students Management Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder={`Tìm trong lớp ${currentClass?.code}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-xs pl-8 pr-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg w-52 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <span className="text-xs text-slate-500">
            Hiển thị {filteredStudents.length} học sinh
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const newStudent: Student = {
                id: `hs-${Date.now()}`,
                code: `HS${currentClass.grade}0${filteredStudents.length + 1}`,
                fullName: 'Học sinh mới',
                classId: currentClass.id,
                className: currentClass.code,
                grade: currentClass.grade,
                dateOfBirth: '2010-01-01',
                gender: 'Nam',
                parentPhone: '0901234567',
                status: 'Đang học',
              };
              setEditingStudent(newStudent);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm học sinh</span>
          </button>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px] uppercase">
              <tr>
                <th className="py-3 px-4">Mã HS</th>
                <th className="py-3 px-4">Họ và tên</th>
                <th className="py-3 px-3">Giới tính</th>
                <th className="py-3 px-3">Ngày sinh</th>
                <th className="py-3 px-3">Liên hệ phụ huynh</th>
                <th className="py-3 px-3">Trạng thái</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((st) => (
                <tr key={st.id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-mono font-semibold text-blue-600">
                    {st.code}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    {st.fullName}
                  </td>
                  <td className="py-3 px-3 text-slate-600">
                    {st.gender}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-500">
                    {st.dateOfBirth}
                  </td>
                  <td className="py-3 px-3 text-slate-600 font-mono flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{st.parentPhone || 'Chưa cập nhật'}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {st.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setEditingStudent(st)}
                        title="Chỉnh sửa thông tin"
                        className="p-1.5 text-slate-500 hover:text-blue-600 rounded"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Xóa học sinh ${st.fullName}?`)) {
                            onDeleteStudent(st.id);
                            onNotify('Đã xóa học sinh', 'info');
                          }
                        }}
                        title="Xóa"
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded"
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

      {/* EDIT STUDENT MODAL */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-5 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                {editingStudent.id ? 'Cập nhật học sinh' : 'Thêm học sinh mới'}
              </h3>
              <button onClick={() => setEditingStudent(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Mã học sinh</label>
                  <input
                    type="text"
                    value={editingStudent.code}
                    onChange={(e) => setEditingStudent({ ...editingStudent, code: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Giới tính</label>
                  <select
                    value={editingStudent.gender}
                    onChange={(e) => setEditingStudent({ ...editingStudent, gender: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Họ và tên</label>
                <input
                  type="text"
                  value={editingStudent.fullName}
                  onChange={(e) => setEditingStudent({ ...editingStudent, fullName: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Ngày sinh</label>
                  <input
                    type="date"
                    value={editingStudent.dateOfBirth}
                    onChange={(e) => setEditingStudent({ ...editingStudent, dateOfBirth: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Số điện thoại phụ huynh</label>
                  <input
                    type="text"
                    value={editingStudent.parentPhone || ''}
                    onChange={(e) => setEditingStudent({ ...editingStudent, parentPhone: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setEditingStudent(null)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  onSaveStudent(editingStudent);
                  setEditingStudent(null);
                  onNotify('Đã lưu thông tin học sinh', 'success');
                }}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
              >
                Lưu học sinh
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT CLASS MODAL */}
      {editingClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-5 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Cập nhật lớp học</h3>
              <button onClick={() => setEditingClass(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Mã lớp</label>
                <input
                  type="text"
                  value={editingClass.code}
                  onChange={(e) => setEditingClass({ ...editingClass, code: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tên lớp</label>
                <input
                  type="text"
                  value={editingClass.name}
                  onChange={(e) => setEditingClass({ ...editingClass, name: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Giáo viên phụ trách</label>
                <input
                  type="text"
                  value={editingClass.teacherInCharge}
                  onChange={(e) => setEditingClass({ ...editingClass, teacherInCharge: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setEditingClass(null)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  onSaveClass(editingClass);
                  setEditingClass(null);
                  onNotify('Đã cập nhật thông tin lớp học', 'success');
                }}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
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
