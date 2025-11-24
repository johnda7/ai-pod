
import React from 'react';
import { LECTURES } from '../constants';
import { Play, BookOpen, Clock, List } from 'lucide-react';

export const ParentDashboard: React.FC = () => {
  return (
    <div className="px-4 pb-20">
      <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 mb-6 mt-2">
        <h2 className="text-teal-800 font-bold text-lg mb-1">Родительский клуб</h2>
        <p className="text-teal-600 text-sm">Здесь мы учимся понимать наших детей и строить доверительные отношения.</p>
      </div>

      <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
        <BookOpen size={20} className="text-teal-600" />
        Лекции курса
      </h3>

      <div className="space-y-6">
        {LECTURES.map((lecture) => (
          <div key={lecture.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all group">
            <div className="relative h-48 w-full">
              <img src={lecture.thumbnail} alt={lecture.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
                <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center pl-1 shadow-lg transform group-hover:scale-110 transition-transform">
                  <Play size={24} className="text-slate-900" fill="currentColor" />
                </div>
              </div>
              <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md font-bold backdrop-blur-sm">
                {lecture.duration}
              </span>
            </div>
            
            <div className="p-5">
              <div className="flex items-center gap-2 mb-3">
                 <span className="text-[10px] font-bold text-white bg-teal-500 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Неделя {lecture.week}
                 </span>
              </div>
              
              <h4 className="font-bold text-slate-800 text-lg mb-2 leading-tight">{lecture.title}</h4>
              <p className="text-sm text-slate-500 mb-4">{lecture.description}</p>

              {/* Topics List if available */}
              {lecture.topics && lecture.topics.length > 0 && (
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                      <h5 className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                          <List size={14} /> В этом уроке:
                      </h5>
                      <ul className="space-y-2">
                          {lecture.topics.map((topic, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                                  <span className="text-teal-400 mt-1.5 w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0"></span>
                                  <span className="leading-snug">{topic}</span>
                              </li>
                          ))}
                      </ul>
                  </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center">
          <h3 className="font-bold text-slate-800 mb-2">Нужна консультация?</h3>
          <p className="text-sm text-slate-500 mb-4">Наши кураторы готовы ответить на вопросы по программе.</p>
          <button className="w-full py-3 border border-teal-600 text-teal-600 rounded-xl font-bold hover:bg-teal-50 transition-colors">
              Написать куратору
          </button>
      </div>
    </div>
  );
};