
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
    // Check if we already have a stored guest ID to PERSIST progress across refreshes
    const storedId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    if (storedId && storedId.startsWith('guest_')) {
      userId = storedId;
      console.log("DB: Recovered Guest ID:", userId);
    } else {
      userId = 'guest_' + Date.now();
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, userId);
      console.log("DB: Generated New Guest ID:", userId);
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
      console.log(`DB: Checking Supabase for Telegram ID: ${userId} (Guest: ${isGuest})`);
      
      // Query by telegram_id if available (Telegram user), otherwise by UUID (Guest)
      let query = supabase.from('users').select('*');
      let existingUser = null;
      let error = null;
      
      if (!isGuest && telegramUser?.id) {
          // For Telegram users, search by telegram_id first
          const { data, error: err } = await supabase
              .from('users')
              .select('*')
              .eq('telegram_id', telegramUser.id.toString())
              .maybeSingle();
          existingUser = data;
          error = err;
      } else {
          // For guests or fallback, search by ID
          const { data, error: err } = await query.eq('id', userId).maybeSingle();
          existingUser = data;
          error = err;
      }

      if (existingUser) {
        console.log('✅ Found User in Supabase:', existingUser.name, 'ID:', existingUser.id);
        
        // Get Progress - ALL completed tasks
        const { data: progressData, error: progressError } = await supabase
          .from('progress')
          .select('task_id')
          .eq('user_id', existingUser.id);

        if (progressError) {
          console.error("Error loading progress:", progressError);
        }

        const completedTaskIds = progressData?.map((p: any) => p.task_id) || [];
        console.log(`📊 Loaded ${completedTaskIds.length} completed tasks from Supabase`);

        // MERGE: Cloud is source of truth, BUT respect local progress if higher (Conflict Resolution)
        const cloudXp = Number(existingUser.xp) || 0;
        const cloudCoins = Number(existingUser.coins) || 0;
        const localXp = localUser?.xp || 0;
        const localCoins = localUser?.coins || 0;

        const mergedUser: User = {
          ...newUserTemplate,
          id: existingUser.id, // Use the UUID from DB (IMPORTANT!)
          telegramId: existingUser.telegram_id || telegramUser?.id,
          username: existingUser.username || telegramUser?.username,
          name: existingUser.name || telegramUser?.first_name || 'Студент',
          xp: Math.max(cloudXp, localXp),
          coins: Math.max(cloudCoins, localCoins), // Use higher value to prevent data loss
          level: existingUser.level || 1,
          hp: existingUser.hp ?? 5,
          maxHp: existingUser.max_hp ?? 5,
          streak: existingUser.streak || 0,
          interest: existingUser.interest || 'Гейминг',
          inventory: existingUser.inventory || [],
          completedTaskIds: completedTaskIds, // Load from progress table
          avatarUrl: telegramUser?.photo_url || existingUser.avatar_url || defaultAvatar,
          league: existingUser.league || 'BRONZE'
        };
        
        // Update Local Cache with correct UUID
        saveUserToStorage(mergedUser);
        console.log('💾 User synced to local storage with UUID:', mergedUser.id);
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
      } else {
        // Task already completed locally, but we should still sync to Supabase
        updatedUser = u;
      }
  }

  // 2. UPDATE SUPABASE
  if (isSupabaseEnabled) {
      try {
        // If user not found locally, try to get from Supabase
        if (!updatedUser) {
          const { data: dbUser } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();
          
          if (dbUser) {
            // Get progress from DB
            const { data: progressData } = await supabase
              .from('progress')
              .select('task_id')
              .eq('user_id', userId);
            
            const completedIds = progressData?.map((p: any) => p.task_id) || [];
            
            if (!completedIds.includes(task.id)) {
              updatedUser = {
                id: dbUser.id,
                telegramId: dbUser.telegram_id,
                username: dbUser.username,
                name: dbUser.name,
                role: dbUser.role as UserRole,
                xp: Number(dbUser.xp) || 0,
                coins: Number(dbUser.coins) || 0,
                level: dbUser.level || 1,
                hp: dbUser.hp ?? 5,
                maxHp: dbUser.max_hp ?? 5,
                avatarUrl: dbUser.avatar_url || '',
                streak: dbUser.streak || 0,
                completedTaskIds: completedIds,
                interest: dbUser.interest || 'Гейминг',
                inventory: dbUser.inventory || [],
                league: dbUser.league || 'BRONZE'
              };
              
              // Update user stats
              updatedUser.completedTaskIds.push(task.id);
              updatedUser.xp += task.xpReward;
              updatedUser.coins = (updatedUser.coins || 0) + (task.coinsReward || 0);
              updatedUser.level = Math.floor(updatedUser.xp / 500) + 1;
              
              // Save to local storage
              saveUserToStorage(updatedUser);
            }
          }
        }
        
        if (updatedUser) {
          // Check if task done (Server Side Verification)
          const { data: existingProgress } = await supabase
              .from('progress')
              .select('*')
              .eq('user_id', userId)
              .eq('task_id', task.id)
              .maybeSingle();

          if (!existingProgress) {
              // Insert progress record
              const { error: progressError } = await supabase.from('progress').insert({
                  user_id: userId,
                  task_id: task.id,
                  xp_earned: task.xpReward,
                  completed_at: new Date().toISOString()
              });

              if (progressError) {
                console.error("Supabase Progress Insert Error:", progressError);
              }

              // Update User Stats
              const { error: userError } = await supabase.from('users')
                  .update({ 
                      xp: updatedUser.xp, 
                      coins: updatedUser.coins, 
                      level: updatedUser.level 
                  })
                  .eq('id', userId);
              
              if (userError) {
                console.error("Supabase User Update Error:", userError);
              } else {
                console.log("✅ Task completed and synced to Supabase:", task.id);
              }
          } else {
            console.log("Task already completed in Supabase:", task.id);
          }
        }
      } catch (e) {
          console.error("Supabase Sync Error", e);
      }
  }
};

