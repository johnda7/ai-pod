
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

// Helper to generate UUID for guests
function generateUUID() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

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
    if (storedId) {
        // Check if it's a legacy non-UUID guest ID - MIGRATE IT!
        if (storedId.startsWith('guest_')) {
            console.log("DB: Found Legacy Guest ID (Non-UUID):", storedId);
            console.log("DB: 🔄 MIGRATING to new UUID format...");
            
            // Get the old user data before migration
            const users = getUsersFromStorage();
            const oldUser = users.find(u => u.id === storedId);
            
            // Generate new UUID
            const newUUID = generateUUID();
            userId = newUUID;
            
            // Update localStorage with new UUID
            localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, newUUID);
            
            // If old user exists, update their ID in storage
            if (oldUser) {
                console.log("DB: Migrating user data:", oldUser.coins, "coins,", oldUser.xp, "XP");
                oldUser.id = newUUID;
                saveUserToStorage(oldUser);
            }
            
            console.log("DB: ✅ Migration complete! New UUID:", newUUID);
        } else {
            userId = storedId;
            console.log("DB: Recovered Guest UUID:", userId);
        }
    } else {
      // Generate a proper UUID for new guests
      userId = generateUUID();
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, userId);
      console.log("DB: Generated New Guest UUID:", userId);
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
          // For guests or fallback, search by ID (must be UUID)
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
          id: isGuest ? userId : undefined, // Explicitly set ID for guests
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

// ==========================================
// 🎮 ПРОДВИНУТЫЕ ИГРОВЫЕ МЕХАНИКИ
// ==========================================

// Бонус за уровень: чем выше уровень, тем больше XP
const getLevelBonus = (level: number): number => {
  if (level >= 10) return 0.5;  // +50% XP
  if (level >= 7) return 0.3;   // +30% XP
  if (level >= 5) return 0.2;   // +20% XP
  if (level >= 3) return 0.1;   // +10% XP
  return 0;
};

// Бонус за серию уроков за день
const getDailyStreakBonus = (tasksToday: number): number => {
  if (tasksToday >= 5) return 0.3;  // +30% за 5+ уроков в день
  if (tasksToday >= 3) return 0.2;  // +20% за 3+ уроков
  if (tasksToday >= 2) return 0.1;  // +10% за 2+ уроков
  return 0;
};

// Случайный бонус (surprise reward) - 20% шанс
const getSurpriseBonus = (): { xp: number; coins: number; message: string } | null => {
  if (Math.random() > 0.2) return null; // 80% - нет бонуса
  
  const surprises = [
    { xp: 50, coins: 0, message: '🎁 Сюрприз! +50 XP!' },
    { xp: 0, coins: 25, message: '💰 Бонус! +25 монет!' },
    { xp: 100, coins: 0, message: '⭐ Удача! +100 XP!' },
    { xp: 0, coins: 50, message: '🪙 Джекпот! +50 монет!' },
    { xp: 75, coins: 25, message: '🌟 Супер! +75 XP и +25 монет!' },
  ];
  
  return surprises[Math.floor(Math.random() * surprises.length)];
};

// Подсчёт уроков за сегодня
const getTasksCompletedToday = (completedTaskIds: string[]): number => {
  const today = new Date().toDateString();
  const todayKey = `tasks_completed_${today}`;
  const stored = localStorage.getItem(todayKey);
  return stored ? parseInt(stored, 10) : 0;
};

const incrementTasksToday = () => {
  const today = new Date().toDateString();
  const todayKey = `tasks_completed_${today}`;
  const current = getTasksCompletedToday([]);
  localStorage.setItem(todayKey, (current + 1).toString());
};

// Расчёт финальных наград с бонусами
export const calculateRewards = (baseXP: number, baseCoins: number, level: number, completedTaskIds: string[]): {
  finalXP: number;
  finalCoins: number;
  bonusXP: number;
  bonusCoins: number;
  bonusMessages: string[];
} => {
  let bonusXP = 0;
  let bonusCoins = 0;
  const bonusMessages: string[] = [];

  // 1. Бонус за уровень
  const levelBonus = getLevelBonus(level);
  if (levelBonus > 0) {
    const levelBonusXP = Math.floor(baseXP * levelBonus);
    bonusXP += levelBonusXP;
    bonusMessages.push(`⬆️ Уровень ${level}: +${Math.round(levelBonus * 100)}% XP`);
  }

  // 2. Бонус за серию уроков за день
  const tasksToday = getTasksCompletedToday(completedTaskIds);
  const dailyBonus = getDailyStreakBonus(tasksToday);
  if (dailyBonus > 0) {
    const dailyBonusXP = Math.floor(baseXP * dailyBonus);
    bonusXP += dailyBonusXP;
    bonusMessages.push(`🔥 ${tasksToday} уроков сегодня: +${Math.round(dailyBonus * 100)}% XP`);
  }

  // 3. Случайный бонус
  const surprise = getSurpriseBonus();
  if (surprise) {
    bonusXP += surprise.xp;
    bonusCoins += surprise.coins;
    bonusMessages.push(surprise.message);
    localStorage.setItem('last_surprise_bonus', JSON.stringify(surprise));
  }

  return {
    finalXP: baseXP + bonusXP,
    finalCoins: baseCoins + bonusCoins,
    bonusXP,
    bonusCoins,
    bonusMessages
  };
};

