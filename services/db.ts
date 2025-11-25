
import { Task, User, UserRole, StudentStats } from '../types';
import { MOCK_USER, MOCK_STUDENTS, TASKS } from '../constants';
import { supabase, isSupabaseEnabled } from './supabaseClient';
import { sheetsAPI, isGoogleSheetsEnabled } from './googleSheetsService';

/**
 * DB SERVICE (Strict Telegram Sync)
 */

const STORAGE_KEYS = {
  USERS: 'ai_teenager_users_v6',
  CURRENT_USER_ID: 'ai_teenager_current_id_v6'
};

// --- INITIALIZATION ---

export const getOrCreateUser = async (telegramUser: any | null): Promise<User> => {
  let userId: string;
  let isGuest = false;

  console.log("DB: Identifying User...", telegramUser);

  // 1. DETERMINE ID SOURCE (STRICT TELEGRAM PRIORITY)
  if (telegramUser?.id) {
    userId = telegramUser.id.toString();
  } else {
    // Fallback only if absolutely necessary (Dev mode outside TG)
    isGuest = true;
    const storedId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    if (storedId && storedId.startsWith('guest_')) {
      userId = storedId;
    } else {
      userId = 'guest_' + Date.now();
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, userId);
    }
  }

  // DEFAULT TEMPLATE
  const defaultAvatar = telegramUser?.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}&backgroundColor=b6e3f4`;
  const newUserTemplate: User = {
    id: userId,
    telegramId: telegramUser?.id,
    username: telegramUser?.username,
    name: telegramUser?.first_name || 'Студент',
    role: UserRole.TEEN,
    xp: 0, 
    coins: 100, // Welcome bonus
    level: 1,
    hp: 5,
    maxHp: 5,
    avatarUrl: defaultAvatar,
    streak: 0,
    completedTaskIds: [], 
    interest: 'Гейминг',
    inventory: [],
    league: 'BRONZE'
  };

  // 2. GET LOCAL DATA (To preserve your 530 coins if DB is empty)
  const users = getUsersFromStorage();
  // Try to find a user that matches this Telegram ID, or the current Guest ID
  const localUser = users.find(u => 
    u.id === userId || 
    (u.telegramId && u.telegramId.toString() === userId)
  );

  // 3. SUPABASE SYNC
  if (isSupabaseEnabled) {
    try {
      console.log(`DB: Checking Supabase for Telegram ID: ${userId}`);
      
      // Query by telegram_id if available, otherwise by UUID
      let query = supabase.from('users').select('*');
      if (!isGuest) {
          query = query.eq('telegram_id', userId);
      } else {
          query = query.eq('id', userId);
      }

      const { data: existingUser, error } = await query.single();

      if (existingUser) {
        console.log('✅ Found User in Supabase:', existingUser.name);
        
        // Get Progress
        const { data: progressData } = await supabase
          .from('progress')
          .select('task_id')
          .eq('user_id', existingUser.id);

        // MERGE: Cloud is source of truth
        const mergedUser: User = {
          ...newUserTemplate,
          id: existingUser.id, // Use the UUID from DB
          telegramId: existingUser.telegram_id,
          name: existingUser.name,
          xp: Number(existingUser.xp) || 0,
          coins: Number(existingUser.coins) || 0, // Ensure Number type
          level: existingUser.level || 1,
          hp: existingUser.hp ?? 5,
          maxHp: existingUser.max_hp ?? 5,
          interest: existingUser.interest || 'Гейминг',
          inventory: existingUser.inventory || [],
          completedTaskIds: progressData?.map((p: any) => p.task_id) || [],
          avatarUrl: telegramUser?.photo_url || existingUser.avatar_url || defaultAvatar
        };
        
        // Update Local Cache
        saveUserToStorage(mergedUser);
        return mergedUser;

      } else {
        // --- CRITICAL FIX: MIGRATION ---
        console.log('✨ User not found in DB. Uploading Local Data...');
        
        const sourceData = localUser || newUserTemplate;

        const dbUserPayload = {
          telegram_id: !isGuest ? userId : null,
          username: sourceData.username || telegramUser?.username,
          name: sourceData.name || telegramUser?.first_name,
          role: sourceData.role,
          xp: sourceData.xp, // KEEP THE XP
          coins: sourceData.coins, // KEEP THE COINS
          level: sourceData.level,
          hp: sourceData.hp,
          max_hp: sourceData.maxHp,
          avatar_url: sourceData.avatarUrl,
          streak: sourceData.streak,
          interest: sourceData.interest,
          inventory: sourceData.inventory
        };

        // Insert into DB
        let { data: createdUser, error: createError } = await supabase
            .from('users')
            .insert(dbUserPayload)
            .select()
            .single();
        
        if (createError) {
            console.error("❌ DB Create Failed:", createError);
            // Fallback: Just return local so user can continue playing
            return sourceData;
        }

        // Update local with the new DB UUID
        const finalUser = { ...sourceData, id: createdUser.id };
        saveUserToStorage(finalUser);
        
        // Also sync completed tasks if any
        if (sourceData.completedTaskIds.length > 0) {
            for (const taskId of sourceData.completedTaskIds) {
                await supabase.from('progress').insert({
                    user_id: createdUser.id,
                    task_id: taskId,
                    xp_earned: 0, // Already counted in total XP
                    completed_at: new Date().toISOString()
                });
            }
        }

        return finalUser;
      }
    } catch (e) {
      console.error("Supabase Connection Error:", e);
    }
  }

  // Offline / No-DB Fallback
  return localUser || newUserTemplate;
};

export const completeTask = async (userId: string, task: Task): Promise<void> => {
  // 1. UPDATE LOCAL
  const users = getUsersFromStorage();
  const userIndex = users.findIndex(u => u.id === userId);
  let updatedUser: User | null = null;
  
  if (userIndex !== -1) {
      const u = users[userIndex];
      if (!u.completedTaskIds.includes(task.id)) {
        u.completedTaskIds.push(task.id);
        u.xp += task.xpReward;
        u.coins = (u.coins || 0) + (task.coinsReward || 0);
        u.level = Math.floor(u.xp / 500) + 1;
        users[userIndex] = u;
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        updatedUser = u;
      }
  }

  // 2. UPDATE SUPABASE
  if (isSupabaseEnabled && updatedUser) {
      try {
        // Check if task done (Server Side Verification)
        const { data: existingProgress } = await supabase
            .from('progress')
            .select('*')
            .eq('user_id', userId)
            .eq('task_id', task.id)
            .maybeSingle();

        if (!existingProgress) {
            await supabase.from('progress').insert({
                user_id: userId,
                task_id: task.id,
                xp_earned: task.xpReward,
                completed_at: new Date().toISOString()
            });

            // Update User Stats
            await supabase.from('users')
                .update({ 
                    xp: updatedUser.xp, 
                    coins: updatedUser.coins, 
                    level: updatedUser.level 
                })
                .eq('id', userId);
        }
      } catch (e) {
          console.error("Supabase Sync Error", e);
      }
  }
};

export const purchaseItem = async (userId: string, item: any): Promise<boolean> => {
    // 1. Local Update
    const users = getUsersFromStorage();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) return false;

    const user = users[userIndex];
    
    // Validate Logic
    if (user.coins < item.price) return false;
    if (item.id === 'hp_potion' && user.hp >= user.maxHp) return false;
    if (item.type === 'COSMETIC' && user.inventory.includes(item.id)) return false;

    // Deduct
    user.coins -= item.price;
    
    // Grant
    if (item.type === 'COSMETIC') {
        user.inventory.push(item.id);
    } else if (item.id === 'hp_potion') {
        user.hp = Math.min(user.hp + 1, user.maxHp);
    }

    // Save Local
    users[userIndex] = user;
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

    // 2. Cloud Update
    if (isSupabaseEnabled) {
        try {
            const { error } = await supabase.from('users').update({
                coins: user.coins,
                inventory: user.inventory,
                hp: user.hp
            }).eq('id', userId);
            
            if (error) {
                console.error("Supabase Purchase Error:", error);
                return true; // Return true anyway because local update succeeded
            }
        } catch(e) {
            console.error("Purchase Sync Failed", e);
        }
    }
    return true;
};

export const getAllStudentsStats = async (): Promise<StudentStats[]> => {
  if (isSupabaseEnabled) {
      try {
          const { data: users } = await supabase.from('users').select('*').eq('role', 'TEEN');
          if (users) {
              const { data: progress } = await supabase.from('progress').select('*');
              
              return users.map((u: any) => {
                 const userProg = progress?.filter((p: any) => p.user_id === u.id) || [];
                 const w1 = userProg.length > 0 ? 50 : 0; // Simplified logic
                 
                 return {
                     id: u.id,
                     name: u.name,
                     avatar: u.avatar_url || '',
                     week1Progress: w1,
                     week2Progress: 0,
                     week3Progress: 0,
                     status: 'active',
                     lastLogin: 'Web',
                     totalXp: Number(u.xp) || 0,
                     tasksCompletedCount: userProg.length
                 };
              });
          }
      } catch (e) { console.error(e); }
  }
  return [];
};

// HELPERS
function getUsersFromStorage(): User[] {
  try {
    const str = localStorage.getItem(STORAGE_KEYS.USERS);
    return str ? JSON.parse(str) : [];
  } catch (e) {
    return [];
  }
}

function saveUserToStorage(user: User) {
  const users = getUsersFromStorage();
  const index = users.findIndex(u => u.id === user.id);
  if (index === -1) users.push(user);
  else users[index] = user;
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}
