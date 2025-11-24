
import React, { useState, useEffect } from 'react';
import { Task } from '../types';
import { X, Play, Trophy, ArrowRight, Star, Sparkles, BookOpen, Terminal, Check, ScanLine } from 'lucide-react';
import { adaptTaskContent } from '../services/geminiService';
import { KATYA_IMAGE_URL } from '../constants';

interface TaskModalProps {
  task: Task;
  isOpen: boolean;
  userInterest: string;
  isPreviouslyCompleted: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({ task, isOpen, userInterest, isPreviouslyCompleted, onClose, onComplete }) => {
  const [step, setStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [isCompleted, setIsCompleted] = useState(isPreviouslyCompleted);
  const [adaptedText, setAdaptedText] = useState<string>('');
  const [isLoadingAI, setIsLoadingAI] = useState(true);
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    if (isOpen) {
        // Simulate scanning effect
        const scanTimer = setTimeout(() => setIsScanning(false), 1500);

        setIsLoadingAI(true);
        adaptTaskContent(task.title, task.description, userInterest)
            .then(text => {
                setAdaptedText(text);
                setIsLoadingAI(false);
            });
        
        return () => clearTimeout(scanTimer);
    }
  }, [task, isOpen, userInterest]);

  if (!isOpen) return null;

  const handleQuizAnswer = (optionIndex: number) => {
    if (isPreviouslyCompleted) return;

    const newAnswers = [...quizAnswers];
    newAnswers[step] = optionIndex;
    setQuizAnswers(newAnswers);
    setTimeout(() => {
       if (task.content?.questions && step < task.content.questions.length - 1) {
         setStep(step + 1);
       } else {
         setIsCompleted(true);
       }
    }, 500);
  };

  const handleCompleteAction = () => {
      if (isPreviouslyCompleted) {
          onClose();
      } else {
          onComplete(); 
      }
  };

  const getTaskTypeLabel = (type: string) => {
      switch(type) {
          case 'VIDEO': return 'ВИДЕО';
          case 'QUIZ': return 'ТЕСТ';
          case 'ACTION': return 'ДЕЙСТВИЕ';
          default: return 'ЗАДАНИЕ';
      }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4">
      {/* Dark Overlay with Grid */}
      <div className="absolute inset-0 bg-[#020617]/90 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose}>
         <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.05)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
      </div>
      
      {/* Modal Content */}
      <div className="bg-[#0A0F1C] w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-[0_0_80px_rgba(79,70,229,0.3)] overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-500 relative border border-indigo-500/30">
        
        {/* Scanning Effect Overlay */}
        {isScanning && (
            <div className="absolute inset-0 z-50 bg-[#0A0F1C] flex flex-col items-center justify-center">
                <div className="relative">
                    <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full animate-pulse"></div>
                    <ScanLine size={64} className="text-indigo-400 relative z-10 animate-bounce" />
                </div>
                <div className="mt-4 font-mono text-indigo-400 text-xs uppercase tracking-[0.3em] animate-pulse font-bold">Расшифровка данных...</div>
                <div className="w-48 h-0.5 bg-indigo-900 mt-4 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-400 animate-[width_1.5s_ease-in-out]"></div>
                </div>
            </div>
        )}

        {/* Header */}
        <div className={`relative p-8 shrink-0 ${isPreviouslyCompleted ? 'bg-emerald-950/30 border-b border-emerald-500/20' : 'bg-indigo-950/30 border-b border-indigo-500/20'}`}>
           {/* Tech Corners */}
           <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-white/20 rounded-tl-xl"></div>
           <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-white/20 rounded-tr-xl"></div>

           <button onClick={onClose} className="absolute top-6 right-6 bg-white/5 hover:bg-white/10 p-2 rounded-full transition-colors text-slate-400 hover:text-white z-10">
                <X size={24} />
           </button>

           <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-white/10 bg-white/5 text-slate-300">
                    {getTaskTypeLabel(task.type)}
                </span>
                {isPreviouslyCompleted ? (
                    <span className="flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
                    <Check size={12} strokeWidth={3} /> ВЫПОЛНЕНО
                    </span>
                ) : (
                <span className="flex items-center gap-1 px-3 py-1 rounded-lg bg-yellow-500/10 text-yellow-400 text-[10px] font-bold uppercase tracking-wider border border-yellow-500/20">
                    <Star size={12} fill="currentColor" /> {task.xpReward} XP
                </span>
                )}
            </div>
            
