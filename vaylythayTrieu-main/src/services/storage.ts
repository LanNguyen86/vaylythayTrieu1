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
} from '../types';
import {
  initialClasses,
  initialStudents,
  initialExams,
  initialLessons,
  initialSlides,
  initialAssignments,
  initialGradeRecords,
  defaultGradingScheme,
  initialAuditLogs,
} from '../data/mockData';

const KEYS = {
  CLASSES: 'phys_classes_v1',
  STUDENTS: 'phys_students_v1',
  EXAMS: 'phys_exams_v1',
  LESSONS: 'phys_lessons_v1',
  SLIDES: 'phys_slides_v1',
  ASSIGNMENTS: 'phys_assignments_v1',
  GRADES: 'phys_grades_v1',
  SCHEME: 'phys_scheme_v1',
  LOGS: 'phys_logs_v1',
  ROLE: 'phys_user_role_v1',
};

// Safe JSON parser
function getStored<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.warn(`Error reading key ${key} from localStorage:`, e);
    return fallback;
  }
}

function setStored<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error writing key ${key} to localStorage:`, e);
  }
}

// Compute student semester average and classification
export function computeStudentScore(
  record: StudentGradeRecord,
  scheme: GradingScheme = defaultGradingScheme
): { average: number; level: 'Xuất sắc' | 'Giỏi' | 'Khá' | 'Đạt' | 'Chưa đạt' } {
  const txScores = [record.tx1, record.tx2, record.tx3, record.tx4].filter(
    (s): s is number => typeof s === 'number' && !isNaN(s)
  );

  let totalWeightedScore = 0;
  let totalWeight = 0;

  // TX scores
  txScores.forEach((score) => {
    totalWeightedScore += score * scheme.txWeight;
    totalWeight += scheme.txWeight;
  });

  // GK score
  if (typeof record.gk === 'number' && !isNaN(record.gk)) {
    totalWeightedScore += record.gk * scheme.gkWeight;
    totalWeight += scheme.gkWeight;
  }

  // CK score
  if (typeof record.ck === 'number' && !isNaN(record.ck)) {
    totalWeightedScore += record.ck * scheme.ckWeight;
    totalWeight += scheme.ckWeight;
  }

  if (totalWeight === 0) {
    return { average: 0, level: 'Chưa đạt' };
  }

  const average = Math.round((totalWeightedScore / totalWeight) * 10) / 10;

  let level: 'Xuất sắc' | 'Giỏi' | 'Khá' | 'Đạt' | 'Chưa đạt' = 'Chưa đạt';
  if (average >= 9.0) level = 'Xuất sắc';
  else if (average >= scheme.excellentThreshold) level = 'Giỏi';
  else if (average >= scheme.goodThreshold) level = 'Khá';
  else if (average >= scheme.passThreshold) level = 'Đạt';
  else level = 'Chưa đạt';

  return { average, level };
}

export const storage = {
  // Roles
  getRole(): UserRole {
    return getStored<UserRole>(KEYS.ROLE, 'teacher');
  },
  setRole(role: UserRole) {
    setStored(KEYS.ROLE, role);
  },

  // Classes
  getClasses(): SchoolClass[] {
    return getStored<SchoolClass[]>(KEYS.CLASSES, initialClasses);
  },
  saveClass(cls: SchoolClass): void {
    const list = this.getClasses();
    const index = list.findIndex((c) => c.id === cls.id);
    if (index >= 0) {
      list[index] = cls;
    } else {
      list.push(cls);
    }
    setStored(KEYS.CLASSES, list);
    this.addLog(`Thêm/cập nhật lớp ${cls.name}`);
  },
  deleteClass(id: string): void {
    const list = this.getClasses().filter((c) => c.id !== id);
    setStored(KEYS.CLASSES, list);
    this.addLog(`Đã xóa lớp học mã ${id}`);
  },

  // Students
  getStudents(): Student[] {
    return getStored<Student[]>(KEYS.STUDENTS, initialStudents);
  },
  saveStudent(student: Student): void {
    const list = this.getStudents();
    const index = list.findIndex((s) => s.id === student.id);
    if (index >= 0) {
      list[index] = student;
    } else {
      list.push(student);
    }
    setStored(KEYS.STUDENTS, list);
    this.addLog(`Thêm/cập nhật học sinh: ${student.fullName} (${student.className})`);
  },
  deleteStudent(id: string): void {
    const list = this.getStudents().filter((s) => s.id !== id);
    setStored(KEYS.STUDENTS, list);
    this.addLog(`Đã xóa học sinh mã ${id}`);
  },

  // Exams
  getExams(): Exam[] {
    return getStored<Exam[]>(KEYS.EXAMS, initialExams);
  },
  saveExam(exam: Exam): void {
    const list = this.getExams();
    const index = list.findIndex((e) => e.id === exam.id);
    if (index >= 0) {
      list[index] = exam;
    } else {
      list.unshift(exam);
    }
    setStored(KEYS.EXAMS, list);
    this.addLog(`Lưu đề thi: ${exam.title} (${exam.code})`);
  },
  deleteExam(id: string): void {
    const list = this.getExams().filter((e) => e.id !== id);
    setStored(KEYS.EXAMS, list);
    this.addLog(`Đã xóa đề thi mã ${id}`);
  },

  // Lessons
  getLessons(): LessonPlan[] {
    return getStored<LessonPlan[]>(KEYS.LESSONS, initialLessons);
  },
  saveLesson(lesson: LessonPlan): void {
    const list = this.getLessons();
    const index = list.findIndex((l) => l.id === lesson.id);
    if (index >= 0) {
      list[index] = lesson;
    } else {
      list.unshift(lesson);
    }
    setStored(KEYS.LESSONS, list);
    this.addLog(`Lưu giáo án: ${lesson.title} (${lesson.code})`);
  },
  deleteLesson(id: string): void {
    const list = this.getLessons().filter((l) => l.id !== id);
    setStored(KEYS.LESSONS, list);
    this.addLog(`Đã xóa giáo án mã ${id}`);
  },

  // Slides
  getSlides(): SlideDeck[] {
    return getStored<SlideDeck[]>(KEYS.SLIDES, initialSlides);
  },
  saveSlide(slide: SlideDeck): void {
    const list = this.getSlides();
    const index = list.findIndex((s) => s.id === slide.id);
    if (index >= 0) {
      list[index] = slide;
    } else {
      list.unshift(slide);
    }
    setStored(KEYS.SLIDES, list);
    this.addLog(`Lưu bộ slide bài giảng: ${slide.title}`);
  },
  deleteSlide(id: string): void {
    const list = this.getSlides().filter((s) => s.id !== id);
    setStored(KEYS.SLIDES, list);
    this.addLog(`Đã xóa bộ slide mã ${id}`);
  },

  // Assignments
  getAssignments(): Assignment[] {
    return getStored<Assignment[]>(KEYS.ASSIGNMENTS, initialAssignments);
  },
  saveAssignment(asg: Assignment): void {
    const list = this.getAssignments();
    const index = list.findIndex((a) => a.id === asg.id);
    if (index >= 0) {
      list[index] = asg;
    } else {
      list.unshift(asg);
    }
    setStored(KEYS.ASSIGNMENTS, list);
    this.addLog(`Lưu bài tập: ${asg.title} (${asg.targetClassName})`);
  },
  deleteAssignment(id: string): void {
    const list = this.getAssignments().filter((a) => a.id !== id);
    setStored(KEYS.ASSIGNMENTS, list);
    this.addLog(`Đã xóa bài tập mã ${id}`);
  },

  // Grades
  getGrades(): StudentGradeRecord[] {
    const grades = getStored<StudentGradeRecord[]>(KEYS.GRADES, initialGradeRecords);
    const scheme = this.getScheme();
    return grades.map((g) => {
      const { average, level } = computeStudentScore(g, scheme);
      return {
        ...g,
        averageScore: average,
        performanceLevel: level,
      };
    });
  },
  saveGrade(grade: StudentGradeRecord): void {
    const list = getStored<StudentGradeRecord[]>(KEYS.GRADES, initialGradeRecords);
    const index = list.findIndex((g) => g.id === grade.id);
    const updated = {
      ...grade,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    if (index >= 0) {
      list[index] = updated;
    } else {
      list.push(updated);
    }
    setStored(KEYS.GRADES, list);
    this.addLog(`Cập nhật điểm cho học sinh: ${grade.studentName}`);
  },
  saveGradesBatch(grades: StudentGradeRecord[]): void {
    setStored(KEYS.GRADES, grades);
    this.addLog(`Cập nhật danh sách điểm (${grades.length} bản ghi)`);
  },

  // Grading Scheme
  getScheme(): GradingScheme {
    return getStored<GradingScheme>(KEYS.SCHEME, defaultGradingScheme);
  },
  saveScheme(scheme: GradingScheme): void {
    setStored(KEYS.SCHEME, scheme);
    this.addLog('Cập nhật cấu hình trọng số tính điểm Thông tư 22');
  },

  // Audit Logs
  getLogs(): AuditLog[] {
    return getStored<AuditLog[]>(KEYS.LOGS, initialAuditLogs);
  },
  addLog(action: string, details?: string): void {
    const logs = this.getLogs();
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString('vi-VN'),
      action,
      actor: 'Thầy Triệu Vật Lý',
      details: details || action,
    };
    logs.unshift(newLog);
    if (logs.length > 50) logs.pop();
    setStored(KEYS.LOGS, logs);
  },

  // System Reset to Seed Demo Data
  resetToDemo(): void {
    setStored(KEYS.CLASSES, initialClasses);
    setStored(KEYS.STUDENTS, initialStudents);
    setStored(KEYS.EXAMS, initialExams);
    setStored(KEYS.LESSONS, initialLessons);
    setStored(KEYS.SLIDES, initialSlides);
    setStored(KEYS.ASSIGNMENTS, initialAssignments);
    setStored(KEYS.GRADES, initialGradeRecords);
    setStored(KEYS.SCHEME, defaultGradingScheme);
    setStored(KEYS.LOGS, initialAuditLogs);
    setStored(KEYS.ROLE, 'teacher');
  },

  // Export & Import backup JSON
  exportBackupJson(): string {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      classes: this.getClasses(),
      students: this.getStudents(),
      exams: this.getExams(),
      lessons: this.getLessons(),
      slides: this.getSlides(),
      assignments: this.getAssignments(),
      grades: this.getGrades(),
      scheme: this.getScheme(),
      logs: this.getLogs(),
    };
    return JSON.stringify(backup, null, 2);
  },
  importBackupJson(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.classes) setStored(KEYS.CLASSES, data.classes);
      if (data.students) setStored(KEYS.STUDENTS, data.students);
      if (data.exams) setStored(KEYS.EXAMS, data.exams);
      if (data.lessons) setStored(KEYS.LESSONS, data.lessons);
      if (data.slides) setStored(KEYS.SLIDES, data.slides);
      if (data.assignments) setStored(KEYS.ASSIGNMENTS, data.assignments);
      if (data.grades) setStored(KEYS.GRADES, data.grades);
      if (data.scheme) setStored(KEYS.SCHEME, data.scheme);
      if (data.logs) setStored(KEYS.LOGS, data.logs);
      this.addLog('Phục hồi dữ liệu từ tệp sao lưu JSON');
      return true;
    } catch (e) {
      console.error('Import backup failed:', e);
      return false;
    }
  },
};