export const completeTask = async (userId: string, task: Task): Promise<void> => {
  // 1. UPDATE LOCAL
  const users = getUsersFromStorage();
  const userIndex = users.findIndex(u => u.id === userId);
  let updatedUser: User | null = null;
  
  if (userIndex !== -1) {
      const u = users[userIndex];
      if (!u.completedTaskIds.includes(task.id)) {
        // 🎮 Расчёт бонусов!
        const rewards = calculateRewards(
          task.xpReward,
          task.coinsReward || 0,
          u.level,
          u.completedTaskIds
        );
        
        u.completedTaskIds.push(task.id);
        u.xp += rewards.finalXP;
        u.coins = (u.coins || 0) + rewards.finalCoins;
        u.level = Math.floor(u.xp / 500) + 1;
        
        // Сохраняем бонус-сообщения для UI
        if (rewards.bonusMessages.length > 0) {
          localStorage.setItem('last_bonus_messages', JSON.stringify(rewards.bonusMessages));
          console.log('🎮 Бонусы:', rewards.bonusMessages);
        }
        
        // Увеличиваем счётчик уроков за день
        incrementTasksToday();
        
        users[userIndex] = u;
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        updatedUser = u;
      } else {
        // Task already completed locally, but we should still sync to Supabase
        updatedUser = u;
      }
  }

  // 2. UPDATE SUPABASE
  // Check if valid UUID before syncing to avoid 400 errors
  const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);

  if (isSupabaseEnabled && isValidUUID) {
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
        const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
        
        if (isValidUUID) {
            try {
                const { data: dbUser } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', userId)
                    .single();
                
                if (dbUser) {
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
                        completedTaskIds: [], // Will need to fetch progress
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
    }

    if (!user) {
        console.error("User not found for purchase:", userId);
        return false;
    }

    // --- CRITICAL SYNC: FORCE UPDATE DB IF LOCAL IS AHEAD ---
    if (isSupabaseEnabled) {
        const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
        if (isValidUUID) {
            try {
                // 1. Get current DB coins
                const { data: dbUser } = await supabase
                    .from('users')
                    .select('coins, inventory')
                    .eq('id', userId)
                    .single();
                
                const dbCoins = Number(dbUser?.coins) || 0;
                const localCoins = user.coins || 0;

                // 2. IF local coins > DB coins, we MUST sync up first
                if (localCoins > dbCoins) {
                    console.log(`💰 Syncing coins to DB: Local(${localCoins}) > DB(${dbCoins})`);
                    const { error: syncError } = await supabase
                        .from('users')
                        .update({ coins: localCoins })
                        .eq('id', userId);
                    
                    if (syncError) {
                        console.error("Failed to sync coins to DB:", syncError);
                        // We continue anyway, trusting local state for now
                    } else {
                        console.log("✅ Coins synced successfully.");
                    }
                }
                // 3. IF DB coins > local coins (e.g. bought on another device), update local
                else if (dbCoins > localCoins) {
                     console.log(`💰 Updating local coins from DB: DB(${dbCoins}) > Local(${localCoins})`);
                     user.coins = dbCoins;
                     // Merge inventories too
                     if (dbUser?.inventory && Array.isArray(dbUser.inventory)) {
                         const newInventory = [...new Set([...user.inventory, ...dbUser.inventory])];
                         user.inventory = newInventory;
                     }
                     saveUserToStorage(user);
                }
            } catch (e) {
                console.error("Error during pre-purchase sync:", e);
            }
        }
    }
    // -------------------------------------------------------
    
    // 2. Validate Logic
    // Double check if item is already owned after sync
    if (item.type === 'COSMETIC' && user.inventory.includes(item.id)) {
        console.log("Item already owned (checked after sync):", item.id);
        return false;
    }

    if (user.coins < item.price) {
        console.log("Insufficient coins:", user.coins, "<", item.price);
        return false;
    }
    if (item.id === 'hp_potion' && user.hp >= user.maxHp) {
        console.log("HP already full:", user.hp, ">=", user.maxHp);
        return false;
    }

    // 3. Deduct & Grant
    user.coins -= item.price;
    
    // Variable to store mystery box reward for UI
    let mysteryReward: { type: string; amount: number; message: string } | null = null;
    
    if (item.type === 'COSMETIC') {
        user.inventory.push(item.id);
    } else if (item.id === 'hp_potion') {
        user.hp = Math.min(user.hp + 1, user.maxHp);
    } else if (item.id === 'mystery_box') {
        // Mystery Box - Random Reward!
        const rewards = [
            { type: 'coins', amount: 50, message: '💰 +50 монет!' },
            { type: 'coins', amount: 100, message: '💰💰 +100 монет! Удача!' },
            { type: 'coins', amount: 150, message: '💰💰💰 +150 монет! ДЖЕКПОТ!' },
            { type: 'xp', amount: 100, message: '⭐ +100 XP!' },
            { type: 'xp', amount: 200, message: '⭐⭐ +200 XP! Супер!' },
            { type: 'hp', amount: 1, message: '❤️ +1 HP восстановлено!' },
            { type: 'hp', amount: 2, message: '❤️❤️ +2 HP! Отлично!' },
        ];
        
        const reward = rewards[Math.floor(Math.random() * rewards.length)];
        mysteryReward = reward;
        
        if (reward.type === 'coins') {
            user.coins += reward.amount;
        } else if (reward.type === 'xp') {
            user.xp += reward.amount;
            user.level = Math.floor(user.xp / 500) + 1;
        } else if (reward.type === 'hp') {
            user.hp = Math.min(user.hp + reward.amount, user.maxHp);
        }
        
        console.log('🎁 Mystery Box Reward:', reward.message);
        
        // Store reward in localStorage for UI to display
        localStorage.setItem('mystery_box_reward', JSON.stringify(reward));
    } else if (item.id === 'streak_freeze') {
        // Streak Freeze - add to inventory for later use
        user.inventory.push(item.id);
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
    const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
    
    if (isSupabaseEnabled && isValidUUID) {
        try {
            const { error } = await supabase.from('users').update({
                coins: user.coins,
                inventory: user.inventory,
                hp: user.hp,
                xp: user.xp,
                level: user.level
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

// ==========================================
// STREAK SYSTEM - Auto-update on daily login
// ==========================================

const STREAK_STORAGE_KEY = 'ai_teenager_last_activity';

export const checkAndUpdateStreak = async (userId: string): Promise<{ newStreak: number; bonus: number; message: string } | null> => {
  const users = getUsersFromStorage();
  const user = users.find(u => u.id === userId);
  if (!user) return null;

  const lastActivity = localStorage.getItem(STREAK_STORAGE_KEY);
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  
  // Already logged in today
  if (lastActivity === today) {
    return null;
  }
  
  let newStreak = user.streak || 0;
  let bonus = 0;
  let message = '';

  if (lastActivity === yesterday) {
    // Streak continues! +1
    newStreak += 1;
    bonus = Math.min(newStreak * 10, 100); // Max 100 bonus coins
    message = `🔥 ${newStreak} дней подряд! +${bonus} монет`;
  } else if (!lastActivity) {
    // First time ever
    newStreak = 1;
    bonus = 10;
    message = '🔥 Первый день! +10 монет';
  } else {
    // Streak broken - reset but encourage
    newStreak = 1;
    bonus = 5;
    message = '🔥 Новый старт! +5 монет';
  }

  // Update user
  user.streak = newStreak;
  user.coins = (user.coins || 0) + bonus;
  
  // Save to localStorage
  localStorage.setItem(STREAK_STORAGE_KEY, today);
  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex !== -1) {
    users[userIndex] = user;
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  // Sync to Supabase
  const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
  if (isSupabaseEnabled && isValidUUID) {
    try {
      await supabase.from('users').update({
        streak: newStreak,
        coins: user.coins,
        last_activity: today
      }).eq('id', userId);
      console.log(`✅ Streak synced: ${newStreak} days`);
    } catch (e) {
      console.error('Streak sync failed:', e);
    }
  }

  return { newStreak, bonus, message };
};

// Milestone rewards (5, 10, 15 lessons completed)
export const checkMilestoneReward = async (userId: string): Promise<{ milestone: number; xpBonus: number; coinsBonus: number } | null> => {
  const users = getUsersFromStorage();
  const user = users.find(u => u.id === userId);
  if (!user) return null;

  const completedCount = user.completedTaskIds?.length || 0;
  const milestones = [
    { count: 5, xp: 200, coins: 100, key: 'milestone_5' },
    { count: 10, xp: 500, coins: 250, key: 'milestone_10' },
    { count: 15, xp: 800, coins: 400, key: 'milestone_15' },
    { count: 20, xp: 1000, coins: 500, key: 'milestone_20' },
    { count: 25, xp: 1500, coins: 750, key: 'milestone_25' },
    { count: 30, xp: 2000, coins: 1000, key: 'milestone_30' },
  ];

  const claimedMilestones = JSON.parse(localStorage.getItem('claimed_milestones') || '[]');
  
  for (const m of milestones) {
    if (completedCount >= m.count && !claimedMilestones.includes(m.key)) {
      // Claim this milestone!
      user.xp += m.xp;
      user.coins += m.coins;
      user.level = Math.floor(user.xp / 500) + 1;
      
      claimedMilestones.push(m.key);
      localStorage.setItem('claimed_milestones', JSON.stringify(claimedMilestones));
      
      // Save user
      const userIndex = users.findIndex(u => u.id === userId);
      if (userIndex !== -1) {
        users[userIndex] = user;
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      }

      // Sync to Supabase
      const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
      if (isSupabaseEnabled && isValidUUID) {
        try {
          await supabase.from('users').update({
            xp: user.xp,
            coins: user.coins,
            level: user.level
          }).eq('id', userId);
        } catch (e) {
          console.error('Milestone sync failed:', e);
        }
      }

      return { milestone: m.count, xpBonus: m.xp, coinsBonus: m.coins };
    }
  }

  return null;
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
  const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
  if (!isValidUUID) return null;
  
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

// ==========================================
// TOOLS DATA SYNC (Привычки, Цели, Заметки)
// ==========================================

// Ключи всех инструментов в localStorage
const TOOLS_STORAGE_KEYS = [
  'habit_tracker_data',
  'goals_tracker',
  'notes_journal',
  'balance_wheel_history',
  'emotion_diary_entries',
  'gratitude_entries',
  'reflection_entries',
  'planner_tasks',
  'focus_sessions',
  'challenges_data',
  'life_skills_progress'
];

// Собрать все данные инструментов в один объект
export const getToolsData = (): Record<string, any> => {
  const data: Record<string, any> = {};
  TOOLS_STORAGE_KEYS.forEach(key => {
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        data[key] = JSON.parse(stored);
      } catch (e) {
        data[key] = stored;
      }
    }
  });
  return data;
};

// Сохранить данные инструментов из объекта в localStorage
export const setToolsData = (data: Record<string, any>): void => {
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      localStorage.setItem(key, JSON.stringify(value));
    }
  });
};

// Синхронизировать данные инструментов с Supabase
export const syncToolsDataToSupabase = async (userId: string): Promise<boolean> => {
  if (!isSupabaseEnabled) return false;
  
  const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
  if (!isValidUUID) return false;
  
  try {
    const toolsData = getToolsData();
    
    const { error } = await supabase
      .from('users')
      .update({ tools_data: toolsData })
      .eq('id', userId);
    
    if (error) {
      console.error('❌ Tools sync failed:', error.message);
      return false;
    }
    
    console.log('✅ Tools data synced to Supabase');
    return true;
  } catch (e) {
    console.error('❌ Tools sync error:', e);
    return false;
  }
};

// Загрузить данные инструментов из Supabase
export const loadToolsDataFromSupabase = async (userId: string): Promise<boolean> => {
  if (!isSupabaseEnabled) return false;
  
  const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
  if (!isValidUUID) return false;
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('tools_data')
      .eq('id', userId)
      .single();
    
    if (error || !data?.tools_data) {
      console.log('ℹ️ No tools data in Supabase yet');
      return false;
    }
    
    // Merge: Cloud data + Local data (Local wins for conflicts)
    const cloudData = data.tools_data as Record<string, any>;
    const localData = getToolsData();
    
    // Merge strategy: if local has more data, keep it
    const mergedData: Record<string, any> = { ...cloudData };
    Object.entries(localData).forEach(([key, value]) => {
      if (Array.isArray(value) && Array.isArray(cloudData[key])) {
        // For arrays: merge unique items
        const cloudArray = cloudData[key] as any[];
        const localArray = value as any[];
        const mergedArray = [...cloudArray];
        localArray.forEach(item => {
          const exists = mergedArray.some(c => c.id === item.id);
          if (!exists) mergedArray.push(item);
        });
        mergedData[key] = mergedArray;
      } else if (value && (!cloudData[key] || JSON.stringify(value).length > JSON.stringify(cloudData[key]).length)) {
        mergedData[key] = value;
      }
    });
    
    setToolsData(mergedData);
    console.log('✅ Tools data loaded from Supabase');
    return true;
  } catch (e) {
    console.error('❌ Load tools error:', e);
    return false;
  }
};