            <h3 className="font-black text-3xl text-white leading-none tracking-tight font-sans">
                {task.title}
            </h3>
            <div className="h-1 w-24 bg-gradient-to-r from-indigo-500 to-transparent mt-6"></div>
        </div>

        {/* Body */}
        <div className="p-8 flex-1 overflow-y-auto bg-[#0A0F1C] text-white relative">
          
          {/* Vertical Line Decoration */}
          <div className="absolute left-8 top-0 bottom-0 w-px bg-white/5"></div>

          {isCompleted ? (
            <div className="text-center py-10 animate-in zoom-in duration-500 pl-6">
                <div className="relative inline-block mb-8">
                    <div className={`absolute inset-0 blur-[60px] opacity-40 animate-pulse ${isPreviouslyCompleted ? 'bg-emerald-500' : 'bg-yellow-500'}`}></div>
                    <Trophy size={100} className={`relative z-10 drop-shadow-2xl ${isPreviouslyCompleted ? 'text-emerald-400' : 'text-yellow-400'}`} />
                </div>
                
                {isPreviouslyCompleted ? (
                    <>
                        <h2 className="text-3xl font-black text-white mb-2 tracking-tight uppercase">Миссия Завершена</h2>
                        <p className="text-slate-400 mb-8 font-mono text-sm">Награда уже получена.</p>
                        <button 
                          onClick={onClose}
                          className="w-full bg-white/5 text-white py-5 rounded-2xl font-bold text-sm hover:bg-white/10 transition-all border border-white/10 font-mono tracking-wider"
                        >
                          [ ЗАКРЫТЬ ]
                        </button>
                    </>
                ) : (
                    <>
                        <h2 className="text-4xl font-black text-white mb-2 tracking-tight uppercase italic">Новый уровень!</h2>
                        <p className="text-slate-400 mb-10 font-mono text-sm">+ {task.xpReward} XP добавлено в профиль</p>
                        <button 
                          onClick={handleCompleteAction}
                          className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-bold text-sm shadow-[0_0_30px_rgba(79,70,229,0.5)] hover:shadow-[0_0_50px_rgba(79,70,229,0.7)] hover:scale-[1.02] transition-all border border-indigo-400 font-mono uppercase tracking-wider"
                        >
                          [ ЗАБРАТЬ НАГРАДУ ]
                        </button>
                    </>
                )}
            </div>
          ) : (
            <div className="space-y-8 pl-6">
               {/* AI Adaptation Block */}
               <div className="bg-indigo-900/10 p-5 rounded-r-2xl border-l-4 border-indigo-500 relative">
                  <div className="flex items-start gap-4">
                      <div className="shrink-0 relative mt-1">
                         <img src={KATYA_IMAGE_URL} className="w-12 h-12 rounded-xl object-cover grayscale contrast-125 border border-indigo-500/50" alt="Katya" />
                         {isLoadingAI && (
                             <div className="absolute -bottom-1 -right-1 bg-indigo-500 rounded text-[9px] px-1 font-mono text-white animate-pulse font-bold">ИИ</div>
                         )}
                      </div>
                      <div>
                          <div className="text-[10px] font-bold text-indigo-400 uppercase mb-2 flex items-center gap-1 font-mono tracking-widest">
                             <Terminal size={12} /> {isLoadingAI ? 'АНАЛИЗ ДАННЫХ...' : `ЦЕЛЬ: ${userInterest.toUpperCase()}`}
                          </div>
                          <div className={`text-slate-300 text-sm font-medium leading-relaxed font-sans ${isLoadingAI ? 'opacity-50' : ''}`}>
                              {isLoadingAI ? "Нейросеть адаптирует контент..." : (
                                  <span>
                                      {adaptedText}
                                  </span>
                              )}
                          </div>
                      </div>
                  </div>
               </div>

               {/* Task Content */}
               {task.type === 'VIDEO' && (
                 <div className="space-y-6">
                   <div className="aspect-video bg-black rounded-2xl flex items-center justify-center relative overflow-hidden group cursor-pointer border border-white/10 shadow-2xl">
                      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                      <Play size={64} className="text-white relative z-10 opacity-80 group-hover:scale-110 transition-transform group-hover:text-indigo-400" fill="currentColor" />
                      
                      {/* Tech Overlay */}
                      <div className="absolute top-4 left-4 text-[10px] font-mono text-red-500 font-bold tracking-widest flex items-center gap-2">
                          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span> ЗАПИСЬ
                      </div>
                      <div className="absolute bottom-4 right-4 bg-indigo-900/80 text-indigo-100 text-xs px-3 py-1.5 rounded-lg font-mono border border-indigo-500/30 font-bold">
                        {task.content?.videoDuration || '10:00'}
                      </div>
                   </div>

                   {task.content?.topics && (
                       <div className="bg-white/5 rounded-r-2xl p-6 border-l border-white/10">
                           <h4 className="font-bold text-slate-400 mb-4 flex items-center gap-2 text-xs uppercase tracking-wider font-mono">
                               <BookOpen size={14} className="text-indigo-400"/>
                               База знаний:
                           </h4>
                           <ul className="space-y-3">
                               {task.content.topics.map((topic, idx) => (
                                   <li key={idx} className="flex items-start gap-3 text-sm text-slate-300 leading-snug">
                                       <span className="text-indigo-500 text-[10px] mt-1.5">{">"}</span>
                                       <span>{topic}</span>
                                   </li>
                               ))}
                           </ul>
                       </div>
                   )}

                   <button 
                        onClick={() => setIsCompleted(true)}
                        className="w-full bg-white/5 text-white border border-white/10 hover:border-indigo-500 hover:bg-indigo-500/10 py-5 rounded-2xl font-bold font-mono text-sm flex items-center justify-center gap-2 transition-all active:scale-95 uppercase tracking-wider"
                      >
                        ОТМЕТИТЬ ПРОСМОТРЕННЫМ <ArrowRight size={18} />
                   </button>
                 </div>
               )}

               {task.type === 'QUIZ' && task.content?.questions && (
                 <div>
                    {/* Progress Bar */}
                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden mb-8">
                        <div 
                            className="bg-indigo-500 h-full transition-all duration-500 shadow-[0_0_15px_rgba(99,102,241,0.8)]" 
                            style={{ width: `${((step) / task.content.questions.length) * 100}%` }}
                        ></div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-8 leading-relaxed">
                        <span className="text-indigo-500 mr-3 font-mono">0{step+1}:</span>
                        {task.content.questions[step].question}
                    </h3>

                    <div className="space-y-4">
                        {task.content.questions[step].options.map((opt, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleQuizAnswer(idx)}
                                className="w-full text-left p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-indigo-500/10 hover:border-indigo-500/50 transition-all font-bold text-slate-300 flex justify-between items-center group active:scale-[0.98] text-sm"
                            >
                                <span className="flex items-center gap-4">
                                    <span className="text-slate-500 text-xs group-hover:text-indigo-400 font-mono font-bold uppercase">[{String.fromCharCode(1040+idx)}]</span>
                                    {opt}
                                </span>
                                <div className="w-6 h-6 rounded-lg border border-slate-600 group-hover:border-indigo-400 group-hover:bg-indigo-400 flex items-center justify-center transition-colors">
                                </div>
                            </button>
                        ))}
                    </div>
                 </div>
               )}

               {(task.type === 'ACTION' || task.type === 'UPLOAD' || task.type === 'AUDIO') && (
                   <div className="space-y-6">
                       <div className="bg-emerald-900/10 p-6 rounded-r-2xl border-l-4 border-emerald-500 text-emerald-100 font-mono text-sm leading-relaxed">
                           <p>Требуется действие в реальности. Выполни задачу и подтверди статус.</p>
                       </div>
                       <button 
                        onClick={() => setIsCompleted(true)}
                        className="w-full mt-4 bg-emerald-600/20 border border-emerald-500 text-emerald-400 py-5 rounded-2xl font-bold font-mono uppercase tracking-wider hover:bg-emerald-600/30 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                      >
                        [ ПОДТВЕРДИТЬ ВЫПОЛНЕНИЕ ]
                      </button>
                   </div>
               )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
