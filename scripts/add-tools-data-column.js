/**
 * Добавление колонки tools_data в Supabase
 * Использует service_role ключ для выполнения DDL операций
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rnxqyltjbcwqwblnhuhm.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJueHF5bHRqYmN3cXdibG5odWhtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mzk2NzY5NCwiZXhwIjoyMDc5NTQzNjk0fQ.THfAkq_i0eFEnBqtd22n6ZdNZyKnldve_d2rl88e6_w';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function addToolsDataColumn() {
  console.log('🚀 Добавляю колонку tools_data в таблицу users...\n');

  try {
    // Проверяем подключение
    const { data: users, error: checkError } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (checkError) {
      console.error('❌ Ошибка подключения:', checkError.message);
      return false;
    }

    console.log('✅ Подключение к Supabase установлено');
    
    // Пробуем добавить колонку через RPC (если есть функция exec_sql)
    // Если нет - используем прямой запрос через REST API
    
    const sqlCommands = [
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS tools_data JSONB DEFAULT '{}'::jsonb",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS last_activity TEXT"
    ];

    console.log('\n📝 Выполняю SQL команды...');

    for (const sql of sqlCommands) {
      console.log(`   Выполняю: ${sql.substring(0, 50)}...`);
      
      // Используем fetch для прямого SQL через PostgREST не работает для DDL
      // Поэтому пробуем через Management API
      try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'apikey': SERVICE_KEY,
            'Authorization': `Bearer ${SERVICE_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: sql })
        });

        if (response.ok) {
          console.log('   ✅ Успешно');
        } else {
          const errorText = await response.text();
          // Проверяем если колонка уже существует
          if (errorText.includes('already exists') || errorText.includes('duplicate')) {
            console.log('   ⚠️ Колонка уже существует');
          } else {
            console.log('   ⚠️ Нужно выполнить вручную в SQL Editor');
          }
        }
      } catch (e) {
        console.log('   ⚠️ RPC exec_sql не найден - нужно выполнить вручную');
      }
    }

    // Проверяем результат - пробуем записать в tools_data
    console.log('\n🔍 Проверяю наличие колонки tools_data...');
    
    const testData = { test: 'check', timestamp: Date.now() };
    
    const { error: updateError } = await supabase
      .from('users')
      .update({ tools_data: testData })
      .eq('id', users[0]?.id || 'test');

    if (!updateError) {
      console.log('✅ Колонка tools_data СУЩЕСТВУЕТ и работает!');
      return true;
    } else if (updateError.message.includes('column')) {
      console.log('❌ Колонка tools_data НЕ существует');
      console.log('\n📋 Выполните вручную в Supabase SQL Editor:');
      console.log('─'.repeat(50));
      console.log("ALTER TABLE users ADD COLUMN IF NOT EXISTS tools_data JSONB DEFAULT '{}'::jsonb;");
      console.log("ALTER TABLE users ADD COLUMN IF NOT EXISTS last_activity TEXT;");
      console.log('─'.repeat(50));
      return false;
    } else {
      // Другая ошибка - возможно нет пользователей
      console.log('⚠️ Не удалось проверить (возможно нет пользователей)');
      return false;
    }

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    return false;
  }
}

addToolsDataColumn().then(success => {
  if (success) {
    console.log('\n🎉 Готово! Теперь включите синхронизацию в коде:');
    console.log('   services/db.ts → TOOLS_DATA_COLUMN_EXISTS = true');
  }
  process.exit(success ? 0 : 1);
});

