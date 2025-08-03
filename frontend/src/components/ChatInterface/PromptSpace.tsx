import ChatBox from "./ChatBox.tsx";
import { useState, useRef} from "react";
import { motion } from "framer-motion";
import SlideInPreview from "./SlideInPreview.tsx";

import {useUser} from "@clerk/clerk-react";

import type { MessageType } from "@/types/chat.ts";
import MessageItem from "@/components/ChatInterface/MessageItem.tsx";
import {useChatMessages} from "@/hooks/useChatMessages.tsx";


export default function PromptSpace({ id } :  { id : string }  ) {
    const { user } = useUser();
    const [showPreview, setShowPreview] = useState(false);
    const [videoLink, setVideoLink] = useState("");
    const messageEndRef = useRef<HTMLDivElement>(null);


    const {
        formattedMessages,
        latestCode,
        setLatestCode,
    } = useChatMessages(id);





    const handleShowAnimation = (link: string) => {
        setVideoLink(link);
        setShowPreview(true);
    };

    const closePreview = () => {
        setShowPreview(false);
    };

    const avatarUrls = {
        user: user?.imageUrl || "https://api.dicebear.com/6.x/thumbs/svg?seed=user",
        assistant: "https://us7xgl2xx9.ufs.sh/f/NLwJvYRc8DXfuFwjqH36uPjeydlQ1VcfNSsXmpHwDFZAxrE4",
    };




    return (
        <div className="w-full h-screen flex relative overflow-hidden">

            <motion.div
                animate={{ width: showPreview ? "50%" : "100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="flex flex-col h-full"
            >

                <div className="flex-1 overflow-y-auto scrollbar-hide">

                    <div className="mx-auto max-w-4xl w-full  py-10">
                        {formattedMessages?.map((msg : MessageType, i) => (
                            <MessageItem
                                key={`msg-${i}`}
                                message={msg}
                                avatarUrl={avatarUrls[msg.type]}
                                onCodeExtract={setLatestCode}
                                onShowAnimation={handleShowAnimation}
                            />
                        ))}
                        <div ref={messageEndRef} />
                    </div>
                </div>


                <div className="mx-auto max-w-4xl w-full px-4 pt-2 pb-4">
                    <ChatBox  sessionId={id} />
                </div>
            </motion.div>


            <motion.div
                initial={{ x: "100%" }}
                animate={{ x: showPreview ? "0%" : "100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="absolute top-0 right-0 w-1/2 h-full z-40"
            >
                <SlideInPreview
                    isOpen={showPreview}
                    onClose={closePreview}
                    videoLink={videoLink}
                    code={latestCode}
                />
            </motion.div>
        </div>
    );
}