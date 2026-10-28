import { motion, useAnimationControls } from "framer-motion";
import { useMemo, useEffect } from "react";

interface ShootingTextProps {
  text: string;
  primaryColor: string;
  secondaryColor: string;
}

interface Line {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  strokeWidth: number;
  opacity: number;
}

interface CrackSegment extends Line {
  fork: Line | null;
}

export default function ShootingText({
  text,
  primaryColor,
  secondaryColor,
}: ShootingTextProps) {
  const letters = Array.from(text);
  const containerControls = useAnimationControls();

  // Secure parsing strings to avoid client interface filters stripping arrays
  const letterOpacity = "0,1,1,1".split(",").map(Number);
  const crackOpacity = "0,1,0.95".split(",").map(Number);

  // Depends on `text` only: the random geometry must not be re-rolled by unrelated re-renders,
  // since new animation targets would restart the animation mid-flight.
  const effectData = useMemo(() => {
    const chars = Array.from(text);
    return chars.map((_, index) => {
      const rotation = Math.floor(Math.random() * 25) - 12;
      const delayTime = index * 0.06;
      const hitTime = delayTime + 0.21;

      // Word boundary rules to prevent horizontal overlap
      const isFirstOfWord = index === 0 || chars[index - 1] === " ";
      const isLastOfWord =
        index === chars.length - 1 || chars[index + 1] === " ";

      // 1. Generate an irregular, jagged hole geometry
      const numPoints = 11;
      const pointsArray: string[] = [];
      const holePerimeterPoints: { x: number; y: number; angle: number }[] = [];

      for (let i = 0; i < numPoints; i++) {
        const angle = i * (360 / numPoints) + (Math.random() * 24 - 12);
        const rad = (angle * Math.PI) / 180;
        const currentRadius = 22 + Math.random() * 15;
        const x = 50 + Math.cos(rad) * currentRadius;
        const y = 50 + Math.sin(rad) * currentRadius;

        pointsArray.push(`${x},${y}`);
        holePerimeterPoints.push({ x, y, angle });
      }
      const jaggedHolePointsStr = pointsArray.join(" ");

      // 2. Generate multi-segmented, lightning-like glass fractures
      const complexCracks: CrackSegment[][] = [];
      const crackCount = 2 + Math.floor(Math.random() * 2);
      const shuffledPoints = [...holePerimeterPoints].sort(
        () => Math.random() - 0.5
      );

      let processedLines = 0;
      for (let i = 0; i < shuffledPoints.length; i++) {
        if (processedLines >= crackCount) break;

        const point = shuffledPoints[i];
        const normalizedAngle = ((point.angle % 360) + 360) % 360;

        const isLeftCrack = normalizedAngle > 140 && normalizedAngle < 220;
        const isRightCrack = normalizedAngle < 40 || normalizedAngle > 320;

        if (isLeftCrack && !isFirstOfWord) continue;
        if (isRightCrack && !isLastOfWord) continue;

        let currentX = point.x;
        let currentY = point.y;
        const baseAngleRad = (point.angle * Math.PI) / 180;

        const segments: CrackSegment[] = [];
        const numSegments = 4;
        const totalLength = 15 + Math.random() * 25;
        const segmentLength = totalLength / numSegments;

        for (let j = 0; j < numSegments; j++) {
          const deviation = Math.random() * 0.8 - 0.4;
          const segmentAngle = baseAngleRad + deviation;

          const nextX = currentX + Math.cos(segmentAngle) * segmentLength;
          const nextY = currentY + Math.sin(segmentAngle) * segmentLength;

          let fork: Line | null = null;
          if (Math.random() > 0.7 && j < numSegments - 1) {
            const forkAngle = segmentAngle + (Math.random() > 0.5 ? 0.6 : -0.6);
            const forkLength = segmentLength * 0.7;
            fork = {
              x1: nextX,
              y1: nextY,
              x2: nextX + Math.cos(forkAngle) * forkLength,
              y2: nextY + Math.sin(forkAngle) * forkLength,
              strokeWidth: Math.max(0.3, 0.8 - j * 0.2),
              opacity: Math.max(0.2, 0.5 - j * 0.1),
            };
          }

          segments.push({
            x1: currentX,
            y1: currentY,
            x2: nextX,
            y2: nextY,
            strokeWidth: Math.max(0.4, 1.4 - j * 0.3),
            opacity: Math.max(0.2, 0.8 - j * 0.15),
            fork,
          });

          currentX = nextX;
          currentY = nextY;
        }

        complexCracks.push(segments);
        processedLines++;
      }

      // 3. Generate small, incomplete concentric stress rings close to the hole
      const stressArcs = Array.from({ length: 3 })
        .map((_, rIndex) => {
          const ringRadius = 32 + rIndex * 6;
          const lines = Array.from({ length: 6 })
            .map((_, lIndex) => {
              if (Math.random() > 0.4) return null;
              const startAngle = lIndex * 60 + Math.random() * 15;
              const endAngle = startAngle + 20 + Math.random() * 20;

              const rad1 = (startAngle * Math.PI) / 180;
              const rad2 = (endAngle * Math.PI) / 180;

              return {
                x1: 50 + Math.cos(rad1) * ringRadius,
                y1: 50 + Math.sin(rad1) * ringRadius,
                x2: 50 + Math.cos(rad2) * ringRadius,
                y2: 50 + Math.sin(rad2) * ringRadius,
              };
            })
            .filter((l): l is NonNullable<typeof l> => l !== null);
          return lines;
        })
        .flat();

      // 4. Procedural Glass Debris Fragments (Tiny 3-point shards matching core holes)
      const shards = Array.from({
        length: 4 + Math.floor(Math.random() * 3),
      }).map(() => {
        // Distribute initialization around the core rim bounds
        const shardAngle = Math.random() * Math.PI * 2;
        const startDist = 20 + Math.random() * 10;
        const startX = 50 + Math.cos(shardAngle) * startDist;
        const startY = 50 + Math.sin(shardAngle) * startDist;

        // Create sharp local triangular vector strings
        const size1 = 1.5 + Math.random() * 2.5;
        const size2 = 1.5 + Math.random() * 2.5;
        const shardPoints = `0,0 ${size1},${Math.random() * 2 - 1} ${Math.random() * 2 - 1
          },${size2}`;

        // Physics trajectory targets: blast outward slightly, then pull straight down (gravity drop)
        const blastDistance = 15 + Math.random() * 20;
        const targetX =
          Math.cos(shardAngle) * blastDistance + (Math.random() * 10 - 5);
        const targetY =
          Math.sin(shardAngle) * blastDistance + (Math.random() * 10 - 5);
        const gravityDropY = 60 + Math.random() * 40; // Tumbling off the screen bottom bounds

        return {
          startX,
          startY,
          shardPoints,
          animateX: [0, targetX * 0.4, targetX],
          animateY: [0, targetY * 0.2 - (5 + Math.random() * 10), gravityDropY],
          animateRotate: [
            0,
            Math.random() * 180 - 90,
            Math.random() * 720 - 360,
          ],
          duration: 0.6 + Math.random() * 0.4,
        };
      });

      return {
        rotation,
        delayTime,
        hitTime,
        jaggedHolePointsStr,
        complexCracks,
        stressArcs,
        shards,
      };
    });
  }, [text]);

  useEffect(() => {
    const timeoutIds: ReturnType<typeof setTimeout>[] = [];
    effectData.forEach((letter) => {
      const id = setTimeout(async () => {
        await containerControls.start({
          x: "0,3,-2,0"
            .split(",")
            .map((v) => Number(v) * (Math.random() * 1.5 - 0.75)),
          y: "0,3,-2,0"
            .split(",")
            .map((v) => Number(v) * (Math.random() * 1.5 - 0.75)),
          transition: { duration: 0.12, ease: "easeInOut" },
        });
      }, letter.hitTime * 1000);
      timeoutIds.push(id);
    });
    return () => timeoutIds.forEach(clearTimeout);
  }, [effectData, containerControls]);

  return (
    <motion.div
      animate={containerControls}
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "8px",
        perspective: "1000px",
        position: "relative",
        padding: "60px",
      }}
    >
      {letters.map((char, index) => {
        const {
          rotation,
          delayTime,
          hitTime,
          jaggedHolePointsStr,
          complexCracks,
          stressArcs,
          shards,
        } = effectData[index];

        return (
          <div
            key={index}
            style={{ position: "relative", display: "inline-block" }}
          >
            {/* The Animated Letter */}
            <motion.span
              initial={{
                opacity: 0,
                y: -150,
                z: -500,
                filter: "blur(4px)",
                scaleX: 0,
                scaleY: 0,
                rotate: 0,
              }}
              animate={{
                y: "-150,0,0,0".split(",").map(Number),
                z: "-500,0,0,0".split(",").map(Number),
                opacity: letterOpacity,
                filter: ["blur(4px)", "blur(0px)", "blur(0px)", "blur(0px)"],
                scaleX: "0,2.4,0.85,1".split(",").map(Number),
                scaleY: "0,1.6,0.9,1".split(",").map(Number),
                rotate: [0, rotation * 1.5, rotation, rotation],
              }}
              transition={{
                duration: 0.35,
                ease: "easeOut",
                delay: delayTime,
                times: "0,0.6,0.8,1".split(",").map(Number),
              }}
              style={{
                display: "inline-block",
                fontSize: "85px",
                fontWeight: "900",
                fontFamily: '"Arial Black", sans-serif',
                color: "#ffffff",
                letterSpacing: "2px",
                whiteSpace: char === " " ? "pre" : "normal",
                transformOrigin: "center center",
                position: "relative",
                zIndex: 3,
                textShadow: `0 0 25px ${primaryColor}, 0 0 12px ${secondaryColor}, 0 4px 12px rgba(0,0,0,0.9)`,
              }}
            >
              {char}
            </motion.span>

            {/* IMPACT BACKGROUND HOLE, GLASS CRACKS & FALLING DEBRIS */}
            {char !== " " && (
              <motion.svg
                viewBox="0 0 100 100"
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{
                  opacity: crackOpacity,
                  scale: "0.4,1.1,1".split(",").map(Number),
                }}
                transition={{
                  duration: 0.12,
                  delay: hitTime,
                  ease: "backOut",
                }}
                style={{
                  position: "absolute",
                  top: "-60%",
                  left: "-60%",
                  width: "220%",
                  height: "220%",
                  pointerEvents: "none",
                  zIndex: 1,
                  overflow: "visible", // Allows shards to tumble completely down past the clipping boundary
                }}
              >
                <defs>
                  <radialGradient
                    id={`hole-${index}`}
                    cx="50%"
                    cy="50%"
                    r="50%"
                  >
                    <stop offset="0%" stopColor="#000000" stopOpacity="1" />
                    <stop offset="65%" stopColor="#080808" stopOpacity="0.95" />
                    <stop offset="90%" stopColor="#141414" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#000000" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* Solid jagged broken glass hole */}
                <polygon
                  points={jaggedHolePointsStr}
                  fill={`url(#hole-${index})`}
                />
                <polygon points={jaggedHolePointsStr} fill="#020202" />

                {/* Micro Concentric Stress Arcs */}
                {stressArcs.map((arc, i) => (
                  <line
                    key={`arc-${i}`}
                    x1={arc.x1}
                    y1={arc.y1}
                    x2={arc.x2}
                    y2={arc.y2}
                    stroke="rgba(0, 0, 0, 0.35)"
                    strokeWidth="0.8"
                    strokeLinecap="round"
                  />
                ))}

                {/* Jagged, multi-segmented fading lightning cracks */}
                {complexCracks.map((segments, i) => (
                  <g key={`crack-tree-${i}`}>
                    {segments.map((seg, j) => (
                      <g key={`seg-${j}`}>
                        <line
                          x1={seg.x1}
                          y1={seg.y1}
                          x2={seg.x2}
                          y2={seg.y2}
                          stroke={`rgba(0, 0, 0, ${seg.opacity})`}
                          strokeWidth={seg.strokeWidth}
                          strokeLinecap="round"
                        />
                        {seg.fork && (
                          <line
                            x1={seg.fork.x1}
                            y1={seg.fork.y1}
                            x2={seg.fork.x2}
                            y2={seg.fork.y2}
                            stroke={`rgba(0, 0, 0, ${seg.fork.opacity})`}
                            strokeWidth={seg.fork.strokeWidth}
                            strokeLinecap="round"
                          />
                        )}
                      </g>
                    ))}
                  </g>
                ))}

                {/* DYNAMIC SHARD SYSTEM: Simulates physical glass debris popping out & falling */}
                {shards.map((shard, i) => (
                  <motion.g
                    key={`shard-${i}`}
                    initial={{ x: shard.startX, y: shard.startY, opacity: 1 }}
                    animate={{
                      x: shard.animateX.map((val) => shard.startX + val),
                      y: shard.animateY.map((val) => shard.startY + val),
                      rotate: shard.animateRotate,
                      opacity: "1,1,0".split(",").map(Number),
                    }}
                    transition={{
                      duration: shard.duration,
                      delay: hitTime, // Matches letter contact impact frame
                      ease: "easeOut",
                    }}
                    style={{ transformOrigin: "center center" }}
                  >
                    <polygon
                      points={shard.shardPoints}
                      fill="rgba(255, 255, 255, 0.85)"
                      stroke="rgba(255, 255, 255, 1)"
                      strokeWidth="0.3"
                    />
                  </motion.g>
                ))}
              </motion.svg>
            )}
          </div>
        );
      })}
    </motion.div>
  );
}
