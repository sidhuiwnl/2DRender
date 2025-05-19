import {createContext, type ReactNode, useContext, useState} from "react";

type PromptContextType = {
    prompt: string;
    setPrompt: (prompt: string) => void;
}

const PromptContext = createContext<PromptContextType | undefined>(undefined);


export const PromptProvider = ({ children } : { children : ReactNode}) =>     {
    const [prompt, setPrompt] = useState('');
    return (
        <PromptContext.Provider value={{ prompt, setPrompt }}>
            {children}
        </PromptContext.Provider>
        )

}

export const usePrompt = () => {
    const context = useContext(PromptContext);
    if (context === undefined) {
        throw new Error('usePrompt must be used within a PromptProvider');
    }

    return context;
};