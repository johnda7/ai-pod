# Развертывание проекта AI Pod

## 🚀 Полная инструкция по деплою для AI Агентов

---

## 📍 Где развертывается проект

### Текущие платформы:

1. **GitHub Pages** - веб-приложение
   - URL: `https://johnda7.github.io/ai-pod/`
   - Статус: Настроено, но требует включения в настройках GitHub

2. **Telegram Bot** - отдельный бот
   - Токен: `REVOKED_TOKEN`
   - Статус: Настроен, требует запуска на сервере

---

## 🌐 Развертывание на GitHub Pages

### Текущая конфигурация:

**Файл:** `vite.config.ts`
```typescript
base: process.env.NODE_ENV === 'production' ? '/ai-pod/' : '/',
```

**Важно:** Base path установлен как `/ai-pod/` для GitHub Pages.

### Процесс деплоя:

#### Вариант 1: Ручной деплой (текущий)

```bash
# 1. Собрать проект
npm run build

# 2. Проверить сборку
npm run preview

# 3. Закоммитить dist/ (если нужно)
# Обычно dist/ в .gitignore, но для GitHub Pages может понадобиться
```

#### Вариант 2: GitHub Actions (был удален)

Ранее был настроен workflow `.github/workflows/deploy.yml`, но он был удален.

**Для восстановления:**
- См. историю коммита `6ebb2cb`
- Или создайте новый workflow

### Включение GitHub Pages:

1. Откройте: https://github.com/johnda7/ai-pod/settings/pages
2. В разделе "Source" выберите:
   - **Source:** `GitHub Actions` (если есть workflow)
   - Или **Source:** `Deploy from a branch` → `main` → `/dist`
3. Сохраните

**URL после включения:**
```
https://johnda7.github.io/ai-pod/
```

---

## 🤖 Развертывание Telegram бота

### Локальный запуск:

```bash
cd telegram-bot
npm install
npm start
```

### Настройка:

1. Создайте `.env` файл:
   ```bash
   cd telegram-bot
   cp .env.example .env
   ```

2. Заполните токен:
   ```
   TELEGRAM_BOT_TOKEN=REVOKED_TOKEN
   ```

### Развертывание на сервере:

#### Вариант 1: VPS/Cloud Server

```bash
# На сервере
git clone https://github.com/johnda7/ai-pod.git
cd ai-pod/telegram-bot
npm install
npm start
```

#### Вариант 2: PM2 (рекомендуется)

```bash
# Установить PM2
npm install -g pm2

# Запустить бота
cd telegram-bot
pm2 start index.js --name "ai-pod-bot"

# Автозапуск при перезагрузке
pm2 startup
pm2 save
```

#### Вариант 3: Docker

```dockerfile
# Dockerfile (создать в telegram-bot/)
FROM node:20
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["node", "index.js"]
```

```bash
docker build -t ai-pod-bot .
docker run -d --name ai-pod-bot ai-pod-bot
```

---

## 🔧 Настройка переменных окружения

### Для веб-приложения:

**Файл:** `.env.local` (в корне проекта)

```bash
# Обязательно для AI-наставника
GEMINI_API_KEY=ваш_ключ_здесь

# Опционально для Supabase
SUPABASE_URL=https://rnxqyltjbcwqwblnhuhm.supabase.co
SUPABASE_KEY=ваш_ключ
```

**Для GitHub Pages:**
- Переменные окружения нужно добавить в GitHub Secrets
- Settings → Secrets and variables → Actions
- Добавить `GEMINI_API_KEY`

### Для Telegram бота:

**Файл:** `telegram-bot/.env`

```bash
TELEGRAM_BOT_TOKEN=REVOKED_TOKEN
GEMINI_API_KEY=ваш_ключ (опционально)
```

---

## 📦 Процесс сборки

### Локальная сборка:

```bash
# Установить зависимости
npm install

# Собрать проект
npm run build

# Результат в папке dist/
ls -la dist/
```

