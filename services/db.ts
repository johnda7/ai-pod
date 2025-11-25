import { Task, User, UserRole, StudentStats } from '../types';
import { MOCK_USER, MOCK_STUDENTS, TASKS } from '../constants';
import { supabase, isSupabaseEnabled } from './supabaseClient';
import { sheetsAPI, isGoogleSheetsEnabled } from './googleSheetsService';

/**
 * DB SERVICE (Fixed for Real Progress & Telegram ID)
 */

const STORAGE_KEYS = {
  USERS: 'ai_teenager_users_v4', // Version bumped to reset stuck data (350 points)
  CURRENT_USER_ID: 'ai_teenager_current_id_v4'
};

// --- INITIALIZATION ---

export const getOrCreateUser = async (telegramUser: any | null): Promise<User> => {
  let userId: string;
  let isGuest = false;

  console.log("DB: Identifying User...", telegramUser);

  // 1. DETERMINE ID SOURCE
  if (telegramUser?.id) {
    // REAL TELEGRAM USER
    userId = telegramUser.id.toString();
  } else {
    // GUEST / BROWSER USER
    isGuest = true;
    const storedId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    if (storedId) {
      userId = storedId;
    } else {
      userId = 'guest_' + Date.now();
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, userId);
    }
  }

  // DEFAULT NEW USER STATE (Start from 0 XP, not 1250!)
  const newUserTemplate: User = {
    id: userId, // Temporarily use TG ID or Guest ID
    telegramId: telegramUser?.id,
    username: telegramUser?.username || (isGuest ? undefined : 'User'),
    name: telegramUser?.first_name || (isGuest ? 'Гость' : 'Студент'),
    role: UserRole.TEEN,
    xp: 0, 
    coins: 100, // Welcome bonus
    level: 1,
    hp: 5,
    maxHp: 5,
    avatarUrl: telegramUser?.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}&backgroundColor=b6e3f4`,
    streak: 0,
    completedTaskIds: [],
    interest: 'Гейминг',
    inventory: [],
    league: 'BRONZE'
  };

  // 2. SUPABASE FLOW (PRIORITY)
  if (isSupabaseEnabled && !isGuest) {
    try {
      console.log("DB: Checking Supabase for TG ID:", userId);
      
      // Try to get user by Telegram ID
      const { data: existingUser, error } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', userId)
        .single();

      if (existingUser) {
        console.log('✅ Found User in Supabase:', existingUser.name, 'XP:', existingUser.xp);
        
        // Fetch progress
        const { data: progressData } = await supabase
          .from('progress')
          .select('task_id')
          .eq('user_id', existingUser.id);

        // Return merged data
        return {
          ...newUserTemplate,
          id: existingUser.id, // Use Supabase UUID
          name: existingUser.name,
          xp: existingUser.xp || 0,
          coins: existingUser.coins || 0,
          level: existingUser.level || 1,
          interest: existingUser.interest || 'Гейминг',
          completedTaskIds: progressData?.map((p: any) => p.task_id) || [],
          // Keep the avatar from Telegram if available, otherwise DB or default
          avatarUrl: telegramUser?.photo_url || existingUser.avatar_url || newUserTemplate.avatarUrl
        };
      } else {
        // User doesn't exist in Supabase -> CREATE THEM
        console.log('✨ Creating new user in Supabase for TG ID:', userId);
        
        const dbUserPayload = {
          telegram_id: userId, // Store the TG ID string
          username: newUserTemplate.username,
          name: newUserTemplate.name,
          role: newUserTemplate.role,
          xp: newUserTemplate.xp,
          coins: newUserTemplate.coins,
          level: newUserTemplate.level,
          hp: newUserTemplate.hp,
          max_hp: newUserTemplate.maxHp,
          avatar_url: newUserTemplate.avatarUrl,
          streak: newUserTemplate.streak,
          interest: newUserTemplate.interest
        };

        const { data: createdUser, error: createError } = await supabase
            .from('users')
            .insert(dbUserPayload)
            .select()
            .single();
        
        if (createError) {
            console.error("Supabase Create Failed:", createError);
            throw createError;
        }

        return { ...newUserTemplate, id: createdUser.id };
      }
    } catch (e) {
      console.error("Supabase Error (Fallback to Local):", e);
      // Fallback to local storage if Supabase fails (offline)
    }
  }

  // 3. LOCAL STORAGE FLOW (FALLBACK OR GUEST)
  const users = getUsersFromStorage();
  let localUser = users.find(u => u.telegramId?.toString() === userId || u.id === userId);

  if (!localUser) {
    localUser = newUserTemplate;
    saveUserToStorage(localUser);
    console.log('👤 Created new Local User:', localUser.name);
  } else {
    // If we have a local user, ensure we update their avatar if TG provides a new one
    if (telegramUser?.photo_url && localUser.avatarUrl !== telegramUser.photo_url) {
        localUser.avatarUrl = telegramUser.photo_url;
        localUser.name = telegramUser.first_name; // Update name too
        saveUserToStorage(localUser);
    }
    console.log('📂 Loaded Local User:', localUser.name, 'XP:', localUser.xp);
  }

  return localUser;
};

export const completeTask = async (userId: string, task: Task): Promise<void> => {
  console.log(`🚀 Completing task: ${task.title} for user ${userId}`);

  // 1. UPDATE LOCAL STORAGE (Optimistic UI & Backup)
  const users = getUsersFromStorage();
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex !== -1) {
      const u = users[userIndex];
      if (!u.completedTaskIds.includes(task.id)) {
        u.completedTaskIds.push(task.id);
        u.xp += task.xpReward;
        u.coins = (u.coins || 0) + (task.coinsReward || 0);
        u.level = Math.floor(u.xp / 500) + 1;
        users[userIndex] = u;
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      }
  }

  // 2. UPDATE SUPABASE
  if (isSupabaseEnabled) {
      try {
        // userId should be the UUID from Supabase if getOrCreateUser worked correctly
        
        // Double check if this task is already logged
        const { data: existingProgress } = await supabase
            .from('progress')
            .select('*')
            .eq('user_id', userId)
            .eq('task_id', task.id)
            .single();

        if (!existingProgress) {
            // Insert Progress
            const { error: progressError } = await supabase.from('progress').insert({
                user_id: userId,
                task_id: task.id,
                xp_earned: task.xpReward,
                completed_at: new Date().toISOString()
            });

            if (progressError) console.error("Progress Insert Error", progressError);

            // Update User Stats (Fetch first to be safe, or increment)
            // We use rpc or simple update. Simple update for now.
            const { data: currentUser } = await supabase.from('users').select('xp, coins').eq('id', userId).single();
            
            if (currentUser) {
                const newXp = (currentUser.xp || 0) + task.xpReward;
                const newCoins = (currentUser.coins || 0) + (task.coinsReward || 0);
                const newLevel = Math.floor(newXp / 500) + 1;

                await supabase
                    .from('users')
                    .update({ xp: newXp, coins: newCoins, level: newLevel })
                    .eq('id', userId);
                
                console.log('☁️ Synced task to Supabase');
            }
        }
      } catch (e) {
          console.error("Supabase Sync Error:", e);
      }
  }
};

export const getAllStudentsStats = async (): Promise<StudentStats[]> => {
  // 1. SUPABASE
  if (isSupabaseEnabled) {
      try {
          const { data: users, error } = await supabase
              .from('users')
              .select('*')
              .eq('role', 'TEEN');

          if (error) throw error;

          if (users) {
              const userIds = users.map((u: any) => u.id);
              
              const { data: progressData } = await supabase
                  .from('progress')
                  .select('*')
                  .in('user_id', userIds);
              
              return users.map((u: any) => {
                 const userProgress = progressData?.filter((p: any) => p.user_id === u.id) || [];
                 const completedIds = userProgress.map((p: any) => p.task_id);
                 
                 // Calc progress
                 const week1Tasks = TASKS.filter(t => t.week === 1).map(t => t.id);
                 const week2Tasks = TASKS.filter(t => t.week === 2).map(t => t.id);

                 const w1 = week1Tasks.length ? Math.round((week1Tasks.filter(id => completedIds.includes(id)).length / week1Tasks.length) * 100) : 0;
                 const w2 = week2Tasks.length ? Math.round((week2Tasks.filter(id => completedIds.includes(id)).length / week2Tasks.length) * 100) : 0;

                 let status: 'active' | 'risk' | 'inactive' = 'active';
                 if (w1 < 50) status = 'risk';
                 if (completedIds.length === 0) status = 'inactive';

                 return {
                     id: u.id,
                     name: u.name,
                     avatar: u.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.id}`,
                     week1Progress: w1,
                     week2Progress: w2,
                     week3Progress: 0,
                     status: status,
                     lastLogin: new Date(u.updated_at || Date.now()).toLocaleDateString(),
                     totalXp: u.xp || 0,
                     tasksCompletedCount: completedIds.length
                 };
              });
          }
      } catch (e) {
          console.error("Supabase stats fetch error:", e);
      }
  }

  // 2. FALLBACK MOCK
  return MOCK_STUDENTS.map(s => ({
      id: s.id,
      name: s.name,
      avatar: s.avatar,
      week1Progress: 0,
      week2Progress: 0,
      week3Progress: 0,
      status: 'active',
      lastLogin: 'Today',
      totalXp: 0,
      tasksCompletedCount: 0
  }));
};

// --- HELPERS ---
function getUsersFromStorage(): User[] {
  const str = localStorage.getItem(STORAGE_KEYS.USERS);
  return str ? JSON.parse(str) : [];
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