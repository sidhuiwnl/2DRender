import type React from "react";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { cn } from "../lib/utils.ts";
import { useAutoResizeTextarea } from "../hooks/use-auto-resize-textarea";
import type { MessageType } from "./PromptSpace.tsx";
import axios from "axios";


type ChatBotProps = {
    setMessages: React.Dispatch<React.SetStateAction<MessageType[]>>;
};

export default function ChatBox({ setMessages }: ChatBotProps) {


    const [value, setValue] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const { textareaRef, adjustHeight } = useAutoResizeTextarea({
        minHeight: 48,
        maxHeight: 300,
    });

     const sendMessage = async () => {
        if (!value.trim()) return;

        // Create user message with content as a single text block
        const userMessage: MessageType = {
            type: "user",
            content: [{ type: "text", value: value.trim() }],
        };



        setMessages((prev) => [...prev, userMessage]);
        setValue("");
        adjustHeight(true);
        setIsLoading(true);
        try {
            const response = await axios.post("http://localhost:3000/generate",{
                prompt : value.trim(),
                user_id : "",

            });

            if(response.data.success){
                if(response.data.content){
                    const assisstantMessage : MessageType = {
                        type : "assistant",
                        content: response.data.content,
                        // content : [
                        //     {
                        //         "type": "text",
                        //         "value": "This animation shows a circle morphing smoothly into a rectangle. The `Transform` function in Manim is used to animate the change in shape from the initial circle to the final rectangle."
                        //     },
                        //     {
                        //         "type": "code",
                        //         "language": "python",
                        //         "value": "from manim import *\n\nclass AnimationScene(Scene):\n    def construct(self):\n        circle = Circle()\n        rectangle = Rectangle(width=4.0, height=2.0)\n\n        self.play(Create(circle))\n        self.wait(0.5)\n        self.play(Transform(circle, rectangle))\n        self.wait(0.5)\n        self.play(FadeOut(circle))\n        self.wait(0.5)"
                        //     },
                        //     {
                        //         "type": "link",
                        //         "value": "https://res.cloudinary.com/domrmiesw/video/upload/v1748098914/AnimationScene.mp4"
                        //     }
                        // ]
                    }

                    setMessages((prev) => [...prev, assisstantMessage]);

                    setIsLoading(false);
                }
            }

        }catch (err) {
            const errorMessage: MessageType = {
                type: "assistant",
                content: [
                    {
                        type: "text",
                        value: `❌ Error: ${err instanceof Error ? err.message : String(err)}`
                    }
                    ],
            };
            setMessages((prev) => [...prev, errorMessage]);
        }

         // const assisstantMessage : MessageType = {
         //     type : "assistant",
         //     content : [
         //         {
         //             "type": "text",
         //             "value": "This animation shows a circle morphing smoothly into a rectangle. The `Transform` function in Manim is used to animate the change in shape from the initial circle to the final rectangle."
         //         },
         //         {
         //             "type": "code",
         //             "language": "python",
         //             "value": "from manim import *\n\nclass AnimationScene(Scene):\n    def construct(self):\n        arr = [2, 5, 7, 8, 11, 12, 15, 20, 23, 28]\n        target = 23\n        n = len(arr)\n\n        rects = VGroup()\n        texts = VGroup()\n        for i in range(n):\n            rect = Rectangle(width=0.7, height=0.7)\n            text = Text(str(arr[i])).scale(0.6)\n            text.move_to(rect.get_center())\n            rects.add(rect)\n            texts.add(text)\n\n        rects.arrange(RIGHT, buff=0.1)\n        texts.arrange(RIGHT, buff=0.1)\n        group = VGroup(rects, texts).move_to(ORIGIN)\n\n        self.play(Create(rects), Create(texts))\n\n        low = 0\n        high = n - 1\n\n        low_tracker = Integer(low).move_to(DOWN * 2 + LEFT * 5)\n        high_tracker = Integer(high).move_to(DOWN * 2 + RIGHT * 5)\n        target_text = Text(f\"Target: {target}\").to_edge(UP)\n        low_text = Text(\"Low:\").next_to(low_tracker, LEFT)\n        high_text = Text(\"High:\").next_to(high_tracker, LEFT)\n\n        self.play(Write(target_text), Write(low_text), Write(high_text), Create(low_tracker), Create(high_tracker))\n\n        while low <= high:\n            mid = (low + high) // 2\n            mid_tracker = Integer(mid).move_to(DOWN * 2)\n            mid_text = Text(\"Mid:\").next_to(mid_tracker, LEFT)\n\n            self.play(Write(mid_text), Create(mid_tracker))\n            self.play(rects[mid].set_fill(color=YELLOW, opacity=0.5))\n            self.wait(0.5)\n\n            if arr[mid] == target:\n                self.play(rects[mid].set_fill(color=GREEN, opacity=0.8))\n                found_text = Text(\"Target Found!\").to_edge(DOWN)\n                self.play(Write(found_text))\n                self.wait(2)\n                self.play(FadeOut(found_text))\n                break\n            elif arr[mid] < target:\n                self.play(\n                    low_tracker.animate.set_value(mid + 1),\n                )\n                low = mid + 1\n                self.play(rects[mid].set_fill(color=BLUE, opacity=0))\n\n            else:\n                self.play(\n                    high_tracker.animate.set_value(mid - 1),\n                )\n                high = mid - 1\n                self.play(rects[mid].set_fill(color=BLUE, opacity=0))\n\n            self.play(FadeOut(mid_tracker, mid_text))\n            self.wait(0.5)\n\n        if low > high:\n            not_found_text = Text(\"Target Not Found!\").to_edge(DOWN)\n            self.play(Write(not_found_text))\n            self.wait(2)"
         //         },
         //         {
         //             "type": "link",
         //             "value": "https://res.cloudinary.com/domrmiesw/video/upload/v1747757032/AnimationScene.mp4"
         //         }
         //         ]
         //
         // }
         //
         // setMessages((prev) => [...prev, assisstantMessage]);
         // setIsLoading(false);

    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };
    return (
        <div className="w-[800px] relative h-full">
            <div className="bg-white dark:bg-neutral-900 rounded-xl flex items-end p-2 gap-2 shadow-xl border border-2">
                <textarea
                    id="ai-input-15"
                    value={value}
                    placeholder="What can I do for you?"
                    className={cn(
                        "w-full text-sm resize-none border-none   placeholder:text-sm p-3 focus:outline-none dark:text-white placeholder:text-black/70 dark:placeholder:text-white/70",
                        "min-h-[48px] max-h-[300px] py-2"
                    )}
                    ref={textareaRef}
                    onKeyDown={handleKeyDown}
                    onChange={(e) => {
                        setValue(e.target.value);
                        adjustHeight();
                    }}
                    disabled={isLoading}
                />


                <button
                    type="button"
                    className={cn(
                        "p-2 rounded-lg bg-black/5 dark:bg-white/5",
                        "hover:bg-black/10 dark:hover:bg-white/10 focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-blue-500",
                        isLoading && "opacity-50 cursor-not-allowed"
                    )}
                    aria-label="Send message"
                    disabled={!value.trim() || isLoading}
                    onClick={sendMessage}
                >
                    {isLoading ? (
                        <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin" />
                    ) : (
                        <ArrowRight
                            className={cn(
                                "w-4 h-4 dark:text-white transition-opacity duration-200",
                                value.trim() ? "opacity-100" : "opacity-30"
                            )}
                        />
                    )}
                </button>
            </div>
        </div>
    );
}