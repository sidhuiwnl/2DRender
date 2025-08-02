import ReactMarkdown from "react-markdown";
import BouncingBalls from "@/components/ui/bouncing-ball.tsx";
import type {ContentBlock} from "@/types/chat.ts";

export const ContentBlockRenderer = ({

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