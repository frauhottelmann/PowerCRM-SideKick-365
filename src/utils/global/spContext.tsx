import { createContext, useContext, useEffect, type PropsWithChildren } from "react";

import { useBoolean, type UseBooleanReturn } from "~utils/hooks/use/useBoolean";

import { noOperation } from "./common";
import { Env } from "./var";

interface IspDevToolsContext {
    isDebug: UseBooleanReturn;
}
const defaultspDevToolsContext: IspDevToolsContext = {
    isDebug: {
        value: false,
        setValue: noOperation,
        setTrue: noOperation,
        setFalse: noOperation,
        toggle: noOperation
    }
};
const spDevToolsContext = createContext<IspDevToolsContext>(defaultspDevToolsContext);

export const useSpDevTools = function () {
    return useContext(spDevToolsContext);
};

export default function SpDevToolsContextProvider(props: PropsWithChildren) {
    const isDebug = useBoolean(false);

    useEffect(() => {
        Env.DEBUG = isDebug.value;
    }, [isDebug.value]);

    return (
        <spDevToolsContext.Provider
            value={{
                isDebug
            }}
            {...props}
        />
    );
}
