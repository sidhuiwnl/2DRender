import ChatBox from "./ChatBox";
import { useState } from "react";

import {motion} from "framer-motion";


export type MessageType = {
    type: "user" | "assistant";
    content: string;
};

export default function PromptSpace() {
    const [messages, setMessages] = useState<MessageType[]>([]);

    return (
        <div className="flex flex-col items-center w-full h-full ">

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
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                                className={`flex ${msg.type === "user" ? "justify-start" : "justify-end"}`}
                            >
                                <div
                                    className={`rounded-xl px-4 py-2 text-sm max-w-xs ${
                                        msg.type === "user"
                                            ? "bg-neutral-200 text-black dark:bg-neutral-800 dark:text-white"
                                            : "bg-neutral-900 text-white"
                                    }`}
                                >
                                    {msg.content}
                                </div>
                            </motion.div>

                        </div>
                    ))
                )}
            </div>


            <div className="w-full max-w-2xl p-4  dark:border-neutral-800 ">
                <ChatBox setMessages={setMessages} />
            </div>
        </div>
    );
}
