import { useMemo, useEffect } from "react";
import { motion, useAnimationControls } from "framer-motion";

interface PopTextProps {
  text: string;
  primaryColor?: string;
}

export default function PopText({ text, primaryColor }: PopTextProps) {
  const containerControls = useAnimationControls();

  // Dynamic aura layout glow matching your team colors
  const dynamicShadow = primaryColor
    ? `0 0 30px ${primaryColor}, 0 0 12px ${primaryColor}, 0 4px 10px rgba(0,0,0,0.9)`
    : "0 4px 12px rgba(0,0,0,0.5)";

  const elementColor = primaryColor || "#ffffff";

  // Calculate individual projectile physics trajectories for every single letter.
  // Depends on `text` only: the random trajectories must not be re-rolled by unrelated re-renders,
  // since new animation targets would restart the animation mid-flight.
  const blastPhysicsMesh = useMemo(() => {
    const letters = Array.from(text);
    const totalLetters = letters.length;

    // Approximate a fixed baseline character width to know where each letter should land
    const letterSpacingWidth = 46;
    const totalTextWidth = totalLetters * letterSpacingWidth;
    const centerOffset = totalTextWidth / 2;

    return letters.map((char, index) => {
      // 1. Calculate the final, readable rest position relative to the absolute center
      const restX =
        index * letterSpacingWidth - centerOffset + letterSpacingWidth / 2;
      const restY = 0;
      const finalTilt = Math.floor(Math.random() * 24) - 12;

      // 2. WIDENED CHAR ACTOR BLAST TRAJECTORY PATHS:
      const blastAngle = Math.random() * Math.PI * 2;
      const blastVelocity = 220 + Math.random() * 380;

      const midAirX = Math.cos(blastAngle) * blastVelocity;
      const midAirY =
        Math.sin(blastAngle) * blastVelocity - (60 + Math.random() * 100);

      // 3. Generate randomized spinning cycles
      const wildSpins =
        Math.random() > 0.5
          ? 360 + Math.random() * 360
          : -360 - Math.random() * 360;

      // 4. Staggered individual particle spray calculations
      const particles = Array.from({ length: 3 }).map(() => {
        const pAngle = Math.random() * Math.PI * 2;
        const pDist = 80 + Math.random() * 100;
        return {
          targetX: Math.cos(pAngle) * pDist,
          targetY: Math.sin(pAngle) * pDist,
          radius: 1 + Math.random() * 2,
          duration: 0.6 + Math.random() * 0.4,
        };
      });

      return {
        char,
        restX,
        restY,
        midAirX,
        midAirY,
        finalTilt,
        wildSpins,
        particles,
      };
    });
  }, [text]);

  // CAMERA RUMBLE CONTROLLER
  useEffect(() => {
    const triggerCameraShake = async () => {
      await containerControls.start({
        x: "0,6,-5,4,-2,1,0"
          .split(",")
          .map((v) => Number(v) * (Math.random() > 0.5 ? 1 : -1)),
        y: "0,5,-6,3,-3,1,0"
          .split(",")
          .map((v) => Number(v) * (Math.random() > 0.5 ? 1 : -1)),
        transition: {
          duration: 0.28,
          ease: "easeInOut",
        },
      });
    };

    triggerCameraShake();
  }, [containerControls]);

  return (
    <motion.div
      animate={containerControls}
      style={{
        width: "100%",
        height: "500px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "transparent",
        position: "relative",
        overflow: "visible",
        userSelect: "none",
      }}
    >
      {/* ==========================================================================
         CENTRAL SHOCKWAVE EXPLOSION LAYER
         ========================================================================== */}
      {text.trim().length > 0 && (
        <div
          style={{
            position: "absolute",
            width: "0px",
            height: "0px",
            pointerEvents: "none",
            zIndex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <motion.span
            initial={{ scale: 0.05, opacity: 0 }}
            animate={{
              scale: [0.05, 1.5, 2.1],
              opacity: "0,1,0".split(",").map(Number),
            }}
            transition={{
              duration: 0.65,
              ease: "easeOut",
            }}
            style={{
              position: "absolute",
              width: "160px",
              height: "160px",
              borderRadius: "50%",
              border: `3px solid ${elementColor}`,
              boxShadow: `0 0 30px ${elementColor}, inset 0 0 15px ${elementColor}`,
            }}
          />

          <svg
            viewBox="0 0 400 400"
            style={{
              position: "absolute",
              width: "700px",
              height: "700px",
              overflow: "visible",
            }}
          >
            {blastPhysicsMesh.map((letter, lIdx) =>
              letter.particles.map((p, pIdx) => (
                <motion.circle
                  key={`p-${lIdx}-${pIdx}`}
                  cx="200"
                  cy="200"
                  r={p.radius}
                  fill={elementColor}
                  initial={{ x: 0, y: 0, opacity: 0 }}
                  animate={{
                    x: [0, p.targetX],
                    y: [0, p.targetY],
                    opacity: "0,1,0".split(",").map(Number),
                  }}
                  transition={{ duration: p.duration, ease: "easeOut" }}
                  style={{ filter: `drop-shadow(0 0 4px ${elementColor})` }}
                />
              ))
            )}
          </svg>
        </div>
      )}

      {/* ==========================================================================
         PROJECTILE TYPOGRAPHY LAYER: Inverted distance scale layout
         ========================================================================== */}
      {blastPhysicsMesh.map((letter, index) => {
        if (letter.char === " ")
          return <div key={index} style={{ width: "46px" }} />;

        return (
          <motion.span
            key={`${letter.char}-${index}`}
            initial={{
              x: 0,
              y: 0,
              scale: 0,
              opacity: 0,
              rotate: 0,
            }}
            animate={{
              x: [0, letter.midAirX, letter.restX],
              y: [0, letter.midAirY, letter.restY],
              // INVERTED SCALE MATRIX: Starts at 0, stays small as debris (0.35), then expands up to full size (1)
              scale: "0,0.35,1".split(",").map(Number),
              opacity: "0,1,1".split(",").map(Number),
              rotate: [0, letter.wildSpins, letter.finalTilt],
            }}
            transition={{
              duration: 0.95,
              times: "0,0.38,1".split(",").map(Number),
              ease: "easeOut",
            }}
            style={{
              position: "absolute",
              display: "inline-block",
              fontSize: "85px",
              fontWeight: "900",
              fontFamily: "'Impact','Arial Black', sans-serif",
              textTransform: "uppercase",
              color: "#ffffff",
              transformOrigin: "center center",
              textShadow: dynamicShadow,
            }}
          >
            {letter.char}
          </motion.span>
        );
      })}
    </motion.div>
  );
}
