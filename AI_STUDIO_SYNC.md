# 🔄 Инструкция для AI Studio: Синхронизация с GitHub

## Для AI-ассистента в Google AI Studio

Когда пользователь просит **"сохранить прогресс"** или **"закоммитить изменения"**, следуй этому протоколу:

---

## 📋 Что коммитить

### ✅ ВСЕГДА включай эти файлы:
```
App.tsx
components/*.tsx
services/*.ts
constants.ts
types.ts
index.tsx
index.html
vite.config.ts
package.json
save_data.json
```

### ❌ НЕ коммить:
```
node_modules/
dist/
.env
.env.local
*.log
.DS_Store
```

---

## 🚀 Пошаговая инструкция

### Шаг 1: Проверь что изменилось
Спроси пользователя:
```
Какие файлы ты редактировал? Я вижу изменения в:
- [список файлов]

Закоммитить все эти изменения?
```

### Шаг 2: Создай правильное commit message

**Формат:**
```
<type>: <короткое описание>

- Детальное описание изменения 1
- Детальное описание изменения 2
- Детальное описание изменения 3
```

**Types (типы коммитов):**
- `feat:` - новая фича
- `fix:` - багфикс
- `docs:` - документация
- `style:` - стили/UI
- `refactor:` - рефакторинг
- `perf:` - оптимизация
- `test:` - тесты
- `chore:` - зависимости, конфиг

**Примеры хороших commit messages:**

```
feat: Add GitHub Cloud Save modal with token auth

- Create GitHubSyncModal component with Octokit integration
- Add localStorage fallback for offline mode
- Implement export/import JSON functionality
- Add Telegram WebApp haptic feedback
```

```
fix: Resolve white screen on app load

- Add missing <script type="module" src="/index.tsx"> to index.html
- Configure Vite HMR for WebSocket support
- Add debug console.logs for React initialization
```

```
style: Update teen dashboard with gradient path animation

- Add SVG gradient definitions (indigo → violet → purple)
- Animate task nodes with organic-float keyframes
- Update Katya chat bubble positioning
```

---

## 🔑 GitHub API для коммита

Используй GitHub REST API или Octokit для создания коммита:

```javascript
// Пример с Octokit
const octokit = new Octokit({ auth: GITHUB_TOKEN });

await octokit.rest.repos.createOrUpdateFileContents({
  owner: 'johnda7',
  repo: 'ai-pod',
  path: 'App.tsx',
  message: 'feat: Add GitHub Cloud Save modal',
  content: Buffer.from(fileContent).toString('base64'),
  sha: currentFileSha, // Получи через GET /repos/:owner/:repo/contents/:path
  branch: 'main'
});
```

---

## 📦 Коммит нескольких файлов сразу

### Вариант 1: Один коммит на файл (НЕ РЕКОМЕНДУЕТСЯ)
```
❌ Плохо: 15 коммитов для 15 файлов
```

### Вариант 2: Используй Git Tree API (РЕКОМЕНДУЕТСЯ)
```javascript
// 1. Получи последний коммит
const { data: ref } = await octokit.rest.git.getRef({
  owner: 'johnda7',
  repo: 'ai-pod',
  ref: 'heads/main'
});

// 2. Создай blobs для каждого файла
const blobs = await Promise.all(
  files.map(file => 
    octokit.rest.git.createBlob({
      owner: 'johnda7',
      repo: 'ai-pod',
      content: Buffer.from(file.content).toString('base64'),
      encoding: 'base64'
    })
  )
);

// 3. Создай tree
const { data: tree } = await octokit.rest.git.createTree({
  owner: 'johnda7',
  repo: 'ai-pod',
  base_tree: ref.object.sha,
  tree: files.map((file, i) => ({
    path: file.path,
    mode: '100644',
    type: 'blob',
    sha: blobs[i].data.sha
  }))
});

// 4. Создай коммит
const { data: commit } = await octokit.rest.git.createCommit({
  owner: 'johnda7',
  repo: 'ai-pod',
  message: 'feat: Update multiple components',
  tree: tree.sha,
  parents: [ref.object.sha]
});

// 5. Обнови ref
await octokit.rest.git.updateRef({
  owner: 'johnda7',
  repo: 'ai-pod',
  ref: 'heads/main',
  sha: commit.sha
});
```

---

## ⚠️ Частые ошибки

### 1. Коммитишь только save_data.json
```
❌ Плохо:
💾 Auto-save: Update user progress

✅ Хорошо:
feat: Add new meditation sounds and update user XP system

- Add 3 new meditation tracks in MeditationView
- Update XP calculation in TeenDashboard
- Save user progress (1250 XP, level 5)
```

### 2. Непонятное commit message
```
❌ Плохо:
Auto-save progress: 2025-11-23T10:05:26.605Z

✅ Хорошо:
feat: Complete Week 1 Gaming Quest with adaptive content

- User completed task 1-1 (15 min focus session)
- Unlocked Week 2 path
- Updated learning style to VISUAL
```

### 3. Забываешь про конфликты
```
⚠️ Перед коммитом:
1. Проверь что на GitHub нет новых коммитов
2. Если есть конфликты → сначала merge, потом коммит
3. Используй SHA последнего коммита как parent
```

---

## 🎯 Checklist перед коммитом

- [ ] Все изменённые файлы включены?
- [ ] Commit message описывает ЧТО и ЗАЧЕМ?
- [ ] Нет node_modules/ и dist/ в коммите?
- [ ] save_data.json актуален?
- [ ] Проверил конфликты с origin/main?

---

## 📞 Если что-то пошло не так

**Конфликт при пуше:**
```
Скажи пользователю:
"⚠️ На GitHub есть новые изменения. Нужно сначала их подтянуть.
Открой терминал и выполни:
git pull origin main
Потом я снова закоммичу."
```

**Токен не работает:**
```
Скажи пользователю:
"❌ GitHub токен недействителен. Проверь права:
- repo (полный доступ)
- workflow (для Actions)

Создай новый токен: https://github.com/settings/tokens"
```

---

## 🌟 Best Practices

1. **Коммить атомарно**: одна логическая фича = один коммит
2. **Описывать изменения**: не просто "update", а ЧТО обновил и ЗАЧЕМ
3. **Группировать файлы**: все файлы одной фичи в один коммит
4. **Синхронизироваться часто**: каждые 10-15 минут работы
5. **Тестировать локально**: убедись что app работает перед коммитом

---

## 📚 Примеры реальных коммитов

### Хорошие ✅
```
feat: Add GitHub Cloud Save modal with Octokit integration

- Create GitHubSyncModal component with token input
- Implement createGitHubCommit function with Tree API
- Add localStorage for GitHub token persistence
- Update App.tsx with sync state management
- Add sync button to profile menu
```

```
fix: Resolve localStorage quota exceeded error

- Add try-catch wrapper for localStorage operations
- Implement memory fallback storage
- Add safeStorage helper in App.tsx
- Update error handling in TeenDashboard
```

### Плохие ❌
```
update
```

```
💾 Auto-save: Full App Snapshot (Code + Data)
```

```
fix bug
```

---

*Этот файл создан для AI Studio ассистентов. Следуй ему при каждом сохранении прогресса!*
