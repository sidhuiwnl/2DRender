import type React from "react";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { cn } from "../lib/utils.ts";
import { useAutoResizeTextarea } from "../hooks/use-auto-resize-textarea";
import type { MessageType, ContentBlock } from "./PromptSpace.tsx";
import axios from "axios";

type ChatBotProps = {
    setMessages: React.Dispatch<React.SetStateAction<MessageType[]>>;
};

export default function ChatBox({ setMessages }: ChatBotProps) {
    const [value, setValue] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const { textareaRef, adjustHeight } = useAutoResizeTextarea({
        minHeight: 48,
        maxHeight: 300,
    });

    const sendMessage = async () => {
        if (!value.trim()) return;

        // Create user message with content as a single text block
        const userMessage: MessageType = {
            type: "user",
            content: [{ type: "text", value: value.trim() }],
        };

        setMessages((prev) => [...prev, userMessage]);
        setValue("");
        adjustHeight(true);
        setIsLoading(true);

        try {
            // Send request to backend
            const response = await axios.post("http://localhost:3000/generate", {
                prompt: value.trim(),
            });

            if (response.data.success) {
                // Use the structured content from the backend if available
                if (response.data.content) {
                    const assistantMessage: MessageType = {
                        type: "assistant",
                        content: response.data.content,
                    };
                    setMessages((prev) => [...prev, assistantMessage]);
                } else {
                    // Fallback for backward compatibility with older API responses
                    const { code, video_url } = response.data;

                    // Create structured content blocks manually
                    const contentBlocks: ContentBlock[] = [
                        { type: "text", value: "Here's your Manim animation:" },
                        { type: "code", language: "python", value: `from manim import *\n\n${code}` },
                    ];

                    // Add video URL information if available
                    if (video_url) {
                        contentBlocks.push({
                            type: "text",
                            value: `The animation has been rendered and is available at: ${video_url}`
                        });
                    }

                    const assistantMessage: MessageType = {
                        type: "assistant",
                        content: contentBlocks,
                    };

                    setMessages((prev) => [...prev, assistantMessage]);
                }
            } else {
                // Handle error response with structured content if available
                if (response.data.content) {
                    const errorMessage: MessageType = {
                        type: "assistant",
                        content: response.data.content,
                    };
                    setMessages((prev) => [...prev, errorMessage]);
                } else {
                    // Fallback error message
                    const errorMessage: MessageType = {
                        type: "assistant",
                        content: [
                            {
                                type: "text",
                                value: `⚠️ ${response.data.message || "Failed to generate animation. Please try again."}`
                            }
                        ],
                    };
                    setMessages((prev) => [...prev, errorMessage]);
                }
            }
        } catch (err) {
            // Create error message with structured content
            const errorMessage: MessageType = {
                type: "assistant",
                content: [
                    {
                        type: "text",
                        value: `❌ Error: ${err instanceof Error ? err.message : String(err)}`
                    }
                ],
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
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
            disabled={isLoading}
        />

                {/* Send button */}
                <button
                    type="button"
                    className={cn(
                        "p-2 rounded-lg bg-black/5 dark:bg-white/5",
                        "hover:bg-black/10 dark:hover:bg-white/10 focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-blue-500",
                        isLoading && "opacity-50 cursor-not-allowed"
                    )}
                    aria-label="Send message"
                    disabled={!value.trim() || isLoading}
                    onClick={sendMessage}
                >
                    {isLoading ? (
                        <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin" />
                    ) : (
                        <ArrowRight
                            className={cn(
                                "w-4 h-4 dark:text-white transition-opacity duration-200",
                                value.trim() ? "opacity-100" : "opacity-30"
                            )}
                        />
                    )}
                </button>
            </div>
        </div>
    );
}