

import { ArrowRight,Paperclip,Loader2 } from "lucide-react"
import {useCallback, useState} from "react"
import {cn} from "../lib/utils.ts";
import { useAutoResizeTextarea } from "../hooks/use-auto-resize-textarea"
import {usePrompt} from "../context/chat-context.tsx";
import {toast} from "sonner";
import {useCreateSession} from "@/queryOptions/createSessionMutation.ts";



export default function ChatInterface() {
    const { setPrompt } = usePrompt();
    const [value, setValue] = useState("");

    const createSessionMutation = useCreateSession();

    const { textareaRef, adjustHeight } = useAutoResizeTextarea({
        minHeight: 72,
        maxHeight: 300,
    })
    const handleSubmit = useCallback(() => {
        const userId = localStorage.getItem("userId") as string;

        if (!userId) {
            toast.error("User not authenticated");
            return;
        }

        createSessionMutation.mutate(userId);
        setPrompt(value);
    }, [value, createSessionMutation, setPrompt]);

    return (
        <div className="w-4/6 py-4 ">
            <div className="bg-black/5 dark:bg-white/5 rounded-2xl p-1.5">
                <div className="relative">
                    <div className="relative flex flex-col">
                        <div className="overflow-y-auto" style={{ maxHeight: "400px" }}>
                            <textarea
                                id="ai-input-15"
                                value={value}
                                placeholder={"What can I do for you?"}
                                className={cn(
                                    "w-full rounded-xl outline-none rounded-b-none px-4 py-3 bg-black/5 dark:bg-white/5 border-none dark:text-white placeholder:text-black/70 dark:placeholder:text-white/70 resize-none focus-visible:ring-0 focus-visible:ring-offset-0",
                                    "min-h-[72px]",
                                )}
                                ref={textareaRef}

                                onChange={(e) => {
                                    const newValue = e.target.value;
                                    if(newValue !== value) {
                                        setValue(e.target.value)
                                        adjustHeight()
                                    }

                                }}
                            />
                        </div>

                        <div className="h-14 bg-black/5 dark:bg-white/5 rounded-b-xl flex items-center">
                            <div className="absolute left-3 right-3 bottom-3 flex items-center justify-between w-[calc(100%-24px)]">
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-px bg-black/10 dark:bg-white/10 mx-0.5" />
                                    <label
                                        className={cn(
                                            "rounded-lg p-2 bg-black/5 dark:bg-white/5 cursor-pointer",
                                            "hover:bg-black/10 dark:hover:bg-white/10 focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-blue-500",
                                            "text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white",
                                        )}
                                        aria-label="Attach file"
                                    >
                                        <input type="file" className="hidden" />
                                        <Paperclip className="w-4 h-4 transition-colors" />
                                    </label>
                                </div>
                                <button
                                    type="button"
                                    className={cn(
                                        "rounded-lg p-2 bg-black/5 dark:bg-white/5",
                                        "hover:bg-black/10 dark:hover:bg-white/10 focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-blue-500",
                                    )}
                                    onClick={handleSubmit}
                                    aria-label="Send message"
                                    disabled={!value.trim()}
                                >
                                    {createSessionMutation.isPending ?
                                        <Loader2
                                            className="animate-spin w-4 h-4 dark:text-white transition-opacity duration-200"
                                        /> :
                                        (
                                        <ArrowRight
                                            className={cn(
                                                "w-4 h-4 dark:text-white transition-opacity duration-200",
                                                value.trim() ? "opacity-100" : "opacity-30",
                                            )}
                                        />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
