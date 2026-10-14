import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const port = 3000;

app.use(express.json({ limit: '10mb' }));

// Server-side Gemini initialization adhering to @google/genai guidelines
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper for calling Gemini safely with system instruction and fallback
async function callGemini(contents: string, systemInstruction: string) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('Chưa cấu hình GEMINI_API_KEY trên máy chủ. Vui lòng cấu hình trong bảng điều khiển Secrets.');
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents,
    config: {
      systemInstruction,
      temperature: 0.7,
    },
  });

  return response.text ?? '';
}

// 1. Physics AI Assistant Chat
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { message, history, contextGrade, topic } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Nội dung tin nhắn không được để trống' });
    }

    const systemInstruction = `Bạn là Trợ lý AI Giảng viên Vật lý THPT (Chương trình Giáo dục Phổ thông 2018 Việt Nam).
Vai trò: Hỗ trợ giáo viên Vật lý cấp 3 (Khối 10, 11, 12).
Phong cách: Sư phạm, chính xác về mặt vật lý, chuẩn hóa công thức, kiểm tra đơn vị SI chính xác.
Khi giải bài toán: Trình bày từng bước logic: Hiện tượng -> Giả thiết và đổi đơn vị -> Công thức áp dụng -> Tính toán -> Biện luận kết quả.
Khi giải thích hiện tượng: Liên hệ đời sống thực tế sinh động, dễ hiểu cho học sinh THPT.
Thông tin ngữ cảnh hiện tại: Khối lớp: ${contextGrade || 'Tất cả khối 10-12'}, Chủ đề: ${topic || 'Vật lý THPT'}.
Ngôn ngữ: Tiếng Việt sư phạm chuẩn mực.`;

    const prompt = `Lịch sử trao đổi trước đó:\n${(history || []).map((h: { role: string; content: string }) => `${h.role === 'user' ? 'Giáo viên' : 'Trợ lý'}: ${h.content}`).join('\n')}\n\nGiáo viên hỏi: ${message}`;

    const text = await callGemini(prompt, systemInstruction);
    res.json({ reply: text });
  } catch (error: any) {
    console.error('Gemini Chat Error:', error);
    res.status(500).json({ error: error.message || 'Lỗi khi gọi Gemini AI' });
  }
});

// 2. AI Generate Physics Exam Draft
app.post('/api/gemini/generate-exam', async (req, res) => {
  try {
    const { grade, topic, examType, multipleChoiceCount, essayCount, duration, requirements } = req.body;

    const systemInstruction = `Bạn là chuyên gia khảo thí Vật lý THPT Việt Nam.
Nhiệm vụ: Tạo bản nháp đề thi Vật lý THPT theo ma trận chuẩn với đáp án và lời giải chi tiết.
Yêu cầu bắt buộc:
1. Đảm bảo tính nhất quán của đơn vị SI (m, s, kg, N, J, W, V, A, T, Hz...).
2. Số liệu thực tế, câu hỏi không bị mâu thuẫn dữ kiện.
3. Phân bổ mức độ nhận thức: Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao.
4. Trả về đúng định dạng JSON có cấu trúc.`;

    const prompt = `Hãy tạo một đề thi Vật lý với các thông số sau:
- Khối lớp: ${grade || 10}
- Chủ đề: ${topic || 'Động học chất điểm'}
- Loại đề: ${examType || 'Kiểm tra giữa kỳ'}
- Số câu trắc nghiệm (4 lựa chọn A, B, C, D): ${multipleChoiceCount || 10}
- Số câu tự luận / trả lời ngắn: ${essayCount || 2}
- Thời gian làm bài: ${duration || 45} phút
- Yêu cầu bổ sung của giáo viên: ${requirements || 'Đề thi cân đối mức độ nhận thức, có hướng dẫn chấm'}

Định dạng JSON yêu cầu:
{
  "title": "Tên đề thi",
  "topic": "${topic}",
  "grade": ${grade || 10},
  "duration": ${duration || 45},
  "questions": [
    {
      "id": 1,
      "type": "multiple_choice",
      "level": "Nhận biết | Thông hiểu | Vận dụng | Vận dụng cao",
      "content": "Nội dung câu hỏi...",
      "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
      "correctAnswer": "A",
      "solution": "Lời giải chi tiết và công thức...",
      "points": 0.5
    },
    {
      "id": 2,
      "type": "essay",
      "level": "Vận dụng cao",
      "content": "Đề bài tự luận...",
      "solution": "Các bước giải và biểu điểm chi tiết...",
      "points": 2.0
    }
  ],
  "teacherNotes": "Lưu ý sư phạm khi chấm bài..."
}
Chỉ trả về JSON thuần túy, không bao quanh bằng markdown hoặc giải thích bên ngoài.`;

    const rawText = await callGemini(prompt, systemInstruction);
    const cleanedJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanedJson);
    res.json(parsed);
  } catch (error: any) {
    console.error('Gemini Exam Generator Error:', error);
    res.status(500).json({ error: error.message || 'Lỗi khi tạo đề thi bằng AI' });
  }
});

