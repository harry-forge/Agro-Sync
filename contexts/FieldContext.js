import { createContext, useContext, useState } from "react";

const FieldContext = createContext(null);

export function FieldProvider({ children }) {
    const [fieldData, setFieldData] = useState({
        temperature: null,
        humidity: null,
        moisture: null,
        rainfall: null,
        N: null,
        P: null,
        K: null,
        pH: null,
    });

    return (
        <FieldContext.Provider value={{ fieldData, setFieldData }}>
            {children}
        </FieldContext.Provider>
    );
}

export function useFieldData() {
    return useContext(FieldContext);
}
