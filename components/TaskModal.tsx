import React, { useState, useEffect } from 'react';
import { Task } from '../types';
import { X, Play, CheckCircle, Trophy, ArrowRight, Star, Sparkles, Bot } from 'lucide-react';
import { adaptTaskContent } from '../services/geminiService';

interface TaskModalProps {
  task: Task;
  isOpen: boolean;
  userInterest: string;
  onClose: () => void;
  onComplete: () => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({ task, isOpen, userInterest, onClose, onComplete }) => {
  const [step, setStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [adaptedText, setAdaptedText] = useState<string>('');
  const [isLoadingAI, setIsLoadingAI] = useState(true);

  // "Adaptive Learning" Effect
  useEffect(() => {
    if (isOpen) {
        setIsLoadingAI(true);
        // Call Gemini to rewrite content
        adaptTaskContent(task.title, task.description, userInterest)
            .then(text => {
                setAdaptedText(text);
                setIsLoadingAI(false);
            });
    }
  }, [task, isOpen, userInterest]);

  if (!isOpen) return null;

  const handleQuizAnswer = (optionIndex: number) => {
    const newAnswers = [...quizAnswers];
    newAnswers[step] = optionIndex;
    setQuizAnswers(newAnswers);
    
    // Add a small delay for feedback before moving next
    setTimeout(() => {
       if (task.content?.questions && step < task.content.questions.length - 1) {
         setStep(step + 1);
       } else {
         setIsCompleted(true);
       }
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300 relative">
        
        {/* Header */}
        <div className="bg-indigo-600 p-6 relative overflow-hidden">
           {/* Pattern */}
           <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
           
           <div className="flex justify-between items-start text-white relative z-10">
              <div>
                  <div className="flex items-center gap-2 mb-2">
                     <span className="px-2 py-0.5 rounded bg-white/20 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">
                         {task.type === 'VIDEO' ? 'Урок' : 'Челлендж'}
                     </span>
                     <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-yellow-400/90 text-yellow-900 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">
                        <Star size={10} fill="currentColor" /> {task.xpReward} XP
                     </span>
                  </div>
                  <h3 className="font-black text-2xl leading-tight pr-4">{task.title}</h3>
              </div>
              <button onClick={onClose} className="bg-black/20 hover:bg-black/40 p-2 rounded-full transition-colors backdrop-blur-md">
                <X size={20} />
              </button>
           </div>
        </div>

        {/* Body */}
        <div className="p-6 flex-1 overflow-y-auto bg-white">
          
          {isCompleted ? (
            <div className="text-center py-8 animate-in zoom-in duration-300">
                <div className="relative inline-block mb-6">
                    <div className="absolute inset-0 bg-yellow-400 blur-xl opacity-50 animate-pulse"></div>
                    <Trophy size={80} className="text-yellow-500 relative z-10 drop-shadow-sm" />
                    <Star size={30} className="text-yellow-400 absolute -top-2 -right-4 animate-bounce" fill="currentColor" />
                    <Star size={20} className="text-yellow-400 absolute bottom-0 -left-4 animate-bounce delay-75" fill="currentColor" />
                </div>
                <h2 className="text-3xl font-black text-slate-800 mb-2 tracking-tight">Level Up!</h2>
                <p className="text-slate-500 mb-8 font-medium">Ты заработал +{task.xpReward} XP<br/>Так держать!</p>
                <button 
                  onClick={onComplete}
                  className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:scale-[1.02] transition-all active:scale-95"
                >
                  Забрать награду
                </button>
            </div>
          ) : (
            <div className="space-y-6">
               {/* AI Adaptation Block */}
               <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 relative overflow-hidden">
                  <div className="flex items-start gap-3 relative z-10">
                      <div className="bg-indigo-100 p-2 rounded-full shrink-0">
                         <Bot size={20} className="text-indigo-600" />
                      </div>
                      <div>
                          <div className="text-xs font-bold text-indigo-400 uppercase mb-1 flex items-center gap-1">
                             {isLoadingAI ? 'Адаптирую под тебя...' : `Версия для фаната: ${userInterest}`}
                             {isLoadingAI && <Sparkles size={10} className="animate-spin" />}
                          </div>
                          <div className={`text-slate-700 text-sm font-medium leading-relaxed ${isLoadingAI ? 'opacity-50 animate-pulse' : ''}`}>
                              {isLoadingAI ? "Придумываю крутое объяснение..." : adaptedText}
                          </div>
                      </div>
                  </div>
               </div>

               {/* Video Lesson View */}
               {task.type === 'VIDEO' && (
                 <div className="space-y-4">
                   <div className="aspect-video bg-slate-900 rounded-2xl flex items-center justify-center relative overflow-hidden group cursor-pointer shadow-lg">
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-slate-900 opacity-50"></div>
                      <Play size={48} className="text-white relative z-10 opacity-80 group-hover:scale-110 transition-transform drop-shadow-lg" fill="currentColor" />
                      <p className="absolute bottom-4 left-4 text-white font-bold z-10 tracking-wide">Смотреть урок</p>
                   </div>
                   <button 
                        onClick={() => setIsCompleted(true)}
                        className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-95 shadow-xl"
                      >
                        Всё понятно, дальше! <ArrowRight size={20} />
                   </button>
                 </div>
               )}

               {/* Quiz Game View */}
               {task.type === 'QUIZ' && task.content?.questions && (
                 <div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-6">
                        <div 
                            className="bg-indigo-500 h-full transition-all duration-500" 
                            style={{ width: `${((step) / task.content.questions.length) * 100}%` }}
                        ></div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-slate-800 mb-6 leading-tight">
                        {task.content.questions[step].question}
                    </h3>

                    <div className="space-y-3">
                        {task.content.questions[step].options.map((opt, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleQuizAnswer(idx)}
                                className="w-full text-left p-4 rounded-xl border-2 border-slate-100 hover:border-indigo-500 hover:bg-indigo-50 transition-all font-bold text-slate-700 flex justify-between items-center group active:scale-[0.98]"
                            >
                                {opt}
                                <div className="w-6 h-6 rounded-full border-2 border-slate-200 group-hover:border-indigo-500 group-hover:bg-indigo-500 flex items-center justify-center transition-colors">
                                    <div className="w-2 h-2 bg-white rounded-full opacity-0 group-hover:opacity-100"></div>
                                </div>
                            </button>
                        ))}
                    </div>
                 </div>
               )}

               {/* Action/Upload View */}
               {(task.type === 'ACTION' || task.type === 'UPLOAD') && (
                   <div className="space-y-4">
                       {task.content?.actionSteps && (
                           <ul className="space-y-3">
                               {task.content.actionSteps.map((s, i) => (
                                   <li key={i} className="flex items-center gap-4 text-slate-700 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                       <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-black shrink-0">{i+1}</div>
                                       <span className="font-medium">{s}</span>
                                   </li>
                               ))}
                           </ul>
                       )}

                       <button 
                        onClick={() => setIsCompleted(true)}
                        className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-2xl font-bold shadow-xl shadow-indigo-200 hover:shadow-indigo-300 hover:translate-y-[-2px] transition-all"
                      >
                        Я сделал это!
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