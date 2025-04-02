"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

export function AiImagePreview() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="relative w-full aspect-[4/3] rounded-xl overflow-hidden cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Original Image */}
      <Image
        src="/images/original-image.jpg"
        alt="Original image"
        fill
        className="object-cover"
        priority
      />

      {/* Processed Image */}
      <motion.div
        className="absolute inset-0"
        initial={{ clipPath: "inset(0 100% 0 0)" }}
        animate={{ 
          clipPath: isHovered ? "inset(0 0 0 0)" : "inset(0 100% 0 0)" 
        }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      >
        <Image
          src="/images/processed-image.jpg"
          alt="AI processed image"
          fill
          className="object-cover"
          priority
        />
      </motion.div>

      {/* Slider Line */}
      <motion.div
        className="absolute inset-y-0 w-1 bg-white shadow-lg"
        style={{ 
          left: "50%",
          transform: "translateX(-50%)"
        }}
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: isHovered ? 1 : 0,
          x: isHovered ? 0 : -100
        }}
        transition={{ duration: 0.3 }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
          <svg
            className="w-4 h-4 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 9l4-4 4 4m0 6l-4 4-4-4"
            />
          </svg>
        </div>
      </motion.div>

      {/* Labels */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between text-white text-sm font-medium">
        <motion.span
          className="bg-black/50 px-3 py-1 rounded-full"
          initial={{ opacity: 0, y: 10 }}
          animate={{ 
            opacity: isHovered ? 1 : 0,
            y: isHovered ? 0 : 10
          }}
          transition={{ duration: 0.3 }}
        >
          Original
        </motion.span>
        <motion.span
          className="bg-black/50 px-3 py-1 rounded-full"
          initial={{ opacity: 0, y: 10 }}
          animate={{ 
            opacity: isHovered ? 1 : 0,
            y: isHovered ? 0 : 10
          }}
          transition={{ duration: 0.3 }}
        >
          AI Enhanced
        </motion.span>
      </div>
    </div>
  );
} 