
import React, { useState, useEffect } from 'react';
import { Task } from '../types';
import { X, Play, Trophy, ArrowRight, Star, Sparkles, BookOpen, RotateCcw, Check } from 'lucide-react';
import { adaptTaskContent } from '../services/geminiService';
import { KATYA_IMAGE_URL } from '../constants';

interface TaskModalProps {
  task: Task;
  isOpen: boolean;
  userInterest: string;
  isPreviouslyCompleted: boolean; // NEW PROP to control logic
  onClose: () => void;
  onComplete: () => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({ task, isOpen, userInterest, isPreviouslyCompleted, onClose, onComplete }) => {
  const [step, setStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  // If previously completed, start in "Completed" state immediately
  const [isCompleted, setIsCompleted] = useState(isPreviouslyCompleted);
  const [adaptedText, setAdaptedText] = useState<string>('');
  const [isLoadingAI, setIsLoadingAI] = useState(true);

  useEffect(() => {
    if (isOpen) {
        setIsLoadingAI(true);
        adaptTaskContent(task.title, task.description, userInterest)
            .then(text => {
                setAdaptedText(text);
                setIsLoadingAI(false);
            });
    }
  }, [task, isOpen, userInterest]);

  if (!isOpen) return null;

  const handleQuizAnswer = (optionIndex: number) => {
    // If already completed before, do not allow changing answers or re-submitting logic
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
      // If previously completed, just close (no new XP)
      if (isPreviouslyCompleted) {
          onClose();
      } else {
          onComplete(); // Award XP and save
      }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4">
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}></div>
      
      {/* Modal Content */}
      <div className="bg-[#1E2332] w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300 relative border border-white/10">
        
        {/* Decorative Top Line for Mobile drag hint */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-white/20 rounded-full sm:hidden"></div>

        {/* Header Image/Pattern */}
        <div className={`h-32 relative overflow-hidden shrink-0 ${isPreviouslyCompleted ? 'bg-emerald-900' : 'bg-gradient-to-br from-indigo-600 to-purple-800'}`}>
           <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.4),transparent)]"></div>
           <button onClick={onClose} className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 p-2 rounded-full transition-colors backdrop-blur-md text-white z-10">
                <X size={20} />
           </button>
           <div className="absolute bottom-4 left-6 right-6">
                <div className="flex items-center gap-2 mb-1">
                     <span className="px-2 py-0.5 rounded-lg bg-white/20 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md text-white border border-white/10">
                         {task.type}
                     </span>
                     {isPreviouslyCompleted ? (
                         <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/40 text-emerald-200 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border border-emerald-500/30">
                            <Check size={10} /> Пройдено
                         </span>
                     ) : (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-yellow-400/20 text-yellow-300 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border border-yellow-400/20">
                            <Star size={10} fill="currentColor" /> {task.xpReward} XP
                        </span>
                     )}
                </div>
                <h3 className="font-black text-2xl text-white leading-tight drop-shadow-md">{task.title}</h3>
           </div>
        </div>

        {/* Body */}
        <div className="p-6 flex-1 overflow-y-auto bg-[#1E2332] text-white">
          
