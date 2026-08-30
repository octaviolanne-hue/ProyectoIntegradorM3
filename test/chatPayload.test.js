import { describe, it, expect} from "vitest";
import { 
    buildPayload, 
    getTrimmedHistory, 
    normalizeAIResponse,
    toApiMessages
    } from "../src/transform/chatPayload.js";

describe("normalizeAIResponse",() =>{
    it("Deberia devolver un string vacio cuando la respuesta es invalida",()=>{
        expect(normalizeAIResponse(null)).toBe("");//respuesta es null
        expect(normalizeAIResponse({})).toBe("");//candidates no existe
        expect(normalizeAIResponse({candidates:[]})).toBe("");//candidates es un array vacio
        expect(normalizeAIResponse(
            {candidates:[{content:{parts:[]}}]}
        )).toBe("");//parts es un array vacio
        expect(
        normalizeAIResponse({
            candidates: [{content: {parts: [{notText: "x"},null ,{text: 123}]}}],
        })
    ).toBe("");//parts tiene objetos invalidos
    });
})

describe(`buildPayload`,()=>{
    it ("Deberia construir el shape correto para Gemini",()=>{
        const systemPrompt = "Sos Jack Sparrow";
        const uiMessages = [
            {role: "user", text: "hola"},
            {role: "character", text: "¿Qué querés saber, amigo?"},
        ];
        const payload = buildPayload({systemPrompt, uiMessages});
        expect(payload).toEqual({
            model: "gemini-flash-lite-latest",
            systemInstruction: { parts:[{text: "Sos Jack Sparrow"}] },
            contents: [
                {role: "user", parts: [{text: "hola"}]},
                {role: "model", parts:[{text:"¿Qué querés saber, amigo?"}]},
            ],
            generationConfig: {
                maxOutputTokens: 200,
                temperature: 0.9,
            },
        });
    });
});

describe(`getTrimmedHistory`,()=>{
    it(`Deberia devolver los ultimos N mensajes cuando hay mas que el limite`,()=>{
        const messages = Array.from({ length: 15},(_,i)=>({
            role: "user",
            text: `mensaje ${i+1}`,
        }));

        const trimmed = getTrimmedHistory(messages, 12);
        expect(trimmed).toHaveLength(12);
        expect(trimmed[11].text).toBe("mensaje 15")
        expect(trimmed[0].text).toBe("mensaje 4")
    });
    it(`Deberia devolver el historial completo si tiene menos que el limite`,()=>{
        const messages = [
            {role: "user", text:"a"},
            {role: "character", text:"b"},
            {role: "user", text:"c"},
        ]
        const trimmed = getTrimmedHistory(messages,12);
        expect(trimmed).toHaveLength(3);
    })
})
it("Debería extraer y limpiar el texto de una respuesta válida", () => {
    const raw = {
        candidates: [
            {
                content: {
                    parts: [
                        { text: "  Hola Jack  " }
                    ]
                }
            }
        ]
    };

    expect(normalizeAIResponse(raw)).toBe("Hola Jack");
});
it("Debería unir el texto de varias partes", () => {
    const raw = {
        candidates: [
            {
                content: {
                    parts: [
                        { text: "Hola " },
                        { text: "amigo, " },
                        { text: "¿cómo estás?" }
                    ]
                }
            }
        ]
    };

    expect(normalizeAIResponse(raw)).toBe(
        "Hola amigo, ¿cómo estás?"
    );
});
describe("toApiMessages", () => {

    it("Debería convertir user correctamente", () => {
        const messages = [
            {
                role: "user",
                text: "Hola"
            }
        ];

        expect(toApiMessages(messages)).toEqual([
            {
                role: "user",
                parts: [
                    {
                        text: "Hola"
                    }
                ]
            }
        ]);
    });

    it("Debería convertir character a model", () => {
        const messages = [
            {
                role: "character",
                text: "Hola, soy Jack"
            }
        ];

        expect(toApiMessages(messages)).toEqual([
            {
                role: "model",
                parts: [
                    {
                        text: "Hola, soy Jack"
                    }
                ]
            }
        ]);
    });

    it("Debería convertir una conversación completa", () => {
        const messages = [
            { role: "user", text: "Hola" },
            { role: "character", text: "¡Ahoy!" },
            { role: "user", text: "¿Dónde está el tesoro?" }
        ];

        expect(toApiMessages(messages)).toEqual([
            {
                role: "user",
                parts: [{ text: "Hola" }]
            },
            {
                role: "model",
                parts: [{ text: "¡Ahoy!" }]
            },
            {
                role: "user",
                parts: [{ text: "¿Dónde está el tesoro?" }]
            }
        ]);
    });

});