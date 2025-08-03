"use client";
import { motion } from "framer-motion";

export default function BouncingBalls() {
    return (
        <div className="flex items-end gap-2 h-[32px] pl-2">
            {[0, 1, 2].map((i) => (
                <motion.div
                    key={i}
                    className="w-2 h-1 rounded-full bg-muted-foreground"
                    animate={{
                        y: [0, -8, 0],
                    }}
                    transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.2,
                    }}
                />
            ))}
        </div>
    );
}
