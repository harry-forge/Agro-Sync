// contexts/FieldContext.js - UPDATED
import { createContext, useContext, useState, useMemo } from "react";

const FieldContext = createContext(null);

export function FieldProvider({ children }) {
    const [fields, setFields] = useState([
        { id: "field_1", name: "Field 1", iotId: "default" },
    ]);

    const [fieldData, setFieldData] = useState({
        temperature: null,
        humidity: null,
        moisture: null,
        rainfall: null,
        N: null,
        P: null,
        K: null,
        pH: null,

        // Basic recommendation caching
        recommendation: null,
        englishDesc: null,
        hindiDesc: null,

        // NEW: Refined recommendation data
        refinedRecommendation: null,
        /* Structure:
        {
            topCrops: [
                {
                    name: "Crop Name",
                    reason: "Detailed reason...",
                    expectedYield: "X tons/acre",
                    estimatedProfit: "₹X",
                    growingPeriod: "X months"
                }
            ],
            avoidCrops: [
                {
                    name: "Crop Name",
                    reason: "Reason to avoid..."
                }
            ],
            soilImprovements: ["Tip 1", "Tip 2", "Tip 3"],
            profitStrategies: ["Strategy 1", "Strategy 2", "Strategy 3"]
        }
        */
    });

    const [lastFetchedAt, setLastFetchedAt] = useState(null);

    const getFieldById = (id) => fields.find((f) => f.id === id) || null;

    const value = useMemo(
        () => ({
            fields,
            setFields,
            fieldData,
            setFieldData,
            lastFetchedAt,
            setLastFetchedAt,
            getFieldById,
        }),
        [fields, fieldData, lastFetchedAt]
    );

    return <FieldContext.Provider value={value}>{children}</FieldContext.Provider>;
}

export function useFieldData() {
    return useContext(FieldContext);
}

export function useFields() {
    return useContext(FieldContext);
}