const { OpenAI } = require("openai");

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

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: "OPENAI_API_KEY nao esta configurada nas variaveis de ambiente do Vercel." });
    }

    try {
        const openai = new OpenAI({ apiKey });
        const { contents } = req.body;

        // Converter histórico do formato antigo (Gemini) para o formato do ChatGPT (OpenAI)
        const messages = contents.map(c => ({
            role: c.role === 'model' ? 'assistant' : 'user',
            content: c.parts[0].text
        }));

        // Adiciona a instrução do bot para o ChatGPT
        messages.unshift({
            role: 'system',
            content: 'Você é um assistente virtual da Faculdade Uniminas EAD. Responda de forma curta, amigável e persuasiva. Você ajuda com dúvidas sobre pós-graduação, cursos, certificados reconhecidos pelo MEC e conclusão em 3 meses.'
        });

        // Chama a API da OpenAI (ChatGPT)
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: messages,
            temperature: 0.7,
            max_tokens: 250
        });

        const text = completion.choices[0].message.content;

        // Retorna no formato que o frontend já espera
        return res.status(200).json({
            candidates: [{ content: { parts: [{ text: text }] } }]
        });

    } catch (error) {
        console.error("OpenAI Error:", error.message);
        return res.status(500).json({ error: error.message || "Erro interno na API do ChatGPT." });
    }
};