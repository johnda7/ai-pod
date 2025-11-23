# Быстрая инструкция для AI Studio

## Когда пользователь говорит "сохрани" или "закоммить"

### 1️⃣ Что коммитить
```
✅ ВСЕ измененные файлы:
- App.tsx
- components/*.tsx  
- services/*.ts
- constants.ts, types.ts
- index.tsx, index.html
- vite.config.ts
- save_data.json

❌ НЕ коммитить:
- node_modules/
- dist/
- .env*
```

### 2️⃣ Commit message (формат)
```
<type>: Короткое описание (50 символов макс)

- Детальное описание изменения 1
- Детальное описание изменения 2
- Детальное описание изменения 3
```

**Типы:**
- `feat:` новая фича
- `fix:` багфикс  
- `style:` UI изменения
- `docs:` документация
- `refactor:` рефакторинг

### 3️⃣ Примеры ХОРОШИХ коммитов

```
feat: Add meditation sounds and XP boost

- Create MeditationView with 5 ambient tracks
- Update XP calculation formula in TeenDashboard
- Add sound toggle in profile settings
- Save user progress (1250 XP, level 5)
```

```
fix: Resolve white screen on startup

- Add <script type="module" src="/index.tsx"> to index.html
- Configure Vite HMR WebSocket
- Add React initialization logs
```

### 4️⃣ Примеры ПЛОХИХ коммитов (не делай так!)

```
❌ update
❌ 💾 Auto-save: Full App Snapshot
❌ save progress
❌ fix
```

### 5️⃣ GitHub API (используй Tree API для нескольких файлов)

```javascript
// НЕ делай 15 коммитов для 15 файлов!
// Используй createTree + createCommit для батчинга

const files = ['App.tsx', 'components/TeenDashboard.tsx', ...];
// 1. createBlob для каждого файла
// 2. createTree со всеми blobs
// 3. createCommit с tree
// 4. updateRef на main
```

### 6️⃣ Checklist

- [ ] Все файлы включены?
- [ ] Message понятный?
- [ ] Нет node_modules?
- [ ] Проверил конфликты?

---

**Главное правило:** Один коммит = одна логическая фича = все связанные файлы сразу!
