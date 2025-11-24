
import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Mic } from 'lucide-react';
import { ChatMessage } from '../types';
import { askKatya } from '../services/geminiService';
import { KATYA_IMAGE_URL } from '../constants';
import { useRive, useStateMachineInput } from '@rive-app/react-canvas';

type CharacterState = 'IDLE' | 'LISTENING' | 'SPEAKING';

// Demo Rive URL - Replace this with your specific 'katya.riv' file URL
const RIVE_URL = "https://cdn.rive.app/animations/vehicles.riv"; 
// A better character placeholder for demo purposes (if accessible):
// const RIVE_URL = "https://public.rive.app/community/runtime-files/2063-4139-example-character.riv"; 

export const KatyaChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '0', sender: 'katya', text: 'Привет! Я на связи. Чем могу помочь?', timestamp: Date.now() }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [characterState, setCharacterState] = useState<CharacterState>('IDLE');

  // --- RIVE SETUP ---
  const { rive, RiveComponent } = useRive({
    src: "https://cdn.rive.app/animations/hero_use_case.riv", // Using a robust public demo file
    stateMachines: "State Machine 1", // Ensure this matches your Rive file's state machine name
    // Layout, Fit, and Alignment removed due to import issues with current CDN build.
    // Default is usually Fit.Contain and Alignment.Center
    autoplay: true,
  });

  // Example Inputs - Adjust 'isSpeaking' / 'isListening' to match your Rive file inputs
  const isSpeakingInput = useStateMachineInput(rive, "State Machine 1", "isSpeaking");
  const isListeningInput = useStateMachineInput(rive, "State Machine 1", "isListening"); // Or 'Level' for audio reactivity

  // Sync React State with Rive Inputs
  useEffect(() => {
    if (rive && isSpeakingInput && isListeningInput) {
        if (characterState === 'SPEAKING') {
            isSpeakingInput.value = true;
            isListeningInput.value = false;
        } else if (characterState === 'LISTENING') {
            isSpeakingInput.value = false;
            isListeningInput.value = true;
        } else {
            // IDLE
            isSpeakingInput.value = false;
            isListeningInput.value = false;
        }
    }
  }, [characterState, rive, isSpeakingInput, isListeningInput]);
  // ------------------

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputValue,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);
    setCharacterState('LISTENING'); // Katya is "processing/listening"

    try {
        const responseText = await askKatya(userMsg.text, "User is a teen learning about soft skills", "Gaming");
        
        setIsTyping(false);
        setCharacterState('SPEAKING');

        const botMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'katya',
          text: responseText,
          timestamp: Date.now()
        };
        
        setMessages(prev => [...prev, botMsg]);
        
        // Return to IDLE after reading time
        setTimeout(() => {
            setCharacterState('IDLE');
        }, Math.min(responseText.length * 50, 5000));
    } catch (e) {
        setIsTyping(false);
        setCharacterState('IDLE');
    }
  };

  // Helper to render the Avatar (Rive or Fallback Image)
  const renderAvatar = () => (
      <div className="w-full h-full relative">
          {/* Fallback Image (shows if Rive fails or loads) */}
          <img 
            src={KATYA_IMAGE_URL} 
            className="absolute inset-0 w-full h-full object-cover" 
            alt="Katya" 
          />
          
          {/* Rive Layer */}
          {rive && (
              <div className="absolute inset-0 bg-[#0A0F1C] bg-opacity-10"> 
                  <RiveComponent className="w-full h-full object-cover" />
              </div>
          )}
      </div>
  );

  return (
    <>
      {/* Trigger Button (Minimised) */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 right-4 z-40 group hover:scale-105 transition-transform duration-300"
        >
          <div className="relative">
             {/* Pulsing rings for attention */}
             <div className="absolute inset-0 bg-indigo-500 rounded-full animate-ping opacity-20"></div>
             
             {/* Main Circle */}
             <div className="relative w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-indigo-500 to-purple-600 shadow-[0_10px_30px_rgba(79,70,229,0.4)] overflow-hidden">
                 <div className="w-full h-full rounded-full overflow-hidden border-2 border-white bg-slate-900">
                    {renderAvatar()}
                 </div>
                 
                 {/* Online Status Dot */}
                 <div className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-[#0A0F1C] z-10 shadow-sm"></div>
             </div>
          </div>
        </button>
      )}

      {/* Chat Window (Maximized) */}
      {isOpen && (
        <div className="fixed bottom-0 right-0 w-full md:w-96 md:bottom-4 md:right-4 z-50 flex flex-col h-[85vh] md:h-[650px] bg-white/95 backdrop-blur-2xl md:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-500 border border-white/40 ring-1 ring-black/5">
           
           {/* Header with Large Avatar */}
           <div className="relative bg-gradient-to-b from-indigo-50 to-white/50 p-6 pb-4 border-b border-slate-100 z-10">
              <button 
                onClick={() => setIsOpen(false)} 
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/60 hover:bg-white flex items-center justify-center text-slate-500 transition-colors backdrop-blur-sm shadow-sm"
              >
                  <X size={18} />
              </button>

              <div className="flex flex-col items-center">
                  <div className="relative mb-3">
                      {/* Active Status Ring */}
                      {(characterState === 'SPEAKING' || isTyping) && (
                          <>
                            <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 animate-[spin_3s_linear_infinite] opacity-50"></div>
                            <div className="absolute -inset-2 rounded-full border border-indigo-200 animate-ping opacity-30"></div>
                          </>
                      )}
                      
                      {/* Avatar Container */}
                      <div className="relative w-24 h-24 rounded-full border-4 border-white shadow-xl overflow-hidden bg-slate-100">
                           {renderAvatar()}
                      </div>
                  </div>
                  
                  <h3 className="font-black text-2xl text-slate-800 tracking-tight leading-none">Катя</h3>
                  <div className="flex items-center gap-1.5 mt-1">
                      {characterState === 'SPEAKING' || isTyping ? (
                          <>
                             <div className="flex gap-0.5 items-end h-3">
                                 <div className="w-1 h-2 bg-indigo-500 rounded-full animate-[bounce_0.8s_infinite]"></div>
                                 <div className="w-1 h-3 bg-indigo-500 rounded-full animate-[bounce_1s_infinite]"></div>
                                 <div className="w-1 h-1.5 bg-indigo-500 rounded-full animate-[bounce_1.2s_infinite]"></div>
                             </div>
                             <span className="text-xs font-bold text-indigo-500">Печатает...</span>
                          </>
                      ) : (
                          <>
                            <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                            <span className="text-xs font-bold text-slate-400">В сети</span>
                          </>
                      )}
                  </div>
              </div>
           </div>

           {/* Messages Area */}
           <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
              {messages.map((msg) => (
                  <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                      {msg.sender === 'katya' && (
                          <span className="text-[10px] font-bold text-slate-400 ml-3 mb-1 uppercase tracking-wider">Катя</span>
                      )}
                      <div className={`max-w-[85%] px-5 py-3.5 rounded-2xl text-sm font-medium leading-relaxed shadow-sm ${
                          msg.sender === 'user' 
                          ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-br-none shadow-indigo-500/20' 
                          : 'bg-white text-slate-700 rounded-bl-none border border-slate-100'
                      }`}>
                          {msg.text}
                      </div>
                  </div>
              ))}
              
              {isTyping && (
                  <div className="flex items-end gap-2">
                       <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-200 mb-2 opacity-50">
                           <img src={KATYA_IMAGE_URL} className="w-full h-full object-cover" alt="" />
                       </div>
                       <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-none shadow-sm border border-slate-100 flex gap-1">
                          <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                          <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-75"></div>
                          <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-150"></div>
                      </div>
                  </div>
              )}
              <div ref={messagesEndRef} />
           </div>

           {/* Input Area */}
           <div className="p-4 bg-white border-t border-slate-100 flex gap-2 shrink-0 relative z-20">
               <input 
                  type="text" 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Напиши сообщение..."
                  className="flex-1 bg-slate-100 border-none rounded-[1.2rem] px-5 py-3.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all placeholder:text-slate-400"
               />
               <button 
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isTyping}
                  className="w-12 h-12 flex items-center justify-center bg-indigo-600 text-white rounded-full hover:bg-indigo-700 hover:scale-105 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/30"
               >
                   <Send size={20} className="ml-0.5" strokeWidth={2.5} />
               </button>
           </div>
        </div>
      )}
    </>
  );
};
