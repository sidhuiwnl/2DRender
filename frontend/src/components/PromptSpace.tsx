import ChatBox from "./ChatBox";
import {useEffect, useState,useRef} from "react";
import { motion } from "framer-motion";
import SlideInPreview from "./SlideInPreview";
import {User,Computer} from "lucide-react";
import {usePrompt} from "../context/chat-context.tsx";
import ReactMarkdown from 'react-markdown';


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
                                  onPreviewClick,
                                  onSendCode,
                                  isAssistant
                              }: {
    block: ContentBlock;
    onPreviewClick: (videoLink: string) => void;
    onSendCode: (code: string) => void;
    isAssistant: boolean;
}) => {
    // Handle different content block types
    if (block.type === "text") {
        return (
            <div className="mb-4 p-3 rounded-lg shadow-sm">
                <div className="">
                    <ReactMarkdown className="prose prose-sm max-w-none text-white prose-headings:text-white prose-p:text-white prose-strong:text-white prose-li:text-white prose-a:text-white">
                        {block.value}
                    </ReactMarkdown>
                </div>
            </div>
        );
    } else if (block.type === "code") {
        // Send code to parent and also render it
        onSendCode(block.value);

    } else if (block.type === "link") {
        // Handle video links - send to parent for preview
        if (isAssistant && block.value.includes('.mp4')) {
            return (
                <div className="mb-4 p-3 rounded-lg shadow-sm">
                    <button
                        onClick={() => onPreviewClick(block.value)}
                        className="px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors text-sm font-medium"
                    >
                        Show Animation
                    </button>
                </div>
            );
        } else {
            // Regular link
            return (
                <div className="mb-4 p-3 rounded-lg shadow-sm">
                    <a
                        href={block.value}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 underline"
                    >
                        {block.value}
                    </a>
                </div>
            );
        }
    }

    return null;
};

export default function PromptSpace() {
    const { prompt } = usePrompt();
    const [messages, setMessages] = useState<MessageType[]>([]);
    const [showPreview, setShowPreview] = useState(false);
    const [videoLink, setVideoLink] = useState("");
    const[latestCode,setLatestCode] = useState("");
    const messageEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messageEndRef.current?.scrollIntoView({
            behavior: "smooth",
        })
    }

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleAssistantResponse = async () => {
        console.log("Assistant Response");
        // Simulate a delay or call your LLM backend here
        const assistantReply = "Hello, I'm your assistant. How can I help?";

        const assistantMessage: MessageType = {
            type: "assistant",
            content: [{ type: "text", value: assistantReply }],
        };

        setMessages(prev => [...prev, assistantMessage]);
    };

    useEffect(() => {

        if(!prompt) return;

        let shouldTriggerAssistant = false;

        setMessages(prev => {
            const aldreadyHasPrompt = prev.some(m => m.type === "user" && m.content[0]?.value === prompt);

            if(aldreadyHasPrompt) return prev;

            shouldTriggerAssistant = true;

            const userMessage: MessageType = {
                type: "user",
                content: [{ type: "text", value: prompt }],
            };

            return [...prev, userMessage];

        })

        if (shouldTriggerAssistant) {
            handleAssistantResponse();
        }

    }, []);

    const handleCodeExtraction = (code: string) => {
        setLatestCode(code);
    };

    const handleShowAnimation = (link: string) => {
        setVideoLink(link);
        setShowPreview(true);
    };

    const closePreview = () => {
        console.log("closing")
        setShowPreview(false);

    };

    return (
        <div className="flex  overflow-hidden relative h-screen">
            <motion.div
                animate={{
                    width: showPreview ? "50%" : "100%",
                    x: showPreview ? -400 : 0
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="max-w-2xl flex flex-col items-center flex-shrink-0 mx-auto h-full"
            >
                <div className="flex-1 overflow-y-auto w-full px-6 pt-6 pb-10 space-y-4 scrollbar-hide ">
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.type === "user" ? "justify-start" : "justify-end"} `}>
                            {msg.type === "user" && <User className="w-5 h-5 mt-1 mr-5 text-neutral-500 dark:text-neutral-400" />}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                                className="max-w-md"
                            >
                                <div className={`rounded-xl  text-sm ${
                                    msg.type === "user"
                                        ? "bg-neutral-200 text-black dark:bg-neutral-800 dark:text-white"
                                        : "bg-neutral-900 text-white"
                                }`}>
                                    {msg.content.map((block, j) => (
                                        <ContentBlockRenderer
                                            key={j}
                                            block={block}
                                            onPreviewClick={handleShowAnimation}
                                            onSendCode={handleCodeExtraction}
                                            isAssistant={msg.type === "assistant"}
                                        />
                                    ))}
                                </div>

                            </motion.div>

                            {msg.type === "assistant" && <Computer className="w-5 h-5 mt-1 ml-5 text-neutral-500 dark:text-neutral-400" />}

                        </div>
                    ))}
                    <div ref={messageEndRef} />
                </div>

                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 z-50">
                    <ChatBox setMessages={setMessages} />
                </div>
            </motion.div>

            <SlideInPreview
                isOpen={showPreview}
                onClose={closePreview}
                videoLink={videoLink}
                code={latestCode}
            />
        </div>
    );
}