### Проверка сборки:

```bash
# Запустить preview
npm run preview

# Открыть http://localhost:4173
```

### Что проверять:

- ✅ Нет ошибок в консоли
- ✅ Все файлы собраны в `dist/`
- ✅ `index.html` существует
- ✅ JS файлы минифицированы
- ✅ Статические ресурсы скопированы

---

## 🚀 Автоматический деплой

### GitHub Actions (если восстановить):

**Файл:** `.github/workflows/deploy.yml`

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm install
      - run: npm run build
        env:
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### Настройка:

1. Добавить `GEMINI_API_KEY` в GitHub Secrets
2. Включить GitHub Pages в настройках
3. При каждом push в `main` будет автоматический деплой

---

## 🔍 Проверка деплоя

### GitHub Pages:

1. Откройте: https://johnda7.github.io/ai-pod/
2. Проверьте:
   - ✅ Страница загружается
   - ✅ Нет ошибок в консоли браузера
   - ✅ Все ресурсы загружаются
   - ✅ AI работает (если ключ установлен)

### Telegram бот:

1. Найдите бота в Telegram
2. Отправьте `/start`
3. Проверьте:
   - ✅ Бот отвечает
   - ✅ Команды работают
   - ✅ Нет ошибок в логах

---

## 🐛 Решение проблем деплоя

### Проблема: GitHub Pages показывает 404

**Решение:**
1. Проверьте base path в `vite.config.ts` - должен быть `/ai-pod/`
2. Убедитесь, что GitHub Pages включен
3. Проверьте, что файлы в папке `dist/` закоммичены (или используйте GitHub Actions)

### Проблема: Бот не отвечает

**Решение:**
1. Проверьте токен в `.env`
2. Убедитесь, что бот запущен: `npm start`
3. Проверьте логи на ошибки
4. Проверьте интернет-соединение сервера

### Проблема: AI не работает на GitHub Pages

**Решение:**
1. Добавьте `GEMINI_API_KEY` в GitHub Secrets
2. Обновите workflow для использования секрета
3. Пересоберите и задеплойте

---

## 📝 Чеклист деплоя

### Перед деплоем:

- [ ] Код протестирован локально
- [ ] `npm run build` выполняется без ошибок
- [ ] Переменные окружения настроены
- [ ] Все зависимости установлены

### Деплой веб-приложения:

- [ ] Собрать проект: `npm run build`
- [ ] Проверить сборку: `npm run preview`
- [ ] Закоммитить изменения (если нужно)
- [ ] Запушить на GitHub
- [ ] Проверить GitHub Pages

### Деплой Telegram бота:

- [ ] Установить зависимости: `npm install`
- [ ] Настроить `.env` файл
- [ ] Запустить бота: `npm start`
- [ ] Проверить работу бота
- [ ] Настроить автозапуск (PM2/Docker)

---

## 🔗 Полезные ссылки

- **GitHub Repository:** https://github.com/johnda7/ai-pod
- **GitHub Pages:** https://johnda7.github.io/ai-pod/
- **GitHub Settings:** https://github.com/johnda7/ai-pod/settings
- **Vite Docs:** https://vitejs.dev/guide/static-deploy.html
- **GitHub Pages Docs:** https://docs.github.com/en/pages

---

## 💡 Рекомендации

### Для продакшена:

1. **Используйте GitHub Actions** для автоматического деплоя
2. **Настройте CI/CD** для проверки перед деплоем
3. **Используйте PM2** для Telegram бота
4. **Настройте мониторинг** (логи, алерты)
5. **Используйте CDN** для статических ресурсов

### Безопасность:

- ✅ Не коммитьте `.env` файлы
- ✅ Используйте GitHub Secrets для ключей
- ✅ Ограничьте доступ к репозиторию
- ✅ Регулярно обновляйте зависимости

---

**Версия:** 1.0  
**Последнее обновление:** 2025-11-26

