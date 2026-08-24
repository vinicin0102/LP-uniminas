const { OpenAI } = require("openai");

module.exports = async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    // Injetando a chave DIRETO no código para ignorar as configurações do Vercel
    const apiKey = "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";

    try {
        const openai = new OpenAI({ apiKey });
        const { contents } = req.body;

        const messages = contents.map(c => ({
            role: c.role === 'model' ? 'assistant' : 'user',
            content: c.parts[0].text
        }));

        messages.unshift({
            role: 'system',
            content: 'Você é um assistente virtual da Faculdade Uniminas EAD. Responda de forma curta, amigável e persuasiva. Você ajuda com dúvidas sobre pós-graduação, cursos, certificados reconhecidos pelo MEC e conclusão em 3 meses.'
        });

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: messages,
            temperature: 0.7,
            max_tokens: 250
        });

        const text = completion.choices[0].message.content;

        return res.status(200).json({
            candidates: [{ content: { parts: [{ text: text }] } }]
        });

    } catch (error) {
        console.error("OpenAI Error:", error.message);
        
        // MODO DE SEGURANÇA: Se a chave da OpenAI der erro de pagamento/bloqueio,
        // o chat NUNCA MAIS vai mostrar tela de erro. Ele vai responder isso automaticamente:
        const fallbackText = "Olá! Nosso sistema de inteligência artificial está passando por uma atualização rápida no momento. Mas não se preocupe, adoraríamos tirar suas dúvidas! Por favor, clique no botão do WhatsApp logo abaixo para falar com um consultor real. 😊";
        
        return res.status(200).json({
            candidates: [{ content: { parts: [{ text: fallbackText }] } }]
        });
    }
};