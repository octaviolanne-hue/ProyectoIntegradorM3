import {
    JACK_SYSTEM_PROMPT,
    TONY_SYSTEM_PROMPT,
    DEADPOOL_SYSTEM_PROMPT
} from "./prompts.js";

import {
    buildPayload,
    normalizeAIResponse,
    getTrimmedHistory
} from "../transform/chatPayload.js";

import { fetchJson } from "./fetchJson.js";

const CHAT_ENDPOINT = "/api/chat";

const CHARACTER_PROMPTS = {
    jack: JACK_SYSTEM_PROMPT,
    tony: TONY_SYSTEM_PROMPT,
    deadpool: DEADPOOL_SYSTEM_PROMPT,
};

export async function getCharacterReply(uiMessages, character) {

    // 1. Buscar el prompt correspondiente al personaje.
    const systemPrompt = CHARACTER_PROMPTS[character];

    // 2. Verificar que exista el personaje.
    if (!systemPrompt) {
        throw new Error("Personaje no válido");
    }

    // 3. Recortar historial para controlar tokens.
    const trimmed = getTrimmedHistory(uiMessages);

    // 4. Construir payload con shape de Gemini.
    const payload = buildPayload({
        systemPrompt,
        uiMessages: trimmed,
    });

    // 5. Llamar al endpoint.
    let rawResponse;

    try {

        rawResponse = await fetchJson(CHAT_ENDPOINT, {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
            },

            body: JSON.stringify(payload),
        });

    } catch (err) {

        if (err.status === 429 && err.body?.retryAfterSeconds) {
            err.retryAfterSeconds = err.body.retryAfterSeconds;
        }

        throw err;
    }

    // 6. Normalizar la respuesta a string limpio.
    const text = normalizeAIResponse(rawResponse);

    // 7. Mostrar información de tokens.
    const usage = rawResponse?.usageMetadata;

    if (usage) {
        console.log(
            `[Tokens] input: ${usage.promptTokenCount}, output: ${usage.candidatesTokenCount}`
        );
    }

    return text;
}