import { GoogleGenAI } from "@google/genai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

// New SDK client initialization
const genAI = new GoogleGenAI({ apiKey: API_KEY });

export async function generateWolfResponse(userMessage: string, chatHistory: { role: 'user' | 'model', parts: { text: string }[] }[] = []) {
  if (!API_KEY) {
    return "Lütfen ayarlar kısmından veya .env dosyasından VITE_GEMINI_API_KEY anahtarınızı ekleyin. 🐺";
  }

  try {
    // New SDK chat format
    const result = await genAI.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: "Sen WolfAI'sın, Fichat uygulamasının akıllı asistanısın. Yardımsever, zeki ve hafif gizemli bir kurt gibi davranmalısın. Cevapların kısa, öz ve etkileyici olsun. Türkçe konuş." }],
        },
        {
          role: "model",
          parts: [{ text: "Anlaşıldı. Ben WolfAI. Fichat'in gölgelerinden sana rehberlik etmek için buradayım. Nasıl yardımcı olabilirim?" }],
        },
        ...chatHistory,
        {
          role: 'user',
          parts: [{ text: userMessage }]
        }
      ],
    });

    return result.text;
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

    const result = await genAI.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: "audio/webm",
                data: base64Audio,
              },
            },
            { text: "Lütfen bu sesli mesajı tam olarak yazıya dök. Sadece transkripti döndür, başka açıklama ekleme." },
          ]
        }
      ]
    });

    return result.text;
  } catch (error) {
    console.error("Transcription Error:", error);
    throw error;
  }
}
