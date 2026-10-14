export type GradeLevel = 10 | 11 | 12;

export type CognitiveLevel = 'Nhận biết' | 'Thông hiểu' | 'Vận dụng' | 'Vận dụng cao';

export type ExamType = 'Thường xuyên' | 'Giữa kỳ' | 'Cuối kỳ' | 'Ôn tập' | 'Thi thử';

export type ExamStatus = 'Bản nháp' | 'Đã hoàn thiện' | 'Đã sử dụng';

export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';

export interface Question {
  id: string;
  type: QuestionType;
  level: CognitiveLevel;
  content: string;
  options?: string[]; // for multiple choice
  correctAnswer?: string;
  solution: string;
  points: number;
}

export interface Exam {
  id: string;
  code: string; // e.g. DT-10-GK1
  title: string;
  grade: GradeLevel;
  semester: 1 | 2;
  topic: string;
  type: ExamType;
  durationMinutes: number;
  totalPoints: number;
  createdAt: string;
  status: ExamStatus;
  questions: Question[];
  attachments?: string[];
  note?: string;
}

export interface LessonPlan {
  id: string;
  code: string; // GA-10-01
  title: string;
  grade: GradeLevel;
  chapter: string;
  topic: string;
  bookSeries: 'Kết nối tri thức' | 'Cánh Diều' | 'Chân trời sáng tạo';
  durationPeriods: number; // số tiết (1-4)
  objectives: {
    knowledge: string[];
    competencies: string[];
    qualities: string[];
  };
  keyKnowledge: string[];
  equipment: string[];
  activities: {
    name: string;
    target: string;
    content: string;
    product: string;
    implementation: string;
  }[];
  assessment: string;
  references: string[];
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SlideDeck {
  id: string;
  title: string;
  grade: GradeLevel;
  chapter: string;
  topic: string;
  description: string;
  fileFormat: 'PPTX' | 'PDF';
  fileSizeMb: number;
  thumbnailUrl?: string;
  relatedLessonId?: string;
  createdAt: string;
  updatedAt: string;
  keywords: string[];
  slidesCount: number;
  slidesPreview?: {
    slideNumber: number;
    title: string;
    bulletPoints: string[];
    notes?: string;
  }[];
}

export interface Assignment {
  id: string;
  code: string; // BT-10-01
  title: string;
  description: string;
  targetClassId: string;
  targetClassName: string;
  grade: GradeLevel;
  topic: string;
  dueDate: string;
  createdAt: string;
  totalPoints: number;
  status: 'Đang mở' | 'Đã đóng' | 'Đã chấm';
  differentiationTier: 'Đại trà' | 'Cơ bản (hỗ trợ)' | 'Nâng cao (chọn lọc)';
  questionsSummary: string;
  guidelines: string;
  teacherAnswerKey: string;
  submissionsCount: number;
  gradedCount: number;
}

export interface StudentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  submittedAt: string | null;
  status: 'Đã nộp' | 'Chưa nộp' | 'Nộp muộn';
  score?: number | null;
  teacherComment?: string;
  studentContent?: string;
}

export interface SchoolClass {
  id: string;
  code: string; // 10A1
  name: string;
  grade: GradeLevel;
  academicYear: string; // 2025 - 2026
  teacherInCharge: string;
  studentsCount: number;
}

export interface Student {
  id: string;
  code: string; // HS1001
  fullName: string;
  classId: string;
  className: string;
  grade: GradeLevel;
  dateOfBirth: string;
  gender: 'Nam' | 'Nữ';
  parentPhone?: string;
  status: 'Đang học' | 'Tạm nghỉ' | 'Chuyển lớp';
}

export interface StudentGradeRecord {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  semester: 1 | 2;
  // Điểm kiểm tra thường xuyên (hệ số 1, tối đa 4 cột)
  tx1: number | null;
  tx2: number | null;
  tx3: number | null;
  tx4: number | null;
  // Điểm giữa kỳ (hệ số 2)
  gk: number | null;
  // Điểm cuối kỳ (hệ số 3)
  ck: number | null;
  // Điểm thực hành / bài tập bổ sung
  practical: number | null;
  assignmentAvg: number | null;
  averageScore?: number;
  performanceLevel?: 'Xuất sắc' | 'Giỏi' | 'Khá' | 'Đạt' | 'Chưa đạt';
  teacherNote?: string;
  lastUpdated: string;
}

export interface GradingScheme {
  txWeight: number; // Default 1
  gkWeight: number; // Default 2
  ckWeight: number; // Default 3
  passThreshold: number; // Default 5.0
  goodThreshold: number; // Default 6.5
  excellentThreshold: number; // Default 8.0
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  details: string;
}

export type UserRole = 'teacher' | 'admin' | 'student';
