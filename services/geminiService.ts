import { GoogleGenAI } from "@google/genai";
import { BookedSlot } from "../types";
import { WEEK_DAYS, TIME_SLOTS } from "../constants";

const getTimeLabel = (timeId: string) => TIME_SLOTS.find(t => t.id === timeId)?.label || timeId;

const CHINESE_DAYS: Record<string, string> = {
  'Sun': '週日',
  'Mon': '週一',
  'Tue': '週二',
  'Wed': '週三',
  'Thu': '週四',
  'Fri': '週五',
  'Sat': '週六'
};

export const generateConfirmationMessage = async (
  slot: BookedSlot
): Promise<string> => {
  // Parse date safely (YYYY-MM-DD)
  const [yStr, mStr, dStr] = slot.date.split('-');
  const year = parseInt(yStr, 10);
  const month = parseInt(mStr, 10);
  const day = parseInt(dStr, 10);
  
  // Create date object (Month is 0-indexed)
  const dateObj = new Date(year, month - 1, day);
  const engDay = WEEK_DAYS[dateObj.getDay()];
  const dayLabel = CHINESE_DAYS[engDay] || engDay;
  
  const timeLabel = getTimeLabel(slot.timeId);
  const computerLabel = slot.computerId ? `(電腦${slot.computerId})` : '';

  // Format date as M月D日
  const formattedDate = `${month}月${day}日`;

  if (!process.env.API_KEY) {
    console.warn("No API Key found for Gemini");
    return "API Key missing. Cannot generate message.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `
      You are an assistant for the "Sesame Street" (芝麻街) school.
      Generate a text message exactly following the template below. 
      
      Variables:
      - Date: ${formattedDate}
      - Day: ${dayLabel}
      - Time: ${timeLabel}
      - Computer: ${slot.computerId}
      
      Template:
      您好，補課時間已安排於 ${formattedDate}（${dayLabel}） ${timeLabel} ${computerLabel}，請您留意時間，若臨時有異動請提前告知，謝謝配合。

      Instructions:
      - Output ONLY the message content. 
      - Do not add any conversational text or markdown.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    if (response.text) {
      return response.text.trim();
    }
    throw new Error("No text in response");
  } catch (error) {
    console.error("Error generating message:", error);
    return `您好，補課時間已安排於 ${formattedDate}（${dayLabel}） ${timeLabel} ${computerLabel}，請您留意時間，若臨時有異動請提前告知，謝謝配合。`;
  }
};