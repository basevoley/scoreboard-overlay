import { motion } from "framer-motion";

interface SupermanTextProps {
  text: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export default function SupermanTextUniversalBlur({
  text,
  primaryColor = "var(--ov-primary)",
  secondaryColor = "var(--ov-accent)",
}: SupermanTextProps) {
  const totalLayers = 18;
  const instances = Array.from(Array(totalLayers).keys());

  const opacityTimelineMain = [0, 0.9, 1, 1, 0];
  const textGlow = primaryColor
    ? `0 0 10px ${primaryColor}, 0 0 25px ${primaryColor}, 2px 2px 0px #000`
    : '0 0 15px rgba(255,0,85,0.8), 2px 2px 0px #000';

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        perspective: "1000px",
        position: "relative",
        width: "100%",
        height: "250px",
      }}
    >
      {/* Hidden placeholder to preserve layout structural integrity */}
      <h1
        style={{
          fontSize: "85px",
          fontWeight: "900",
          letterSpacing: "6px",
          visibility: "hidden",
          whiteSpace: "nowrap",
        }}
      >
        {text}
      </h1>

      {/* 
        PERFORMANCE MASTERSTROKE: This single parent container handles the blur. 
        It stays crisp (blur(0px)) during the entire entrance and stationary phase.
        At the exact moment the text begins zooming into the camera (times: 0.75 to 1), 
        the parent applies the blur, automatically blurring all 24 sub-layers instantly.
      */}
      <motion.div
        animate={{
          filter: [
            "blur(0px)",
            "blur(0px)",
            "blur(0px)",
            "blur(0px)",
            "blur(16px)",
          ],
        }}
        transition={{
          duration: 3.0,
          ease: "easeInOut",
          // times: [0, 0.25, 0.45, 0.75, 1],
          times: [0, 0.15, 0.45, 0.75, 1],
          // Giving the loop components a head start so the parent timeline lines up with the main text layer
          delay: 0,
        }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          willChange: "filter",
        }}
      >
        {instances.map((instanceId) => {
          const isMain = instanceId === 0;
          const progress = instanceId / (totalLayers - 1);
          const calculatedDelay = instanceId * 0.032;

          const maxOpacity = isMain ? 1 : 0.8 * (1 - progress * 0.5);
          const opacityTimelineTrail = [
            0,
            maxOpacity * 0.8,
            maxOpacity,
            maxOpacity,
            0,
          ];

          return (
            <motion.h1
              key={instanceId}
              initial={{
                opacity: 0,
                transform:
                  "translateX(0px) translateY(-600px) translateZ(-1200px) scale(0)",
              }}
              animate={{
                opacity: isMain ? opacityTimelineMain : opacityTimelineTrail,
                transform: [
                  "translateX(0px) translateY(-600px) translateZ(-1200px) scale(0)",
                  "translateX(0px) translateY(0px) translateZ(-600px) scale(0.4)",
                  "translateX(0px) translateY(0px) translateZ(0px) scale(1)",
                  "translateX(0px) translateY(0px) translateZ(0px) scale(1)",
                  "translateX(0px) translateY(-500px) translateZ(600px) scale(15)",
                ],
              }}
              transition={{
                duration: 3.0,
                ease: "easeInOut",
                delay: calculatedDelay,
                times: [0, 0.15, 0.45, 0.75, 1],
              }}
              style={{
                position: "absolute",
                fontSize: "85px",
                fontWeight: "900",
                letterSpacing: "6px",
                fontFamily: "'Impact','Arial Black', sans-serif",
                textAlign: "center",
                whiteSpace: "nowrap",
                // Notice 'filter' is removed here entirely. Individual elements are strictly crisp.
                willChange: "transform, opacity",
                zIndex: 100 - instanceId,
                color: isMain
                  ? "#ffffff"
                  : instanceId % 2 === 0
                    ? primaryColor
                    : secondaryColor,
                textShadow: isMain
                  ? textGlow
                  : "none",
              }}
            >
              {text}
            </motion.h1>
          );
        })}
      </motion.div>
    </div>
  );
}
