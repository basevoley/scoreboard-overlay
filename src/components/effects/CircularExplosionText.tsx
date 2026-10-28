import { motion, useAnimationControls } from "framer-motion";
import { useEffect } from "react";

interface CircularExplosionTextProps {
  text?: string;
  primaryColor: string;
  secondaryColor: string;
}

export default function CircularExplosionText({
  text = "POINT!",
  primaryColor,
  secondaryColor,
}: CircularExplosionTextProps) {
  const letters = Array.from(text);
  const controls = useAnimationControls();
  const totalLetters = letters.length;

  // --- DYNAMIC RADIUS CALCULATOR ---
  // 1. Estimate how many pixels wide an individual character is at 64px font-size
  const averageLetterWidth = 44;

  // 2. Circumference = Total text length in pixels
  const estimatedCircumference = totalLetters * averageLetterWidth;

  // 3. Radius = Circumference / (2 * pi)
  // We use Math.max to make sure short words (like "ACE!") don't collapse into a tiny clump
  const dynamicRadius = Math.max(70, estimatedCircumference / (2 * Math.PI));
  // ---------------------------------

  useEffect(() => {
    const runAnimationSequence = async () => {
      // Step 1: All characters move inwards to form the dynamic circle size
      await controls.start((index: number) => {
        // Calculate the radian angle for each letter slot
        const angle = (index / totalLetters) * 2 * Math.PI - Math.PI / 2;
        return {
          x: Math.cos(angle) * dynamicRadius, // Uses our on-the-fly calculated radius
          y: Math.sin(angle) * dynamicRadius,
          rotate: (angle * 180) / Math.PI + 90, // Faces the letters outwards cleanly
          scale: 1,
          opacity: 1,
          transition: {
            type: "spring",
            stiffness: 140,
            damping: 14,
            delay: index * 0.03, // Fast sequential gathering cascade
          },
        };
      });

      // Step 2: Hype holding frame pause (600ms)
      await new Promise((resolve) => setTimeout(resolve, 600));

      // Step 3: Launch letters out past the viewport boundaries
      controls.start((index: number) => {
        const angle = (index / totalLetters) * 2 * Math.PI - Math.PI / 2;
        const blastDistance = 700; // Far enough to clear 1080p canvas bounds safely
        return {
          x: Math.cos(angle) * blastDistance,
          y: Math.sin(angle) * blastDistance,
          scale: 0.1,
          opacity: 0,
          rotate: (angle * 180) / Math.PI + 90 + (Math.random() * 120 - 60), // Add chaotic tumble spin
          transition: { duration: 0.45, ease: "easeOut" },
        };
      });
    };

    runAnimationSequence();
  }, [controls, totalLetters, dynamicRadius]);

  return (
    <div
      style={{
        position: "relative",
        width: "600px", // Expanded container boundaries to accommodate long dynamic words
        height: "600px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {letters.map((char, index) => (
        <motion.span
          key={index}
          custom={index}
          animate={controls}
          initial={{ x: 0, y: 0, scale: 0, opacity: 0, rotate: 0 }}
          style={{
            position: "absolute",
            fontSize: "85px",
            fontWeight: "900",
            fontFamily: "'Impact','Arial Black', sans-serif",
            color: "#ffffff",
            display: "inline-block",
            transformOrigin: "center center",
            pointerEvents: "none",
            userSelect: "none",
            textShadow: `0 0 25px ${primaryColor}, 0 0 12px ${secondaryColor}, 0 4px 12px rgba(0,0,0,0.9)`,
          }}
        >
          {char === " " ? " " : char}
        </motion.span>
      ))}
    </div>
  );
}
