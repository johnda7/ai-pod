<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# AI Teenager — Геймифицированное обучение для подростков

> Интерактивное веб-приложение с AI-ассистентом Катей, квестами и адаптивным контентом.

[![View in AI Studio](https://img.shields.io/badge/AI_Studio-Open-blue?logo=google)](https://ai.studio/apps/drive/1bXHHCbf6fYioP9eHGif8NUKO6anr392m)
[![Made with Vite](https://img.shields.io/badge/Vite-6.4-646CFF?logo=vite)](https://vitejs.dev/)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)](https://www.typescriptlang.org/)

## 🚀 Быстрый старт

**Просмотр в AI Studio:** https://ai.studio/apps/drive/1bXHHCbf6fYioP9eHGif8NUKO6anr392m

## 🛠️ Локальная разработка

**Требования:** Node.js 18+

1. Установить зависимости:
   ```bash
   npm install
   ```

2. Создать `.env.local` с API ключом:
   ```bash
   echo "GEMINI_API_KEY=ваш_ключ_google_gemini" > .env.local
   ```

3. Запустить dev-сервер:
   ```bash
   npm run dev
   ```
   Откроется http://localhost:3000/

4. Сборка для production:
   ```bash
   npm run build
   ```

## 📁 Структура проекта

```
ai-pod/
├── components/          # React компоненты
│   ├── TeenDashboard.tsx   # Главная страница с квестами
│   ├── KatyaChat.tsx       # AI чат-ассистент
│   └── ...
├── services/
│   └── geminiService.ts    # Интеграция с Google Gemini
├── App.tsx              # Главный компонент
├── types.ts             # TypeScript типы
├── constants.ts         # Mock данные
└── save_data.json       # Прогресс пользователя
```

## 🎯 Основные возможности

- 🎮 **Геймификация** — XP, уровни, стрики
- 🤖 **AI-ассистент Катя** — адаптируется под интересы (Гейминг, Футбол, Арт, IT)
- 🗺️ **Квесты с градиентной дорогой** — визуальный прогресс
- 🧘 **Медитации и звуки** — релакс и фокус
- 👥 **3 роли** — подросток, родитель, куратор
- 💾 **Cloud Sync** — сохранение через GitHub Actions

## 🔧 Технологии

- **Frontend:** React 19, TypeScript, Tailwind CSS
- **Build Tool:** Vite 6.4
- **AI:** Google Gemini 2.5 Flash
- **Icons:** Lucide React
- **Deployment:** AI Studio CDN

## 📚 Документация

- **[AGENTS.md](AGENTS.md)** — полный гайд для AI-агентов и разработчиков
- **[.github/copilot-instructions.md](.github/copilot-instructions.md)** — инструкции для GitHub Copilot

## 🤝 Вклад

Проект активно разрабатывается. Для предложений:
1. Форкните репозиторий
2. Создайте feature branch
3. Откройте Pull Request

## 📄 Лицензия

MIT License — свободно используйте и модифицируйте!

---

*Разработано с ❤️ для подростков и их родителей*
