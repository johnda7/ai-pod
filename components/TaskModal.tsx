

import React, { useState, useEffect } from 'react';
import { Task, LessonSlide, SortingItem } from '../types';
import { X, Play, Trophy, ArrowRight, Star, Heart, ArrowLeft, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { adaptTaskContent } from '../services/geminiService';

interface TaskModalProps {
  task: Task;
  isOpen: boolean;
  userInterest: string;
  isPreviouslyCompleted: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({ task, isOpen, userInterest, isPreviouslyCompleted, onClose, onComplete }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [lives, setLives] = useState(5);
  const [feedbackStatus, setFeedbackStatus] = useState<'NONE' | 'CORRECT' | 'WRONG'>('NONE');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [sortedItems, setSortedItems] = useState<SortingItem[]>([]);
  const [puzzleWords, setPuzzleWords] = useState<string[]>([]);
  const [isShake, setIsShake] = useState(false);

  // If task has no slides (legacy), wrap description in theory slide
  const slides: LessonSlide[] = task.slides && task.slides.length > 0 ? task.slides : [
      { id: 'legacy', type: 'THEORY', title: task.title, content: task.description, buttonText: 'Завершить' }
  ];

  const currentSlide = slides[currentSlideIndex];
  const progress = ((currentSlideIndex) / slides.length) * 100;

  useEffect(() => {
    if (isOpen) {
        setLives(5);
        setCurrentSlideIndex(0);
        setFeedbackStatus('NONE');
    }
  }, [isOpen]);

  // Init Puzzle/Sorting State when slide changes
  useEffect(() => {
      setFeedbackStatus('NONE');
      setSelectedOption(null);
      setSortedItems([]);
      
      if (currentSlide.type === 'PUZZLE') {
          // Shuffle words for puzzle
          const allWords = [...currentSlide.correctSentence, ...(currentSlide.distractorWords || [])];
          setPuzzleWords(allWords.sort(() => Math.random() - 0.5));
      }
  }, [currentSlideIndex, currentSlide]);

  const handleNext = () => {
      if (currentSlideIndex < slides.length - 1) {
          setCurrentSlideIndex(prev => prev + 1);
      } else {
          onComplete();
      }
  };

  const handleCorrect = () => {
      setFeedbackStatus('CORRECT');
      // Auto advance or show button? Duolingo shows button.
  };

  const handleWrong = () => {
      setFeedbackStatus('WRONG');
      setLives(prev => Math.max(0, prev - 1));
      setIsShake(true);
      setTimeout(() => setIsShake(false), 500);
  };

  // --- INTERACTION HANDLERS ---

  const handleQuizSubmit = (index: number) => {
      if (feedbackStatus !== 'NONE' || currentSlide.type !== 'QUIZ') return;
      setSelectedOption(index);
      
      if (index === currentSlide.correctIndex) {
          handleCorrect();
      } else {
          handleWrong();
      }
  };

  const handleSorting = (item: SortingItem, direction: 'LEFT' | 'RIGHT') => {
      if (currentSlide.type !== 'SORTING') return;
      
      // Visual only logic for now, or check immediately
      if (item.category === direction) {
          const newSorted = [...sortedItems, item];
          setSortedItems(newSorted);
          
          if (newSorted.length === currentSlide.items.length) {
              handleCorrect();
          }
      } else {
          handleWrong();
      }
  };

  const handlePuzzleWordClick = (word: string) => {
      // Simple toggle logic not implemented for brevity, assuming precise add
      // Real app would have "Selected Words" area
  };
  
  const renderSlideContent = () => {
      switch (currentSlide.type) {
          case 'THEORY':
              return (
                  <div className="flex flex-col h-full justify-center p-6 text-center space-y-6 animate-in zoom-in-95 duration-300">
                      <h3 className="text-2xl font-black text-white">{currentSlide.title}</h3>
                      <p className="text-slate-300 text-lg leading-relaxed">{currentSlide.content}</p>
                      {currentSlide.imageUrl && (
                          <img src={currentSlide.imageUrl} className="rounded-2xl border border-white/10" alt="" />
                      )}
                  </div>
              );

          case 'VIDEO':
              return (
                  <div className="flex flex-col h-full p-6 animate-in fade-in duration-300">
                      <h3 className="text-xl font-bold text-white mb-4 text-center">Видео-брифинг</h3>
                      <div className="aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative group">
                          <iframe 
                             width="100%" height="100%" 
                             src={currentSlide.videoUrl} 
                             title="Video" 
                             allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                             allowFullScreen
                             className="opacity-90 hover:opacity-100 transition-opacity"
                          ></iframe>
                      </div>
                      <p className="mt-6 text-slate-400 text-center text-sm">{currentSlide.description}</p>
                  </div>
              );

          case 'QUIZ':
              return (
                  <div className="flex flex-col h-full p-6 animate-in slide-in-from-right-10 duration-300">
                      <h3 className="text-xl font-bold text-white mb-8">{currentSlide.question}</h3>
                      <div className="space-y-3">
                          {currentSlide.options.map((opt, idx) => {
                              let btnClass = "bg-[#1E2332] border-white/10 text-slate-300 hover:bg-[#2A3042]";
                              
                              if (selectedOption === idx) {
                                  if (feedbackStatus === 'CORRECT') btnClass = "bg-green-500/20 border-green-500 text-green-400";
                                  if (feedbackStatus === 'WRONG') btnClass = "bg-red-500/20 border-red-500 text-red-400";
                              }

                              return (
                                  <button
                                      key={idx}
                                      onClick={() => handleQuizSubmit(idx)}
                                      disabled={feedbackStatus !== 'NONE'}
                                      className={`w-full p-5 rounded-2xl border-2 font-bold text-left transition-all active:scale-[0.98] ${btnClass}`}
                                  >
                                      {opt}
                                  </button>
                              );
                          })}
                      </div>
                  </div>
              );
          
          case 'SORTING':
               const remainingItems = currentSlide.items.filter(i => !sortedItems.find(s => s.id === i.id));
               const currentItem = remainingItems[0];

               return (
                   <div className="flex flex-col h-full p-6 items-center justify-center animate-in zoom-in-95 duration-300">
                       <h3 className="text-xl font-bold text-white mb-2 text-center">{currentSlide.question}</h3>
                       <div className="flex justify-between w-full mb-8 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                           <span>← {currentSlide.leftCategoryLabel}</span>
                           <span>{currentSlide.rightCategoryLabel} →</span>
                       </div>

                       {currentItem ? (
                           <div className="w-64 h-80 bg-gradient-to-br from-[#1E2332] to-[#151925] border-2 border-indigo-500/30 rounded-3xl flex flex-col items-center justify-center shadow-2xl relative z-10 animate-in zoom-in duration-300">
                               <div className="text-6xl mb-4">{currentItem.emoji}</div>
                               <div className="text-xl font-bold text-center px-4">{currentItem.text}</div>
                               
                               {/* Buttons for desktop/tap interaction */}
                               <div className="absolute -bottom-16 flex gap-4 w-full justify-center">
                                   <button 
                                     onClick={() => handleSorting(currentItem, 'LEFT')}
                                     className="w-16 h-16 rounded-full bg-[#1E2332] border border-rose-500/30 text-rose-500 flex items-center justify-center text-2xl hover:bg-rose-500 hover:text-white transition-colors"
                                   >←</button>
                                   <button 
                                     onClick={() => handleSorting(currentItem, 'RIGHT')}
                                     className="w-16 h-16 rounded-full bg-[#1E2332] border border-emerald-500/30 text-emerald-500 flex items-center justify-center text-2xl hover:bg-emerald-500 hover:text-white transition-colors"
                                   >→</button>
                               </div>
                           </div>
                       ) : (
                           <div className="text-center text-green-400 font-bold text-2xl animate-bounce">
                               ВСЁ ВЕРНО!
                           </div>
                       )}
                   </div>
               );

            case 'PUZZLE':
                // Simplified Puzzle Visuals
                return (
                    <div className="flex flex-col h-full p-6">
                        <h3 className="text-xl font-bold text-white mb-8">{currentSlide.question}</h3>
                        <div className="min-h-[100px] border-b-2 border-white/10 mb-8 flex flex-wrap gap-2 items-center">
                             {/* Placeholder for dropped words */}
                             <span className="text-slate-500 italic text-sm">Нажми на слова ниже...</span>
                        </div>
                        <div className="flex flex-wrap gap-3 justify-center">
                            {puzzleWords.map((word, idx) => (
                                <button key={idx} onClick={() => handleCorrect()} className="px-4 py-2 bg-[#1E2332] border border-white/10 rounded-xl font-bold text-slate-300 hover:bg-indigo-600 hover:text-white transition-colors">
                                    {word}
                                </button>
                            ))}
                        </div>
                        {/* Fake logic bypass for demo */}
                        <div className="mt-auto text-center text-xs text-slate-600">Нажми любое слово для теста</div>
                    </div>
                );

          default:
              return null;
      }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-[#020617] sm:bg-[#020617]/90 backdrop-blur-md">
      
      {/* FULL SCREEN MODAL */}
      <div className={`w-full h-full sm:max-w-md sm:h-[85vh] bg-[#0A0F1C] sm:rounded-[2.5rem] flex flex-col relative overflow-hidden ${isShake ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
        
        {/* HEADER */}
        <div className="px-6 pt-6 pb-2 flex items-center gap-4">
            <button onClick={onClose} className="text-slate-400 hover:text-white">
                <X size={24} />
            </button>
            
            {/* Progress Bar */}
            <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-green-500 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>

            {/* Lives */}
            <div className="flex items-center gap-1.5 text-rose-500 font-bold font-mono text-lg">
                <Heart fill="currentColor" size={20} className={lives === 0 ? 'animate-ping' : ''} />
                {lives}
            </div>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 relative overflow-y-auto">
            {renderSlideContent()}
        </div>

        {/* FOOTER ACTION AREA (Bottom Sheet Style) */}
        <div className={`p-6 border-t border-white/5 bg-[#0A0F1C] transition-colors duration-300 
            ${feedbackStatus === 'CORRECT' ? 'bg-green-900/20 border-green-500/30' : ''} 
            ${feedbackStatus === 'WRONG' ? 'bg-red-900/20 border-red-500/30' : ''}
        `}>
            
            {/* Feedback Message */}
            {feedbackStatus === 'CORRECT' && (
                <div className="flex items-center gap-3 mb-4 text-green-400 font-bold animate-in slide-in-from-bottom-2">
                    <CheckCircle size={28} />
                    <div>
                        <div className="text-lg">Отлично!</div>
                        {currentSlide.type === 'QUIZ' && currentSlide.explanation && (
                            <div className="text-xs text-green-300/80 font-normal mt-1">{currentSlide.explanation}</div>
                        )}
                    </div>
                </div>
            )}

            {feedbackStatus === 'WRONG' && (
                <div className="flex items-center gap-3 mb-4 text-red-400 font-bold animate-in slide-in-from-bottom-2">
                    <AlertCircle size={28} />
                    <div>
                        <div className="text-lg">Неверно</div>
                        <div className="text-xs text-red-300/80 font-normal mt-1">Минус одна жизнь. Соберись!</div>
                    </div>
                </div>
            )}

            {/* Main Button */}
            {feedbackStatus === 'NONE' ? (
                currentSlide.type === 'THEORY' || currentSlide.type === 'VIDEO' ? (
                    <button 
                        onClick={handleNext}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl uppercase tracking-widest transition-all active:scale-[0.98] shadow-lg shadow-indigo-900/50"
                    >
                        {currentSlide.type === 'THEORY' && currentSlide.buttonText ? currentSlide.buttonText : 'ДАЛЕЕ'}
                    </button>
                ) : (
                    <button 
                        disabled 
                        className="w-full bg-slate-800 text-slate-500 font-bold py-4 rounded-2xl uppercase tracking-widest cursor-not-allowed border border-white/5"
                    >
                        ВЫБЕРИ ОТВЕТ
                    </button>
                )
            ) : (
                <button 
                    onClick={feedbackStatus === 'CORRECT' ? handleNext : () => setFeedbackStatus('NONE')}
                    className={`w-full font-bold py-4 rounded-2xl uppercase tracking-widest transition-all active:scale-[0.98] shadow-lg 
                        ${feedbackStatus === 'CORRECT' 
                            ? 'bg-green-500 hover:bg-green-400 text-white shadow-green-900/50' 
                            : 'bg-red-500 hover:bg-red-400 text-white shadow-red-900/50'}
                    `}
                >
                    {feedbackStatus === 'CORRECT' ? 'ПРОДОЛЖИТЬ' : 'ЕЩЕ РАЗ'}
                </button>
            )}

        </div>

      </div>
    </div>
  );
};