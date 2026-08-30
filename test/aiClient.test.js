import { describe, it, expect, vi, beforeEach } from "vitest";
import { getCharacterReply } from "../src/services/aiClient";

beforeEach(() => {
    vi.clearAllMocks();
});
global.fetch = vi.fn();

describe(`getCharacterReply`,()=>{
    beforeEach(()=>{
        fetch.mockClear();
    })
    it(`Deberia llamar a /chat con POST y devolver el texto normalizado`,async ()=>{
        const fakeGeminiResponse= {
            candidates: [
                {
                    content: {parts: [{text:"¿Qué tal la marea, camarada?"}]},
                    finishReason: "STOP",
                }
            ],
            usageMetadata: {promptTokenCount: 10, candidatesTokenCount: 5},
        }

        fetch.mockResolvedValueOnce({
            ok: true,
            json: async()=> fakeGeminiResponse,
        })
        const uiMessages = [{role:"user",text:"Hola Jack"}];
        const character = "jack";
        const text = await getCharacterReply(uiMessages,character);
        expect(text).toBe("¿Qué tal la marea, camarada?");
        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith(
            "/api/chat",
            expect.objectContaining({
                method: "POST",
                headers: {"Content-Type":"application/json"},
            })
        )
    })

    it(`Deberia adjuntar retryAfterSecnonds al error cuando la API responde 429`,async()=>{
        fetch.mockResolvedValueOnce({
            ok:false,
            status: 429,
            statusText: "Too Many Request",
            json: async()=>({
                error: "Rate limit exceeded",
                retryAfterSeconds: 30,
            })
        })
        const character = "jack";
        const uiMessages = [{role:"user",text:"spam"}];
        await expect(getCharacterReply(uiMessages,character)).rejects.toMatchObject({
            status: 429,
            retryAfterSeconds: 30,
        })
    })
})
it("Debería propagar un error cuando la API responde 500", async () => {

    fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        json: async () => ({
            error: "Internal server error"
        })
    });

    await expect(
        getCharacterReply(
            [{ role: "user", text: "Hola" }],
            "jack"
        )
    ).rejects.toMatchObject({
        status: 500
    });
});


it("Debería lanzar un error si el personaje no es válido", async () => {

    await expect(
        getCharacterReply(
            [{ role: "user", text: "Hola" }],
            "spiderman"
        )
    ).rejects.toThrow("Personaje no válido");

    expect(fetch).not.toHaveBeenCalled();
});

it("Debería usar el prompt de Tony cuando el personaje es tony", async () => {

    fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
            candidates: [
                {
                    content: {
                        parts: [
                            { text: "Respuesta de Tony" }
                        ]
                    }
                }
            ]
        })
    });
    await getCharacterReply(
        [{ role: "user", text: "Hola" }],
        "tony"
    );

    const requestBody = JSON.parse(
        fetch.mock.calls[0][1].body
    );

    expect(requestBody.systemInstruction.parts[0].text)
        .toContain("Sos Tony Stark");
});
it("Debería usar el prompt de Jack cuando el personaje es jack", async () => {

    fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
            candidates: [
                {
                    content: {
                        parts: [
                            { text: "Respuesta de Jack" }
                        ]
                    }
                }
            ]
        })
    });

    await getCharacterReply(
        [{ role: "user", text: "Hola" }],
        "jack"
    );

    const requestBody = JSON.parse(
        fetch.mock.calls[0][1].body
    );

    expect(requestBody.systemInstruction.parts[0].text)
        .toContain("Sos Jack Sparrow");
});
it("Debería usar el prompt de Deadpool cuando el personaje es deadpool", async () => {

    fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
            candidates: [
                {
                    content: {
                        parts: [
                            { text: "Respuesta de Deadpool" }
                        ]
                    }
                }
            ]
        })
    });

    await getCharacterReply(
        [{ role: "user", text: "Hola" }],
        "deadpool"
    );

    const requestBody = JSON.parse(
        fetch.mock.calls[0][1].body
    );

    expect(requestBody.systemInstruction.parts[0].text)
        .toContain("Sos Deadpool");
});
