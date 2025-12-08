#!/bin/bash
# Скрипт для извлечения комментариев AI Studio из коммитов

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUTPUT_FILE="$REPO_DIR/ai-studio-comments.md"

cd "$REPO_DIR"

echo "# Комментарии и описания от Google AI Studio" > "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "Автоматически извлечено из истории коммитов Git" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "---" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Извлекаем все коммиты с подробными сообщениями
git log --format="## Коммит %h%n**Дата:** %ai%n**Автор:** %an%n**Сообщение:** %s%n%n%b%n---%n" --all >> "$OUTPUT_FILE"

echo "" >> "$OUTPUT_FILE"
echo "## Статистика" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "Всего коммитов: $(git rev-list --all --count)" >> "$OUTPUT_FILE"
echo "Последний коммит: $(git log -1 --format='%h - %s')" >> "$OUTPUT_FILE"

echo "✅ Комментарии сохранены в: $OUTPUT_FILE"





















