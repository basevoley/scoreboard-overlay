import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import "./glitch.css";

interface GlitchTextProps {
  text: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export default function GlitchText({
  text,
  primaryColor,
  secondaryColor,
}: GlitchTextProps) {
  const [displayedText, setDisplayedText] = useState(text);

  const dynamicShadow = primaryColor
    ? `0 0 25px ${primaryColor}, 0 0 12px ${secondaryColor}, 0 4px 10px rgba(0,0,0,0.9)`
    : undefined;

  // HIGH-FREQUENCY UNTHROTTLED HARDWARE FAULT ENGINE
  useEffect(() => {
    // Terminal blocks, math operations, and hex strings
    const glitchChars = "01XYZ?_%&#ΔΩ█▒▓█[●]×Ø◆//+==_".split("");
    const originalLetters = Array.from(text);
    const restoreTimeouts = new Set<ReturnType<typeof setTimeout>>();

    // Interval dropped down to 90ms for high-frequency, rapid-fire packet corruption
    const corruptionLoop = setInterval(() => {
      // 40% chance per ultra-fast cycle to fire a corruption burst
      if (Math.random() > 0.4) {
        setDisplayedText(text);
        return;
      }

      // Randomly choice: 1, 2, or 3 characters corrupted simultaneously
      const corruptCount = Math.floor(Math.random() * 3) + 1;
      const corruptedLetters = [...originalLetters];

      for (let i = 0; i < corruptCount; i++) {
        const randomIndex = Math.floor(Math.random() * originalLetters.length);

        // Protect layout spacing configurations from breaking
        if (corruptedLetters[randomIndex] !== " ") {
          const randomGlitchChar =
            glitchChars[Math.floor(Math.random() * glitchChars.length)];
          corruptedLetters[randomIndex] = randomGlitchChar;
        }
      }

      setDisplayedText(corruptedLetters.join(""));

      // Snaps back quickly within 60ms to make room for the next fast-incoming interval burst
      const restore = setTimeout(() => {
        restoreTimeouts.delete(restore);
        setDisplayedText(text);
      }, 60);
      restoreTimeouts.add(restore);
    }, 90);

    return () => {
      clearInterval(corruptionLoop);
      restoreTimeouts.forEach(clearTimeout);
    };
  }, [text]);

  return (
    <motion.div
      className="glitch-wrapper"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{
        scale: 0,
        opacity: 0,
        transition: { duration: 0.25, ease: "easeIn" },
      }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
    >
      {/* LAYER CLUSTER 1: The two massive horizontal distortion block bands */}
      <div className="glitch-macro-container" aria-hidden="true">
        <h1
          className="glitch-macro-text macro-band-top"
          data-text={displayedText}
        >
          {displayedText}
        </h1>
        <h1
          className="glitch-macro-text macro-band-bottom"
          data-text={displayedText}
        >
          {displayedText}
        </h1>
      </div>

      {/* LAYER CLUSTER 2: Your original text row handling the thin micro-ripple fuzzy elements */}
      <h1
        className="glitch-text"
        data-text={displayedText}
        style={{
          textShadow: dynamicShadow,
        }}
      >
        {displayedText}
      </h1>
    </motion.div>
  );
}
