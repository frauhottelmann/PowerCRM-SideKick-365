import { useCallback, useState, type Dispatch, type SetStateAction } from "react";

export interface UseBooleanReturn {
    value: boolean;
    setValue: Dispatch<SetStateAction<boolean>>;
    setTrue: () => void;
    setFalse: () => void;
    toggle: () => void;
}

export function useBoolean(defaultValue = false): UseBooleanReturn {
    const [value, setValue] = useState(defaultValue);

    const setTrue = useCallback(() => setValue(true), []);
    const setFalse = useCallback(() => setValue(false), []);
    const toggle = useCallback(() => setValue((current) => !current), []);

    return { value, setValue, setTrue, setFalse, toggle };
}
