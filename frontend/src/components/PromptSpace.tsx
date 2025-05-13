import ChatBox from "./ChatBox";
import { useState } from "react";
import { motion } from "framer-motion";
import  SyntaxHighlighter   from 'react-syntax-highlighter';
import { PrismLight as SyntaxHighlighters } from 'react-syntax-highlighter';
import prism from 'react-syntax-highlighter/dist/esm/styles/prism/prism';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';


export type ContentBlock = {
    type: "text" | "code";
    value: string;
    language?: string;
};

export type MessageType = {
    type: "user" | "assistant";
    content: ContentBlock[];
};

SyntaxHighlighters.registerLanguage("python", python);

const ContentBlockRenderer = ({ block }: { block: ContentBlock }) => {
    if (block.type === "text") {
        return <div className="mb-2 whitespace-pre-wrap">{block.value}</div>;
    } else if (block.type === "code") {
        return (
            <div className="mb-4 rounded-md overflow-hidden">
                <SyntaxHighlighter
                    language={block.language || "plaintext"}
                    style={prism}
                    showLineNumbers
                    customStyle={{ borderRadius: "0.375rem", margin: "0" }}
                >
                    {block.value}
                </SyntaxHighlighter>
            </div>
        );
    }
    return null;
};

export default function PromptSpace() {
    const [messages, setMessages] = useState<MessageType[]>([]);

    return (
        <div className="flex flex-col items-center w-full h-full">
            <div className="flex-1 overflow-y-auto w-full max-w-2xl p-6 space-y-4">
                {messages.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center">
                        Messages will appear here...
                    </p>
                ) : (
                    messages.map((msg, i) => (
                        <div
                            key={i}
                            className={`flex ${
                                msg.type === "user" ? "justify-start" : "justify-end"
                            }`}
                        >
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                                className={`max-w-md ${
                                    msg.type === "user" ? "text-left" : "text-right"
                                }`}
                            >
                                <div
                                    className={`rounded-xl px-4 py-3 text-sm ${
                                        msg.type === "user"
                                            ? "bg-neutral-200 text-black dark:bg-neutral-800 dark:text-white"
                                            : "bg-neutral-900 text-white"
                                    }`}
                                >
                                    {Array.isArray(msg.content) ? (
                                        msg.content.map((block, j) => (
                                            <ContentBlockRenderer key={j} block={block} />
                                        ))
                                    ) : (
                                        // Fallback for backward compatibility - legacy string content
                                        <div className="whitespace-pre-wrap">
                                            {String(msg.content)}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    ))
                )}
            </div>

            <div className="w-full max-w-2xl p-4 dark:border-neutral-800">
                <ChatBox setMessages={setMessages} />
            </div>
        </div>
    );
}