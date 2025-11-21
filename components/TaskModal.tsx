import React, { useState } from 'react';
import { Task } from '../types';
import { X, Play, CheckCircle, Trophy, ArrowRight, Star } from 'lucide-react';

interface TaskModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({ task, isOpen, onClose, onComplete }) => {
  const [step, setStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

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

  const handleFinish = () => {
    onComplete();
    // Confetti effect manually via DOM or just close
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-indigo-600 p-4 flex justify-between items-center text-white">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                {task.type === 'VIDEO' ? <Play size={20} fill="currentColor" /> : <Star size={20} fill="currentColor" />}
             </div>
             <div>
               <h3 className="font-bold text-lg leading-none">{task.title}</h3>
               <p className="text-indigo-200 text-xs mt-1">+{task.xpReward} XP</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex-1 overflow-y-auto">
          
          {isCompleted ? (
            <div className="text-center py-8">
                <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                    <Trophy size={48} className="text-yellow-500" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Уровень пройден!</h2>
                <p className="text-slate-500 mb-6">Ты получаешь {task.xpReward} XP и становишься круче.</p>
                <button 
                  onClick={handleFinish}
                  className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
                >
                  Забрать награду
                </button>
            </div>
          ) : (
            <>
               {/* Video Lesson View */}
               {task.type === 'VIDEO' && (
                 <div className="space-y-4">
                   <div className="aspect-video bg-slate-900 rounded-xl flex items-center justify-center relative overflow-hidden group cursor-pointer">
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-slate-900 opacity-50"></div>
                      <Play size={48} className="text-white relative z-10 opacity-80 group-hover:scale-110 transition-transform" fill="currentColor" />
                      <p className="absolute bottom-4 left-4 text-white font-medium z-10">Нажми чтобы смотреть</p>
                   </div>
                   <p className="text-slate-600 leading-relaxed">{task.description}</p>
                   <div className="pt-4">
                      <button 
                        onClick={() => setIsCompleted(true)}
                        className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors"
                      >
                        Я посмотрел <CheckCircle size={20} />
                      </button>
                   </div>
                 </div>
               )}

               {/* Quiz Game View */}
               {task.type === 'QUIZ' && task.content?.questions && (
                 <div>
                    <div className="flex justify-between text-xs font-bold text-slate-400 mb-4 uppercase tracking-wider">
                       <span>Вопрос {step + 1} из {task.content.questions.length}</span>
                       <span>Игра</span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-slate-800 mb-6">
                        {task.content.questions[step].question}
                    </h3>

                    <div className="space-y-3">
                        {task.content.questions[step].options.map((opt, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleQuizAnswer(idx)}
                                className="w-full text-left p-4 rounded-xl border-2 border-slate-100 hover:border-indigo-500 hover:bg-indigo-50 transition-all font-medium text-slate-700 flex justify-between items-center group"
                            >
                                {opt}
                                <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 text-indigo-500 transform -translate-x-2 group-hover:translate-x-0 transition-all" />
                            </button>
                        ))}
                    </div>
                 </div>
               )}

               {/* Action/Upload View */}
               {(task.type === 'ACTION' || task.type === 'UPLOAD') && (
                   <div className="space-y-4">
                       <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 text-center">
                          <h3 className="font-bold text-indigo-900 mb-2">Задание на сегодня</h3>
                          <p className="text-indigo-700">{task.description}</p>
                       </div>
                       
                       {task.content?.actionSteps && (
                           <ul className="space-y-3">
                               {task.content.actionSteps.map((s, i) => (
                                   <li key={i} className="flex items-center gap-3 text-slate-700 bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                                       <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold">{i+1}</div>
                                       {s}
                                   </li>
                               ))}
                           </ul>
                       )}

                       <button 
                        onClick={() => setIsCompleted(true)}
                        className="w-full mt-4 bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-colors"
                      >
                        Выполнено!
                      </button>
                   </div>
               )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};