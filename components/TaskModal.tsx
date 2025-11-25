
import React, { useState, useEffect } from 'react';
import { Task, LessonSlide, SortingItem, PairItem } from '../types';
import { X, Play, Trophy, CheckCircle, AlertCircle, Skull, BarChart2, Heart, ArrowRight, RotateCcw, Sparkles, MoveRight, MoveLeft } from 'lucide-react';
import { FocusDefender, EmbeddedMemoryGame } from './MiniGames';

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
  
  // Slide Specific States
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [sortedItems, setSortedItems] = useState<SortingItem[]>([]);
  
  // Puzzle State
  const [puzzleWordBank, setPuzzleWordBank] = useState<string[]>([]);
  const [constructedSentence, setConstructedSentence] = useState<string[]>([]);
  
  // Matching State
  const [selectedPairId, setSelectedPairId] = useState<string | null>(null); 
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]); 
  
  // Input State
  const [inputText, setInputText] = useState('');

  // Game State
  const [gameScore, setGameScore] = useState<number | null>(null);

  const [isShake, setIsShake] = useState(false);

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
        resetSlideState();
    }
  }, [isOpen]);

  useEffect(() => {
      resetSlideState();
      
      if (currentSlide.type === 'PUZZLE') {
          // Init Puzzle: Shuffle words
          const allWords = [...currentSlide.correctSentence, ...(currentSlide.distractorWords || [])];
          setPuzzleWordBank(allWords.sort(() => Math.random() - 0.5));
          setConstructedSentence([]);
      }
  }, [currentSlideIndex, currentSlide]);

  const resetSlideState = () => {
      setFeedbackStatus('NONE');
      setSelectedOption(null);
      setSortedItems([]);
      setSelectedPairId(null);
      setMatchedPairs([]);
      setInputText('');
      setGameScore(null);
      setConstructedSentence([]);
  };

  const handleNext = () => {
      if (currentSlideIndex < slides.length - 1) {
          setCurrentSlideIndex(prev => prev + 1);
      } else {
          onComplete();
      }
  };

  const handleCorrect = () => {
      setFeedbackStatus('CORRECT');
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

  const handlePollSubmit = (index: number) => {
    if (feedbackStatus !== 'NONE' || currentSlide.type !== 'POLL') return;
    setSelectedOption(index);
    handleCorrect();
  };

  const handleSorting = (item: SortingItem, direction: 'LEFT' | 'RIGHT') => {
      if (currentSlide.type !== 'SORTING') return;
      
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

  // --- PUZZLE LOGIC ---
  const handlePuzzleWordClick = (word: string, fromBank: boolean) => {
      if (feedbackStatus !== 'NONE') return;

      if (fromBank) {
          // Move from Bank to Sentence
          setPuzzleWordBank(prev => {
              const idx = prev.indexOf(word);
              if (idx > -1) {
                  const newBank = [...prev];
                  newBank.splice(idx, 1);
                  return newBank;
              }
              return prev;
          });
          setConstructedSentence(prev => [...prev, word]);
      } else {
          // Move from Sentence to Bank
          setConstructedSentence(prev => {
              const idx = prev.indexOf(word);
              if (idx > -1) {
                  const newSent = [...prev];
                  newSent.splice(idx, 1);
                  return newSent;
              }
              return prev;
          });
          setPuzzleWordBank(prev => [...prev, word]);
      }
  };

  const checkPuzzle = () => {
      if (currentSlide.type !== 'PUZZLE') return;
      const userSentence = constructedSentence.join(' ');
      const correctSentence = currentSlide.correctSentence.join(' ');
      
      if (userSentence === correctSentence) {
          handleCorrect();
      } else {
          handleWrong();
      }
  };

  const handleMatching = (item: PairItem, side: 'LEFT' | 'RIGHT') => {
      if (currentSlide.type !== 'MATCHING') return;
      
      if (side === 'LEFT') {
          setSelectedPairId(item.id);
      } else {
          if (!selectedPairId) return; 
          
          if (selectedPairId === item.id) {
              const newMatched = [...matchedPairs, item.id];
              setMatchedPairs(newMatched);
              setSelectedPairId(null);

              if (newMatched.length === currentSlide.pairs.length) {
                  handleCorrect();
              }
          } else {
              handleWrong();
              setSelectedPairId(null);
          }
      }
  };

  const handleInputSubmit = () => {
      if (currentSlide.type !== 'INPUT') return;
      if (inputText.length < (currentSlide.minLength || 3)) return;
      handleCorrect();
  };

  const handleGameComplete = (score: number) => {
      setGameScore(score);
      handleCorrect();
  };
  
  const renderSlideContent = () => {
      switch (currentSlide.type) {
          case 'THEORY':
              return (
                  <div className="flex flex-col h-full justify-center p-6 text-center space-y-8 animate-in zoom-in-95 duration-500">
                      <div className="w-32 h-32 mx-auto bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-full blur-[60px] opacity-50 absolute top-20 left-1/2 -translate-x-1/2 pointer-events-none"></div>
                      
                      <h3 className="text-3xl font-black text-white relative z-10 drop-shadow-xl tracking-tight leading-tight">
                          {currentSlide.title}
                      </h3>
                      
                      <div className="glass-panel p-8 rounded-[2rem] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative z-10 backdrop-blur-2xl bg-white/5">
                          <p className="text-indigo-50 text-lg leading-relaxed font-medium">
                              {currentSlide.content}
                          </p>
                      </div>

                      {currentSlide.imageUrl && (
                          <div className="relative rounded-[2rem] overflow-hidden border border-white/20 shadow-2xl group mx-4">
                              <div className="absolute inset-0 bg-indigo-500/20 mix-blend-overlay group-hover:bg-transparent transition-all"></div>
                              <img src={currentSlide.imageUrl} className="w-full h-48 object-cover" alt="" />
                          </div>
                      )}
                  </div>
              );

          case 'VIDEO':
              return (
                  <div className="flex flex-col h-full p-6 animate-in fade-in duration-500 justify-center">
                      <h3 className="text-2xl font-black text-white mb-6 text-center drop-shadow-md">
                          Видео-Брифинг
                      </h3>
                      <div className="relative aspect-video rounded-[2rem] overflow-hidden border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-black group ring-1 ring-white/10">
                          <iframe 
                             width="100%" height="100%" 
                             src={currentSlide.videoUrl} 
                             title="Video" 
                             allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                             allowFullScreen
                             className="opacity-90 group-hover:opacity-100 transition-opacity"
                          ></iframe>
                      </div>
                      <div className="mt-8 glass-panel p-6 rounded-3xl border border-white/5 bg-white/5 backdrop-blur-md">
                          <p className="text-slate-200 text-center text-sm font-medium leading-relaxed">{currentSlide.description}</p>
                      </div>
                  </div>
              );

          case 'QUIZ':
              return (
                  <div className="flex flex-col h-full p-6 animate-in slide-in-from-right-10 duration-500 justify-center">
                      <div className="bg-indigo-500/20 text-indigo-300 w-fit mx-auto px-5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6 border border-indigo-500/30 backdrop-blur-md">
                          Вопрос
                      </div>
                      <h3 className="text-2xl font-black text-white mb-10 text-center leading-tight drop-shadow-md">
                          {currentSlide.question}
                      </h3>
                      <div className="space-y-4">
                          {currentSlide.options.map((opt, idx) => {
                              let btnClass = "bg-white/5 border-white/10 text-slate-200 hover:bg-white/10 hover:border-white/20";
                              
                              if (selectedOption === idx) {
                                  if (feedbackStatus === 'CORRECT') btnClass = "bg-green-500/20 border-green-500 text-green-300 shadow-[0_0_30px_rgba(34,197,94,0.3)]";
                                  if (feedbackStatus === 'WRONG') btnClass = "bg-red-500/20 border-red-500 text-red-300 shadow-[0_0_30px_rgba(239,68,68,0.3)]";
                              }

                              return (
                                  <button
                                      key={idx}
                                      onClick={() => handleQuizSubmit(idx)}
                                      disabled={feedbackStatus !== 'NONE'}
                                      className={`w-full p-6 rounded-2xl border-2 font-bold text-left transition-all active:scale-[0.98] backdrop-blur-xl ${btnClass}`}
                                  >
                                      {opt}
                                  </button>
                              );
                          })}
                      </div>
                  </div>
              );
          
           case 'POLL':
              return (
                  <div className="flex flex-col h-full p-6 animate-in slide-in-from-right-10 duration-500 justify-center">
                      <div className="flex items-center justify-center mb-6">
                          <div className="glass-panel px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 text-indigo-300 border border-indigo-500/30">
                              <BarChart2 size={14} /> Твое Мнение
                          </div>
                      </div>
                      <h3 className="text-2xl font-black text-white mb-8 text-center leading-tight">
                          {currentSlide.question}
                      </h3>
                      <div className="space-y-3">
                          {currentSlide.options.map((opt, idx) => {
                              const isSelected = selectedOption === idx;
                              return (
                                  <button
                                      key={idx}
                                      onClick={() => handlePollSubmit(idx)}
                                      disabled={feedbackStatus !== 'NONE'}
                                      className={`w-full p-5 rounded-2xl border-2 font-bold text-left transition-all active:scale-[0.98] flex justify-between items-center backdrop-blur-xl
                                          ${isSelected 
                                              ? 'bg-indigo-600/30 border-indigo-400 text-white shadow-[0_0_30px_rgba(99,102,241,0.3)]' 
                                              : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                                          }
                                      `}
                                  >
                                      <span>{opt}</span>
                                      {isSelected && <CheckCircle size={20} className="text-indigo-400" />}
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
                   <div className="flex flex-col h-full p-6 items-center justify-center animate-in zoom-in-95 duration-500 relative">
                       {/* Labels Top */}
                       <div className="w-full flex justify-between px-2 mb-4 absolute top-4 left-0">
                           <div className="glass-panel px-3 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 backdrop-blur-md">
                               <div className="text-[10px] font-black uppercase tracking-widest text-rose-300">{currentSlide.leftCategoryLabel}</div>
                           </div>
                           <div className="glass-panel px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-md">
                               <div className="text-[10px] font-black uppercase tracking-widest text-emerald-300">{currentSlide.rightCategoryLabel}</div>
                           </div>
                       </div>

                       {currentItem ? (
                           <div className="relative w-full max-w-[300px] aspect-[3/4] mt-8">
                               {/* Background Cards for depth */}
                               <div className="absolute top-4 left-4 right-[-10px] bottom-[-10px] bg-white/5 rounded-[2.5rem] border border-white/5 z-0 transform rotate-3"></div>
                               <div className="absolute top-2 left-2 right-[-5px] bottom-[-5px] bg-white/5 rounded-[2.5rem] border border-white/5 z-0 transform rotate-1"></div>
                               
                               {/* Active Card */}
                               <div className="absolute inset-0 bg-gradient-to-b from-[#1E2332]/90 to-[#0f172a]/90 border border-white/20 rounded-[2.5rem] flex flex-col items-center justify-center shadow-[0_20px_60px_rgba(0,0,0,0.6)] z-10 backdrop-blur-3xl">
                                   <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent rounded-[2.5rem] pointer-events-none"></div>
                                   
                                   <div className="text-9xl mb-8 drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] transform hover:scale-110 transition-transform cursor-pointer">{currentItem.emoji}</div>
                                   <div className="text-2xl font-black text-center px-6 leading-tight text-white drop-shadow-md">{currentItem.text}</div>
                               </div>
                           </div>
                       ) : (
                           <div className="text-center animate-in zoom-in duration-500">
                               <div className="w-32 h-32 bg-gradient-to-tr from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_50px_rgba(16,185,129,0.5)]">
                                   <CheckCircle size={64} className="text-white" />
                               </div>
                               <h2 className="text-3xl font-black text-white">Супер!</h2>
                           </div>
                       )}

                       {/* CONTROLS */}
                       {currentItem && (
                        <div className="w-full max-w-[320px] flex justify-between items-center mt-10 gap-6">
                            <button 
                                onClick={() => handleSorting(currentItem, 'LEFT')}
                                className="flex-1 h-20 rounded-[2rem] bg-rose-500/10 border-2 border-rose-500 text-rose-400 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-[0_0_30px_rgba(244,63,94,0.2)] active:scale-95 group backdrop-blur-md"
                            >
                                <MoveLeft className="group-hover:-translate-x-1 transition-transform" size={32} strokeWidth={3} />
                            </button>

                            <button 
                                onClick={() => handleSorting(currentItem, 'RIGHT')}
                                className="flex-1 h-20 rounded-[2rem] bg-emerald-500/10 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all shadow-[0_0_30px_rgba(16,185,129,0.2)] active:scale-95 group backdrop-blur-md"
                            >
                                <MoveRight className="group-hover:translate-x-1 transition-transform" size={32} strokeWidth={3} />
                            </button>
                        </div>
                       )}
                   </div>
               );

            case 'PUZZLE':
                return (
                    <div className="flex flex-col h-full p-6 relative">
                        <div className="bg-purple-500/20 text-purple-300 w-fit mx-auto px-5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6 border border-purple-500/30 backdrop-blur-md">
                          Собери фразу
                        </div>

                        <h3 className="text-xl font-bold text-white mb-6 text-center drop-shadow-sm leading-relaxed">{currentSlide.question}</h3>
                        
                        {/* Construction Area */}
                        <div className="glass-panel min-h-[160px] rounded-[2rem] p-5 mb-8 border-2 border-dashed border-indigo-400/30 flex flex-wrap gap-2 items-start content-start bg-indigo-500/5 transition-colors relative shadow-inner">
                             {constructedSentence.length === 0 && (
                                 <div className="absolute inset-0 flex items-center justify-center text-indigo-200/40 font-bold uppercase tracking-widest text-xs pointer-events-none">
                                     Нажми на слова ниже...
                                 </div>
                             )}
                             {constructedSentence.map((word, idx) => (
                                 <button 
                                    key={idx} 
                                    onClick={() => handlePuzzleWordClick(word, false)}
                                    className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-[0_4px_15px_rgba(79,70,229,0.4)] hover:bg-red-500 transition-all animate-in zoom-in duration-200 hover:scale-95 border border-indigo-400"
                                 >
                                     {word}
                                 </button>
                             ))}
                        </div>

                        {/* Word Bank */}
                        <div className="flex-1">
                            <div className="flex flex-wrap gap-3 justify-center">
                                {puzzleWordBank.map((word, idx) => (
                                    <button 
                                        key={idx} 
                                        onClick={() => handlePuzzleWordClick(word, true)}
                                        className="px-5 py-3 bg-[#1E2332]/80 backdrop-blur-xl border border-white/10 rounded-2xl font-bold text-slate-300 hover:bg-white/10 hover:text-white hover:border-indigo-500/50 hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all active:scale-90 animate-in slide-in-from-bottom-2 duration-300"
                                    >
                                        {word}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Reset Button */}
                        <button 
                            onClick={() => {
                                setConstructedSentence([]);
                                setPuzzleWordBank([...currentSlide.correctSentence, ...(currentSlide.distractorWords || [])].sort(() => Math.random() - 0.5));
                            }}
                            className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white bg-white/5 rounded-full hover:bg-white/10 transition-colors"
                        >
                            <RotateCcw size={18} />
                        </button>

                        {constructedSentence.length > 0 && feedbackStatus === 'NONE' && (
                             <div className="absolute bottom-4 left-6 right-6 z-20 animate-in slide-in-from-bottom-4 duration-300">
                                 <button 
                                    onClick={checkPuzzle}
                                    className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black rounded-2xl uppercase tracking-[0.2em] shadow-[0_10px_40px_rgba(79,70,229,0.5)] transition-all active:scale-95 border border-white/20"
                                 >
                                     ПРОВЕРИТЬ
                                 </button>
                             </div>
                        )}
                    </div>
                );

            case 'MATCHING':
                return (
                    <div className="flex flex-col h-full p-6 justify-center">
                         <h3 className="text-xl font-bold text-white mb-8 text-center drop-shadow-sm">{currentSlide.question}</h3>
                         <div className="grid grid-cols-2 gap-4 w-full max-w-sm mx-auto">
                             <div className="space-y-3">
                                 {currentSlide.pairs.map(pair => {
                                     const isMatched = matchedPairs.includes(pair.id);
                                     const isSelected = selectedPairId === pair.id;
                                     return (
                                         <button 
                                            key={pair.id + '_left'}
                                            disabled={isMatched}
                                            onClick={() => handleMatching(pair, 'LEFT')}
                                            className={`w-full p-4 min-h-[80px] rounded-2xl border-2 text-xs font-bold transition-all relative overflow-hidden backdrop-blur-xl flex items-center justify-center text-center
                                                ${isMatched ? 'opacity-0 pointer-events-none' :
                                                isSelected 
                                                    ? 'bg-indigo-600 border-indigo-400 text-white shadow-[0_0_30px_rgba(99,102,241,0.5)] scale-105 z-10' 
                                                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                                                }
                                            `}
                                         >
                                             {pair.left}
                                         </button>
                                     );
                                 })}
                             </div>
                             <div className="space-y-3">
                                 {currentSlide.pairs.map(pair => {
                                     const isMatched = matchedPairs.includes(pair.id);
                                     return (
                                         <button 
                                            key={pair.id + '_right'}
                                            disabled={isMatched}
                                            onClick={() => handleMatching(pair, 'RIGHT')}
                                            className={`w-full p-4 min-h-[80px] rounded-2xl border-2 text-xs font-bold transition-all backdrop-blur-xl flex items-center justify-center text-center
                                                ${isMatched ? 'opacity-0 pointer-events-none' :
                                                'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                                                }
                                            `}
                                         >
                                             {pair.right}
                                         </button>
                                     );
                                 })}
                             </div>
                         </div>
                    </div>
                );

            case 'INPUT':
                return (
                    <div className="flex flex-col h-full p-6 justify-center">
                        <div className="flex items-center gap-2 text-indigo-300 font-bold uppercase text-xs tracking-widest mb-6 px-2">
                            <Sparkles size={14} /> Твои мысли
                        </div>
                        <h3 className="text-2xl font-black text-white mb-6 leading-tight drop-shadow-md">{currentSlide.question}</h3>
                        <div className="relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[1.2rem] opacity-50 group-hover:opacity-100 transition duration-500 blur"></div>
                            <textarea 
                                className="relative w-full h-48 bg-[#0A0F1C]/90 backdrop-blur-xl rounded-2xl p-6 text-white placeholder:text-slate-600 focus:outline-none resize-none text-lg leading-relaxed border border-white/10"
                                placeholder={currentSlide.placeholder}
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                            />
                        </div>
                        <div className="flex justify-between items-center mt-4 px-2">
                             <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                                Мин. {currentSlide.minLength || 3} символов
                             </p>
                             <div className={`text-xs font-bold ${inputText.length >= (currentSlide.minLength || 3) ? 'text-green-500' : 'text-slate-600'}`}>
                                 {inputText.length} / {currentSlide.minLength || 3}
                             </div>
                        </div>
                    </div>
                );

            case 'GAME':
                if (feedbackStatus === 'CORRECT') {
                     return (
                         <div className="flex flex-col h-full items-center justify-center p-6 text-center animate-in zoom-in duration-500">
                             <div className="relative mb-10">
                                 <div className="absolute inset-0 bg-yellow-500 blur-[80px] opacity-40"></div>
                                 <Trophy size={100} className="text-yellow-400 drop-shadow-[0_10px_40px_rgba(250,204,21,0.6)] relative z-10" fill="currentColor" />
                             </div>
                             <h3 className="text-4xl font-black text-white mb-2">Победа!</h3>
                             <p className="text-indigo-200 text-lg font-medium mb-12">Твой результат: <span className="text-white font-bold text-2xl">{gameScore}</span></p>
                             
                             <div className="glass-panel px-6 py-4 rounded-2xl border border-white/10 bg-white/5 animate-pulse">
                                 <p className="text-slate-300 text-sm font-bold uppercase tracking-wider">Нажми "Продолжить" внизу</p>
                             </div>
                         </div>
                     )
                }
                return (
                    <div className="flex flex-col h-full p-2 rounded-[2.5rem] overflow-hidden relative">
                         {/* Game Container styling handled in MiniGames.tsx now */}
                        {currentSlide.gameType === 'FOCUS_DEFENDER' && <FocusDefender config={currentSlide} onComplete={handleGameComplete} />}
                        {currentSlide.gameType === 'NEURO_MATCH' && <EmbeddedMemoryGame config={currentSlide} onComplete={handleGameComplete} />}
                    </div>
                );

          default:
              return null;
      }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#020617]/60 backdrop-blur-xl animate-in fade-in duration-300">
      
      {/* FULL SCREEN MODAL */}
      <div className={`w-full h-full sm:max-w-md sm:h-[90vh] bg-[#0A0F1C]/90 backdrop-blur-3xl sm:rounded-[3rem] flex flex-col relative overflow-hidden shadow-2xl ring-1 ring-white/10 ${isShake ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
        
        {/* LIQUID BACKGROUND */}
        <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute top-[-10%] left-[-20%] w-[100%] h-[60%] bg-indigo-600/30 rounded-full blur-[120px] animate-[pulse_8s_infinite]"></div>
            <div className="absolute bottom-[-10%] right-[-20%] w-[100%] h-[60%] bg-purple-600/30 rounded-full blur-[120px] animate-[pulse_10s_infinite_reverse]"></div>
        </div>

        {/* HEADER */}
        <div className={`px-6 pt-10 pb-4 flex items-center gap-4 relative z-10 bg-gradient-to-b from-[#0A0F1C] to-transparent`}>
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-300 hover:bg-white/10 hover:text-white transition-colors backdrop-blur-md border border-white/5">
                <X size={20} />
            </button>
            
            {/* Progress Bar */}
            <div className="flex-1 h-2 bg-slate-800/50 rounded-full overflow-hidden backdrop-blur-sm border border-white/5">
                <div 
                    className={`h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_15px_rgba(99,102,241,0.6)] ${task.isBoss ? 'bg-red-500' : 'bg-indigo-500'}`}
                    style={{ width: `${progress}%` }}
                >
                     <div className="absolute inset-0 bg-white/20 animate-[pulse_2s_infinite]"></div>
                </div>
            </div>

            {/* Lives */}
            <div className={`flex items-center gap-1.5 font-bold font-mono text-lg glass-panel px-3 py-1 rounded-full border bg-white/5 backdrop-blur-md ${task.isBoss ? 'text-red-400 border-red-500/30' : 'text-rose-400 border-rose-500/30'}`}>
                {task.isBoss ? <Skull size={18} /> : <Heart fill="currentColor" size={18} />}
                {lives}
            </div>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 relative overflow-y-auto z-10 scrollbar-hide">
            {renderSlideContent()}
        </div>

        {/* FOOTER */}
        <div className={`p-6 border-t border-white/5 bg-[#0A0F1C]/80 backdrop-blur-3xl transition-all duration-300 relative z-20 
            ${feedbackStatus === 'CORRECT' ? 'bg-green-900/20 border-t-green-500/30' : ''} 
            ${feedbackStatus === 'WRONG' ? 'bg-red-900/20 border-t-red-500/30' : ''}
        `}>
            
            {feedbackStatus === 'CORRECT' && currentSlide.type !== 'GAME' && (
                <div className="flex items-center gap-4 mb-6 text-green-400 font-bold animate-in slide-in-from-bottom-4 duration-300">
                    <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/50 shadow-[0_0_30px_rgba(34,197,94,0.4)]">
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <div className="text-lg leading-tight">Верно!</div>
                        {currentSlide.type === 'POLL' ? (
                            <div className="text-xs text-green-300/60 font-medium mt-0.5">Мнение принято</div>
                        ) : currentSlide.type === 'QUIZ' && currentSlide.explanation ? (
                            <div className="text-xs text-green-300/80 font-medium mt-0.5 leading-snug">{currentSlide.explanation}</div>
                        ) : null}
                    </div>
                </div>
            )}

            {feedbackStatus === 'WRONG' && (
                <div className="flex items-center gap-4 mb-6 text-red-400 font-bold animate-in slide-in-from-bottom-4 duration-300">
                     <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.4)]">
                        <AlertCircle size={24} />
                    </div>
                    <div>
                        <div className="text-lg leading-tight">Ошибка</div>
                        <div className="text-xs text-red-300/60 font-medium mt-0.5">Попробуй еще раз</div>
                    </div>
                </div>
            )}

            {/* MAIN ACTION BUTTON */}
            {feedbackStatus === 'NONE' ? (
                currentSlide.type === 'INPUT' ? (
                    <button 
                        onClick={handleInputSubmit}
                        disabled={inputText.length < (currentSlide.minLength || 3)}
                        className="w-full bg-indigo-600 disabled:bg-slate-800 disabled:text-slate-600 disabled:shadow-none text-white font-black py-4 rounded-2xl uppercase tracking-[0.2em] transition-all shadow-[0_10px_40px_rgba(79,70,229,0.4)] hover:shadow-[0_15px_50px_rgba(79,70,229,0.6)] hover:scale-[1.02] active:scale-[0.98]"
                    >
                        ПРОВЕРИТЬ
                    </button>
                ) :
                currentSlide.type === 'GAME' ? (
                    <div className="text-center text-[10px] text-slate-500 font-bold uppercase tracking-widest bg-white/5 py-3 rounded-xl border border-white/5">
                       Выполните задание выше
                    </div>
                ) :
                currentSlide.type === 'PUZZLE' ? (
                     // Button is rendered inside puzzle content for better UX
                     null
                ) :
                (currentSlide.type === 'THEORY' || currentSlide.type === 'VIDEO') ? (
                    <button 
                        onClick={handleNext}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-2xl uppercase tracking-[0.2em] transition-all shadow-[0_10px_40px_rgba(79,70,229,0.4)] hover:shadow-[0_15px_50px_rgba(79,70,229,0.6)] hover:scale-[1.02] active:scale-[0.98] group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                        {currentSlide.type === 'THEORY' && currentSlide.buttonText ? currentSlide.buttonText : 'ДАЛЕЕ'}
                    </button>
                ) : (
                    <button 
                        disabled 
                        className="w-full bg-slate-800/50 text-slate-600 font-bold py-4 rounded-2xl uppercase tracking-[0.2em] cursor-not-allowed border border-white/5"
                    >
                        ВЫБЕРИ ОТВЕТ
                    </button>
                )
            ) : (
                <button 
                    onClick={feedbackStatus === 'CORRECT' ? handleNext : () => setFeedbackStatus('NONE')}
                    className={`w-full font-black py-4 rounded-2xl uppercase tracking-[0.2em] transition-all active:scale-[0.98] shadow-lg relative overflow-hidden group
                        ${feedbackStatus === 'CORRECT' 
                            ? 'bg-green-500 hover:bg-green-400 text-white shadow-green-900/50' 
                            : 'bg-red-500 hover:bg-red-400 text-white shadow-red-900/50'}
                    `}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                    {feedbackStatus === 'CORRECT' ? 'ПРОДОЛЖИТЬ' : 'ЕЩЕ РАЗ'}
                </button>
            )}

        </div>

      </div>
    </div>
  );
};
