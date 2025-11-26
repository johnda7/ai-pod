## 9034b33 - fix: Adjust header padding for Telegram UI

**Дата:** 2025-11-26 00:55:32 +0700

Increase top padding on dashboard, meditation, and shop views to prevent content overlap with Telegram's persistent UI elements. This ensures a cleaner and more accessible user experience.
---

## 3ff5d1c - feat: Add 'Anatomy of Laziness' task

**Дата:** 2025-11-26 00:48:13 +0700

Introduces a new task for Week 2 focused on understanding and overcoming laziness. This task includes theory slides, a sorting activity, a mini-game, and a puzzle to help users identify and combat procrastination triggers.
---

## 7b54806 - refactor: Adjust spacing and styling in dashboard views

**Дата:** 2025-11-25 17:51:32 +0700

Updates padding and visual elements in TeenDashboard, MeditationView, ShopView, and LeaderboardView for improved layout and aesthetics. Minor icon updates also included.
---

## 6f8be5b - feat: Refactor dashboard and related components

**Дата:** 2025-11-25 17:27:53 +0700

- Updated MOCK_USER with zero XP and coins for a fresh start.
- Enhanced the TeenDashboard UI by adding icons for new features and implementing a placeholder for inventory display.
- Improved boot sequence messages in App.tsx for clarity.
- Adjusted padding in MeditationView, ShopView, and LeaderboardView for better visual hierarchy.
- Added placeholder for inventory display in TeenDashboard and a new icon set for MiniGames.
---

## ce67f9a - feat: Refactor app initialization and integrate Supabase

**Дата:** 2025-11-25 17:05:37 +0700

This commit refactors the application's boot sequence and initialization logic to better integrate with Supabase for user data persistence.

Key changes include:
- Updating the `vite.config.ts` to remove the specific `/ai-pod/` base path, allowing for more flexible deployment.
- Modifying the `index.html` to remove the inline script tag, deferring script loading.
- Enhancing the `telegramService.ts` to provide more robust user identification, including parsing URL parameters for development.
- Overhauling the `db.ts` service to prioritize Supabase for user creation and data retrieval, with updated storage keys to ensure data integrity.
- Updating the boot sequence in `App.tsx` to reflect the new initialization steps, including Telegram ID lookup and Supabase connection.
- Adding new icons to `App.tsx` for enhanced UI feedback during boot.
- Removing the outdated GitHub Actions workflow for deployment to GitHub Pages.
---

## 3e7be16 - Обновление workflow: автоматическое включение GitHub Pages

**Дата:** 2025-11-25 15:02:30 +0700


---

## 6ebb2cb - Настройка деплоя на GitHub Pages: добавлен workflow и обновлена конфигурация

**Дата:** 2025-11-25 14:58:11 +0700


---

## 7fc1952 - fix: Improve sorting task usability

**Дата:** 2025-11-25 14:24:55 +0700

Enhance the sorting task by providing clearer instructions and visual cues for swiping actions. Update constant text to reflect these changes and introduce touch handling for better mobile interaction.
---

## 45fc980 - feat: Introduce new 'GAME' slide type and mini-games

**Дата:** 2025-11-25 13:29:54 +0700

Adds a new 'GAME' slide type to the lesson engine. This allows for the integration of interactive mini-games directly within lessons.

Also includes the implementation of two example mini-games: FocusDefender and EmbeddedMemoryGame, to demonstrate this new capability.
---

## cff974b - feat: Add currency system and shop integration

**Дата:** 2025-11-24 21:29:01 +0700

Introduces a new currency system (coins) and integrates it into user profiles and tasks. Adds shop items for players to purchase with coins, enhancing gamification and player progression.

Key changes include:
- Adding `coins` and `inventory` fields to the `User` type.
- Introducing `coinsReward` to `Task` and `POLL` slide type to `LessonSlide`.
- Mock user now includes starting coins and an empty inventory.
- `TeenDashboard` now displays coins and adds a 'SHOP' tab.
- `TaskModal` is updated to handle poll slides and display coin rewards.
- `db.ts` initializes new users with a starting coin balance.
- `constants.ts` defines mock shop items.
---

