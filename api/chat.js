import { GoogleGenerativeAI } from "@google/generative-ai";

const RETY_AFTER_FALLBACK_SECONDS = 30;
const MODEL_NAME = "gemini-flash-lite-latest";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }
    try {
        const { contents, systemInstruction, generationConfig} = req.body ?? {};

        if (!Array.isArray(contents) || contents.length === 0){
            return res.status(400).json({error: "contents required and must be non-empty"});
        }
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
        model: MODEL_NAME,
        systemInstruction,
        generationConfig,
        });
    
    const result = await model.generateContent({contents: contents,});

    return res.status(200).json(result.response);

    }catch (error){
        if (error.status === 429) {

        return res.status(429).json({
            error: "Rate limit exceeded",
            retryAfterSeconds: RETY_AFTER_FALLBACK_SECONDS,
            details: error.message,
        });
        }
        console.error("Error in /api/chat:", error)
        return res.status(500).json({ error: "Internal server error"});
    }
}