import { Exam, LessonPlan, StudentGradeRecord, SchoolClass } from '../types';

// Helper to trigger browser file download
export function downloadFile(content: string, filename: string, mimeType: string = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// 1. Export Exam to formatted text / Word document
export function exportExamDoc(exam: Exam, includeSolutions: boolean = false): void {
  let doc = `TRƯỜNG THPT CHUYÊN LÊ HỒNG PHONG\n`;
  doc += `TỔ VẬT LÝ - KHOA HỌC TỰ NHIÊN\n`;
  doc += `--------------------------------------------------\n\n`;
  doc += `${exam.title.toUpperCase()}\n`;
  doc += `Mã đề thi: ${exam.code} | Khối: ${exam.grade} | Thời gian: ${exam.durationMinutes} phút\n`;
  doc += `Chủ đề: ${exam.topic} | Tổng điểm: ${exam.totalPoints} điểm\n`;
  doc += `Họ và tên thí sinh: ............................................ Số báo danh: ................\n\n`;
  doc += `==================================================\n`;
  doc += `NỘI DUNG ĐỀ THI\n`;
  doc += `==================================================\n\n`;

  exam.questions.forEach((q, idx) => {
    doc += `Câu ${idx + 1} [${q.level} - ${q.points} điểm]: ${q.content}\n`;
    if (q.options && q.options.length > 0) {
      q.options.forEach((opt) => {
        doc += `   ${opt}\n`;
      });
    }
    doc += `\n`;
  });

  if (includeSolutions) {
    doc += `\n==================================================\n`;
    doc += `HƯỚNG DẪN CHẤM & LỜI GIẢI CHI TIẾT (DÀNH CHO GIÁO VIÊN)\n`;
    doc += `==================================================\n\n`;
    exam.questions.forEach((q, idx) => {
      doc += `Câu ${idx + 1}: Đáp án: ${q.correctAnswer}\n`;
      doc += `   Lời giải: ${q.solution}\n\n`;
    });
  }

  const filename = `${exam.code}_${includeSolutions ? 'De_va_Dap_an' : 'De_thi'}.doc`;
  downloadFile(doc, filename, 'application/msword;charset=utf-8');
}

// 2. Export separate Answer Key & Detailed Solutions
export function exportAnswerKeyDoc(exam: Exam): void {
  let doc = `ĐÁP ÁN & LỜI GIẢI CHI TIẾT ĐỀ THI: ${exam.code}\n`;
  doc += `Tên đề: ${exam.title}\n`;
  doc += `Khối: ${exam.grade} | Ngày tạo: ${exam.createdAt}\n`;
  doc += `--------------------------------------------------\n\n`;

  doc += `BẢNG ĐÁP ÁN NHANH:\n`;
  const mcQuestions = exam.questions.filter((q) => q.type === 'multiple_choice');
  if (mcQuestions.length > 0) {
    let row = '';
    mcQuestions.forEach((q, idx) => {
      row += `Câu ${idx + 1}: ${q.correctAnswer}   `;
      if ((idx + 1) % 5 === 0) row += '\n';
    });
    doc += row + '\n\n';
  }

  doc += `HƯỚNG DẪN GIẢI CHI TIẾT TỪNG CÂU:\n`;
  doc += `--------------------------------------------------\n`;
  exam.questions.forEach((q, idx) => {
    doc += `Câu ${idx + 1} [${q.level} - ${q.points} điểm]:\n`;
    doc += `Nội dung: ${q.content}\n`;
    doc += `Đáp án chính xác: ${q.correctAnswer}\n`;
    doc += `Lời giải:\n${q.solution}\n\n`;
  });

  downloadFile(doc, `${exam.code}_DAP_AN_CHI_TIET.doc`, 'application/msword;charset=utf-8');
}

// 3. Export Gradebook to CSV with UTF-8 BOM for Excel
export function exportGradebookCsv(
  grades: StudentGradeRecord[],
  selectedClass?: SchoolClass,
  semester: number = 1
): void {
  const BOM = '\uFEFF';
  let csv = BOM;
  csv += `"Mã HS","Họ và tên","Lớp","ĐTX 1","ĐTX 2","ĐTX 3","ĐTX 4","Điểm GK","Điểm CK","Điểm TH","ĐTB Môn","Xếp loại","Ngày cập nhật"\n`;

  grades.forEach((g) => {
    csv += `"${g.studentId}","${g.studentName}","${selectedClass ? selectedClass.code : g.classId}",`;
    csv += `"${g.tx1 ?? ''}","${g.tx2 ?? ''}","${g.tx3 ?? ''}","${g.tx4 ?? ''}",`;
    csv += `"${g.gk ?? ''}","${g.ck ?? ''}","${g.practical ?? ''}",`;
    csv += `"${g.averageScore ?? ''}","${g.performanceLevel ?? ''}","${g.lastUpdated}"\n`;
  });

  const filename = `Bang_diem_${selectedClass ? selectedClass.code : 'Tat_ca'}_HK${semester}_2025_2026.csv`;
  downloadFile(csv, filename, 'text/csv;charset=utf-8');
}

// 4. Export Lesson Plan to Doc
export function exportLessonDoc(lesson: LessonPlan): void {
  let doc = `KẾ HOẠCH BÀI DẠY VẬT LÝ THPT (THEO CÔNG VĂN 5512/BGDĐT)\n`;
  doc += `Tên bài: ${lesson.title.toUpperCase()}\n`;
  doc += `Mã giáo án: ${lesson.code} | Khối: ${lesson.grade} | Thời lượng: ${lesson.durationPeriods} tiết\n`;
  doc += `Bộ sách: ${lesson.bookSeries} | Chương: ${lesson.chapter}\n\n`;

  doc += `I. MỤC TIÊU BÀI HỌC\n`;
  doc += `1. Về kiến thức:\n${lesson.objectives.knowledge.map((k) => `   - ${k}`).join('\n')}\n`;
  doc += `2. Về năng lực:\n${lesson.objectives.competencies.map((c) => `   - ${c}`).join('\n')}\n`;
  doc += `3. Về phẩm chất:\n${lesson.objectives.qualities.map((q) => `   - ${q}`).join('\n')}\n\n`;

  doc += `II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU\n`;
  doc += `${lesson.equipment.map((e) => `   - ${e}`).join('\n')}\n\n`;

  doc += `III. TIẾN TRÌNH TỔ CHỨC CÁC HOẠT ĐỘNG DẠY HỌC\n`;
  lesson.activities.forEach((act, idx) => {
    doc += `\n${idx + 1}. ${act.name}\n`;
    doc += `   a) Mục tiêu: ${act.target}\n`;
    doc += `   b) Nội dung: ${act.content}\n`;
    doc += `   c) Sản phẩm: ${act.product}\n`;
    doc += `   d) Tổ chức thực hiện: ${act.implementation}\n`;
  });

  doc += `\nIV. PHƯƠNG PHÁP ĐÁNH GIÁ\n${lesson.assessment}\n\n`;
  doc += `V. HỒ SƠ DẠY HỌC & THAM KHẢO\n${lesson.references.join(', ')}\n`;

  downloadFile(doc, `${lesson.code}_Giao_an_${lesson.grade}.doc`, 'application/msword;charset=utf-8');
}
