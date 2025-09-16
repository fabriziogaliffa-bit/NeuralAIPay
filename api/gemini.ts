/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI, Modality, Type, Content } from "@google/genai";

// This tells Vercel to run this function as an Edge Function.
// It uses a web-standard API that's fast and efficient.
export const config = {
  runtime: 'edge',
};

// Initialize the Gemini AI client with the API key from environment variables.
// This code runs on the server, so process.env.API_KEY is secure.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

// This is the main function that handles requests from the frontend.
export default async function handler(request: Request) {
    // We only accept POST requests.
    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        // Parse the request body to get the task and payload.
        const { task, payload } = await request.json();

        // Use a switch statement to handle different AI tasks.
        switch (task) {
            case 'chat': {
                const { history, message } = payload;
                const chat = ai.chats.create({
                  model: 'gemini-2.5-flash',
                  config: {
                    systemInstruction: 'You are a helpful and friendly AI assistant for NeuralPay, a platform that provides AI services through crypto payments. Keep your answers concise and friendly.',
                  },
                  history: history as Content[],
                });
                const response = await chat.sendMessage({ message });
                return new Response(JSON.stringify({ text: response.text }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                });
            }

            case 'image-edit': {
                const { image, prompt } = payload;
                const imagePart = { inlineData: image };
                const textPart = { text: prompt };

                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash-image-preview',
                    contents: { parts: [imagePart, textPart] },
                    config: {
                        responseModalities: [Modality.IMAGE, Modality.TEXT],
                    },
                });

                let resultImage = null;
                for (const part of response.candidates[0].content.parts) {
                    if (part.inlineData) {
                        resultImage = part.inlineData;
                        break;
                    }
                }
                return new Response(JSON.stringify({ image: resultImage }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                });
            }

            case 'data-analysis': {
                const { description } = payload;
                const schema = {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING, description: "Ein kurzer, prägnanter Titel für die Analyse." },
                        summary: { type: Type.STRING, description: "Eine Zusammenfassung der Analyse in 2-3 Sätzen." },
                        key_insights: { type: Type.ARRAY, description: "Eine Liste von 3-5 wichtigen Erkenntnissen aus den Daten.", items: { type: Type.STRING } },
                        recommendations: { type: Type.ARRAY, description: "Eine Liste von 2-3 umsetzbaren Empfehlungen basierend auf der Analyse.", items: { type: Type.STRING } }
                    }
                };
                const prompt = `Du bist ein erfahrener Datenanalyst. Basierend auf der folgenden Beschreibung, generiere ein plausibles, fiktives Datenset in deinem Gedächtnis (zeige es nicht an). Analysiere dieses Datenset und gib einen Titel, eine Zusammenfassung, 3-5 Schlüsselerkenntnisse und 2-3 Handlungsempfehlungen zurück. Die Beschreibung des Nutzers ist: "${description}". Formatiere deine Antwort ausschließlich als JSON gemäß dem vorgegebenen Schema.`;

                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                    config: { responseMimeType: "application/json", responseSchema: schema }
                });

                return new Response(JSON.stringify(JSON.parse(response.text)), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                });
            }

            case 'translate': {
                const { text, from, to } = payload;
                const prompt = `Translate the following text from ${from} to ${to}. Provide only the translated text, without any additional explanations or context. The text is: "${text}"`;
                const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
                return new Response(JSON.stringify({ text: response.text }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                });
            }

            case 'audio-transcribe': {
                const { audio } = payload;
                const audioPart = { inlineData: audio };
                const textPart = { text: "Transcribe this audio file." };
                const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: { parts: [audioPart, textPart] } });
                return new Response(JSON.stringify({ text: response.text }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                });
            }

            case 'code-assist': {
                const { description, language } = payload;
                const prompt = `You are an expert programmer. Your task is to act as a code assistant. The user is working with ${language}. The user's request is: "${description}". Provide only the code block as a response, without any additional explanations, introductions, or markdown formatting like \`\`\`${language.toLowerCase()}\n. Just the raw code.`;
                const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
                return new Response(JSON.stringify({ text: response.text }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                });
            }

            default:
                return new Response(JSON.stringify({ error: 'Invalid task specified' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                });
        }
    } catch (error: any) {
        console.error('Error processing request in /api/gemini:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error', details: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}