import React from 'react';
import { LECTURES } from '../constants';
import { Play, BookOpen, Clock } from 'lucide-react';

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

      <div className="space-y-4">
        {LECTURES.map((lecture) => (
          <div key={lecture.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="relative h-32 w-full">
              <img src={lecture.thumbnail} alt={lecture.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center pl-1">
                  <Play size={20} className="text-slate-900" fill="currentColor" />
                </div>
              </div>
              <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded">
                {lecture.duration}
              </span>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                 <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full uppercase">
                    Неделя {lecture.week}
                 </span>
              </div>
              <h4 className="font-bold text-slate-800 mb-1">{lecture.title}</h4>
              <p className="text-sm text-slate-500 line-clamp-2">{lecture.description}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 bg-white p-4 rounded-xl border border-slate-200">
          <h3 className="font-bold mb-2">Нужна консультация?</h3>
          <p className="text-sm text-slate-500 mb-4">Наши кураторы готовы ответить на вопросы по программе.</p>
          <button className="w-full py-2 border border-teal-600 text-teal-600 rounded-lg font-medium hover:bg-teal-50">
              Написать куратору
          </button>
      </div>
    </div>
  );
};