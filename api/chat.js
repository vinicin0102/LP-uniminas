export default async function handler(req, res) {
    // Apenas aceita método POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'A chave da API (GEMINI_API_KEY) não está configurada no Vercel.' });
    }

    try {
        const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
        });

        const data = await response.json();
        
        if (!response.ok) {
            console.error("Gemini API Error:", data);
            return res.status(response.status).json({ error: data.error?.message || 'Erro na API do Gemini' });
        }

        return res.status(200).json(data);
    } catch (error) {
        console.error("Vercel Backend Error:", error);
        return res.status(500).json({ error: 'Erro interno no servidor do Vercel.' });
    }
}