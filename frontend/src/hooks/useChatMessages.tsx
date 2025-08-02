import { useState, useMemo } from "react";
import { useGetChatQuery } from "@/queryOptions/ChatMutation";
import type { MessageType, ContentBlock } from "@/types/chat.ts";

export function useChatMessages(id: string) {
    const [latestCode, setLatestCode] = useState("");

    const { data: chats = [], isLoading: isChatsLoading } = useGetChatQuery(id);

    const formattedMessages = useMemo(() => {
        const messages: MessageType[] = [];

        chats.forEach((chat, index) => {

            messages.push({
                type: "user",
                content: [
                    {
                        type: "text",
                        value: chat.prompt,
                    },
                ],
            });

            const assistantContent: ContentBlock[] = [];

            if (chat.code) {
                assistantContent.push({
                    type: "code",
                    value: chat.code,
                    language: "python",
                });
            }

            if (chat.video_url) {
                assistantContent.push({
                    type: "link",
                    value: chat.video_url,
                });
            }

            if (chat.explanation) {
                assistantContent.push({
                    type: "text",
                    value: chat.explanation,
                });
            }

            const isLast = index === chats.length - 1;
            const hasAssistantReply = assistantContent.length > 0;

            if (hasAssistantReply) {
                messages.push({
                    type: "assistant",
                    content: assistantContent,
                });
            } else if (isLast) {
                messages.push({
                    type: "assistant",
                    content: [
                        {
                            type: "loading",
                            value: "Generating response...",
                        },
                    ],
                });
            }
        });

        return messages;
    }, [chats]);

    return {
        formattedMessages,
        latestCode,
        setLatestCode,
        isChatsLoading,
    };
}
