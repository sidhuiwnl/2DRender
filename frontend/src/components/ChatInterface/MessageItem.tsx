import {motion} from "framer-motion";
import {ContentBlockRenderer} from "@/components/ChatInterface/ContentBlockRender.tsx";
import {ChevronRight} from "lucide-react";
import type {MessageType} from "@/types/chat.ts";

interface MessageItemProps {
    message: MessageType;
    avatarUrl: string;
    onCodeExtract: (code: string) => void;
    onShowAnimation: (link: string) => void;
}


export default function MessageItem({ message, onCodeExtract, onShowAnimation,avatarUrl }: MessageItemProps) {
    const hasVideoLink = message.content.some(
        (c) => c.type === "link" && c.value.includes(".mp4")
    );


    return (
        <div  className="flex items-start gap-3 w-full">
            <img src={avatarUrl} alt="avatar" className="w-8 h-8 rounded-full mt-1" />
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="flex-1"
            >
                <div className="text-sm text-white space-y-1 ">
                    {message.content.map((block, j) => (
                        <ContentBlockRenderer
                            key={j}
                            block={block}
                            onSendCode={onCodeExtract}
                        />
                    ))}

                    {/* Show Animation Button */}
                    {message.type === "assistant" && hasVideoLink && (

                            <button
                                onClick={() =>
                                    onShowAnimation(
                                        message.content.find((c) => c.type === "link")?.value || ""
                                    )
                                }
                                className="px-4 py-2 flex space-x-2 hover:bg-neutral-800 rounded-md cursor-pointer transition-colors text-sm font-medium"
                            >
                                <span>Show Animation</span>
                                <ChevronRight size="20" />
                            </button>

                        )}
                </div>
            </motion.div>
        </div>
    )
}