export const purchaseItem = async (userId: string, item: any): Promise<boolean> => {
    // 1. Get User (Local or Supabase)
    const users = getUsersFromStorage();
    const userIndex = users.findIndex(u => u.id === userId);
    let user: User | null = null;

    if (userIndex !== -1) {
        user = users[userIndex];
    } else if (isSupabaseEnabled) {
        // Try to get from Supabase if not found locally
        try {
            const { data: dbUser } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();
            
            if (dbUser) {
                // Get progress to build full user object
                const { data: progressData } = await supabase
                    .from('progress')
                    .select('task_id')
                    .eq('user_id', userId);
                
                user = {
                    id: dbUser.id,
                    telegramId: dbUser.telegram_id,
                    username: dbUser.username,
                    name: dbUser.name,
                    role: dbUser.role as UserRole,
                    xp: Number(dbUser.xp) || 0,
                    coins: Number(dbUser.coins) || 0,
                    level: dbUser.level || 1,
                    hp: dbUser.hp ?? 5,
                    maxHp: dbUser.max_hp ?? 5,
                    avatarUrl: dbUser.avatar_url || '',
                    streak: dbUser.streak || 0,
                    completedTaskIds: progressData?.map((p: any) => p.task_id) || [],
                    interest: dbUser.interest || 'Гейминг',
                    inventory: dbUser.inventory || [],
                    league: dbUser.league || 'BRONZE'
                };
                
                // Save to local storage for future use
                saveUserToStorage(user);
            }
        } catch (e) {
            console.error("Failed to fetch user from Supabase:", e);
        }
    }

    if (!user) {
        console.error("User not found for purchase:", userId);
        return false;
    }
    
    // 2. Validate Logic
    if (user.coins < item.price) {
        console.log("Insufficient coins:", user.coins, "<", item.price);
        return false;
    }
    if (item.id === 'hp_potion' && user.hp >= user.maxHp) {
        console.log("HP already full:", user.hp, ">=", user.maxHp);
        return false;
    }
    if (item.type === 'COSMETIC' && user.inventory.includes(item.id)) {
        console.log("Item already owned:", item.id);
        return false;
    }

    // 3. Deduct & Grant
    user.coins -= item.price;
    
    if (item.type === 'COSMETIC') {
        user.inventory.push(item.id);
    } else if (item.id === 'hp_potion') {
        user.hp = Math.min(user.hp + 1, user.maxHp);
    }

    // 4. Save Local
    const updatedUsers = getUsersFromStorage();
    const updatedIndex = updatedUsers.findIndex(u => u.id === userId);
    if (updatedIndex !== -1) {
        updatedUsers[updatedIndex] = user;
    } else {
        updatedUsers.push(user);
    }
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));

    // 5. Cloud Update
    if (isSupabaseEnabled) {
        try {
            const { error } = await supabase.from('users').update({
                coins: user.coins,
                inventory: user.inventory,
                hp: user.hp
            }).eq('id', userId);
            
            if (error) {
                console.error("Supabase Purchase Error:", error);
                // Local update succeeded, but Supabase failed
                // We proceed optimistically, but log the error
            } else {
                console.log("✅ Purchase synced to Supabase:", item.id);
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

// --- REFRESH USER FROM SUPABASE ---
export const refreshUserFromSupabase = async (userId: string): Promise<User | null> => {
  if (!isSupabaseEnabled) return null;
  
  try {
    const { data: dbUser, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error || !dbUser) {
      console.error("Failed to refresh user from Supabase:", error);
      return null;
    }
    
    // Get progress
    const { data: progressData } = await supabase
      .from('progress')
      .select('task_id')
      .eq('user_id', userId);
    
    const user: User = {
      id: dbUser.id,
      telegramId: dbUser.telegram_id,
      username: dbUser.username,
      name: dbUser.name,
      role: dbUser.role as UserRole,
      xp: Number(dbUser.xp) || 0,
      coins: Number(dbUser.coins) || 0,
      level: dbUser.level || 1,
      hp: dbUser.hp ?? 5,
      maxHp: dbUser.max_hp ?? 5,
      avatarUrl: dbUser.avatar_url || '',
      streak: dbUser.streak || 0,
      completedTaskIds: progressData?.map((p: any) => p.task_id) || [],
      interest: dbUser.interest || 'Гейминг',
      inventory: dbUser.inventory || [],
      league: dbUser.league || 'BRONZE'
    };
    
    // Update local storage
    saveUserToStorage(user);
    
    return user;
  } catch (e) {
    console.error("Error refreshing user from Supabase:", e);
    return null;
  }
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
  if (index !== -1) users[index] = user;
  else users.push(user);
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}
