import { describe, it, expect} from "vitest";
import { normalizeAIResponse } from "../src/transform/chatPayload.js";

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