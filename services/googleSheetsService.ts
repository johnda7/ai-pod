import { User, Task, StudentStats, UserRole } from '../types';
import { MOCK_USER, MOCK_STUDENTS, TASKS } from '../constants';

// ВСТАВЬТЕ СЮДА URL ВАШЕГО СКРИПТА GOOGLE APPS SCRIPT
// Пример: "https://script.google.com/macros/s/AKfycbx.../exec"
export const GOOGLE_SCRIPT_URL = ""; 

export const isGoogleSheetsEnabled = !!GOOGLE_SCRIPT_URL;

interface SheetResponse {
  status: 'success' | 'error';
  data?: any;
  message?: string;
}

// Helper for making requests to Apps Script
const callScript = async (action: string, payload: any = {}) => {
  if (!GOOGLE_SCRIPT_URL) return null;

  // Apps Script requires POST for everything to avoid CORS issues easily with complex data
  // We send the 'action' inside the body
  const body = JSON.stringify({ action, ...payload });

  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'cors', // Important
      headers: {
        'Content-Type': 'text/plain;charset=utf-8', // 'text/plain' avoids preflight OPTIONS request which GAS hates
      },
      body,
    });

    const json = await response.json();
    return json;
  } catch (error) {
    console.error("Google Sheets API Error:", error);
    return null;
  }
};

export const sheetsAPI = {
  getUser: async (telegramId: number): Promise<User | null> => {
    const res = await callScript('getUser', { telegramId });
    if (res?.status === 'success' && res.data) {
        // Transform raw sheet data back to User type
        return {
            ...res.data,
            completedTaskIds: res.data.completedTaskIds ? JSON.parse(res.data.completedTaskIds) : []
        };
    }
    return null;
  },

  createUser: async (user: User): Promise<User | null> => {
    // Convert array to string for storage
    const payload = {
        ...user,
        completedTaskIds: JSON.stringify(user.completedTaskIds)
    };
    const res = await callScript('createUser', { user: payload });
    return res?.status === 'success' ? user : null;
  },

  updateUser: async (user: User): Promise<void> => {
     const payload = {
        ...user,
        completedTaskIds: JSON.stringify(user.completedTaskIds)
    };
    await callScript('updateUser', { user: payload });
  },

  saveProgress: async (userId: string, task: Task): Promise<void> => {
    await callScript('saveProgress', { 
        userId, 
        taskId: task.id, 
        xp: task.xpReward,
        date: new Date().toISOString()
    });
  },

  getAllStudents: async (): Promise<StudentStats[]> => {
    const res = await callScript('getAllUsers');
    
    if (res?.status === 'success' && Array.isArray(res.data)) {
        // Calculate stats on the fly based on raw user data from sheets
        return res.data
            .filter((u: any) => u.role === UserRole.TEEN)
            .map((u: any) => {
                const completedIds = u.completedTaskIds ? JSON.parse(u.completedTaskIds) : [];
                
                const week1Tasks = TASKS.filter(t => t.week === 1).map(t => t.id);
                const week2Tasks = TASKS.filter(t => t.week === 2).map(t => t.id);

                const completedCount1 = week1Tasks.filter(id => completedIds.includes(id)).length;
                const completedCount2 = week2Tasks.filter(id => completedIds.includes(id)).length;

                const w1Progress = Math.round((completedCount1 / week1Tasks.length) * 100) || 0;
                const w2Progress = Math.round((completedCount2 / week2Tasks.length) * 100) || 0;

                let status: 'active' | 'risk' | 'inactive' = 'active';
                if (w1Progress < 50) status = 'risk';
                if (completedIds.length === 0) status = 'inactive';

                return {
                    id: u.id,
                    name: u.name,
                    avatar: u.avatarUrl,
                    week1Progress: w1Progress,
                    week2Progress: w2Progress,
                    week3Progress: 0,
                    status: status,
                    lastLogin: 'Web',
                    totalXp: parseInt(u.xp) || 0,
                    tasksCompletedCount: completedIds.length
                };
            });
    }
    return [];
  }
};