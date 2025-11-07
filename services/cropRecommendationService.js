
// ============================================
// /services/cropRecommendationService.js
// ============================================

const RECOM_BASE = "https://crop-recommender-engine.onrender.com";

export async function getCropRecommendation(payload) {
    const res = await fetch(`${RECOM_BASE}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Recommender error: ${res.status} ${err}`);
    }
    return res.json(); // { best_crop, probability }
}

