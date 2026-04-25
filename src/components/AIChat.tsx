import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, Send, X, Bot, Loader2, Sparkles, Zap } from 'lucide-react';
import { ItineraryData } from '../types';

interface AIChatProps {
  currentData: ItineraryData;
  onUpdate: (newData: ItineraryData) => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIChat({ currentData, onUpdate }: AIChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Lazy initialize Gemini to avoid crashing if key is missing
  const getAI = () => {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('GEMINI_API_KEY is not configured. Please add it to .env.example');
    }
    return new GoogleGenAI({ apiKey: key });
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const ai = getAI();
      // Create a lightweight version of data to save tokens and prevent truncation
      const promptData = {
        title: currentData.title,
        subtitle: currentData.subtitle,
        adultCount: currentData.adultCount,
        summary: currentData.summary,
        // Only send essential itinerary info
        itinerary: currentData.itinerary.map(day => ({
          date: day.date,
          title: day.title,
          activities: day.activities.map(a => ({ 
            time: a.time, 
            description: a.description, 
            type: a.type 
          }))
        })),
        quickExpenses: currentData.quickExpenses?.slice(-20) || [] // Only send last 20 expenses
      };

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          {
            role: 'user',
            parts: [{
              text: `Current State (truncated): ${JSON.stringify(promptData)}
Request: ${userMsg}

Instruction: Update the travel JSON. Rules:
1. AdultCount: ${currentData.adultCount || 8}.
2. Travel Metadata: 6 ngày 5 đêm, 4 đêm Đà Nẵng (18/6-23/6).
3. Google Maps: venue/activity/hotel MUST have search link in 'mapLink'.
4. Expense Tracking (quickExpenses):
   - AI MUST parse complex commands with multiple entries (e.g., "A paid X for Y, B paid Z...").
   - Valid payers: ["QAnh", "Linh", "NA", "Sơn", "Bố Thắng", "Mẹ Hà", "Dì Hương", "Cậu Thành"].
   - IMPORTANT: If user says "tôi", map to "QAnh".
   - Return ONLY the list of NEW entries to be added to quickExpenses. Generate unique IDs.
5. Return JSON: {"explanation": "...", "newQuickExpenses": [...], "updatedMetadata": {"title": "...", "subtitle": "...", "adultCount": ...}, "itineraryUpdates": [...]}

Note: If updating itinerary, only return the modified days.`
            }]
          }
        ],
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              explanation: { type: Type.STRING },
              newQuickExpenses: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    description: { type: Type.STRING },
                    amount: { type: Type.NUMBER },
                    payer: { type: Type.STRING },
                    date: { type: Type.STRING }
                  }
                }
              },
              updatedMetadata: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  subtitle: { type: Type.STRING },
                  adultCount: { type: Type.NUMBER }
                }
              },
              itineraryUpdates: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    date: { type: Type.STRING },
                    title: { type: Type.STRING },
                    distance: { type: Type.STRING },
                    activities: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          time: { type: Type.STRING },
                          description: { type: Type.STRING },
                          type: { type: Type.STRING },
                          mapLink: { type: Type.STRING },
                        }
                      }
                    }
                  }
                }
              }
            },
            required: ['explanation']
          }
        }
      });

      const res = JSON.parse(response.text || '{}');
      
      // Smart merging logic
      const updatedData = { ...currentData };
      
      if (res.newQuickExpenses) {
        updatedData.quickExpenses = [...(currentData.quickExpenses || []), ...res.newQuickExpenses];
      }
      
      if (res.updatedMetadata) {
        if (res.updatedMetadata.title) updatedData.title = res.updatedMetadata.title;
        if (res.updatedMetadata.subtitle) updatedData.subtitle = res.updatedMetadata.subtitle;
        if (res.updatedMetadata.adultCount) updatedData.adultCount = res.updatedMetadata.adultCount;
      }
      
      if (res.itineraryUpdates) {
        updatedData.itinerary = currentData.itinerary.map(day => {
          const update = res.itineraryUpdates.find((u: any) => u.date === day.date);
          return update ? { ...day, ...update } : day;
        });
      }

      onUpdate(updatedData);
      setMessages(prev => [...prev, { role: 'assistant', content: res.explanation || 'Đã cập nhật yêu cầu của bạn!' }]);
    } catch (error) {
      console.error('AI Error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Xin lỗi, có lỗi xảy ra khi xử lý yêu cầu của bạn.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-sky-500 text-white rounded-full shadow-2xl overflow-hidden group cursor-pointer"
      >
        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        <Sparkles className="w-6 h-6" />
      </motion.button>

      {/* Chat Popup Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden h-[80vh] max-h-[600px] border border-sky-100"
            >
              {/* Header */}
              <div className="p-5 bg-sky-500 text-white flex justify-between items-center bg-gradient-to-r from-sky-500 to-blue-600 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <Sparkles size={24} className="animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg leading-tight uppercase tracking-tighter">Trợ lý Thông minh</h3>
                    <p className="text-[10px] opacity-80 uppercase tracking-widest font-bold">Quy hoạch & Chia tiền đoàn</p>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-2 rounded-full transition-colors cursor-pointer">
                  <X size={24} />
                </button>
              </div>

              {/* Messages */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                {messages.length === 0 && (
                  <div className="text-center py-10 px-6">
                    <div className="w-16 h-16 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Sparkles size={32} />
                    </div>
                    <h4 className="font-bold text-slate-800 mb-2">Chào bạn!</h4>
                    <p className="text-sm text-slate-500">Tôi có thể giúp bạn chỉnh sửa lịch trình, thêm địa điểm ăn uống hoặc điều chỉnh ngân sách.</p>
                    <div className="mt-4 grid grid-cols-1 gap-2 text-left">
                      <button 
                        onClick={() => setInput('Đổi tiêu đề thành "Kỳ nghỉ hè 2026"')}
                        className="text-xs p-2 bg-white border border-sky-100 hover:border-sky-300 rounded-lg text-slate-600 transition-colors"
                      >
                        "Đổi tiêu đề..."
                      </button>
                      <button 
                        onClick={() => setInput('Thêm một bữa tối hải sản vào ngày 21/06')}
                        className="text-xs p-2 bg-white border border-sky-100 hover:border-sky-300 rounded-lg text-slate-600 transition-colors"
                      >
                        "Thêm bữa tối..."
                      </button>
                    </div>
                  </div>
                )}
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-sky-500 text-white rounded-tr-none' 
                        : 'bg-white text-slate-700 border border-sky-50 rounded-tl-none'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-sky-50 p-3 rounded-2xl text-sm flex items-center gap-2 text-slate-400">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Đang xử lý...
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-slate-100">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Yêu cầu thay đổi..."
                    className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                  <button
                    onClick={handleSend}
                    disabled={isLoading || !input.trim()}
                    className="p-3 bg-sky-500 text-white rounded-xl hover:bg-sky-600 disabled:opacity-50 transition-colors shadow-md cursor-pointer"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
