import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Sparkles, Mic, BarChart3 } from 'lucide-react';
import { ChatMessage } from '../types';
import { askKatya } from '../services/geminiService';
import { KATYA_VARIANTS } from '../constants';

type CharacterState = 'IDLE' | 'LISTENING' | 'SPEAKING';

// Hook to manage the character's visual frame based on state
const useCharacterAnimation = (state: CharacterState) => {
  const [currentFrame, setCurrentFrame] = useState(KATYA_VARIANTS.IDLE);
  const blinkInterval = useRef<number | null>(null);
  const talkInterval = useRef<number | null>(null);

  // Preload images to prevent flickering
  useEffect(() => {
    Object.values(KATYA_VARIANTS).forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  useEffect(() => {
    // Clear previous intervals
    if (blinkInterval.current) clearInterval(blinkInterval.current);
    if (talkInterval.current) clearInterval(talkInterval.current);

    if (state === 'IDLE' || state === 'LISTENING') {
      setCurrentFrame(KATYA_VARIANTS.IDLE);
      
      // Random blinking
      blinkInterval.current = window.setInterval(() => {
        setCurrentFrame(KATYA_VARIANTS.BLINK);
        setTimeout(() => {
          setCurrentFrame(KATYA_VARIANTS.IDLE);
        }, 200); 
      }, 3500); 
    }

    if (state === 'SPEAKING') {
      // Talking animation: rapid swap
      let toggle = false;
      talkInterval.current = window.setInterval(() => {
        toggle = !toggle;
        setCurrentFrame(toggle ? KATYA_VARIANTS.TALK : KATYA_VARIANTS.TALK_OPEN);
      }, 150); 
    }

    return () => {
      if (blinkInterval.current) clearInterval(blinkInterval.current);
      if (talkInterval.current) clearInterval(talkInterval.current);
    };
  }, [state]);

  return currentFrame;
};

export const KatyaChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '0', sender: 'katya', text: 'Привет! Я Катя. Готова покорять мир? 🚀', timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [charState, setCharState] = useState<CharacterState>('IDLE');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const avatarSrc = useCharacterAnimation(charState);

  // Auto-scroll
  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  // State Machine Logic
  useEffect(() => {
    if (isLoading) {
      setCharState('SPEAKING');
    } else if (input.length > 0) {
      setCharState('LISTENING');
    } else {
      setCharState('IDLE');
    }
  }, [isLoading, input]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const aiResponseText = await askKatya(input, "Пользователь проходит 1-ю неделю курса.");

    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      sender: 'katya',
      text: aiResponseText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, aiMsg]);
    setIsLoading(false);
  };

  const getContainerClass = () => {
    switch (charState) {
      case 'SPEAKING': return 'anim-speak';
      case 'LISTENING': return 'anim-listen';
      default: return 'anim-idle';
    }
  };

  const getAuraColor = () => {
    switch (charState) {
      case 'SPEAKING': return 'from-purple-400 via-pink-400 to-indigo-400';
      case 'LISTENING': return 'from-indigo-400 via-blue-400 to-teal-400';
      default: return 'from-indigo-500 via-purple-500 to-blue-500';
    }
  };

  return (
    <>
      {/* Floating Character Bubble (Idle State) */}
      {!isOpen && (
        <div className="fixed bottom-24 right-4 z-50 flex flex-col items-end gap-2 animate-in fade-in zoom-in duration-300">
          <div className="bg-white px-3 py-2 rounded-xl rounded-br-none shadow-lg text-xs font-bold text-indigo-900 animate-bounce-soft mb-1 mr-2 border border-indigo-100">
             Поиграем? 👋
          </div>
          
          <button
            onClick={() => setIsOpen(true)}
            className="relative w-20 h-20 group transition-transform hover:scale-105 focus:outline-none"
          >
             <div className="absolute inset-0 bg-indigo-500 rounded-full opacity-20 animate-ping"></div>
             <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full shadow-xl flex items-center justify-center p-1 overflow-hidden">
                <img 
                    src={KATYA_VARIANTS.IDLE} 
                    alt="Katya" 
                    className="w-full h-full bg-indigo-50 object-cover anim-idle" 
                />
             </div>
             <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-400 rounded-full border-4 border-white shadow-sm"></div>
          </button>
        </div>
      )}

      {/* Full Character Interface */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white md:inset-auto md:bottom-20 md:right-4 md:w-[400px] md:h-[650px] md:rounded-3xl md:shadow-2xl md:border md:border-slate-200 overflow-hidden font-sans animate-in slide-in-from-bottom-10 duration-300">
          
          {/* CHARACTER STAGE */}
          <div className="relative h-56 overflow-visible shrink-0 bg-slate-50 z-10">
            {/* Dynamic Animated Background */}
            <div className={`absolute inset-0 bg-gradient-to-b ${getAuraColor()} opacity-10 transition-colors duration-1000 overflow-hidden`}></div>
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-tr ${getAuraColor()} rounded-full blur-3xl opacity-40 anim-aura transition-colors duration-1000`}></div>
            
            {/* Close Button */}
            <div className="absolute top-4 right-4 z-30">
                 <button onClick={() => setIsOpen(false)} className="bg-white/30 hover:bg-white/50 text-slate-700 p-2 rounded-full backdrop-blur-md transition-colors shadow-sm">
                    <X size={20} />
                 </button>
            </div>

            {/* Voice Visualizer */}
            {charState === 'SPEAKING' && (
                <div className="absolute top-1/2 left-8 transform -translate-y-1/2 flex gap-1 z-10 opacity-50">
                    <div className="w-1 h-8 bg-indigo-600 rounded-full animate-pulse delay-75"></div>
                    <div className="w-1 h-12 bg-indigo-600 rounded-full animate-pulse delay-150"></div>
                    <div className="w-1 h-6 bg-indigo-600 rounded-full animate-pulse delay-0"></div>
                </div>
            )}

            {/* The "Live" Character Container */}
            {/* Removed tight cropping/masking so animation is more visible */}
            <div className="absolute bottom-[-20px] left-1/2 -translate-x-1/2 flex flex-col items-center z-20 w-full pointer-events-none">
                 <div className={`relative w-52 h-52 transition-all duration-500 ease-out origin-bottom ${getContainerClass()}`}>
                     <img 
                        src={avatarSrc} 
                        alt="Katya" 
                        className="w-full h-full object-contain drop-shadow-2xl transition-none transform translate-y-4" 
                     />
                 </div>
                 
                 {/* Status Indicator Pill */}
                 <div className="bg-white/80 backdrop-blur px-4 py-1.5 rounded-full shadow-sm -mt-6 border border-white/50 flex items-center gap-2 z-30 transform transition-all duration-300">
                     <span className="font-extrabold text-indigo-900 text-sm">
                        {charState === 'SPEAKING' ? 'Говорит...' : charState === 'LISTENING' ? 'Слушает...' : 'Катя'}
                     </span>
                     {charState === 'SPEAKING' ? (
                         <BarChart3 size={16} className="text-indigo-500 animate-pulse" />
                     ) : charState === 'LISTENING' ? (
                        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping"></div>
                     ) : (
                        <Sparkles size={12} className="text-yellow-500" />
                     )}
                 </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50 space-y-6 relative z-0 pt-10">
            {messages.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 text-sm opacity-60">
                    <Sparkles size={32} className="mb-2 text-indigo-200" />
                    <span>Начни общение с Катей</span>
                </div>
            )}
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm relative group ${
                  msg.sender === 'user' 
                    ? 'bg-indigo-600 text-white rounded-br-none' 
                    : 'bg-white border border-indigo-50 text-slate-800 rounded-bl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Controls Area */}
          <div className="p-3 bg-white border-t border-slate-100 z-20">
            <div className={`flex items-center gap-2 bg-slate-100 p-1.5 rounded-[1.5rem] border transition-all duration-300 ${charState === 'LISTENING' ? 'ring-2 ring-indigo-400 bg-white border-indigo-200' : 'border-slate-200'}`}>
                <button className="p-2 text-slate-400 hover:text-indigo-500 transition-colors rounded-full hover:bg-slate-100 active:scale-95">
                    <Mic size={20} />
                </button>
                <input
                  type="text"
                  value={input}
                  onFocus={() => setCharState('LISTENING')}
                  onBlur={() => !input && setCharState('IDLE')}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Напиши сообщение..."
                  className="flex-1 bg-transparent border-none text-sm focus:ring-0 text-slate-800 placeholder:text-slate-400"
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:scale-95 transition-all shadow-md"
                >
                  <Send size={18} />
                </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};