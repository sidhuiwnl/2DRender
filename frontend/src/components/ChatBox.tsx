import type React from "react";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { cn } from "../lib/utils.ts";
import { useAutoResizeTextarea } from "../hooks/use-auto-resize-textarea";
import type {MessageType} from "./PromptSpace.tsx";
import axios from "axios";

type ChatBotProps = {
    setMessages: React.Dispatch<React.SetStateAction<MessageType[]>>;

}

export default function ChatBox({ setMessages } : ChatBotProps) {
    const [value, setValue] = useState<string>("");

    const { textareaRef, adjustHeight } = useAutoResizeTextarea({
        minHeight: 48,
        maxHeight: 300,
    });

    const sendMessage = async () => {
        if(!value.trim()) return;

        const userMessage: MessageType = {
            type: "user",
            content: value.trim(),
        };

        setMessages((prev) => [...prev, userMessage]);

        try{
            const response = await axios.post("http://localhost:3000/generate", {
                prompt: value.trim(),
            });

            if(response.data.success){
                const { code, video_url } = response.data;

                const assistantMessage: MessageType = {
                    type: "assistant",
                    content: `Here's your Manim code:\n\n\`\`\`python\n${code}\n\`\`\`\n\n[📽 Watch the video](${video_url})`,
                };

                setMessages((prev) => [...prev, assistantMessage]);
            }else {
                const errorMessage: MessageType = {
                    type: "assistant",
                    content: "⚠️ Failed to generate animation. Please try again.",
                };
                setMessages((prev) => [...prev, errorMessage]);
            }

        }catch(err){
            const errorMessage: MessageType = {
                type: "assistant",
                content: `❌ ${err}`,
            };
            setMessages((prev) => [...prev, errorMessage]);
        }


    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            setValue("");
            adjustHeight(true);
        }
    };

    return (
        <div className="w-full px-4 py-2">
            <div className="bg-black/5 dark:bg-white/5 rounded-xl flex items-end p-2 gap-2">
                <textarea
                    id="ai-input-15"
                    value={value}
                    placeholder="What can I do for you?"
                    className={cn(
                        "w-full text-sm resize-none border-none bg-transparent placeholder:text-sm p-3 focus:outline-none dark:text-white placeholder:text-black/70 dark:placeholder:text-white/70",
                        "min-h-[48px] max-h-[300px] py-2"
                    )}
                    ref={textareaRef}
                    onKeyDown={handleKeyDown}
                    onChange={(e) => {
                        setValue(e.target.value);
                        adjustHeight();
                    }}
                />

                {/* Send button */}
                <button
                    type="button"
                    className={cn(
                        "p-2 rounded-lg bg-black/5 dark:bg-white/5",
                        "hover:bg-black/10 dark:hover:bg-white/10 focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-blue-500"
                    )}
                    aria-label="Send message"
                    disabled={!value.trim()}
                    onClick={sendMessage}
                >
                    <ArrowRight
                        className={cn(
                            "w-4 h-4 dark:text-white transition-opacity duration-200",
                            value.trim() ? "opacity-100" : "opacity-30"
                        )}
                    />
                </button>
            </div>
        </div>
    );
}