// 3. AI Generate Lesson Plan Draft
app.post('/api/gemini/generate-lesson', async (req, res) => {
  try {
    const { grade, lessonName, bookSeries, durationPeriods, objectives, specialNeeds } = req.body;

    const systemInstruction = `Bạn là chuyên gia phương pháp dạy học Vật lý THPT theo chuẩn Công văn 5512/BGDĐT.
Nhiệm vụ: Soạn giáo án bài học Vật lý chi tiết, có tiến trình 4 hoạt động:
1. Hoạt động Khởi động (Tạo tình huống có vấn đề từ thực tế)
2. Hoạt động Hình thành kiến thức mới (Thí nghiệm / Quan sát / Khám phá)
3. Hoạt động Luyện tập (Hệ thống hóa và làm bài tập vận dụng)
4. Hoạt động Vận dụng & Tìm tòi mở rộng (Ứng dụng đời sống và kỹ thuật)
Định dạng trả về là JSON.`;

    const prompt = `Soạn giáo án Vật lý lớp ${grade || 10}:
- Tên bài: ${lessonName || 'Định luật II Newton'}
- Bộ sách: ${bookSeries || 'Kết nối tri thức với cuộc sống'}
- Thời lượng: ${durationPeriods || 2} tiết (90 phút)
- Mục tiêu cần đạt: ${objectives || 'Nắm vững công thức F = ma, mối quan hệ giữa lực, khối lượng và gia tốc'}
- Yêu cầu bổ sung: ${specialNeeds || 'Đề xuất thí nghiệm thực hành với xe lăn và gia tốc kế'}

Trả về JSON cấu trúc:
{
  "title": "${lessonName}",
  "grade": ${grade || 10},
  "bookSeries": "${bookSeries || 'Kết nối tri thức'}",
  "durationPeriods": ${durationPeriods || 2},
  "objectives": {
    "knowledge": ["Mục tiêu kiến thức 1", "Mục tiêu 2"],
    "competencies": ["Năng lực vật lý...", "Năng lực tự chủ..."],
    "qualities": ["Chăm chỉ...", "Trung thực trong thí nghiệm..."]
  },
  "equipment": ["Thiết bị và dụng cụ cần chuẩn bị..."],
  "activities": [
    {
      "name": "Hoạt động 1: Khởi động",
      "target": "Mục tiêu hoạt động",
      "content": "Nội dung giao cho học sinh",
      "product": "Sản phẩm học tập của học sinh",
      "implementation": "Các bước tổ chức của giáo viên và học sinh"
    },
    {
      "name": "Hoạt động 2: Hình thành kiến thức mới",
      "target": "Mục tiêu",
      "content": "Nội dung thí nghiệm / phân tích",
      "product": "Sản phẩm ghi chép / kết luận",
      "implementation": "Tiến trình tổ chức"
    },
    {
      "name": "Hoạt động 3: Luyện tập",
      "target": "Củng cố kiến thức",
      "content": "Bài tập câu hỏi",
      "product": "Lời giải",
      "implementation": "Phương pháp chữa bài"
    },
    {
      "name": "Hoạt động 4: Vận dụng",
      "target": "Ứng dụng thực tế",
      "content": "Tình huống đời sống",
      "product": "Báo cáo ngắn",
      "implementation": "Hướng dẫn tự học"
    }
  ],
  "assessment": "Phương pháp đánh giá học sinh",
  "references": "Tài liệu tham khảo"
}
Chỉ trả về JSON thuần túy, không có văn bản phụ bên ngoài.`;

    const rawText = await callGemini(prompt, systemInstruction);
    const cleanedJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanedJson);
    res.json(parsed);
  } catch (error: any) {
    console.error('Gemini Lesson Generator Error:', error);
    res.status(500).json({ error: error.message || 'Lỗi khi soạn giáo án bằng AI' });
  }
});

