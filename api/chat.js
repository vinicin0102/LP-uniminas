const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY nao esta configurada nas variaveis de ambiente do Vercel." });
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const { contents } = req.body;

        const chat = model.startChat({
            history: contents.slice(0, -1).map(c => ({
                role: c.role,
                parts: c.parts
            }))
        });

        const lastMessage = contents[contents.length - 1].parts[0].text;
        const result = await chat.sendMessage(lastMessage);
        const text = result.response.text();

        return res.status(200).json({
            candidates: [{ content: { parts: [{ text: text }] } }]
        });

    } catch (error) {
        console.error("Gemini SDK Error:", error.message);
        return res.status(500).json({ error: error.message || "Erro interno na SDK do Gemini." });
    }
};