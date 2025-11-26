/**
 * Проверка структуры таблиц через API
 */

const SUPABASE_URL = 'https://rnxqyltjbcwqwblnhuhm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJueHF5bHRqYmN3cXdibG5odWhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5Njc2OTQsImV4cCI6MjA3OTU0MzY5NH0.fmyt1OPdu15FUMxr3FrlWEstGMTMXlWcE9clqDOov5o';

async function checkStructure() {
  console.log('🔍 Проверка структуры таблиц...\n');

  try {
    // Получаем пример записи из users для проверки полей
    const response = await fetch(`${SUPABASE_URL}/rest/v1/users?select=*&limit=1`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });

    if (response.ok) {
      const users = await response.json();
      
      if (users && users.length > 0) {
        const user = users[0];
        console.log('✅ Таблица users доступна\n');
        console.log('📊 Проверка полей:');
        
        const requiredFields = {
          'telegram_id': 'BIGINT',
          'username': 'TEXT',
          'inventory': 'JSONB',
          'league': 'TEXT',
          'interest': 'TEXT',
          'streak': 'INTEGER',
          'max_hp': 'INTEGER'
        };

        let allOk = true;
        for (const [field, type] of Object.entries(requiredFields)) {
          if (field in user) {
            const actualType = Array.isArray(user[field]) ? 'ARRAY' : typeof user[field];
            console.log(`   ✅ ${field} - есть (тип: ${actualType})`);
          } else {
            console.log(`   ❌ ${field} - ОТСУТСТВУЕТ!`);
            allOk = false;
          }
        }

        console.log('\n📋 Пример данных пользователя:');
        console.log(`   ID: ${user.id}`);
        console.log(`   Telegram ID: ${user.telegram_id || 'не указан'}`);
        console.log(`   Имя: ${user.name}`);
        console.log(`   XP: ${user.xp || 0}`);
        console.log(`   Монеты: ${user.coins || 0}`);
        console.log(`   Уровень: ${user.level || 1}`);
        console.log(`   Инвентарь: ${JSON.stringify(user.inventory || [])}`);
        console.log(`   Лига: ${user.league || 'не указана'}`);

        if (allOk) {
          console.log('\n🎉 ВСЕ ПОЛЯ НА МЕСТЕ! Структура правильная!');
        } else {
          console.log('\n⚠️  Некоторые поля отсутствуют. Выполните SQL скрипт еще раз.');
        }

        // Проверка типа inventory
        if (user.inventory !== undefined) {
          if (Array.isArray(user.inventory)) {
            console.log('\n⚠️  ВНИМАНИЕ: inventory имеет тип ARRAY, должен быть JSONB');
            console.log('   Выполните часть SQL скрипта для конвертации inventory');
          } else if (typeof user.inventory === 'object') {
            console.log('\n✅ inventory имеет правильный тип (объект/JSONB)');
          }
        }

      } else {
        console.log('⚠️  Таблица users пуста');
      }

      // Проверка progress
      const progressResponse = await fetch(`${SUPABASE_URL}/rest/v1/progress?select=*&limit=1`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      });

      if (progressResponse.ok) {
        const progress = await progressResponse.json();
        console.log(`\n✅ Таблица progress доступна (записей: ${progress.length})`);
      }

    } else {
      const error = await response.text();
      console.error('❌ Ошибка:', error);
    }

  } catch (error) {
    console.error('❌ Ошибка проверки:', error.message);
  }
}

checkStructure();
