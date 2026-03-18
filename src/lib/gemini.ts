import { GoogleGenerativeAI } from "@google/genai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

const genAI = new GoogleGenerativeAI(API_KEY);

export const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function generateWolfResponse(userMessage: string, chatHistory: { role: 'user' | 'model', parts: { text: string }[] }[] = []) {
  if (!API_KEY) {
    return "Lütfen ayarlar kısmından veya .env dosyasından VITE_GEMINI_API_KEY anahtarınızı ekleyin. 🐺";
  }

  try {
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: "Sen WolfAI'sın, Fichat uygulamasının akıllı asistanısın. Yardımsever, zeki ve hafif gizemli bir kurt gibi davranmalısın. Cevapların kısa, öz ve etkileyici olsun. Türkçe konuş." }],
        },
        {
          role: "model",
          parts: [{ text: "Anlaşıldı. Ben WolfAI. Fichat'in gölgelerinden sana rehberlik etmek için buradayım. Nasıl yardımcı olabilirim?" }],
        },
        ...chatHistory
      ],
    });

    const result = await chat.sendMessage(userMessage);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini Error:", error);
    return "🐺 Üzgünüm, şu an bağlantı kuramıyorum. Lütfen API anahtarını kontrol et.";
  }
}

export async function transcribeAudio(audioUrl: string) {
  if (!API_KEY) {
    throw new Error("API Key missing");
  }

  try {
    // Fetch the audio file
    const response = await fetch(audioUrl);
    const arrayBuffer = await response.arrayBuffer();
    const base64Audio = btoa(
      new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: "audio/webm",
          data: base64Audio,
        },
      },
      { text: "Lütfen bu sesli mesajı tam olarak yazıya dök. Sadece transkripti döndür, başka açıklama ekleme." },
    ]);

    return result.response.text();
  } catch (error) {
    console.error("Transcription Error:", error);
    throw error;
  }
}
