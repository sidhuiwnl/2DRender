import ChatBox from "./ChatBox";
import { useState } from "react";
import { motion } from "framer-motion";
import SlideInPreview from "./SlideInPreview";
import {User,Computer} from "lucide-react";


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
    if (block.type === "text") {
        return (
            <div className="mb-2">
                <div className="mb-2 whitespace-pre-wrap">{block.value}</div>

                { isAssistant &&  <button
                    onClick={() => onPreviewClick(block.value)}
                    className="text-xs text-blue-400 mt-2 underline"
                >
                    Show Animation
                </button>}

            </div>

        );

    }else if(block.type === "link") {
        onPreviewClick(block.value);
    }else{
        // Send code silently to the parent, don’t render
        onSendCode(block.value);
        return null;
    }
    return null;
};


export default function PromptSpace() {
    const [messages, setMessages] = useState<MessageType[]>([]);
    const [showPreview, setShowPreview] = useState(false);
    const [videoLink, setVideoLink] = useState("");
    const[lastestcode,setLastestcode] = useState("");

    const handleShowAnimation = (link: string) => {
        setVideoLink(link);
        setShowPreview(true);
    };

    const closePreview = () => {
        console.log("closing")
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
                            {msg.type === "user" && <User className="w-5 h-5 mt-1 mr-5 text-neutral-500 dark:text-neutral-400" />}
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
                                                onSendCode={setLastestcode}
                                                isAssistant = {msg.type === "assistant"}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                            {msg.type === "assistant" && <Computer className="w-5 h-5 mt-1 ml-5 text-neutral-500 dark:text-neutral-400" />}
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
                code={lastestcode}
            />
        </div>
    );
}