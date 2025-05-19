import { motion } from "framer-motion";
import { X } from "lucide-react";

type SlideInPreviewProps = {
    isOpen: boolean;
    onClose: () => void;
    videoLink: string;
};

const SlideInPreview = ({
                            isOpen,
                            onClose,
                            videoLink
                        }: SlideInPreviewProps) => {
    return (
        <motion.div
            initial={{ x: "100%" }}
            animate={{ x: isOpen ? "0%" : "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 w-1/2 h-full bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 shadow-lg overflow-auto z-50"
        >
            <div className="p-4 flex justify-between items-center border-b border-neutral-200 dark:border-neutral-800">
                <h3 className="text-lg font-medium">Video Preview</h3>
                <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                    <X size={20} />
                </button>
            </div>

            <div className="p-4">
                {videoLink && (
                    <div className="flex flex-col items-center">
                        <div className="w-full aspect-video rounded-lg overflow-hidden bg-black">
                            <iframe
                                src={videoLink}
                                className="w-full h-full"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                        <p className="mt-4 text-sm text-neutral-600 dark:text-neutral-400">
                            Manim animation preview
                        </p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default SlideInPreview;