          {isCompleted ? (
            <div className="text-center py-8 animate-in zoom-in duration-300">
                <div className="relative inline-block mb-6">
                    <div className={`absolute inset-0 blur-3xl opacity-20 animate-pulse ${isPreviouslyCompleted ? 'bg-emerald-500' : 'bg-yellow-400'}`}></div>
                    <Trophy size={80} className={`relative z-10 drop-shadow-[0_10px_20px_rgba(250,204,21,0.3)] ${isPreviouslyCompleted ? 'text-emerald-400' : 'text-yellow-400'}`} />
                </div>
                
                {isPreviouslyCompleted ? (
                    <>
                        <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Уже выполнено!</h2>
                        <p className="text-slate-400 mb-8 font-medium">Ты уже получил награду за это задание.<br/>Молодец!</p>
                        <button 
                          onClick={onClose}
                          className="w-full bg-white/10 text-white py-4 rounded-2xl font-bold text-lg hover:bg-white/20 transition-all"
                        >
                          Закрыть
                        </button>
                    </>
                ) : (
                    <>
                        <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Level Up!</h2>
                        <p className="text-slate-400 mb-8 font-medium">Ты заработал +{task.xpReward} XP<br/>Продолжай движение!</p>
                        <button 
                          onClick={handleCompleteAction}
                          className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.02] transition-all"
                        >
                          Забрать награду
                        </button>
                    </>
                )}
            </div>
          ) : (
            <div className="space-y-6">
               {/* AI Adaptation Block */}
               <div className="bg-indigo-500/10 p-4 rounded-2xl border border-indigo-500/20 relative overflow-hidden">
                  <div className="flex items-start gap-3 relative z-10">
                      <div className="shrink-0 relative">
                         <img src={KATYA_IMAGE_URL} className="w-10 h-10 rounded-full object-cover border-2 border-indigo-400/30" alt="Katya" />
                         {isLoadingAI && (
                             <div className="absolute -bottom-1 -right-1 bg-indigo-500 rounded-full p-0.5 border border-[#1E2332]">
                                 <Sparkles size={8} className="text-white animate-spin" />
                             </div>
                         )}
                      </div>
                      <div>
                          <div className="text-xs font-bold text-indigo-300 uppercase mb-1 flex items-center gap-1">
                             {isLoadingAI ? 'Катя адаптирует...' : `Стиль: ${userInterest}`}
                          </div>
                          <div className={`text-slate-200 text-sm font-medium leading-relaxed ${isLoadingAI ? 'opacity-50 animate-pulse' : ''}`}>
                              {isLoadingAI ? "Придумываю метафоры..." : adaptedText}
                          </div>
                      </div>
                  </div>
               </div>

               {/* Task Content */}
               {task.type === 'VIDEO' && (
                 <div className="space-y-6">
                   <div className="aspect-video bg-black/40 rounded-2xl flex items-center justify-center relative overflow-hidden group cursor-pointer border border-white/5">
                      <Play size={48} className="text-white relative z-10 opacity-90 group-hover:scale-110 transition-transform drop-shadow-lg" fill="currentColor" />
                      <div className="absolute bottom-3 left-4 right-4 flex justify-between items-end z-10">
                          <span className="text-xs bg-black/60 text-white px-2 py-1 rounded font-mono border border-white/10">
                            {task.content?.videoDuration || '10:00'}
                          </span>
                      </div>
                   </div>

                   {task.content?.topics && (
                       <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                           <h4 className="font-bold text-slate-300 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                               <BookOpen size={16} className="text-indigo-400"/>
                               Темы урока:
                           </h4>
                           <ul className="space-y-3">
                               {task.content.topics.map((topic, idx) => (
                                   <li key={idx} className="flex items-start gap-3 text-sm text-slate-300 leading-snug">
                                       <div className="w-1.5 h-1.5 mt-1.5 rounded-full bg-indigo-500 shrink-0"></div>
                                       <span>{topic}</span>
                                   </li>
                               ))}
                           </ul>
                       </div>
                   )}

                   <button 
                        onClick={() => setIsCompleted(true)}
                        className="w-full bg-white text-slate-900 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-50 transition-all active:scale-95 shadow-lg"
                      >
                        Задание выполнено <ArrowRight size={20} />
                   </button>
                 </div>
               )}

               {task.type === 'QUIZ' && task.content?.questions && (
                 <div>
                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden mb-6">
                        <div 
                            className="bg-indigo-500 h-full transition-all duration-500" 
                            style={{ width: `${((step) / task.content.questions.length) * 100}%` }}
                        ></div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-6 leading-tight">
                        {task.content.questions[step].question}
                    </h3>

                    <div className="space-y-3">
                        {task.content.questions[step].options.map((opt, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleQuizAnswer(idx)}
                                className="w-full text-left p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-indigo-600/20 hover:border-indigo-500/50 transition-all font-bold text-slate-200 flex justify-between items-center group active:scale-[0.98]"
                            >
                                {opt}
                                <div className="w-6 h-6 rounded-full border-2 border-slate-500 group-hover:border-indigo-400 group-hover:bg-indigo-400 flex items-center justify-center transition-colors">
                                    <div className="w-2 h-2 bg-white rounded-full opacity-0 group-hover:opacity-100"></div>
                                </div>
                            </button>
                        ))}
                    </div>
                 </div>
               )}

               {(task.type === 'ACTION' || task.type === 'UPLOAD' || task.type === 'AUDIO') && (
                   <div className="space-y-4">
                       <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-slate-300">
                           <p>Выполни задание в реальной жизни и нажми кнопку ниже.</p>
                       </div>
                       <button 
                        onClick={() => setIsCompleted(true)}
                        className="w-full mt-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-500/20"
                      >
                        Готово!
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
