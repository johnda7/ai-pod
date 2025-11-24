



import { Task, TaskProgress, User, UserRole, StudentStats } from '../types';
import { MOCK_USER, MOCK_STUDENTS, TASKS } from '../constants';
import { supabase, isSupabaseEnabled } from './supabaseClient';
import { sheetsAPI, isGoogleSheetsEnabled } from './googleSheetsService';

/**
 * DB SERVICE
 * 
 * Priority:
 * 1. Google Sheets (if URL provided) - EASIEST FOR USER
 * 2. Supabase (if keys provided)
 * 3. LocalStorage (Fallback/Demo)
 */

const STORAGE_KEYS = {
  USERS: 'ai_teenager_users',
  PROGRESS: 'ai_teenager_progress',
};

// --- INITIALIZATION ---

export const getOrCreateUser = async (telegramUser: any | null): Promise<User> => {
  
  // 1. GOOGLE SHEETS MODE
  if (isGoogleSheetsEnabled && telegramUser?.id) {
    try {
        const sheetUser = await sheetsAPI.getUser(telegramUser.id);
        if (sheetUser) return sheetUser;

        // Create new
        const newUser: User = {
            id: `u_${telegramUser.id}`,
            telegramId: telegramUser.id,
            username: telegramUser.username,
            name: telegramUser.first_name || 'Student',
            role: UserRole.TEEN,
            xp: 0,
            coins: 100, // Starting Bonus
            level: 1,
            hp: 5,
            maxHp: 5,
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + telegramUser.id,
            streak: 0,
            completedTaskIds: [],
            interest: 'Гейминг',
            inventory: [],
            league: 'BRONZE'
        };
        await sheetsAPI.createUser(newUser);
        return newUser;
    } catch (e) {
        console.error("Sheets Init Error, falling back to local", e);
    }
  }

  // 2. SUPABASE MODE
  if (isSupabaseEnabled && telegramUser?.id && supabase) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', telegramUser.id)
      .single();

    if (data) {
      const { data: progressData } = await supabase
        .from('progress')
        .select('task_id')
        .eq('user_id', data.id);

      return {
        ...data,
        id: data.id,
        telegramId: data.telegram_id,
        avatarUrl: data.avatar_url,
        completedTaskIds: progressData?.map((p: any) => p.task_id) || [],
        inventory: [], // Should load from DB in real app
        coins: data.coins || 0,
        league: 'BRONZE'
      } as User;
    }

    const newUser = {
      telegram_id: telegramUser.id,
      username: telegramUser.username,
      name: telegramUser.first_name || 'Student',
      role: UserRole.TEEN,
      xp: 0,
      coins: 100,
      level: 1,
      hp: 5,
      max_hp: 5,
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + telegramUser.id,
      streak: 0,
      interest: 'Гейминг'
    };

    const { data: createdUser, error: createError } = await supabase
        .from('users')
        .insert(newUser)
        .select()
        .single();
    
    if (createError) throw createError;

    return {
        ...createdUser,
        id: createdUser.id,
        telegramId: createdUser.telegram_id,
        avatarUrl: createdUser.avatar_url,
        completedTaskIds: [],
        inventory: [],
        league: 'BRONZE'
    } as User;
  }

  // 3. LOCAL MODE (FALLBACK)
  const users = getUsersFromStorage();
  
  if (telegramUser) {
    const existing = users.find(u => u.telegramId === telegramUser.id);
    if (existing) return existing;

    const newUser: User = {
      id: `u_${telegramUser.id}`,
      telegramId: telegramUser.id,
      username: telegramUser.username,
      name: telegramUser.first_name || 'Student',
      role: UserRole.TEEN,
      xp: 0,
      coins: 100,
      level: 1,
      hp: 5,
      maxHp: 5,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + telegramUser.id,
      streak: 0,
      completedTaskIds: [],
      interest: 'Гейминг',
      inventory: [],
      league: 'BRONZE'
    };
    saveUserToStorage(newUser);
    return newUser;
  }

  const storedMock = users.find(u => u.id === MOCK_USER.id);
  if (storedMock) return storedMock;
  saveUserToStorage(MOCK_USER);
  return MOCK_USER;
};

export const updateUserProfile = async (user: User): Promise<void> => {
  // 1. GOOGLE SHEETS
  if (isGoogleSheetsEnabled) {
      await sheetsAPI.updateUser(user);
      return;
  }

  // 2. SUPABASE
  if (isSupabaseEnabled && supabase) {
     await supabase
        .from('users')
        .update({ 
            interest: user.interest,
            xp: user.xp,
            coins: user.coins,
            role: user.role 
        })
        .eq('id', user.id);
     return;
  }

  // 3. LOCAL
  const users = getUsersFromStorage();
  const index = users.findIndex(u => u.id === user.id);
  if (index !== -1) {
    users[index] = user;
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }
};

