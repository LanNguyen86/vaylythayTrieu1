import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Atom,
  RotateCcw,
  BookOpen,
  CheckCircle,
  Lightbulb,
  FileQuestion,
  HelpCircle,
  Zap,
} from 'lucide-react';
import { geminiApi } from '../../services/geminiApi';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const AiAssistantView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      role: 'assistant',
      content: `Xin chào Thầy/Cô! Tôi là Trợ lý AI Giảng viên Vật lý THPT.
Tôi có thể hỗ trợ Thầy/Cô:
1. Giải chi tiết các bài toán Vật lý lớp 10, 11, 12 theo từng bước chuẩn hóa đơn vị SI.
2. Kiểm tra tính nhất quán của công thức, dữ kiện và đáp án đề thi.
3. Đề xuất thí nghiệm thực hành trực quan và giải thích hiện tượng đời sống.
4. Xây dựng kế hoạch ôn tập chuyên đề hoặc tạo câu hỏi trắc nghiệm nhanh.

Thầy/Cô muốn trao đổi hoặc cần hỗ trợ chuyên đề nào hôm nay?`,
      timestamp: '08:00',
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState('10');
  const [selectedTopic, setSelectedTopic] = useState('Động lực học chất điểm');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    {
      label: 'Giải bài toán hãm phanh (Lớp 10)',
      prompt: 'Một ôtô đang chạy với tốc độ 20 m/s thì hãm phanh chuyển động chậm dần đều với gia tốc 2 m/s². Hãy giải từng bước: quãng đường xe đi được đến khi dừng hẳn và thời gian chuyển động, kiểm tra kỹ đơn vị SI.',
      grade: '10',
      topic: 'Động học',
    },
    {
      label: 'Kiểm tra đơn vị & công thức cơ năng',
      prompt: 'Hãy phân tích điều kiện bảo toàn cơ năng trong trường trọng lực và các đơn vị tương đương của Joule (J = N.m = kg.m²/s² = W.s).',
      grade: '10',
      topic: 'Năng lượng và Công',
    },
    {
      label: 'Gợi ý thí nghiệm con lắc đơn (Lớp 11)',
      prompt: 'Gợi ý phương án thí nghiệm đo gia tốc trọng trường g bằng con lắc đơn cho học sinh lớp 11: dụng cụ cần có, các bước tiến hành, cách xử lý sai số và đồ thị T² theo l.',
      grade: '11',
      topic: 'Dao động điều hòa',
    },
    {
      label: 'Giải thích hiện tượng Cầu vồng (Lớp 11)',
      prompt: 'Giải thích hiện tượng cầu vồng đôi và góc lệch của tia sáng qua giọt nước mưa dưới góc độ Vật lý 11 (khúc xạ, phản xạ toàn phần và tán sắc).',
      grade: '11',
      topic: 'Quang học sóng',
    },
    {
      label: 'Chu trình khí lý tưởng (Lớp 12)',
      prompt: 'Cho khối khí lý tưởng thực hiện chu trình biến đổi kín gồm 3 quá trình: đẳng nhiệt, đẳng tích và đẳng áp. Hướng dẫn học sinh cách tính công sinh ra và hiệu suất chu trình trên hệ trục p - V.',
      grade: '12',
      topic: 'Khí lý tưởng',
    },
  ];

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const replyText = await geminiApi.chat(text, history, `Lớp ${selectedGrade}`, selectedTopic);

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: replyText,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (e: any) {
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: `Xin lỗi Thầy/Cô, đã có sự cố kết nối: ${e.message}`,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
      {/* Header controls bar */}
      <div className="p-3.5 border-b border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <Atom className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 leading-tight">
              Phòng làm việc Trợ lý AI Vật lý THPT
            </h3>
            <p className="text-[11px] text-slate-500 leading-none">
              Mô hình chuyên sâu Gemini 3.8 Flash · Định hướng GDPT 2018
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2 py-1">
            <span className="text-slate-500 font-medium">Khối:</span>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="font-bold text-blue-700 bg-transparent focus:outline-hidden"
            >
              <option value="10">Lớp 10</option>
              <option value="11">Lớp 11</option>
              <option value="12">Lớp 12</option>
            </select>
          </div>

          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2 py-1">
            <span className="text-slate-500 font-medium">Chủ đề:</span>
            <input
              type="text"
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="text-slate-800 font-medium bg-transparent focus:outline-hidden w-36 truncate"
            />
          </div>

          <button
            onClick={() => setMessages([messages[0]])}
            title="Làm mới phiên trò chuyện"
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 rounded transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Quick Prompts Bar */}
      <div className="px-4 py-2 bg-slate-100/50 border-b border-slate-200/60 overflow-x-auto flex items-center gap-2 no-scrollbar">
        <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap flex items-center gap-1">
          <Zap className="w-3 h-3 text-amber-500" />
          <span>Gợi ý nhanh:</span>
        </span>
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => {
              setSelectedGrade(qp.grade);
              setSelectedTopic(qp.topic);
              handleSend(qp.prompt);
            }}
            className="text-[11px] px-2.5 py-1 bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 rounded-full whitespace-nowrap text-slate-700 transition-colors shrink-0 shadow-2xs"
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-slate-50/30">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-3 max-w-3xl ${
              m.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold shadow-2xs ${
                m.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-900 text-white'
              }`}
            >
              {m.role === 'user' ? 'GV' : 'AI'}
            </div>

            <div
              className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                m.role === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-xs font-medium'
                  : 'bg-white border border-slate-200/80 text-slate-900 rounded-tl-xs'
              }`}
            >
              <div className="whitespace-pre-wrap">{m.content}</div>
              <div
                className={`text-[10px] mt-1.5 font-mono text-right ${
                  m.role === 'user' ? 'text-blue-200' : 'text-slate-400'
                }`}
              >
                {m.timestamp}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-3 max-w-xl mr-auto">
            <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0 text-xs font-bold">
              AI
            </div>
            <div className="p-3.5 bg-white border border-slate-200/80 rounded-2xl rounded-tl-xs shadow-2xs">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span>Trợ lý AI đang suy luận và kiểm tra đơn vị SI...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={chatBottomRef} />
      </div>

      {/* Input controls box */}
      <div className="p-3 bg-white border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Nhập câu hỏi Vật lý, yêu cầu giải bài tập, kiểm tra công thức hoặc soạn bài..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-40 text-white font-semibold text-xs rounded-xl transition-colors shadow-2xs flex items-center gap-1.5 shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Gửi</span>
          </button>
        </form>
      </div>
    </div>
  );
};