// 4. AI Generate Slide Outline
app.post('/api/gemini/generate-slide-outline', async (req, res) => {
  try {
    const { grade, topic, lessonTitle, slideCount } = req.body;

    const systemInstruction = `Bạn là chuyên gia thiết kế bài giảng điện tử PowerPoint môn Vật lý THPT.
Hãy tạo dàn ý bài trình chiếu trực quan, cô đọng, có câu hỏi tương tác và speaker notes cho giáo viên.
Trả về JSON.`;

    const prompt = `Tạo dàn ý bài giảng slide cho bài học:
- Khối lớp: ${grade || 10}
- Bài học: ${lessonTitle || 'Chuyển động thẳng biến đổi đều'}
- Chủ đề: ${topic || 'Động học'}
- Số lượng slide: ${slideCount || 8}

Trả về JSON:
{
  "deckTitle": "Tiêu đề bài giảng",
  "grade": ${grade || 10},
  "slides": [
    {
      "slideNumber": 1,
      "title": "Tiêu đề slide",
      "bulletPoints": ["Ý chính 1", "Ý chính 2", "Công thức trọng tâm"],
      "visualIdea": "Mô tả hình ảnh hoặc sơ đồ minh họa nên chèn",
      "speakerNotes": "Lời giảng gợi ý cho giáo viên",
      "interactiveQuestion": "Câu hỏi tương tác nhanh hỏi học sinh trên lớp"
    }
  ]
}
Chỉ trả về JSON thuần túy.`;

    const rawText = await callGemini(prompt, systemInstruction);
    const cleanedJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanedJson);
    res.json(parsed);
  } catch (error: any) {
    console.error('Gemini Slide Outline Error:', error);
    res.status(500).json({ error: error.message || 'Lỗi khi tạo dàn ý slide' });
  }
});

// 5. AI Generate Homework Assignments
app.post('/api/gemini/generate-assignment', async (req, res) => {
  try {
    const { grade, topic, title, differentiationLevel } = req.body;

    const systemInstruction = `Bạn là giáo viên Vật lý THPT phụ trách ra bài tập về nhà có phân hóa năng lực học sinh.
Phân hóa gồm 3 cấp độ:
- Cấp độ 1: Củng cố cơ bản (học sinh trung bình - yếu)
- Cấp độ 2: Vận dụng thực tế (học sinh khá)
- Cấp độ 3: Nâng cao, tư duy phân tích (học sinh giỏi)
Trả về JSON.`;

    const prompt = `Tạo bộ bài tập về nhà:
- Khối: ${grade || 10}
- Chủ đề: ${topic || 'Năng lượng và Công'}
- Tên bài: ${title || 'Bài tập Định luật bảo toàn cơ năng'}
- Yêu cầu trọng tâm: ${differentiationLevel || 'Đầy đủ 3 cấp độ, có bài toán tình huống thực tế đời sống'}

Trả về JSON:
{
  "title": "${title || 'Bài tập Vật lý'}",
  "grade": ${grade || 10},
  "topic": "${topic}",
  "totalPoints": 10,
  "tasks": [
    {
      "id": 1,
      "tier": "Cơ bản | Vận dụng | Nâng cao",
      "question": "Nội dung câu hỏi bài tập...",
      "solutionSteps": ["Bước 1...", "Bước 2...", "Đáp số: ..."],
      "points": 2.5
    }
  ],
  "guidanceForStudents": "Lời dặn dò phương pháp giải..."
}
Chỉ trả về JSON thuần túy.`;

    const rawText = await callGemini(prompt, systemInstruction);
    const cleanedJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanedJson);
    res.json(parsed);
  } catch (error: any) {
    console.error('Gemini Assignment Error:', error);
    res.status(500).json({ error: error.message || 'Lỗi khi tạo bài tập' });
  }
});

// 6. AI Personalized Feedback for Gradebook
app.post('/api/gemini/suggest-feedback', async (req, res) => {
  try {
    const { studentName, grade, scores, attendance, weakTopic } = req.body;

    const systemInstruction = `Bạn là giáo viên Vật lý THPT viết nhận xét học bạ / phiếu liên lạc sư phạm.
Nhận xét cần mang tính khích lệ, chỉ ra điểm mạnh và định hướng giải pháp cụ thể cho học sinh tiến bộ.`;

    const prompt = `Viết lời nhận xét cho học sinh:
- Tên học sinh: ${studentName || 'Nguyễn Văn A'}
- Lớp: ${grade || '10A1'}
- Điểm trung bình: ${scores || '6.8'}
- Chủ đề còn yếu: ${weakTopic || 'Phần bài tập Động lực học chất điểm'}
- Tinh thần học tập: ${attendance || 'Chuyên cần, phát biểu tích cực nhưng làm bài trắc nghiệm còn vội vàng'}`;

    const text = await callGemini(prompt, systemInstruction);
    res.json({ feedback: text });
  } catch (error: any) {
    console.error('Gemini Feedback Error:', error);
    res.status(500).json({ error: error.message || 'Lỗi khi tạo nhận xét học tập' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    appName: 'Physics Teacher Assistant',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Server boot with Vite middleware integration
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`[Physics Assistant] Server is live on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
