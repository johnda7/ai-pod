#!/bin/bash

# Скрипт для обновления ключей Supabase
# Использование: ./scripts/update-supabase-keys.sh

echo "🔧 Обновление ключей Supabase"
echo "================================"
echo ""

# Проверка наличия файла
if [ ! -f "services/supabaseClient.ts" ]; then
    echo "❌ Файл services/supabaseClient.ts не найден!"
    exit 1
fi

# Запрос URL
echo "Введите Supabase URL (например: https://xxxxx.supabase.co):"
read -r SUPABASE_URL

if [ -z "$SUPABASE_URL" ]; then
    echo "❌ URL не может быть пустым!"
    exit 1
fi

# Запрос ключа
echo ""
echo "Введите Supabase Anon Key (публичный ключ):"
read -r SUPABASE_KEY

if [ -z "$SUPABASE_KEY" ]; then
    echo "❌ Ключ не может быть пустым!"
    exit 1
fi

# Создание резервной копии
cp services/supabaseClient.ts services/supabaseClient.ts.backup
echo "✅ Создана резервная копия: services/supabaseClient.ts.backup"

# Обновление файла (для macOS и Linux)
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s|const SUPABASE_URL = '.*';|const SUPABASE_URL = '$SUPABASE_URL';|" services/supabaseClient.ts
    sed -i '' "s|const SUPABASE_KEY = '.*';|const SUPABASE_KEY = '$SUPABASE_KEY';|" services/supabaseClient.ts
else
    # Linux
    sed -i "s|const SUPABASE_URL = '.*';|const SUPABASE_URL = '$SUPABASE_URL';|" services/supabaseClient.ts
    sed -i "s|const SUPABASE_KEY = '.*';|const SUPABASE_KEY = '$SUPABASE_KEY';|" services/supabaseClient.ts
fi

echo ""
echo "✅ Ключи обновлены!"
echo ""
echo "📝 Проверьте файл: services/supabaseClient.ts"
echo ""
echo "🚀 Следующие шаги:"
echo "   1. Выполните SQL скрипт: scripts/setup-supabase.sql"
echo "   2. Запустите тест: npx tsx scripts/test-supabase.ts"
echo "   3. Запустите приложение: npm run dev"
