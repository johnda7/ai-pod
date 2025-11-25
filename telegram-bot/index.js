import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN || '8144830880:AAHY525Xj6WqoiEKNnk7N3d_aMsKcyP-taU';
const bot = new TelegramBot(token, { polling: true });

// Welcome message
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const welcomeMessage = `
🎮 Добро пожаловать в AI Pod!

Это геймифицированная платформа для обучения подростков.

📚 Доступные команды:
/start - Начать работу
/help - Помощь
/profile - Мой профиль
/tasks - Мои задачи
/leaderboard - Таблица лидеров
/katya - Поговорить с Катей (AI-наставник)

🌐 Веб-приложение: https://johnda7.github.io/ai-pod/

Начни свой путь к мастерству! 🚀
  `;
  
  bot.sendMessage(chatId, welcomeMessage);
});

// Help command
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  const helpMessage = `
📖 Справка по командам:

/profile - Посмотреть свой профиль (XP, уровень, монеты)
/tasks - Список доступных задач и уроков
/leaderboard - Рейтинг игроков
/katya - Чат с AI-наставником Катей
/week1 - Задачи первой недели
/week2 - Задачи второй недели
/week3 - Задачи третьей недели

💡 Совет: Используй веб-приложение для полного функционала!
  `;
  
  bot.sendMessage(chatId, helpMessage);
});

// Profile command
bot.onText(/\/profile/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  // TODO: Получить данные пользователя из БД
  const profileMessage = `
👤 Твой профиль:

🆔 ID: ${userId}
📛 Имя: ${msg.from.first_name || 'Игрок'}
🎮 Уровень: 1
⭐ XP: 0
💰 Монеты: 100
🔥 Стрик: 0 дней

💡 Используй веб-приложение для полного функционала!
  `;
  
  bot.sendMessage(chatId, profileMessage);
});

// Tasks command
bot.onText(/\/tasks/, (msg) => {
  const chatId = msg.chat.id;
  const tasksMessage = `
📚 Доступные задачи:

Неделя 1: Нейробиология мотивации
  • Мозг v2.0
  • Дофамин
  • Фокус-Ниндзя
  • Батарейка
  • Сон: Перезагрузка
  • БОСС: Король Шума

Неделя 2: Стратегия и дисциплина
  • Сила "Зачем"
  • Съешь Лягушку
  • Дисциплина > Мотивация
  • Архитектура Выбора
  • Level Up через Ошибки
  • БОСС: Прокрастинатор

Неделя 3: Мастерство и поток
  • Состояние Потока
  • Помодоро 2.0
  • Deep Work
  • Искусство Отдыха
  • Социальный Движок
  • Манифест
  • ФИНАЛ: Грандмастер

🌐 Открой веб-приложение для прохождения уроков!
  `;
  
  bot.sendMessage(chatId, tasksMessage);
});

// Leaderboard command
bot.onText(/\/leaderboard/, (msg) => {
  const chatId = msg.chat.id;
  const leaderboardMessage = `
🏆 Таблица лидеров:

🥇 1. Алекс - 1250 XP
🥈 2. Катя С. - 1500 XP
🥉 3. Макс Б. - 800 XP

💡 Используй веб-приложение для актуального рейтинга!
  `;
  
  bot.sendMessage(chatId, leaderboardMessage);
});

// Katya chat command
bot.onText(/\/katya/, (msg) => {
  const chatId = msg.chat.id;
  const katyaMessage = `
👋 Привет! Я Катя, твой AI-наставник.

Я помогу тебе:
• Разобраться с задачами
• Мотивировать тебя
• Ответить на вопросы об обучении

Просто напиши мне сообщение, и я отвечу!

💡 Для полного функционала чата используй веб-приложение.
  `;
  
  bot.sendMessage(chatId, katyaMessage);
});

// Week commands
bot.onText(/\/week1/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, '📅 Неделя 1: Нейробиология мотивации\n\n🌐 Открой веб-приложение для прохождения уроков!');
});

bot.onText(/\/week2/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, '📅 Неделя 2: Стратегия и дисциплина\n\n🌐 Открой веб-приложение для прохождения уроков!');
});

bot.onText(/\/week3/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, '📅 Неделя 3: Мастерство и поток\n\n🌐 Открой веб-приложение для прохождения уроков!');
});

// Handle all text messages (for Katya chat)
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  
  // Ignore commands
  if (text && text.startsWith('/')) {
    return;
  }
  
  // Simple echo for now (can be enhanced with Gemini API)
  if (text && !text.startsWith('/')) {
    bot.sendMessage(chatId, `💬 Я получил твое сообщение: "${text}"\n\n💡 Для полного AI-чата используй веб-приложение!`);
  }
});

// Error handling
bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});

console.log('🤖 Telegram bot is running...');



