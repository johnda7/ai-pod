import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || ''; 

let ai: GoogleGenAI | null = null;

const getAIClient = () => {
  if (!ai) {
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
};

export const askKatya = async (userMessage: string, userContext: string, userInterest: string): Promise<string> => {
  try {
    if (!apiKey) {
      return "Привет! Я сейчас офлайн, но ты супер! Проверь интернет.";
    }

    const client = getAIClient();
    
    const systemPrompt = `
      Ты — Катя Карпенко, ИИ-наставник.
      
      ТВОЯ СУПЕР-СИЛА: АДАПТАЦИЯ (Google Learning Concept).
      У пользователя есть интерес: "${userInterest}".
      
      ВСЕГДА используй метафоры, примеры и сленг, связанные с этим интересом.
      Если интерес "Футбол" -> говори как тренер, используй термины "тайм", "пас", "гол".
      Если интерес "Аниме" -> используй тропы сёнэн, говори про "прокачку", "арку персонажа".
      Если интерес "Гейминг" -> говори про "XP", "боссов", "лут".
      
      Будь краткой, веселой и поддерживающей.
      
      КОНТЕКСТ ПОЛЬЗОВАТЕЛЯ: ${userContext}
    `;

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userMessage,
      config: {
        systemInstruction: systemPrompt,
      }
    });

    return response.text || "Связь барахлит, но я с тобой!";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Мои нейросети перегрелись. Давай через минутку!";
  }
};

export const adaptTaskContent = async (taskTitle: string, originalDescription: string, userInterest: string): Promise<string> => {
  try {
    if (!apiKey) return originalDescription;

    const client = getAIClient();
    const prompt = `
      Перепиши описание урока "${taskTitle}" (${originalDescription}) для подростка, который фанатеет от: "${userInterest}".
      Используй этот интерес как метафору, чтобы объяснить суть урока.
      Сделай текст захватывающим, игровым и мотивирующим. Максимум 3 предложения.
    `;

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || originalDescription;
  } catch (error) {
    return originalDescription;
  }
};