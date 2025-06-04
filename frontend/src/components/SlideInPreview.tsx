import {X,Bolt,Copy} from "lucide-react";
import {useNavigate} from "react-router";
import {toast} from "sonner";

type SlideInPreviewProps = {
    isOpen: boolean;
    onClose: () => void;
    videoLink: string;
    code?: string;
};

const SlideInPreview = ({
                            isOpen,
                            onClose,
                            videoLink,
                            code = `
from manim import *

class CircleScene(Scene):
    def construct(self):
        circle = Circle()
        self.play(Create(circle))`
                        }: SlideInPreviewProps) => {



    const navigate = useNavigate();
    if (!isOpen) return null;


    return (
        <div className="w-full h-full bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 shadow-lg overflow-auto">
            <div className="p-4 flex justify-between items-center border-b border-neutral-200 dark:border-neutral-800">
                <h3 className="text-lg font-medium">Manim Animation</h3>
                <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                    <X size={20} />
                </button>
            </div>

            <div className="flex flex-col h-[calc(100%-60px)]">

                <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 h-1/2">
                    <div className="h-full flex flex-col">
                        <h4 className="text-sm font-medium mb-2 text-neutral-600 dark:text-neutral-400">Animation Preview</h4>
                        <div className="flex-1 rounded-lg overflow-hidden bg-black min-h-0">
                            <iframe
                                src={videoLink}
                                className="w-full h-full"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>

                        </div>
                        <button
                            onClick={() => navigate(`/edit/${encodeURIComponent(videoLink)}`)}
                            className="px-4 py-2 w-[90px] mt-3 flex space-x-2 hover:bg-neutral-800  rounded-md border cursor-pointer transition-colors text-sm font-medium"
                        >
                            <span>Edit</span>
                            <Bolt size="20"/>
                        </button>

                    </div>
                </div>


                <div className="p-4 flex-1 overflow-auto">
                    <h4 className="text-sm font-medium mb-2 text-neutral-600 dark:text-neutral-400">Animation Code</h4>
                    <pre className="relative whitespace-pre-wrap text-sm bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg text-neutral-800 dark:text-neutral-100 overflow-x-auto h-full">
                        <Copy
                            size="20"
                            className="absolute right-0 mr-2 cursor-pointer hover:text-neutral-400"
                            onClick={() => {
                                navigator.clipboard.writeText(code);
                                toast.success("The Code has been saved!");
                            }}
                        />
                        <code>{code}</code>
                    </pre>
                </div>
            </div>
        </div>
    );
};

export default SlideInPreview;