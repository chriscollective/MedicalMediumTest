import React from "react";
import { motion } from "motion/react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface NatureElement {
  src: string;
  alt: string;
  size: number;
  rotation: number;
  delay: number;
}

const floatingAnimation = {
  y: [0, -20, 0],
  rotate: [0, 5, 0],
  transition: {
    duration: 6,
    repeat: Infinity,
    ease: [0.42, 0, 0.58, 1],
  },
};

export function NatureDecoration() {
  const elements: NatureElement[] = [
    {
      src: "https://images.pexels.com/photos/5961370/pexels-photo-5961370.jpeg",
      alt: "celery",
      size: 180,
      rotation: -15,
      delay: 0,
    },
    {
      src: "https://thumbs.dreamstime.com/z/%E7%BA%A2%E6%95%B4%E5%88%87%E6%9E%9C%E5%8F%B6%E8%8A%B1%E7%95%AA%E8%8C%84%E6%A4%8D%E7%89%A9-%E6%B0%B4%E5%BD%A9%E7%BB%98%E8%94%AC%E8%8F%9C%E5%89%AA%E8%B4%B4%E7%94%BB-%E7%BA%A2%E6%95%B4%E5%88%87%E7%89%87%E6%9E%9C%E5%8F%B6%E8%8A%B1%E7%95%AA%E8%8C%84%E6%A4%8D%E7%89%A9-376923630.jpg?ct=jpeg",
      alt: "blueberries",
      size: 140,
      rotation: 10,
      delay: 1,
    },
    {
      src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQyUiDOGhkCvMCYXozGXvcGxMrNeyZg1hxTZa76OkvuGFDZi5pu-racDOXkGNP0z2Pr7go&usqp=CAU",
      alt: "lemon",
      size: 120,
      rotation: -20,
      delay: 2,
    },
    {
      src: "https://thumbs.dreamstime.com/z/%E6%A4%8D%E7%89%A9%E7%9A%84%E4%BE%8B%E8%AF%81-113467997.jpg?ct=jpeg",
      alt: "herbs",
      size: 160,
      rotation: 15,
      delay: 1.5,
    },
    {
      src: "https://images.unsplash.com/photo-1613291511109-ea3d67e68a25?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aWxkZmxvd2VycyUyMHBhc3RlbHxlbnwxfHx8fDE3NjE4MDg1NTh8MA&ixlib=rb-4.1.0&q=80&w=1080",
      alt: "wildflowers",
      size: 150,
      rotation: 8,
      delay: 0.5,
    },
    {
      src: "https://images.unsplash.com/photo-1548808918-a33260f83b25?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXBheWElMjBmcnVpdCUyMGJvdGFuaWNhbHxlbnwxfHx8fDE3NjE4MDg1NTh8MA&ixlib=rb-4.1.0&q=80&w=1080",
      alt: "papaya",
      size: 130,
      rotation: -12,
      delay: 2.5,
    },
  ];

  return (
    <>
      {/* Top Left Corner */}
      <motion.div
        className="absolute top-8 left-8 pointer-events-none"
        animate={floatingAnimation}
        style={{ animationDelay: `${elements[0].delay}s` }}
      >
        <div
          className="relative rounded-full overflow-hidden shadow-2xl"
          style={{
            width: elements[0].size,
            height: elements[0].size,
            transform: `rotate(${elements[0].rotation}deg)`,
          }}
        >
          <ImageWithFallback
            src={elements[0].src}
            alt={elements[0].alt}
            className="w-full h-full object-cover opacity-60"
            style={{
              filter: "sepia(0.2) saturate(0.7) brightness(1.1) contrast(0.9)",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#A8CBB7]/30 to-[#F7E6C3]/30 mix-blend-overlay" />
        </div>
      </motion.div>

      {/* Top Right Corner */}
      <motion.div
        className="absolute top-16 right-12 pointer-events-none"
        animate={floatingAnimation}
        style={{ animationDelay: `${elements[1].delay}s` }}
      >
        <div
          className="relative rounded-full overflow-hidden shadow-2xl"
          style={{
            width: elements[1].size,
            height: elements[1].size,
            transform: `rotate(${elements[1].rotation}deg)`,
          }}
        >
          <ImageWithFallback
            src={elements[1].src}
            alt={elements[1].alt}
            className="w-full h-full object-cover opacity-50"
            style={{
              filter:
                "sepia(0.3) saturate(0.6) brightness(1.2) contrast(0.85) hue-rotate(-10deg)",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#E5C17A]/20 to-[#A8CBB7]/30 mix-blend-overlay" />
        </div>
      </motion.div>

      {/* Middle Left */}
      <motion.div
        className="absolute top-1/3 left-4 pointer-events-none"
        animate={floatingAnimation}
        style={{ animationDelay: `${elements[2].delay}s` }}
      >
        <div
          className="relative rounded-full overflow-hidden shadow-2xl"
          style={{
            width: elements[2].size,
            height: elements[2].size,
            transform: `rotate(${elements[2].rotation}deg)`,
          }}
        >
          <ImageWithFallback
            src={elements[2].src}
            alt={elements[2].alt}
            className="w-full h-full object-cover opacity-55"
            style={{
              filter:
                "sepia(0.25) saturate(0.65) brightness(1.15) contrast(0.9)",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#F7E6C3]/40 to-[#E5C17A]/20 mix-blend-overlay" />
        </div>
      </motion.div>

      {/* Middle Right */}
      <motion.div
        className="absolute top-1/2 right-8 pointer-events-none"
        animate={floatingAnimation}
        style={{ animationDelay: `${elements[3].delay}s` }}
      >
        <div
          className="relative rounded-full overflow-hidden shadow-2xl"
          style={{
            width: elements[3].size,
            height: elements[3].size,
            transform: `rotate(${elements[3].rotation}deg)`,
          }}
        >
          <ImageWithFallback
            src={elements[3].src}
            alt={elements[3].alt}
            className="w-full h-full object-cover opacity-50"
            style={{
              filter: "sepia(0.2) saturate(0.7) brightness(1.1) contrast(0.88)",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#A8CBB7]/25 to-[#9fb8a8]/30 mix-blend-overlay" />
        </div>
      </motion.div>

      {/* Bottom Left */}
      <motion.div
        className="absolute bottom-20 left-16 pointer-events-none"
        animate={floatingAnimation}
        style={{ animationDelay: `${elements[4].delay}s` }}
      >
        <div
          className="relative rounded-full overflow-hidden shadow-2xl"
          style={{
            width: elements[4].size,
            height: elements[4].size,
            transform: `rotate(${elements[4].rotation}deg)`,
          }}
        >
          <ImageWithFallback
            src={elements[4].src}
            alt={elements[4].alt}
            className="w-full h-full object-cover opacity-60"
            style={{
              filter:
                "sepia(0.15) saturate(0.75) brightness(1.15) contrast(0.9) hue-rotate(5deg)",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#F7E6C3]/30 to-[#A8CBB7]/25 mix-blend-overlay" />
        </div>
      </motion.div>

      {/* Bottom Right */}
      <motion.div
        className="absolute bottom-32 right-20 pointer-events-none"
        animate={floatingAnimation}
        style={{ animationDelay: `${elements[5].delay}s` }}
      >
        <div
          className="relative rounded-full overflow-hidden shadow-2xl"
          style={{
            width: elements[5].size,
            height: elements[5].size,
            transform: `rotate(${elements[5].rotation}deg)`,
          }}
        >
          <ImageWithFallback
            src={elements[5].src}
            alt={elements[5].alt}
            className="w-full h-full object-cover opacity-55"
            style={{
              filter:
                "sepia(0.25) saturate(0.65) brightness(1.1) contrast(0.85)",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#E5C17A]/25 to-[#F7E6C3]/35 mix-blend-overlay" />
        </div>
      </motion.div>
    </>
  );
}
