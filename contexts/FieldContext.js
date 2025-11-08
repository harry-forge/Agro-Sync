// contexts/FieldContext.js
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

        // new caching
        recommendation: null,
        englishDesc: null,
        hindiDesc: null,
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
