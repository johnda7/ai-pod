<!-- Copilot / AI-agent instructions for the `ai-pod` repo -->
# Quick orientation for AI coding agents

Purpose: give a short, actionable summary so an AI agent can be productive right away in this repo.

1) Big picture
- Single-page React + TypeScript app built with Vite. UI is component-driven and uses Tailwind-style classnames.
- AI integration is entirely client-side via a thin service wrapper around `@google/genai` in `services/geminiService.ts`.
- Main runtime roles: `TEEN`, `PARENT`, `CURATOR`. Role switching is obvious in `App.tsx` via `RoleSelector` and influences which dashboard mounts:
  - `components/TeenDashboard.tsx`
  - `components/ParentDashboard.tsx`
  - `components/CuratorDashboard.tsx`

2) Key files to reference (concrete examples)
- `services/geminiService.ts` — AI client wrapper and place where system prompts live (change assistant voice/behavior here). Example: update `systemPrompt` to change Katya's persona.
- `components/KatyaChat.tsx` — chat UI and how `askKatya` is called (passes userMessage, userContext, userInterest).
- `constants.ts` — data model examples (TASKS, MOCK_USER, KATYA_VARIANTS). Use for test data and component examples.
- `types.ts` — canonical shapes (User, Task, ChatMessage) — follow these types when adding features.
- `save_data.json` — persistent user data (profile, XP, chat history). Created/updated via **Cloud Sync** feature (GitHub Actions integration in AI Studio). File is committed to repo root automatically when user clicks "Сохранить прогресс" button.
- `vite.config.ts` — shows environment wiring: `loadEnv` + `define` maps `GEMINI_API_KEY` into `process.env.*` for the browser. Note: API keys end up in the client bundle unless you change this.
- `package.json` — scripts: `npm run dev`, `npm run build`, `npm run preview`.

3) Developer workflows and important notes
- Run locally: npm install; add `.env.local` with `GEMINI_API_KEY` (see README.md); then `npm run dev` (Vite). The project expects the key via `GEMINI_API_KEY`.
- Quick smoke: `npm run build` will run Vite build.
- There are no backend server files in this repo — the AI client is instantiated in the browser. Avoid committing real keys.
- **Cloud Sync workflow:** User progress is saved to `save_data.json` via GitHub Actions when user clicks "Сохранить прогресс" button in AI Studio. This file is intentionally committed to repo (not gitignored). To test locally without cloud sync, implement localStorage fallback in components.

4) Project-specific conventions and gotchas
- UI text and prompts are Russian (see `services/geminiService.ts` and many components). When editing copy or prompts, preserve the RU context unless intentionally adding a new locale.
- The AI wrapper expects environment key at build time (`process.env.API_KEY` / `process.env.GEMINI_API_KEY` in `vite.config.ts`). If you need a server-proxy pattern, add a server-side endpoint rather than putting a key in the client bundle.
- State is mostly local component state (React useState). Global state stores are not present — for cross-component changes, follow the pattern in `App.tsx` (lift and pass callbacks like `onTaskComplete`).
- Mock data is authoritative for UI layout: `constants.ts` contains TASKS, LECTURES, MOCK_USER, MOCK_STUDENTS. Use these for unit/visual testing.
- **Data persistence:** `save_data.json` in project root is managed by **Cloud Sync** (AI Studio feature). When user clicks "Сохранить прогресс", app uses GitHub token to commit/update this file via Actions. Do NOT move to `public/` or add to `.gitignore` — it's intentionally version-controlled for cloud save feature. For local dev without cloud sync, use browser localStorage as fallback.

5) Integration points an agent may edit
- To change assistant behavior: edit `systemPrompt` in `services/geminiService.ts`.
- To change when/where the assistant appears: `App.tsx` mounts `<KatyaChat />` only for TEEN role.
- To change task descriptions or add adaptive text: tasks live in `constants.ts` (field `content.adaptedText`) and `adaptTaskContent` in `services/geminiService.ts` is the helper that rewrites descriptions.

6) Safety, secrets, and testing guidance for agents
- Do not commit secrets. If you need to run the AI locally, set `.env.local` (not committed) and add `GEMINI_API_KEY`.
- Prefer adding a development-only guard in `services/geminiService.ts` when experimenting (e.g., return canned text when `!process.env.GEMINI_API_KEY`). The file already includes a fallback message.

7) Small examples (copy/paste locations)
- Change Katya persona: edit `systemPrompt` string in `services/geminiService.ts` (lines near the `askKatya` function).
- Tip: `components/KatyaChat.tsx` shows how `askKatya(input, "Неделя 1: Старт", "Гейминг")` passes context — keep the same argument order when calling the helper.

8) What NOT to change without a test or PR note
- `vite.config.ts` env `define` mapping — changing it alters how env values are available in the client.
- Public asset URIs in `constants.ts` — they are used across many components for layout.

9) For AI Studio agents: Commit guidelines
When saving progress to GitHub, follow these rules:
- **Always commit ALL changed files** (not just save_data.json): App.tsx, components/*.tsx, services/*.ts, index.html, vite.config.ts, etc.
- **Use descriptive commit messages** with format: `<type>: Brief description` (types: feat, fix, style, docs, refactor)
- **Group related changes** into one commit using GitHub Tree API (don't create 15 separate commits for 15 files)
- **Example good commit**: `feat: Add meditation sounds and XP boost\n\n- Create MeditationView with 5 tracks\n- Update XP formula\n- Save user progress (1250 XP)`
- **Example bad commit**: `💾 Auto-save: Full App Snapshot` or `update` (too vague, no context)
- See `.aistudio/commit-instructions.md` and `AI_STUDIO_SYNC.md` for detailed instructions

If anything above is unclear or you want the instructions to emphasize a different area (for example, adding tests, CI, or a server-side proxy for API keys), tell me what to add and I will iterate.
