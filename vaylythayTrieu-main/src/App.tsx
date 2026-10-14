/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sidebar, ActiveTab } from './components/common/Sidebar';
import { Header } from './components/common/Header';
import { Toast, ToastMessage } from './components/common/Toast';
import { ConfirmModal } from './components/common/ConfirmModal';
import { QuickCreateModal } from './components/quick-create/QuickCreateModal';

import { DashboardView } from './components/dashboard/DashboardView';
import { ExamsView } from './components/exams/ExamsView';
import { LessonsView } from './components/lessons/LessonsView';
import { SlidesView } from './components/slides/SlidesView';
import { AssignmentsView } from './components/assignments/AssignmentsView';
import { GradebookView } from './components/gradebook/GradebookView';
import { ClassesView } from './components/classes/ClassesView';
import { AiAssistantView } from './components/ai-assistant/AiAssistantView';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';
import { StudentPortalView } from './components/student-portal/StudentPortalView';

import { storage } from './services/storage';
import {
  SchoolClass,
  Student,
  Exam,
  LessonPlan,
  SlideDeck,
  Assignment,
  StudentGradeRecord,
  GradingScheme,
  AuditLog,
  UserRole,
} from './types';

export default function App() {
  // App data states
  const [classes, setClasses] = useState<SchoolClass[]>(() => storage.getClasses());
  const [students, setStudents] = useState<Student[]>(() => storage.getStudents());
  const [exams, setExams] = useState<Exam[]>(() => storage.getExams());
  const [lessons, setLessons] = useState<LessonPlan[]>(() => storage.getLessons());
  const [slides, setSlides] = useState<SlideDeck[]>(() => storage.getSlides());
  const [assignments, setAssignments] = useState<Assignment[]>(() => storage.getAssignments());
  const [grades, setGrades] = useState<StudentGradeRecord[]>(() => storage.getGrades());
  const [scheme, setScheme] = useState<GradingScheme>(() => storage.getScheme());
  const [logs, setLogs] = useState<AuditLog[]>(() => storage.getLogs());
  const [role, setRole] = useState<UserRole>(() => storage.getRole());

  // Navigation & UI states
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Toast notification helper
  const notify = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Synchronizers
  const handleSaveClass = (cls: SchoolClass) => {
    storage.saveClass(cls);
    setClasses(storage.getClasses());
    setLogs(storage.getLogs());
  };

  const handleDeleteClass = (id: string) => {
    storage.deleteClass(id);
    setClasses(storage.getClasses());
    setLogs(storage.getLogs());
  };

  const handleSaveStudent = (st: Student) => {
    storage.saveStudent(st);
    setStudents(storage.getStudents());
    setLogs(storage.getLogs());
  };

  const handleDeleteStudent = (id: string) => {
    storage.deleteStudent(id);
    setStudents(storage.getStudents());
    setLogs(storage.getLogs());
  };

  const handleSaveExam = (exam: Exam) => {
    storage.saveExam(exam);
    setExams(storage.getExams());
    setLogs(storage.getLogs());
  };

  const handleDeleteExam = (id: string) => {
    storage.deleteExam(id);
    setExams(storage.getExams());
    setLogs(storage.getLogs());
  };

  const handleSaveLesson = (lesson: LessonPlan) => {
    storage.saveLesson(lesson);
    setLessons(storage.getLessons());
    setLogs(storage.getLogs());
  };

  const handleDeleteLesson = (id: string) => {
    storage.deleteLesson(id);
    setLessons(storage.getLessons());
    setLogs(storage.getLogs());
  };

  const handleSaveSlide = (slide: SlideDeck) => {
    storage.saveSlide(slide);
    setSlides(storage.getSlides());
    setLogs(storage.getLogs());
  };

  const handleDeleteSlide = (id: string) => {
    storage.deleteSlide(id);
    setSlides(storage.getSlides());
    setLogs(storage.getLogs());
  };

  const handleSaveAssignment = (asg: Assignment) => {
    storage.saveAssignment(asg);
    setAssignments(storage.getAssignments());
    setLogs(storage.getLogs());
  };

  const handleDeleteAssignment = (id: string) => {
    storage.deleteAssignment(id);
    setAssignments(storage.getAssignments());
    setLogs(storage.getLogs());
  };

  const handleSaveGrade = (grade: StudentGradeRecord) => {
    storage.saveGrade(grade);
    setGrades(storage.getGrades());
    setLogs(storage.getLogs());
  };

  const handleSaveGradesBatch = (batch: StudentGradeRecord[]) => {
    storage.saveGradesBatch(batch);
    setGrades(storage.getGrades());
    setLogs(storage.getLogs());
  };

  const handleSaveScheme = (newScheme: GradingScheme) => {
    storage.saveScheme(newScheme);
    setScheme(newScheme);
    setGrades(storage.getGrades());
    setLogs(storage.getLogs());
  };

  const handleRoleChange = (newRole: UserRole) => {
    storage.setRole(newRole);
    setRole(newRole);
  };

  // Reset to demo data
  const handleResetDemo = () => {
    storage.resetToDemo();
    setClasses(storage.getClasses());
    setStudents(storage.getStudents());
    setExams(storage.getExams());
    setLessons(storage.getLessons());
    setSlides(storage.getSlides());
    setAssignments(storage.getAssignments());
    setGrades(storage.getGrades());
    setScheme(storage.getScheme());
    setLogs(storage.getLogs());
    setRole('teacher');
    setResetConfirmOpen(false);
    notify('Đã khôi phục toàn bộ dữ liệu mẫu Vật lý THPT (GDPT 2018)', 'info');
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Toast notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />

      {/* Confirmation Modal for Reset */}
      <ConfirmModal
        isOpen={resetConfirmOpen}
        title="Nạp lại bộ dữ liệu mẫu ban đầu?"
        message="Thao tác này sẽ nạp lại toàn bộ 3 lớp học mẫu, 24 học sinh, 10 đề thi chuẩn, 10 giáo án theo CV 5512, 10 bộ slide và 15 bài tập mẫu."
        confirmText="Nạp lại dữ liệu"
        cancelText="Giữ nguyên"
        onConfirm={handleResetDemo}
        onCancel={() => setResetConfirmOpen(false)}
      />

      {/* Quick Add Modal */}
      <QuickCreateModal
        isOpen={isQuickCreateOpen}
        onClose={() => setIsQuickCreateOpen(false)}
        onNavigate={(tab) => {
          setActiveTab(tab);
        }}
      />

      {/* Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setSearchQuery('');
        }}
        role={role}
        counts={{
          classes: classes.length,
          exams: exams.length,
          lessons: lessons.length,
          slides: slides.length,
          assignments: assignments.length,
        }}
      />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenQuickCreate={() => setIsQuickCreateOpen(true)}
          onResetDemo={() => setResetConfirmOpen(true)}
          role={role}
          onRoleChange={handleRoleChange}
        />

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto px-6 py-6">
          {/* If current role is Student */}
          {role === 'student' ? (
            <StudentPortalView
              students={students}
              assignments={assignments}
              grades={grades}
              slides={slides}
              onRoleChange={handleRoleChange}
              onNotify={notify}
            />
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardView
                  classes={classes}
                  students={students}
                  exams={exams}
                  lessons={lessons}
                  slides={slides}
                  assignments={assignments}
                  grades={grades}
                  logs={logs}
                  onNavigate={(tab) => setActiveTab(tab)}
                />
              )}

              {activeTab === 'classes' && (
                <ClassesView
                  classes={classes}
                  students={students}
                  onSaveClass={handleSaveClass}
                  onDeleteClass={handleDeleteClass}
                  onSaveStudent={handleSaveStudent}
                  onDeleteStudent={handleDeleteStudent}
                  onNotify={notify}
                />
              )}

              {activeTab === 'students' && (
                <ClassesView
                  classes={classes}
                  students={students}
                  onSaveClass={handleSaveClass}
                  onDeleteClass={handleDeleteClass}
                  onSaveStudent={handleSaveStudent}
                  onDeleteStudent={handleDeleteStudent}
                  onNotify={notify}
                />
              )}

              {activeTab === 'exams' && (
                <ExamsView
                  exams={exams}
                  onSaveExam={handleSaveExam}
                  onDeleteExam={handleDeleteExam}
                  onNotify={notify}
                />
              )}

              {activeTab === 'lessons' && (
                <LessonsView
                  lessons={lessons}
                  onSaveLesson={handleSaveLesson}
                  onDeleteLesson={handleDeleteLesson}
                  onNotify={notify}
                />
              )}

              {activeTab === 'slides' && (
                <SlidesView
                  slides={slides}
                  onSaveSlide={handleSaveSlide}
                  onDeleteSlide={handleDeleteSlide}
                  onNotify={notify}
                />
              )}

              {activeTab === 'assignments' && (
                <AssignmentsView
                  assignments={assignments}
                  classes={classes}
                  onSaveAssignment={handleSaveAssignment}
                  onDeleteAssignment={handleDeleteAssignment}
                  onNotify={notify}
                />
              )}

              {activeTab === 'gradebook' && (
                <GradebookView
                  grades={grades}
                  classes={classes}
                  students={students}
                  scheme={scheme}
                  onSaveGrade={handleSaveGrade}
                  onSaveGradesBatch={handleSaveGradesBatch}
                  onNotify={notify}
                />
              )}

              {activeTab === 'ai-assistant' && <AiAssistantView />}

              {activeTab === 'reports' && (
                <ReportsView
                  classes={classes}
                  grades={grades}
                  students={students}
                  assignments={assignments}
                  exams={exams}
                />
              )}

              {activeTab === 'settings' && (
                <SettingsView
                  role={role}
                  onRoleChange={handleRoleChange}
                  scheme={scheme}
                  onSaveScheme={handleSaveScheme}
                  onResetDemo={() => setResetConfirmOpen(true)}
                  onNotify={notify}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
