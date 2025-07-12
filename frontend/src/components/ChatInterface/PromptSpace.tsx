import ChatBox from "./ChatBox.tsx";
import {useEffect, useState, useRef, useMemo} from "react";
import { motion } from "framer-motion";
import SlideInPreview from "./SlideInPreview.tsx";
import {ChevronRight} from "lucide-react";
import {usePrompt} from "../../context/chat-context.tsx";
import ReactMarkdown from 'react-markdown';
import {useUser} from "@clerk/clerk-react";
import BouncingBalls from "@/components/ui/bouncing-ball.tsx";
import {useGetChatQuery} from "@/queryOptions/ChatMutation.ts";


export type ContentBlock = {
    type: "text" | "code" | "link" | "loading";
    value: string ;
    language?: string;
};

export type MessageType = {
    type: "user" | "assistant";
    content: ContentBlock[];
};

const ContentBlockRenderer = ({
                                  block,

                                  onSendCode,

                              }: {
    block: ContentBlock;

    onSendCode: (code: string) => void;

}) => {
    const displayTime = new Date().toLocaleTimeString([],{
        hour : "2-digit",
        minute : "2-digit",

    });



    if (block.type === "text") {
        return (
            <div className="mb-4 p-3 mr-36">
                <div className="text-xs text-gray-400 mb-2 ">{displayTime}</div>
                <ReactMarkdown className="prose prose-sm max-w-none text-white prose-headings:text-white prose-code:text-white prose-p:text-white prose-strong:text-white prose-li:text-white prose-a:text-white">
                    {block.value}
                </ReactMarkdown>
            </div>
        );
    }

    if (block.type === "code") {
        onSendCode(block.value);
        return null;
    }

    if (block.type === "loading") {
        return (
            <BouncingBalls/>
        )
    }

    return null;
};

export default function PromptSpace({ id } :  { id : string }  ) {
    const { prompt } = usePrompt();
    const [messages, setMessages] = useState<MessageType[]>([]);
    const [showPreview, setShowPreview] = useState(false);
    const [videoLink, setVideoLink] = useState("");
    const[latestCode,setLatestCode] = useState("");
    const messageEndRef = useRef<HTMLDivElement>(null);
    const { user } = useUser();

    const { data : chats } = useGetChatQuery(id)


    console.log(chats)



    const scrollToBottom = () => {
        messageEndRef.current?.scrollIntoView({
            behavior: "smooth",
        })
    }


    const formattedMessages = useMemo(() => {
       return chats?.flatMap((chat ) : MessageType[] => {
           const useMessage : MessageType = {
               type : "user",
               content : [{
                   type : "text",
                   value : chat.prompt
               }]
           }
           const assistantContent : ContentBlock[] = [];

           if(chat.code){
               assistantContent.push({
                   type : "code",
                   value : chat.code,
                   language : 'python'
               })
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
           const assistantMessage : MessageType = {
               type : "assistant",
               content : assistantContent,
           }

           return [useMessage,assistantMessage]
       })
    },[chats])

    useEffect(() => {
        setMessages(formattedMessages as MessageType[]);
    }, [formattedMessages]);

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
        setShowPreview(false);
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
                        {messages && messages.map((msg, i) => {
                            const isUser = msg.type === "user";
                            const avatarUrl = isUser
                                ? user?.imageUrl || "https://api.dicebear.com/6.x/thumbs/svg?seed=user"
                                : "https://us7xgl2xx9.ufs.sh/f/NLwJvYRc8DXfuFwjqH36uPjeydlQ1VcfNSsXmpHwDFZAxrE4";

                            return (
                                <div key={i} className="flex items-start gap-3 w-full">
                                    <img src={avatarUrl} alt="avatar" className="w-8 h-8 rounded-full mt-1" />
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="flex-1"
                                    >
                                        <div className="text-sm text-white space-y-1 ">
                                            {msg.content.map((block, j) => (
                                                <ContentBlockRenderer
                                                    key={j}
                                                    block={block}
                                                    onSendCode={handleCodeExtraction}
                                                />
                                            ))}

                                            {/* Show Animation Button */}
                                            {msg.type === "assistant" &&
                                                msg.content.some((c) => c.type === "link" && c.value.includes(".mp4")) && (

                                                        <button
                                                            onClick={() =>
                                                                handleShowAnimation(
                                                                    msg.content.find((c) => c.type === "link")?.value || ""
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
                            );
                        })}
                        <div ref={messageEndRef} />
                    </div>
                </div>

                {/* ChatBox with matching width */}
                <div className="mx-auto max-w-4xl w-full px-4 pt-2 pb-4">
                    <ChatBox setMessages={setMessages} sessionId={id} />
                </div>
            </motion.div>

            {/* Preview panel remains the same */}
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