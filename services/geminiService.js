// =============================
// /services/geminiService.js
// =============================

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const GEMINI_ENDPOINT =
    "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent";


function buildPrompt({ temperature, humidity, moisture, rainfall }) {
    return `You are an agronomy assistant. Given current field conditions, estimate soil macronutrients and pH for use in a crop recommendation model.

Return ONLY a strict minified JSON object with numeric values (no comments, no text around it), like:
{"N":80,"P":35,"K":40,"pH":6.5}

Constraints:
- N, P, K are in kg/ha, integers 0-300
- pH is 3.5 - 9.5 (one decimal)
- If information is insufficient, infer a reasonable value from typical Indian loamy soils in Kharif season.

Conditions:
- temperature_C: ${temperature}
- humidity_pct: ${humidity}
- soil_moisture_pct: ${moisture}
- rainfall_mm: ${rainfall}
`;
}

function extractJsonFromText(text) {
    try {
        // If it's already pure JSON
        return JSON.parse(text);
    } catch (_) {
        // Try to locate the first {...} block
        const start = text.indexOf("{");
        const end = text.lastIndexOf("}");
        if (start !== -1 && end !== -1 && end > start) {
            const jsonSlice = text.slice(start, end + 1);
            return JSON.parse(jsonSlice);
        }
        throw new Error("Gemini response did not contain valid JSON.");
    }
}

export async function predictSoilParams({ temperature, humidity, moisture, rainfall }) {
    if (!GEMINI_API_KEY) {
        throw new Error("Missing EXPO_PUBLIC_GEMINI_API_KEY");
    }

    const body = {
        contents: [
            {
                role: "user",
                parts: [{ text: buildPrompt({ temperature, humidity, moisture, rainfall }) }],
            },
        ],
        generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 128,
        },
    };

    const res = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [
                {
                    role: "user",
                    parts: [{ text: buildPrompt({ temperature, humidity, moisture, rainfall }) }],
                },
            ],
        }),
    });


    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Gemini API error: ${res.status} ${errText}`);
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const parsed = extractJsonFromText(text);

    const N = Math.max(0, Math.min(300, Math.round(Number(parsed.N))));
    const P = Math.max(0, Math.min(300, Math.round(Number(parsed.P))));
    const K = Math.max(0, Math.min(300, Math.round(Number(parsed.K))));
    const pH = Math.max(3.5, Math.min(9.5, Number(parsed.pH)));

    if ([N, P, K].some((v) => Number.isNaN(v)) || Number.isNaN(pH)) {
        throw new Error("Gemini returned invalid numbers");
    }

    return { N, P, K, pH: Number(pH.toFixed(1)) };
}

// --- Helpers: robust JSON extraction/parsing from LLM text ---
// Finds the first balanced {...} JSON object (ignores braces inside quotes)
function findFirstJsonObject(s) {
    if (!s) return null;

    // strip common wrappers
    let t = s.trim().replace(/```json/gi, "").replace(/```/g, "");
    // also strip any preface before the first '{'
    const firstBrace = t.indexOf("{");
    if (firstBrace > 0) t = t.slice(firstBrace);

    let depth = 0;
    let inString = false;
    let escape = false;

    for (let i = 0; i < t.length; i++) {
        const ch = t[i];

        if (inString) {
            if (escape) {
                escape = false;
            } else if (ch === "\\") {
                escape = true;
            } else if (ch === "\"") {
                inString = false;
            }
            continue;
        }

        if (ch === "\"") {
            inString = true;
            continue;
        }
        if (ch === "{") {
            depth++;
            continue;
        }
        if (ch === "}") {
            depth--;
            if (depth === 0) {
                // slice inclusive of this closing brace
                return t.slice(0, i + 1);
            }
            continue;
        }
    }
    return null; // not found
}

function safeParseGeminiJson(text) {
    const jsonSlice = findFirstJsonObject(text);
    if (!jsonSlice) throw new Error("No JSON object found in Gemini response.");
    // Clean any stray leading commas/colons/newlines
    const clean = jsonSlice.replace(/^[,:\\s]+/, "");
    return JSON.parse(clean);
}

// =====================
// ONE-CALL: English + Hindi description
// =====================
export async function generateCropDescriptionBoth({
                                                      crop, N, P, K, pH, temperature, humidity, moisture, rainfall
                                                  }) {
    const prompt = `
You are an agriculture advisor.
Generate TWO versions of a very short advice (max 3 lines) for a farmer based on this crop and field data.

crop=${crop}
N=${N}, P=${P}, K=${K}, pH=${pH}
temperature=${temperature}C, humidity=${humidity}%, moisture=${moisture}%, rainfall=${rainfall}mm

Return EXACTLY and ONLY this JSON (no extra words, no backticks):
{"english":"<simple english, farmer-friendly>", "hindi":"<simple Hindi, farmer-friendly>"}
`;

    const res = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
        }),
    });

    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Gemini API error: ${res.status} ${errText}`);
    }

    const data = await res.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    try {
        const obj = safeParseGeminiJson(raw);
        // Minimal sanity
        if (!obj || typeof obj !== "object") throw new Error("Parsed result is not an object");
        if (typeof obj.english !== "string" || typeof obj.hindi !== "string") {
            throw new Error("Parsed JSON missing 'english' or 'hindi' strings");
        }
        return obj; // { english, hindi }
    } catch (e) {
        // Log raw to console to debug quickly, but don't crash the app silently
        console.log("🔎 Gemini raw description text =>", raw);
        throw e;
    }
}


// =====================
// HELP: Ask AI with context
// =====================
export async function helpAnswer({ question, context }) {
    if (!question || !question.trim()) return "";

    const prompt = `
You are an agriculture advisor inside AgroSync app.
This is the current field context:

Temperature: ${context.temperature}°C
Humidity: ${context.humidity}%
Moisture: ${context.moisture}%
Rainfall: ${context.rainfall}mm
N: ${context.N}
P: ${context.P}
K: ${context.K}
pH: ${context.pH}

User question:
${question.trim()}

Answer in 3-5 short lines, simple farmer-friendly English.
Do not use codeblocks or markdown.
  `;

    const res = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
        }),
    });

    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Gemini Help error: ${res.status} ${errText}`);
    }

    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
}



//
// // =====================
// // translate to Hindi
// // =====================
// export async function translateToHindi(text) {
//     const prompt = `Translate this to simple Hindi suitable for farmers:\n${text}`;
//
//     const res = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
//         method:"POST",
//         headers:{ "Content-Type":"application/json" },
//         body:JSON.stringify({
//             contents:[{role:"user", parts:[{text:prompt}]}]
//         })
//     });
//
//     const data = await res.json();
//     return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
// }
