import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || ''; 

let ai: GoogleGenAI | null = null;

const getAIClient = () => {
  if (!ai) {
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
};

export const askKatya = async (userMessage: string, userContext: string): Promise<string> => {
  try {
    if (!apiKey) {
      return "Привет! Я сейчас офлайн, но ты супер! Проверь интернет.";
    }

    const client = getAIClient();
    
    const systemPrompt = `
      Ты — Катя Карпенко, ИИ-наставник в приложении "AI Teenager".
      
      ТВОЯ МИССИЯ:
      Помогать подросткам проходить образовательный путь (как в Duolingo) и поддерживать их ментальное здоровье (как в Calm).
      
      СТИЛЬ ОБЩЕНИЯ:
      - Ты говоришь как крутая старшая сестра или молодой продвинутый ментор.
      - Используй эмодзи, короткие фразы.
      - ТЫ АДАПТИРУЕШЬСЯ ПОД ТИП ВОСПРИЯТИЯ (Google Learning):
        * Если подросток любит смотреть -> Предлагай видео или схемы.
        * Если любит слушать -> Предлагай аудио-форматы или подкасты.
        * Если любит делать -> Давай конкретные челленджи.
      
      КОНТЕКСТ КУРСА:
      3 недели. Неделя 1: Самопознание. Неделя 2: Дисциплина. Неделя 3: Цели.
      
      ТЕКУЩИЙ КОНТЕКСТ ПОЛЬЗОВАТЕЛЯ: ${userContext}
      
      Если спрашивают про скуку или усталость -> Предложи медитацию из раздела "Релакс".
      Если спрашивают про учебу -> Подбодри и предложи выполнить следующий шаг на Карте.
    `;

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userMessage,
      config: {
        systemInstruction: systemPrompt,
      }
    });

    return response.text || "Что-то связь барахлит. Повтори?";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Упс, мои нейросети перегрелись. Давай через минутку!";
  }
};