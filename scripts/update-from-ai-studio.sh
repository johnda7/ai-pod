#!/bin/bash
# Автоматическое обновление от Google AI Studio
# Использование: ./scripts/update-from-ai-studio.sh

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_DIR"

echo "🔄 Проверка обновлений от Google AI Studio..."
echo ""

# Получить информацию о новых коммитах
git fetch origin

# Проверить наличие новых коммитов
NEW_COMMITS=$(git log HEAD..origin/main --oneline)

if [ -z "$NEW_COMMITS" ]; then
    echo "✅ Проект уже обновлен до последней версии"
    echo "   Локальная ветка синхронизирована с origin/main"
else
    echo "📥 Найдены новые коммиты от AI Studio:"
    echo ""
    echo "$NEW_COMMITS" | while read line; do
        echo "   • $line"
    done
    echo ""
    echo "⬇️  Загружаю обновления..."
    echo ""
    
    # Подтянуть обновления
    git pull origin main
    
    echo ""
    echo "✅ Обновление завершено!"
    echo ""
    echo "📋 Последние изменения с описаниями:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    git log -5 --format="%n🔹 %h - %s%n   📅 %ai%n   %b%n" --oneline
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "📝 Измененные файлы в последнем коммите:"
    git show HEAD --name-only --format="" | sed 's/^/   • /'
fi

