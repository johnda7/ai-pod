/**
 * СКРИПТ ДЛЯ ПРОВЕРКИ ПОДКЛЮЧЕНИЯ К SUPABASE
 * 
 * Запуск: npx tsx scripts/test-supabase.ts
 * Или: node --loader ts-node/esm scripts/test-supabase.ts
 */

import { createClient } from '@supabase/supabase-js';

// ВАШИ ДАННЫЕ (замените на свои)
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://rnxqyltjbcwqwblnhuhm.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || '';

async function testSupabase() {
  console.log('🔍 Тестирование подключения к Supabase...\n');
  console.log('URL:', SUPABASE_URL);
  console.log('Key:', SUPABASE_KEY ? `${SUPABASE_KEY.substring(0, 20)}...` : 'НЕ УКАЗАН');

  if (!SUPABASE_KEY) {
    console.error('❌ SUPABASE_KEY не указан!');
    console.log('\n📝 Укажите ключ через переменную окружения:');
    console.log('   SUPABASE_KEY=ваш_ключ npx tsx scripts/test-supabase.ts');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  try {
    // 1. Проверка подключения
    console.log('\n1️⃣ Проверка подключения...');
    const { data: healthCheck, error: healthError } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (healthError) {
      console.error('❌ Ошибка подключения:', healthError.message);
      if (healthError.message.includes('relation "users" does not exist')) {
        console.log('\n💡 Таблица users не существует!');
        console.log('   Выполните SQL скрипт: scripts/setup-supabase.sql');
      }
      process.exit(1);
    }
    console.log('✅ Подключение успешно!');

    // 2. Проверка таблицы users
    console.log('\n2️⃣ Проверка таблицы users...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(5);

    if (usersError) {
      console.error('❌ Ошибка чтения users:', usersError.message);
      process.exit(1);
    }
    console.log(`✅ Таблица users доступна. Найдено записей: ${users?.length || 0}`);

    // 3. Проверка таблицы progress
    console.log('\n3️⃣ Проверка таблицы progress...');
    const { data: progress, error: progressError } = await supabase
      .from('progress')
      .select('*')
      .limit(5);

    if (progressError) {
      console.error('❌ Ошибка чтения progress:', progressError.message);
      process.exit(1);
    }
    console.log(`✅ Таблица progress доступна. Найдено записей: ${progress?.length || 0}`);

    // 4. Тест создания пользователя
    console.log('\n4️⃣ Тест создания пользователя...');
    const testUser = {
      telegram_id: 999999999,
      name: 'Test User',
      role: 'TEEN',
      xp: 0,
      coins: 100,
      level: 1,
      hp: 5,
      max_hp: 5,
      interest: 'Гейминг',
      inventory: []
    };

    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert(testUser)
      .select()
      .single();

    if (createError) {
      if (createError.code === '23505') {
        console.log('⚠️ Пользователь с таким telegram_id уже существует (это нормально)');
      } else {
        console.error('❌ Ошибка создания пользователя:', createError.message);
        process.exit(1);
      }
    } else {
      console.log('✅ Пользователь создан:', newUser.id);
      
      // Удаляем тестового пользователя
      await supabase.from('users').delete().eq('id', newUser.id);
      console.log('🧹 Тестовый пользователь удален');
    }

    // 5. Тест обновления
    console.log('\n5️⃣ Тест обновления данных...');
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', 999999999)
      .single();

    if (existingUser) {
      const { error: updateError } = await supabase
        .from('users')
        .update({ xp: 100, coins: 200 })
        .eq('id', existingUser.id);

      if (updateError) {
        console.error('❌ Ошибка обновления:', updateError.message);
        process.exit(1);
      }
      console.log('✅ Обновление работает!');
    }

    console.log('\n🎉 ВСЕ ТЕСТЫ ПРОЙДЕНЫ УСПЕШНО!');
    console.log('\n📋 Следующие шаги:');
    console.log('   1. Обновите ключи в services/supabaseClient.ts');
    console.log('   2. Запустите приложение: npm run dev');
    console.log('   3. Проверьте консоль браузера на наличие ошибок');

  } catch (error: any) {
    console.error('\n❌ Критическая ошибка:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testSupabase();
