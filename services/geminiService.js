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



// services/geminiService.js - ADD THIS NEW FUNCTION

// ... (keep all existing functions) ...

// =====================
// REFINED RECOMMENDATION
// {"topCrops":[{"name":"crop","reason":"brief","expectedYield":"X tons/ac","estimatedProfit":"₹X/ac","growingPeriod":"X mo"}],"avoidCrops":[{"name":"crop","reason":"brief"}],"soilImprovements":["tip","tip","tip"],"profitStrategies":["strategy","strategy","strategy"]}`;
// =====================
export async function getRefinedRecommendation(data) {
    const prompt = `Agricultural advisor API. JSON only response.

Data: ${data.temperature}°C, ${data.humidity}% humidity, ${data.moisture}% moisture, ${data.rainfall}mm rain, NPK: ${data.N}/${data.P}/${data.K}, pH ${data.pH}, ${data.farmSize}ac, ₹${data.budget}, ${data.laborAvailability} labor, ${data.irrigationSystem} irrigation, ${data.marketDistance}km market, ${data.soilTexture} soil.

Return 2 crops to grow, 2 to avoid, 3 general soil improvement tips 
Return all of this without any newline characters or formatting, ONLY this JSON:
{"topCrops":[{"name":"crop","reason":"brief"}],"avoidCrops":[{"name":"crop","reason":"brief"}],"soilImprovements":["tip","tip","tip"]}`;

    console.log("📨 Sending request to Gemini...");

    const res = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.1,
                maxOutputTokens: 2048,
                candidateCount: 1,
            },
            safetySettings: [
                {
                    category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                    threshold: "BLOCK_NONE"
                }
            ]
        }),
    });

    if (!res.ok) {
        const errText = await res.text();
        console.error("❌ API Error:", res.status, errText);
        throw new Error(`Gemini API error: ${res.status}`);
    }

    const responseData = await res.json();
    console.log("📦 Full API Response:", JSON.stringify(responseData, null, 2));

    // Check for blocked content or errors
    if (responseData.promptFeedback?.blockReason) {
        console.error("❌ Content blocked:", responseData.promptFeedback.blockReason);
        throw new Error(`Content blocked: ${responseData.promptFeedback.blockReason}`);
    }

    const candidate = responseData?.candidates?.[0];
    const raw = candidate?.content?.parts?.[0]?.text ?? "";

    if (!candidate) {
        console.error("❌ No candidates in response");
        throw new Error("No response from AI. Please try again.");
    }

    if (candidate.finishReason === "MAX_TOKENS") {
        console.warn("⚠️ Response truncated (MAX_TOKENS). Attempting to parse partial JSON...");

        // Try to close the JSON properly
        let partialJson = raw.trim();

        // Remove markdown if present
        partialJson = partialJson.replace(/```json\n?/g, "").replace(/```/g, "");

        // Count braces to try to close JSON
        const openBraces = (partialJson.match(/\{/g) || []).length;
        const closeBraces = (partialJson.match(/\}/g) || []).length;

        if (openBraces > closeBraces) {
            // Add missing closing braces
            partialJson += ']'.repeat(Math.max(0, (partialJson.match(/\[/g) || []).length - (partialJson.match(/\]/g) || []).length));
            partialJson += '}'.repeat(openBraces - closeBraces);
            console.log("🔧 Added closing braces to partial JSON");
        }

        try {
            const parsed = JSON.parse(partialJson);
            console.log("✅ Successfully parsed partial JSON");

            // Fill in missing data with defaults
            return {
                topCrops: (parsed.topCrops || []).map((crop, idx) => ({
                    name: crop.name || `Crop ${idx + 1}`,
                    reason: crop.reason || "Suitable for your conditions",
                    expectedYield: crop.expectedYield || "Varies",
                    estimatedProfit: crop.estimatedProfit || "₹20,000-50,000/acre",
                    growingPeriod: crop.growingPeriod || "3-4 months"
                })).concat(
                    Array(Math.max(0, 3 - (parsed.topCrops || []).length))
                        .fill(null)
                        .map((_, idx) => ({
                            name: ["Wheat", "Rice", "Maize"][idx],
                            reason: "Alternative crop for your soil and climate",
                            expectedYield: "Varies by season",
                            estimatedProfit: "₹25,000-40,000/acre",
                            growingPeriod: "3-4 months"
                        }))
                ).slice(0, 3),
                avoidCrops: (parsed.avoidCrops || []).concat(
                    Array(Math.max(0, 2 - (parsed.avoidCrops || []).length))
                        .fill(null)
                        .map(() => ({
                            name: "Check with local expert",
                            reason: "Depends on specific local conditions"
                        }))
                ).slice(0, 2),
                soilImprovements: (parsed.soilImprovements || []).concat([
                    "Add organic compost regularly",
                    "Test soil nutrients annually",
                    "Maintain proper drainage"
                ]).slice(0, 3),
                profitStrategies: (parsed.profitStrategies || []).concat([
                    "Sell directly at local markets for better prices",
                    "Plan crops according to market demand",
                    "Use efficient irrigation to reduce costs"
                ]).slice(0, 3)
            };
        } catch (e) {
            console.error("❌ Could not parse even with fixes:", e.message);
            // Fall through to normal parsing
        }
    }

    // const raw = candidate?.content?.parts?.[0]?.text ?? "";

    console.log("🔍 Gemini raw text length:", raw.length);
    console.log("🔍 Gemini raw response (first 800 chars):", raw.substring(0, 800));

    // If response is empty
    if (!raw || raw.trim().length === 0) {
        throw new Error("Gemini returned empty response");
    }

    // Try multiple parsing strategies
    let parsedData = null;
    let parseError = null;

    // Strategy 1: Direct parse if it starts with {
    try {
        const trimmed = raw.trim();
        if (trimmed.startsWith('{')) {
            parsedData = JSON.parse(trimmed);
            console.log("✅ Parsed with Strategy 1 (direct parse)");
        }
    } catch (e) {
        parseError = e;
    }

    // Strategy 2: Find JSON between ```json and ``` or just between ```
    if (!parsedData) {
        try {
            const codeBlockMatch = raw.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
            if (codeBlockMatch && codeBlockMatch[1]) {
                parsedData = JSON.parse(codeBlockMatch[1]);
                console.log("✅ Parsed with Strategy 2 (markdown code block)");
            }
        } catch (e) {
            parseError = e;
        }
    }

    // Strategy 3: Use robust parser
    if (!parsedData) {
        try {
            parsedData = safeParseGeminiJson(raw);
            console.log("✅ Parsed with Strategy 3 (robust parser)");
        } catch (e) {
            parseError = e;
        }
    }

    // Strategy 4: Regex to find any JSON object
    if (!parsedData) {
        try {
            const jsonMatch = raw.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                parsedData = JSON.parse(jsonMatch[0]);
                console.log("✅ Parsed with Strategy 4 (regex match)");
            }
        } catch (e) {
            parseError = e;
        }
    }

    // If all strategies failed
    if (!parsedData) {
        console.error("❌ All parsing strategies failed");
        console.error("❌ Full response:", raw);
        console.error("❌ Last parse error:", parseError?.message);
        throw new Error("Could not parse AI response. Please try again.");
    }

    // Validate structure
    if (!parsedData.topCrops || !Array.isArray(parsedData.topCrops) || parsedData.topCrops.length === 0) {
        console.error("❌ Invalid structure:", parsedData);
        throw new Error("AI returned incomplete data. Please try again.");
    }

    // Ensure all required fields with defaults
    const validated = {
        topCrops: parsedData.topCrops.slice(0, 3).map(crop => ({
            name: crop.name || "Unknown Crop",
            reason: crop.reason || "Suitable for current conditions",
            expectedYield: crop.expectedYield || "Data not available",
            estimatedProfit: crop.estimatedProfit || "Varies",
            growingPeriod: crop.growingPeriod || "Standard season"
        })),
        avoidCrops: (parsedData.avoidCrops || []).map(crop => ({
            name: crop.name || "Unknown",
            reason: crop.reason || "Not suitable for current conditions"
        })),
        soilImprovements: parsedData.soilImprovements || ["Add organic matter", "Test soil regularly", "Maintain proper drainage"],
        profitStrategies: parsedData.profitStrategies || ["Focus on market demand", "Reduce input costs", "Improve crop quality"]
    };

    console.log("✅ Validated refined data:", JSON.stringify(validated, null, 2));
    return validated;
}


// =====================
// HELP: Ask AI with REFINED context
// =====================
export async function helpAnswer({ question, context }) {
    if (!question || !question.trim()) return "";

    // Build context string including refined data if available
    let contextString = `
Temperature: ${context.temperature}°C
Humidity: ${context.humidity}%
Moisture: ${context.moisture}%
Rainfall: ${context.rainfall}mm
N: ${context.N}
P: ${context.P}
K: ${context.K}
pH: ${context.pH}`;

    // Add refined recommendation context if available
    if (context.refinedRecommendation) {
        const refined = context.refinedRecommendation;
        contextString += `

REFINED RECOMMENDATION DATA:
Top Recommended Crops: ${refined.topCrops?.map(c => c.name).join(", ")}
Crops to Avoid: ${refined.avoidCrops?.map(c => c.name).join(", ")}
Soil Improvements Needed: ${refined.soilImprovements?.join("; ")}`;
    }

    const prompt = `
You are an agriculture advisor inside AgroSync app.
This is the current field context:

${contextString}

User question:
${question.trim()}

Answer in 3-5 short lines, simple farmer-friendly English.
Do not use codeblocks or markdown.
If the question relates to refined recommendations, use that detailed context to provide specific advice.
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