export const completeTask = async (userId: string, task: Task): Promise<void> => {
  const users = getUsersFromStorage();
  const userIndex = users.findIndex(u => u.id === userId);
  let currentUser = users[userIndex];
  
  // Update local object first for speed
  if (userIndex !== -1) {
      if (!currentUser.completedTaskIds.includes(task.id)) {
        currentUser.completedTaskIds.push(task.id);
        currentUser.xp += task.xpReward;
        currentUser.coins = (currentUser.coins || 0) + (task.coinsReward || 0); // Add Coins
        currentUser.level = Math.floor(currentUser.xp / 500) + 1;
        
        // Save to local storage immediately for UI responsiveness
        users[userIndex] = currentUser;
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      }
  }

  // 1. GOOGLE SHEETS
  if (isGoogleSheetsEnabled) {
      await sheetsAPI.updateUser(currentUser); // Save new XP/Tasks
      await sheetsAPI.saveProgress(userId, task); // Log event
      return;
  }

  // 2. SUPABASE
  if (isSupabaseEnabled && supabase) {
      await supabase
        .from('progress')
        .insert({
            user_id: userId,
            task_id: task.id,
            xp_earned: task.xpReward,
            completed_at: new Date().toISOString()
        });
      
      const { data: u } = await supabase.from('users').select('xp, coins').eq('id', userId).single();
      if (u) {
          await supabase.from('users').update({ 
              xp: u.xp + task.xpReward,
              coins: (u.coins || 0) + (task.coinsReward || 0)
          }).eq('id', userId);
      }
      return;
  }

  // 3. LOCAL (Already done above)
  const progressRecord: TaskProgress = {
    userId,
    taskId: task.id,
    completedAt: new Date().toISOString(),
    xpEarned: task.xpReward
  };
  saveProgressToStorage(progressRecord);
};


export const getAllStudentsStats = async (): Promise<StudentStats[]> => {
  // 1. GOOGLE SHEETS
  if (isGoogleSheetsEnabled) {
      return await sheetsAPI.getAllStudents();
  }

  // 2. SUPABASE
  if (isSupabaseEnabled && supabase) {
      const { data: users } = await supabase.from('users').select('*').eq('role', UserRole.TEEN);
      if (!users) return [];
      const { data: progress } = await supabase.from('progress').select('*');

      return users.map((u: any) => {
          const userProgress = progress?.filter((p: any) => p.user_id === u.id) || [];
          const completedIds = userProgress.map((p: any) => p.task_id);
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
            avatar: u.avatar_url,
            week1Progress: w1Progress,
            week2Progress: w2Progress,
            week3Progress: 0,
            status: status,
            lastLogin: 'Web',
            totalXp: u.xp,
            tasksCompletedCount: completedIds.length
          };
      });
  }

  // 3. LOCAL
  const allUsers = getUsersFromStorage();
  const teens = allUsers.filter(u => u.role === UserRole.TEEN);

  return teens.map(user => {
    const week1Tasks = TASKS.filter(t => t.week === 1).map(t => t.id);
    const week2Tasks = TASKS.filter(t => t.week === 2).map(t => t.id);

    const completedCount1 = week1Tasks.filter(id => user.completedTaskIds.includes(id)).length;
    const completedCount2 = week2Tasks.filter(id => user.completedTaskIds.includes(id)).length;

    const w1Progress = Math.round((completedCount1 / week1Tasks.length) * 100) || 0;
    const w2Progress = Math.round((completedCount2 / week2Tasks.length) * 100) || 0;

    let status: 'active' | 'risk' | 'inactive' = 'active';
    if (w1Progress < 50) status = 'risk';
    if (user.completedTaskIds.length === 0) status = 'inactive';

    return {
      id: user.id,
      name: user.name,
      avatar: user.avatarUrl,
      week1Progress: w1Progress,
      week2Progress: w2Progress,
      week3Progress: 0,
      status: status,
      lastLogin: 'Сегодня',
      totalXp: user.xp,
      tasksCompletedCount: user.completedTaskIds.length
    };
  });
};


// --- INTERNAL HELPERS ---
function getUsersFromStorage(): User[] {
  const str = localStorage.getItem(STORAGE_KEYS.USERS);
  if (!str) return [MOCK_USER, ...mockStudentsAsUsers()];
  return JSON.parse(str);
}

function saveUserToStorage(user: User) {
  const users = getUsersFromStorage();
  const index = users.findIndex(u => u.id === user.id);
  if (index === -1) {
    users.push(user);
  } else {
    users[index] = user;
  }
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

function saveProgressToStorage(progress: TaskProgress) {
  const str = localStorage.getItem(STORAGE_KEYS.PROGRESS);
  const allProgress: TaskProgress[] = str ? JSON.parse(str) : [];
  allProgress.push(progress);
  localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(allProgress));
}

function mockStudentsAsUsers(): User[] {
  return MOCK_STUDENTS.map((s) => ({
    id: s.id,
    name: s.name,
    role: UserRole.TEEN,
    xp: s.tasksCompleted * 100,
    coins: 100,
    level: 2,
    hp: 5,
    maxHp: 5,
    avatarUrl: s.avatar,
    streak: 5,
    completedTaskIds: [], 
    interest: 'Гейминг',
    inventory: [],
    league: 'BRONZE'
  }));
}