import React, { useState } from 'react';
import { Search, Filter, AlertTriangle, Check, X, ChevronDown } from 'lucide-react';
import { MOCK_STUDENTS } from '../constants';

export const CuratorDashboard: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'risk'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = MOCK_STUDENTS
    .filter(s => filter === 'all' || (s.status === 'risk' || s.status === 'inactive'))
    .filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const stats = {
      total: MOCK_STUDENTS.length,
      risk: MOCK_STUDENTS.filter(s => s.status === 'risk').length,
      inactive: MOCK_STUDENTS.filter(s => s.status === 'inactive').length,
      active: MOCK_STUDENTS.filter(s => s.status === 'active').length
  };

  return (
    <div className="bg-slate-50 min-h-full pb-20 flex flex-col h-screen">
      {/* CRM Header */}
      <div className="bg-white p-4 border-b border-slate-200 shadow-sm z-20">
         <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-slate-800">Группа "Поток 1"</h2>
            <div className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500 font-mono">
                ID: 8472
            </div>
         </div>

         {/* Quick Stats Row */}
         <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
             <div className="flex-1 min-w-[80px] bg-indigo-50 border border-indigo-100 p-2 rounded-lg text-center">
                 <div className="text-xl font-bold text-indigo-700">{stats.total}</div>
                 <div className="text-[10px] font-bold text-indigo-400 uppercase">Всего</div>
             </div>
             <div className="flex-1 min-w-[80px] bg-red-50 border border-red-100 p-2 rounded-lg text-center">
                 <div className="text-xl font-bold text-red-700">{stats.risk}</div>
                 <div className="text-[10px] font-bold text-red-400 uppercase">Риск</div>
             </div>
             <div className="flex-1 min-w-[80px] bg-slate-50 border border-slate-200 p-2 rounded-lg text-center">
                 <div className="text-xl font-bold text-slate-700">{stats.inactive}</div>
                 <div className="text-[10px] font-bold text-slate-400 uppercase">Спят</div>
             </div>
         </div>

         {/* Toolbar */}
         <div className="flex gap-2">
             <div className="relative flex-1">
                 <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                 <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Поиск по имени..." 
                    className="w-full pl-9 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                 />
             </div>
             <button 
                onClick={() => setFilter(filter === 'all' ? 'risk' : 'all')}
                className={`px-3 py-2 rounded-lg border flex items-center gap-2 transition-colors ${filter === 'risk' ? 'bg-red-600 text-white border-red-600' : 'bg-white border-slate-300 text-slate-600'}`}
             >
                 <AlertTriangle size={16} />
                 <span className="text-xs font-bold hidden sm:inline">Риск</span>
             </button>
         </div>
      </div>

      {/* Data Grid */}
      <div className="flex-1 overflow-y-auto p-2">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                      <tr>
                          <th className="px-4 py-3">Ученик</th>
                          <th className="px-2 py-3 text-center">Прогресс</th>
                          <th className="px-2 py-3 text-center hidden sm:table-cell">Статус</th>
                          <th className="px-2 py-3 text-right">Действие</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                      {filteredStudents.map((student) => (
                          <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-4 py-3">
                                  <div className="flex items-center gap-3">
                                      <img src={student.avatar} className="w-8 h-8 rounded-full bg-slate-100" alt="" />
                                      <div>
                                          <div className="font-bold text-slate-800">{student.name}</div>
                                          <div className="text-[10px] text-slate-400">Вход: {student.lastLogin}</div>
                                      </div>
                                  </div>
                              </td>
                              <td className="px-2 py-3">
                                  <div className="flex flex-col gap-1 max-w-[100px] mx-auto">
                                      <div className="flex h-1.5 bg-slate-100 rounded-full overflow-hidden w-full">
                                          <div style={{ width: `${student.week1Progress}%` }} className="bg-green-500"></div>
                                          <div style={{ width: `${student.week2Progress}%` }} className="bg-indigo-500"></div>
                                      </div>
                                      <div className="text-[10px] text-slate-400 text-center">
                                          {student.tasksCompleted} заданий
                                      </div>
                                  </div>
                              </td>
                              <td className="px-2 py-3 text-center hidden sm:table-cell">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                      student.status === 'active' ? 'bg-green-100 text-green-700' : 
                                      student.status === 'risk' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500'
                                  }`}>
                                      {student.status === 'active' ? 'Актив' : student.status === 'risk' ? 'Риск' : 'Спит'}
                                  </span>
                              </td>
                              <td className="px-2 py-3 text-right">
                                  <button className="text-indigo-600 p-1 hover:bg-indigo-50 rounded">
                                      <ChevronDown size={16} />
                                  </button>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
              
              {filteredStudents.length === 0 && (
                  <div className="p-8 text-center text-slate-400 text-sm">
                      Никого не найдено
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};