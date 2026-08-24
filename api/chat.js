import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'A chave da API não está configurada no Vercel.' });
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const { contents } = req.body;
        
        const result = await model.generateContent({ contents });
        const response = await result.response;
        const text = response.text();

        return res.status(200).json({
            candidates: [{ content: { parts: [{ text: text }] } }]
        });

    } catch (error) {
        console.error("Gemini SDK Error:", error);
        return res.status(500).json({ error: error.message || 'Erro interno na SDK do Gemini.' });
    }
}