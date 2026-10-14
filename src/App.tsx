import React, { useState, useEffect } from 'react';
import { Sidebar, NavTab } from './components/Sidebar';
import { Header } from './components/Header';
import { QuickActionModal } from './components/QuickActionModal';
import { storage } from './services/storage';

// Views
import { DashboardView } from './views/DashboardView';
import { ExamsView } from './views/ExamsView';
import { LessonsView } from './views/LessonsView';
import { SlidesView } from './views/SlidesView';
import { AssignmentsView } from './views/AssignmentsView';
import { GradebookView } from './views/GradebookView';
import { ClassroomsView } from './views/ClassroomsView';
import { StudentsView } from './views/StudentsView';
import { AIAssistantView } from './views/AIAssistantView';
import { AnalyticsView } from './views/AnalyticsView';
import { SettingsView } from './views/SettingsView';

import {
  Classroom,
  Student,
  Exam,
  LessonPlan,
  SlideDeck,
  Assignment,
  Submission,
  StudentGrade,
  GradingScheme,
  UserProfile,
  AuditLog
} from './types';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);

  // Application State
  const [classes, setClasses] = useState<Classroom[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [lessons, setLessons] = useState<LessonPlan[]>([]);
  const [slides, setSlides] = useState<SlideDeck[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [grades, setGrades] = useState<StudentGrade[]>([]);
  const [gradingScheme, setGradingScheme] = useState<GradingScheme>(storage.getGradingScheme());
  const [user, setUser] = useState<UserProfile>(storage.getUser());
  const [logs, setLogs] = useState<AuditLog[]>([]);

  // Reload data from storage
  const reloadData = () => {
    setClasses(storage.getClasses());
    setStudents(storage.getStudents());
    setExams(storage.getExams());
    setLessons(storage.getLessons());
    setSlides(storage.getSlides());
    setAssignments(storage.getAssignments());
    setSubmissions(storage.getSubmissions());
    setGrades(storage.getGrades());
    setGradingScheme(storage.getGradingScheme());
    setUser(storage.getUser());
    setLogs(storage.getLogs());
  };

  useEffect(() => {
    storage.init();
    reloadData();

    const handleStorageChange = () => {
      reloadData();
    };

    window.addEventListener('pta_data_changed', handleStorageChange);
    return () => {
      window.removeEventListener('pta_data_changed', handleStorageChange);
    };
  }, []);

  // Handlers for Exams
  const handleSaveExam = (exam: Exam) => {
    const existing = exams.findIndex((e) => e.id === exam.id);
    let updated: Exam[];
    if (existing !== -1) {
      updated = exams.map((e) => (e.id === exam.id ? exam : e));
    } else {
      updated = [exam, ...exams];
    }
    storage.saveExams(updated);
  };

  const handleDeleteExam = (id: string) => {
    const updated = exams.filter((e) => e.id !== id);
    storage.saveExams(updated);
  };

  // Handlers for Lessons
  const handleSaveLesson = (lesson: LessonPlan) => {
    const existing = lessons.findIndex((l) => l.id === lesson.id);
    let updated: LessonPlan[];
    if (existing !== -1) {
      updated = lessons.map((l) => (l.id === lesson.id ? lesson : l));
    } else {
      updated = [lesson, ...lessons];
    }
    storage.saveLessons(updated);
  };

  const handleDeleteLesson = (id: string) => {
    const updated = lessons.filter((l) => l.id !== id);
    storage.saveLessons(updated);
  };

  // Handlers for Slides
  const handleSaveSlide = (slide: SlideDeck) => {
    const existing = slides.findIndex((s) => s.id === slide.id);
    let updated: SlideDeck[];
    if (existing !== -1) {
      updated = slides.map((s) => (s.id === slide.id ? slide : s));
    } else {
      updated = [slide, ...slides];
    }
    storage.saveSlides(updated);
  };

  const handleDeleteSlide = (id: string) => {
    const updated = slides.filter((s) => s.id !== id);
    storage.saveSlides(updated);
  };

  // Handlers for Assignments
  const handleSaveAssignment = (asg: Assignment) => {
    const existing = assignments.findIndex((a) => a.id === asg.id);
    let updated: Assignment[];
    if (existing !== -1) {
      updated = assignments.map((a) => (a.id === asg.id ? asg : a));
    } else {
      updated = [asg, ...assignments];
    }
    storage.saveAssignments(updated);
  };

  const handleDeleteAssignment = (id: string) => {
    const updated = assignments.filter((a) => a.id !== id);
    storage.saveAssignments(updated);
  };

  // Handlers for Submissions
  const handleSaveSubmission = (sub: Submission) => {
    const updated = submissions.map((s) => (s.id === sub.id ? sub : s));
    storage.saveSubmissions(updated);
  };

  // Handlers for Grades
  const handleSaveGrades = (updatedGrades: StudentGrade[]) => {
    storage.saveGrades(updatedGrades);
  };

  const handleUpdateScheme = (scheme: GradingScheme) => {
    storage.saveGradingScheme(scheme);
  };

  // Handlers for Classes & Students
  const handleSaveClass = (c: Classroom) => {
    const existing = classes.findIndex((cls) => cls.id === c.id);
    let updated: Classroom[];
    if (existing !== -1) {
      updated = classes.map((cls) => (cls.id === c.id ? c : cls));
    } else {
      updated = [...classes, c];
    }
    storage.saveClasses(updated);
  };

  const handleDeleteClass = (id: string) => {
    const updated = classes.filter((cls) => cls.id !== id);
    storage.saveClasses(updated);
  };

  const handleSaveStudent = (s: Student) => {
    const existing = students.findIndex((std) => std.id === s.id);
    let updated: Student[];
    if (existing !== -1) {
      updated = students.map((std) => (std.id === s.id ? s : std));
    } else {
      updated = [...students, s];
    }
    storage.saveStudents(updated);
  };

  const handleDeleteStudent = (id: string) => {
    const updated = students.filter((std) => std.id !== id);
    storage.saveStudents(updated);
  };

  const handleResetAllData = () => {
    storage.resetAll();
    reloadData();
    alert('Đã khôi phục toàn bộ dữ liệu mẫu THPT!');
  };

  const handleLog = (action: string, module: string, detail: string) => {
    storage.log(action, module, detail);
  };

  const tabTitles: Record<NavTab, string> = {
    dashboard: 'Tổng quan giảng dạy Vật lý THPT',
    classes: 'Quản lý lớp học Vật lý',
    students: 'Danh sách & Hồ sơ học sinh',
    exams: 'Ngân hàng đề thi Vật lý THPT',
    lessons: 'Kho giáo án điện tử (Công văn 5512)',
    slides: 'Thư viện Slide bài giảng PowerPoint',
    assignments: 'Quản lý bài tập & Theo dõi nộp bài',
    gradebook: 'Sổ điểm điện tử theo Thông tư 22',
    'ai-assistant': 'Trợ lý AI Chuyên gia Vật lý THPT',
    analytics: 'Báo cáo & Thống kê kết quả học tập',
    settings: 'Cài đặt hệ thống & Trọng số điểm'
  };

  return (
    <div className="flex h-screen bg-slate-100/90 text-slate-800 font-sans antialiased overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        badgeCounts={{
          exams: exams.length,
          lessons: lessons.length,
          slides: slides.length,
          assignments: assignments.length,
          students: students.length
        }}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          activeTabTitle={tabTitles[currentTab]}
          user={user}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onQuickAction={() => setIsQuickActionOpen(true)}
          recentLogs={logs}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {currentTab === 'dashboard' && (
            <DashboardView
              classes={classes}
              students={students}
              exams={exams}
              lessons={lessons}
              slides={slides}
              assignments={assignments}
              grades={grades}
              logs={logs}
              onNavigate={(tab) => setCurrentTab(tab)}
              onOpenQuickAction={() => setIsQuickActionOpen(true)}
            />
          )}

          {currentTab === 'classes' && (
            <ClassroomsView
              classes={classes}
              students={students}
              onSaveClass={handleSaveClass}
              onDeleteClass={handleDeleteClass}
              onSaveStudent={handleSaveStudent}
              onDeleteStudent={handleDeleteStudent}
              onLog={handleLog}
            />
          )}

          {currentTab === 'students' && (
            <StudentsView
              students={students}
              classes={classes}
              grades={grades}
              onSaveStudent={handleSaveStudent}
              onDeleteStudent={handleDeleteStudent}
              onLog={handleLog}
            />
          )}

          {currentTab === 'exams' && (
            <ExamsView
              exams={exams}
              onSaveExam={handleSaveExam}
              onDeleteExam={handleDeleteExam}
              onLog={handleLog}
            />
          )}

          {currentTab === 'lessons' && (
            <LessonsView
              lessons={lessons}
              onSaveLesson={handleSaveLesson}
              onDeleteLesson={handleDeleteLesson}
              onLog={handleLog}
            />
          )}

          {currentTab === 'slides' && (
            <SlidesView
              slides={slides}
              onSaveSlide={handleSaveSlide}
              onDeleteSlide={handleDeleteSlide}
              onLog={handleLog}
            />
          )}

          {currentTab === 'assignments' && (
            <AssignmentsView
              assignments={assignments}
              submissions={submissions}
              classes={classes}
              students={students}
              onSaveAssignment={handleSaveAssignment}
              onDeleteAssignment={handleDeleteAssignment}
              onSaveSubmission={handleSaveSubmission}
              onLog={handleLog}
            />
          )}

          {currentTab === 'gradebook' && (
            <GradebookView
              classes={classes}
              students={students}
              grades={grades}
              gradingScheme={gradingScheme}
              onSaveGrades={handleSaveGrades}
              onUpdateScheme={handleUpdateScheme}
              onLog={handleLog}
            />
          )}

          {currentTab === 'ai-assistant' && (
            <AIAssistantView
              classes={classes}
              students={students}
              onLog={handleLog}
            />
          )}

          {currentTab === 'analytics' && (
            <AnalyticsView
              classes={classes}
              students={students}
              grades={grades}
              assignments={assignments}
              submissions={submissions}
              onLog={handleLog}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              user={user}
              gradingScheme={gradingScheme}
              logs={logs}
              onUpdateUser={(u) => {
                storage.setUser(u);
                setUser(u);
              }}
              onUpdateScheme={handleUpdateScheme}
              onResetAllData={handleResetAllData}
              onLog={handleLog}
            />
          )}
        </main>
      </div>

      {/* Global Quick Action Modal */}
      <QuickActionModal
        isOpen={isQuickActionOpen}
        onClose={() => setIsQuickActionOpen(false)}
        onNavigate={(tab) => setCurrentTab(tab)}
      />
    </div>
  );
}
