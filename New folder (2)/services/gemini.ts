import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';

// System instruction to ensure the AI behaves like a respectful historian
const SYSTEM_INSTRUCTION = `
Siz Amir Temur (Sohibqiron) davri bo'yicha mutaxassis, donishmand tarixchisiz. 
Ismingiz "Temur AI".
Sizning vazifangiz foydalanuvchilarning Amir Temur, Temuriylar davlati, madaniyati, harbiy yurishlari haqidagi savollariga javob berishdir.

Qoidalar:
1. Javoblar o'zbek tilida (lotin yozuvida) bo'lishi shart.
2. Javoblar aniq, tarixiy faktlarga asoslangan va hurmat bilan yozilishi kerak.
3. Oddiy emojilarni umuman ishlatmang.
4. Javobingiz juda uzun bo'lib ketmasin, o'qishli va ravon bo'lsin.
5. Agar foydalanuvchi Amir Temurga aloqasiz narsa so'rasa, xushmuomalalik bilan mavzuga qaytishni so'rang.
6. Javoblaringizda Amir Temurning "Kuch - adolatdadir" shioriga mos ruh bo'lsin.
`;

export const getGeminiResponseStream = async (
  message: string, 
  history: { role: 'user' | 'model'; text: string }[]
) => {
  if (!apiKey) {
    throw new Error("API kaliti topilmadi.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  // Convert history to format expected by Chat if needed, 
  // but for simple Q&A we can create a new chat instance.
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.7,
    }
  });

  // Pre-load history if we were maintaining a long context, 
  // but for this snippet we assume direct streaming of the new message
  // In a full app, you'd map the `history` prop to the chat history.

  try {
    const resultStream = await chat.sendMessageStream({ message });
    return resultStream;
  } catch (error) {
    console.error("Gemini AI Xatosi:", error);
    throw error;
  }
};