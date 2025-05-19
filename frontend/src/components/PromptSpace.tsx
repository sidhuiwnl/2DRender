import ChatBox from "./ChatBox";
import { useState } from "react";
import { motion } from "framer-motion";
import SyntaxHighlighter from 'react-syntax-highlighter';
import { prism } from 'react-syntax-highlighter/dist/esm/styles/prism';
import SlideInPreview from "./SlideInPreview";

export type ContentBlock = {
    type: "text" | "code" | "link";
    value: string;
    language?: string;
};

export type MessageType = {
    type: "user" | "assistant";
    content: ContentBlock[];
};

const ContentBlockRenderer = ({
                                  block,
                                  onPreviewClick
                              }: {
    block: ContentBlock;
    onPreviewClick: (videoLink: string) => void;
}) => {
    if (block.type === "text") {
        return <div className="mb-2 whitespace-pre-wrap">{block.value}</div>;
    } else if (block.type === "link") {
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
    } else if (block.type === "code") {
        return (
            <div className="mb-2">
                <div className="text-blue-400 break-all">{block.value}</div>
                <button
                    onClick={() => onPreviewClick(block.value)}
                    className="text-xs text-blue-400 mt-2 underline"
                >
                    Show Animation
                </button>
            </div>
        );
    }
    return null;
};

export default function PromptSpace() {
    const [messages, setMessages] = useState<MessageType[]>([]);
    const [showPreview, setShowPreview] = useState(false);
    const [videoLink, setVideoLink] = useState("");

    const handleShowAnimation = (link: string) => {
        setVideoLink(link);
        setShowPreview(true);
    };

    const closePreview = () => {
        setShowPreview(false);
    };

    return (
        <div className="flex w-full h-full justify-center overflow-hidden relative">
            <motion.div
                animate={{
                    width: showPreview ? "50%" : "100%",
                    x: showPreview ? -400 : 0
            }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="max-w-2xl flex flex-col items-center flex-shrink-0 mx-auto"
            >
                <div className="flex-1 overflow-y-auto w-full p-6 space-y-4">
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.type === "user" ? "justify-start" : "justify-end"}`}>
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                                className="max-w-md"
                            >
                                <div className={`rounded-xl px-4 py-3 text-sm ${
                                    msg.type === "user"
                                        ? "bg-neutral-200 text-black dark:bg-neutral-800 dark:text-white"
                                        : "bg-neutral-900 text-white"
                                }`}>
                                    {msg.content.map((block, j) => (
                                        <div key={j}>
                                            <ContentBlockRenderer
                                                block={block}
                                                onPreviewClick={handleShowAnimation}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                    ))}
                </div>

                <div className="w-full p-4 dark:border-neutral-800">
                    <ChatBox setMessages={setMessages} />
                </div>
            </motion.div>

            <SlideInPreview
                isOpen={showPreview}
                onClose={closePreview}
                videoLink={videoLink}
            />
        </div>
    );
}