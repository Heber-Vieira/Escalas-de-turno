
import { GoogleGenAI } from "@google/genai";

/**
 * Sistema de cache persistente para minimizar chamadas à API
 */
const getCache = (key: string) => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return null;
    const parsed = JSON.parse(item);
    // Cache expira em 24h
    if (Date.now() - parsed.timestamp > 86400000) {
      localStorage.removeItem(key);
      return null;
    }
    return parsed.value;
  } catch { return null; }
};

const setCache = (key: string, value: string) => {
  try {
    localStorage.setItem(key, JSON.stringify({ value, timestamp: Date.now() }));
  } catch (e) { console.error("Erro ao salvar cache", e); }
};

async function callWithRetry(fn: () => Promise<any>, maxRetries = 3, baseDelay = 3000) {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const status = error?.status || (error?.message?.includes("429") ? 429 : 0);
      
      if (status === 429 && i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      break;
    }
  }
  throw lastError;
}

export async function getSmartAlert(userName: string, shiftType: string, isWorkDayTomorrow: boolean, isHoliday: boolean) {
  const today = new Date().toISOString().split('T')[0];
  const cacheKey = `alert_v2_${userName}_${today}_${isWorkDayTomorrow}_${isHoliday}`;
  
  // 1. Verificar cache primeiro
  const cached = getCache(cacheKey);
  if (cached) return cached;

  try {
    return await callWithRetry(async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Persona: RH do app Escala Fácil.
      Contexto: ${userName} (${shiftType}). Amanhã trabalha: ${isWorkDayTomorrow}. Feriado: ${isHoliday}.
      Tarefa: 1 frase curta (8-12 palavras) motivadora c/ emoji.
      Foco: Incentive se trabalhar, deseje bom descanso se folga.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      const text = response.text?.trim() || "Tenha um ótimo dia! ✨";
      setCache(cacheKey, text);
      return text;
    });
  } catch (error) {
    console.warn("Gemini Quota/Error Fallback active.");
    return isWorkDayTomorrow 
      ? "Foco total na jornada de amanhã! Você consegue! 💪" 
      : "Aproveite sua folga para recarregar as energias! 🍃";
  }
}
