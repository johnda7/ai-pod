
import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Mic } from 'lucide-react';
import { ChatMessage, User } from '@/types';
import { askKatya } from '../services/geminiService';
import { KATYA_VARIANTS } from '../constants';

type CharacterState = 'IDLE' | 'LISTENING' | 'SPEAKING';

const useCharacterAnimation = (state: CharacterState) => {
  const [currentFrame, setCurrentFrame] = useState(KATYA_VARIANTS.IDLE);
  const blinkInterval = useRef<number | null>(null);
  const talkInterval = useRef<number | null>(null);

  useEffect(() => {
    Object.values(KATYA_VARIANTS).forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  useEffect(() => {
    if (blinkInterval.current) {
        clearInterval(blinkInterval.current);
        blinkInterval.current = null;
    }
    if (talkInterval.current) {
        clearInterval(talkInterval.current);
        talkInterval.current = null;
    }

    if (state === 'IDLE' || state === 'LISTENING') {
      setCurrentFrame(KATYA_VARIANTS.IDLE);
      blinkInterval.current = window.setInterval(() => {
        setCurrentFrame(KATYA_VARIANTS.BLINK);
        setTimeout(() => setCurrentFrame(KATYA_VARIANTS.IDLE), 200); 
      }, 3500); 
    }

    if (state === 'SPEAKING') {
      let toggle = false;
      talkInterval.current = window.setInterval(() => {
         setCurrentFrame(toggle ? KATYA_VARIANTS.TALK : KATYA_VARIANTS.TALK_OPEN);
         toggle = !toggle;
      }, 150);
    }

    return () => {
        if (blinkInterval.current) clearInterval(blinkInterval.current);
        if (talkInterval.current) clearInterval(talkInterval.current);
    };
  }, [state]);

  return currentFrame;
};

interface KatyaChatProps {
    user?: User;
}

export const KatyaChat: React.FC<KatyaChatProps> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('katya_chat_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn("Failed to load chat history", e);
    }
    return [{ id: '1', sender: 'katya', text: 'Йо! Я Катя. Чего хотел?', timestamp: Date.now() }];
  });

  const [inputText, setInputText] = useState('');
  const [characterState, setCharacterState] = useState<CharacterState>('IDLE');
  
  const currentFrame = useCharacterAnimation(characterState);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem('katya_chat_history', JSON.stringify(messages));
    } catch (e) {
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setCharacterState('LISTENING');

    try {
        await new Promise(resolve => setTimeout(resolve, 600));
        setCharacterState('SPEAKING');
        
        const context = user ? `Level: ${user.level}, XP: ${user.xp}, Style: ${user.learningStyle}` : 'Unknown user';
        const interest = user?.interest || 'General';
        
        const responseText = await askKatya(userMsg.text, context, interest);
        
        const katyaMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            sender: 'katya',
            text: responseText,
            timestamp: Date.now()
        };
        
        setMessages(prev => [...prev, katyaMsg]);
        
        const readingTime = Math.min(Math.max(responseText.length * 50, 1500), 5000);
        setTimeout(() => {
            setCharacterState('IDLE');
        }, readingTime);

    } catch (error) {
        setCharacterState('IDLE');
        console.error("Chat error:", error);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-4 z-40 w-16 h-16 bg-white rounded-full shadow-2xl border-4 border-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all group overflow-hidden"
      >
          <div className="absolute inset-0 bg-indigo-50"></div>
          <img src={KATYA_VARIANTS.IDLE} alt="Katya" className="w-full h-full object-cover transform scale-125 translate-y-2 group-hover:scale-110 transition-transform" />
          <div className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></div>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-end sm:items-end pointer-events-none">
        <div className="absolute inset-0 bg-black/20 sm:bg-transparent pointer-events-auto" onClick={() => setIsOpen(false)}></div>
        
        <div 
            className="pointer-events-auto w-full h-[80vh] sm:w-[400px] sm:h-[600px] sm:mr-4 sm:mb-24 bg-slate-50 rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300 border border-slate-200"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="bg-white p-4 border-b border-slate-100 flex items-center justify-between shrink-0 relative z-20">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 overflow-hidden border-2 border-white shadow-md relative">
                        <img src={currentFrame} alt="Katya" className="w-full h-full object-cover transform scale-125 translate-y-1" />
                    </div>
                    <div>
                        <h3 className="font-black text-slate-800 text-lg leading-none">Катя</h3>
                        <div className="flex items-center gap-1 mt-1">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Online</span>
                        </div>
                    </div>
                </div>
                <button 
                    onClick={() => setIsOpen(false)}
                    className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
                >
                    <X size={20} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-4 rounded-2xl text-sm font-medium leading-relaxed shadow-sm ${
                            msg.sender === 'user' 
                            ? 'bg-indigo-600 text-white rounded-tr-none' 
                            : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none'
                        }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                
                {characterState === 'LISTENING' && (
                     <div className="flex justify-start">
                        <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm flex gap-1.5 items-center">
                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-75"></div>
                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-150"></div>
                        </div>
                    </div>
                )}
                
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white border-t border-slate-100 shrink-0">
                <div className="flex items-center gap-2 bg-slate-100 p-2 rounded-[1.5rem] border border-slate-200 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
                    <button className="w-10 h-10 rounded-full bg-white text-slate-400 flex items-center justify-center hover:text-indigo-600 shadow-sm transition-colors">
                        <Mic size={20} />
                    </button>
                    <input 
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Напиши сообщение..." 
                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium placeholder:text-slate-400 text-slate-800 min-w-0"
                    />
                    <button 
                        onClick={handleSendMessage}
                        disabled={!inputText.trim()}
                        className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-95"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};
