import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { parseHex, contrastRatio, deriveDarkTextColor } from './colorUtils';

// Contrast against white above which white text is kept: a deliberately small margin, as white is preferred on real scarves.
const MIN_WHITE_CONTRAST = 1.3;
// Contrast the derived dark text color must reach against the cloth when white is not readable enough.
const MIN_DARK_TEXT_CONTRAST = 3.5;

// Scarf text layout (SVG units). The badges sit at cx±54..76, leaving ~100 units of clear cloth between them.
const SCARF_TEXT_MAX_WIDTH = 100;
const SCARF_MIN_FONT_SIZE = 10; // never smaller: must stay readable on a stream
const SCARF_MAX_FONT_SIZE = 15;
// Approximate advance of an Impact capital plus its letter spacing (0.1em), in em.
const SCARF_CHAR_WIDTH_EM = 0.65;
const SCARF_LINE_HEIGHT_EM = 1.15;
const SCARF_BASE_BAND_HEIGHT = 25; // cloth height of the original single-line scarf
const SCARF_BAND_PADDING = 6;

// Long text is wrapped on word boundaries (never truncated) so it fits at the minimum font size;
// the font then grows up to the maximum for whatever the longest line allows, and the cloth grows downward to hold the lines.
function layoutScarfText(text: string) {
  const maxChars = Math.floor(SCARF_TEXT_MAX_WIDTH / (SCARF_MIN_FONT_SIZE * SCARF_CHAR_WIDTH_EM));
  const lines: string[] = [];
  text.split(/\s+/).filter(Boolean).forEach((word) => {
    const last = lines[lines.length - 1];
    if (last !== undefined && last.length + 1 + word.length <= maxChars) lines[lines.length - 1] = `${last} ${word}`;
    else lines.push(word);
  });
  if (lines.length === 0) lines.push('');
  const longest = Math.max(...lines.map((l) => l.length), 1);
  const fontSize = Math.min(
    SCARF_MAX_FONT_SIZE,
    Math.max(SCARF_MIN_FONT_SIZE, SCARF_TEXT_MAX_WIDTH / (longest * SCARF_CHAR_WIDTH_EM))
  );
  const lineHeight = fontSize * SCARF_LINE_HEIGHT_EM;
  const extraHeight = Math.max(0, lines.length * lineHeight + SCARF_BAND_PADDING - SCARF_BASE_BAND_HEIGHT);
  return { lines, fontSize, lineHeight, extraHeight };
}

// Text color for a given background: white whenever it is readable enough, otherwise a dark tone of the background's own hue.
function getContrastColor(hexColor?: string) {
  const rgb = parseHex(hexColor);
  if (!rgb) return '#FFFFFF';
  if (contrastRatio(rgb, [255, 255, 255]) >= MIN_WHITE_CONTRAST) return '#FFFFFF';
  return deriveDarkTextColor(rgb, MIN_DARK_TEXT_CONTRAST);
}

interface DynamicCrowdProps {
  primaryColor: string;
  secondaryColor: string;
  badgeUrl?: string;
  scarfText: string;
  supporterCount?: number;
}

// Note: mask/clip/keyframe ids are fixed per supporter, so only one crowd may be mounted at a time.
export default function DynamicCrowdSvg({
  primaryColor,
  secondaryColor,
  badgeUrl,
  scarfText,
  supporterCount = 6,
}: DynamicCrowdProps) {

  // Procedurally generate crowd parameters layout calculations safely on the fly across all rows
  const scarf = layoutScarfText(scarfText);

  const crowdLayout = useMemo(() => {
    // ---- LAYER 2: INTERACTIVE SUPPORTERS (Primary Row) ----
    const list: {
      id: string; cx: number; cy: number; r: number; jumpHeight: number;
      duration: number; delay: number; gearType: number;
    }[] = [];
    const widthSegment = 1200 / (supporterCount + 1);
    const gearCounts: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0 };
    const maxAllowedPerGear = Math.max(2, Math.ceil(supporterCount / 4));

    for (let i = 1; i <= supporterCount; i++) {
      const baseCx = Math.floor(widthSegment * i + (Math.random() * 40 - 20));
      const baseCy = Math.floor(320 + (Math.random() * 20 - 10));
      const radius = Math.floor(15 + Math.random() * 4);
      const jumpHeight = Math.floor(-16 - Math.random() * 18);
      const timingDuration = parseFloat(
        (0.4 + Math.random() * 0.18).toFixed(2)
      );
      const delayOffset = parseFloat((Math.random() * 0.3).toFixed(2));

      let selectedGear = Math.floor(Math.random() * 4);
      const previousSupporter = list[list.length - 1];
      const previousGear =
        previousSupporter !== undefined ? previousSupporter.gearType : null;

      const rotationOptions = '0,1,2,3'.split(',').map(Number);
      const startingIndex = Math.floor(timingDuration * 100) % 4;

      for (let attempt = 0; attempt < 4; attempt++) {
        const evaluateGear = rotationOptions[(startingIndex + attempt) % 4];
        const isConsecutive = evaluateGear === previousGear;
        const isOverQuota = gearCounts[evaluateGear] >= maxAllowedPerGear;

        if (!isConsecutive && !isOverQuota) {
          selectedGear = evaluateGear;
          break;
        }
        if (attempt === 3) {
          selectedGear =
            rotationOptions.find((g) => g !== previousGear) ?? evaluateGear;
        }
      }

      gearCounts[selectedGear]++;
      list.push({
        id: `supporter-${i}`,
        cx: baseCx,
        cy: baseCy,
        r: radius,
        jumpHeight,
        duration: timingDuration,
        delay: delayOffset,
        gearType: selectedGear,
      });
    }

    // ---- DYNAMIC LAYER 1: BACKING ROWS (2/5 Proportion) ----
    const layer1Count = Math.max(2, Math.round((supporterCount * 2) / 5));
    const layer1Segment = 1200 / (layer1Count + 1);
    const layer1CxPositions = [];
    for (let i = 1; i <= layer1Count; i++) {
      layer1CxPositions.push(Math.floor(layer1Segment * i));
    }

    // ---- DYNAMIC LAYER 3: FOREGROUND SILHOUETTES (3/5 Proportion) ----
    const layer3Count = Math.max(3, Math.round((supporterCount * 3) / 5));
    const layer3Segment = 1200 / (layer3Count + 1);
    const layer3CxPositions = [];
    for (let i = 1; i <= layer3Count; i++) {
      layer3CxPositions.push(Math.floor(layer3Segment * i));
    }

    return {
      supporters: list,
      layer1Positions: layer1CxPositions,
      layer3Positions: layer3CxPositions,
    };
  }, [supporterCount]); // Recalculated cleanly if crowd size modifications execute

  return (
    <svg
      viewBox="0 0 1200 450"
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMax slice"
    >
      <defs>
        {/* Left and Right separate clipping paths tailored to each drop of the scarf */}
        {crowdLayout.supporters.map((person) => {
          if (person.gearType !== 1) return null;

          // The exact full scarf path geometry to mask both images safely
          const scarfPathData = `M${person.cx - 80},${person.cy - 70} C${
            person.cx - 35
          },${person.cy - 85} ${person.cx + 35},${person.cy - 85} ${
            person.cx + 80
          },${person.cy - 70} L${person.cx + 80},${person.cy - 45 + scarf.extraHeight} C${
            person.cx + 35
          },${person.cy - 60 + scarf.extraHeight} ${person.cx - 35},${person.cy - 60 + scarf.extraHeight} ${
            person.cx - 80
          },${person.cy - 45 + scarf.extraHeight} Z`;

          return (
            <React.Fragment key={`masks-${person.id}`}>
              <mask id={`scarf-mask-left-${person.id}`}>
                <path fill="#ffffff" d={scarfPathData} />
              </mask>
              <mask id={`scarf-mask-right-${person.id}`}>
                <path fill="#ffffff" d={scarfPathData} />
              </mask>
            </React.Fragment>
          );
        })}
      </defs>

      {/* LAYER 1: HARDWARE LAYER BACKING ROWS (Secondary Color) */}
      <g fill={secondaryColor} opacity="0.80">
        <motion.g
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 0.8, ease: 'easeInOut' }}
        >
          {crowdLayout.layer1Positions.map((cx, idx) => (
            <g key={`bg-${idx}`}>
              <circle cx={cx} cy="360" r="15" />
              <path
                d={`M${cx - 30},385 C${cx - 30},370 ${cx + 30},370 ${
                  cx + 30
                },385 Z`}
              />
            </g>
          ))}
        </motion.g>
      </g>

      {/* LAYER 2: PROCEDURAL REAL-TIME INTERACTIVE SUPPORTERS (Primary Color) */}
      <g fill={primaryColor}>
        {crowdLayout.supporters.map((person) => (
          <motion.g
            key={person.id}
            animate={{ y: [0, person.jumpHeight, 0] }}
            transition={{
              repeat: Infinity,
              duration: person.duration,
              ease: person.gearType === 1 ? 'easeInOut' : 'circOut',
              delay: person.delay,
            }}
          >
            {/* Base Body Shapes */}
            <circle cx={person.cx} cy={person.cy} r={person.r} />
            <path
              d={`M${person.cx - person.r * 2},${person.cy + 30} C${
                person.cx - person.r * 2
              },${person.cy + 15} ${person.cx + person.r * 2},${
                person.cy + 15
              } ${person.cx + person.r * 2},${person.cy + 30} L${
                person.cx + person.r * 2.5
              },450 L${person.cx - person.r * 2.5},450 Z`}
            />

            {/* Dynamic Interactive Gear Rendering */}
            {person.gearType === 0 &&
              (() => {
                // Procedurally determine left or right hand placement based on unique supporter id hash
                const isLeftHand =
                  person.id.charCodeAt(person.id.length - 1) % 2 === 0;

                // Key tracking positions for the arm and finger attachment points
                const handX = isLeftHand ? person.cx - 35 : person.cx + 35;
                const handY = person.cy - 40;

                const armPath = isLeftHand
                  ? `M${person.cx - 25},${person.cy + 30} Q${person.cx - 40},${
                      person.cy - 5
                    } ${handX},${handY}`
                  : `M${person.cx + 25},${person.cy + 30} Q${person.cx + 40},${
                      person.cy - 5
                    } ${handX},${handY}`;

                // Complete SVG structural path drawing a distinct, oversized foam finger silhouette
                const foamFingerPath = isLeftHand
                  ? `M${handX + 10},${handY + 20} 
       L${handX - 25},${handY + 20} 
       C${handX - 30},${handY + 20} ${handX - 30},${handY - 25} ${handX - 25},${
                      handY - 25
                    } 
       L${handX - 25},${handY - 55} 
       C${handX - 25},${handY - 65} ${handX - 10},${handY - 65} ${handX - 10},${
                      handY - 55
                    } 
       L${handX - 10},${handY - 20} 
       L${handX + 10},${handY - 20} 
       C${handX + 15},${handY - 20} ${handX + 15},${handY + 20} ${handX + 10},${
                      handY + 20
                    } Z`
                  : `M${handX - 10},${handY + 20} 
       L${handX + 25},${handY + 20} 
       C${handX + 30},${handY + 20} ${handX + 30},${handY - 25} ${handX + 25},${
                      handY - 25
                    } 
       L${handX + 25},${handY - 55} 
       C${handX + 25},${handY - 65} ${handX + 10},${handY - 65} ${handX + 10},${
                      handY - 55
                    } 
       L${handX + 10},${handY - 20} 
       L${handX - 10},${handY - 20} 
       C${handX - 15},${handY - 20} ${handX - 15},${handY + 20} ${handX - 10},${
                      handY + 20
                    } Z`;

                // Calculated rotation angle to match the arm's upward flare
                const rotationAngle = isLeftHand ? -15 : 15;

                return (
                  <g key={person.id}>
                    {/* Arm raising the oversized accessory from the true shoulder anchor point */}
                    <path
                      d={armPath}
                      stroke={primaryColor}
                      strokeWidth="11"
                      strokeLinecap="round"
                    />

                    {/* Rotated Foam Finger Wrapper */}
                    <g
                      transform={`rotate(${rotationAngle}, ${handX}, ${handY})`}
                    >
                      {/* Foam Finger Canvas Silhouette */}
                      <path
                        d={foamFingerPath}
                        fill={secondaryColor}
                        stroke={secondaryColor}
                        strokeWidth="2.5"
                        strokeLinejoin="round"
                      />

                      {/* Dynamic Stadium "#1" Labeling */}
                      <text
                        x={isLeftHand ? handX - 8 : handX + 8}
                        y={handY + 2}
                        fill={getContrastColor(secondaryColor)}
                        fontSize="15"
                        fontWeight="bold"
                        fontFamily="sans-serif"
                        textAnchor="middle"
                        dominantBaseline="central"
                        transform={
                          isLeftHand
                            ? `scale(-1, 1) translate(${-2 * (handX - 8)}, 0)`
                            : ''
                        }
                      >
                        #1
                      </text>
                    </g>
                  </g>
                );
              })()}

            {person.gearType === 1 &&
              (() => {
                // Define a distinct reference ID for this supporter's text path curvature
                const curvePathId = `scarf-curve-${person.id}`;

                // FIX: Shifted the path coordinates downwards to trace the absolute vertical center-line of the fabric canvas.
                // One guide curve per text line, stacked around the center of the (possibly taller) cloth.
                const lineCurves = scarf.lines.map((line, i) => {
                  const dy = scarf.extraHeight / 2 + (i - (scarf.lines.length - 1) / 2) * scarf.lineHeight;
                  return {
                    line,
                    id: `${curvePathId}-${i}`,
                    d: `M${person.cx - 80},${person.cy - 60 + dy} C${person.cx - 35},${person.cy - 73 + dy} ${
                      person.cx + 35
                    },${person.cy - 73 + dy} ${person.cx + 80},${person.cy - 60 + dy}`,
                  };
                });

                return (
                  <g key={person.id}>
                    <defs>
                      {/* A hidden reusable guide line tracking the exact internal center bend of the scarf canvas */}
                      {lineCurves.map((c) => (
                        <path key={c.id} id={c.id} d={c.d} />
                      ))}
                    </defs>

                    {/* Left Arm */}
                    <path
                      d={`M${person.cx - 30},${person.cy + 30} Q${
                        person.cx - 65
                      },${person.cy - 35} ${person.cx - 70},${person.cy - 70}`}
                      stroke={primaryColor}
                      strokeWidth="10"
                      strokeLinecap="round"
                    />
                    {/* Right Arm */}
                    <path
                      d={`M${person.cx + 30},${person.cy + 30} Q${
                        person.cx + 65
                      },${person.cy - 35} ${person.cx + 70},${person.cy - 70}`}
                      stroke={primaryColor}
                      strokeWidth="10"
                      strokeLinecap="round"
                    />

                    {/* Solid Opaque White Base Cloth */}
                    <path
                      fill={secondaryColor} //"#ffffff"
                      stroke={primaryColor}
                      strokeWidth="1"
                      d={`M${person.cx - 80},${person.cy - 70} C${
                        person.cx - 35
                      },${person.cy - 85} ${person.cx + 35},${person.cy - 85} ${
                        person.cx + 80
                      },${person.cy - 70} L${person.cx + 80},${
                        person.cy - 45 + scarf.extraHeight
                      } C${person.cx + 35},${person.cy - 60 + scarf.extraHeight} ${
                        person.cx - 35
                      },${person.cy - 60 + scarf.extraHeight} ${person.cx - 80},${
                        person.cy - 45 + scarf.extraHeight
                      } Z`}
                    />

                    {badgeUrl && (
                      <g>
                        {/* SIDE 1: Left Wing Badge Placement */}
                        <g mask={`url(#scarf-mask-left-${person.id})`}>
                          <image
                            href={badgeUrl}
                            x={person.cx - 76}
                            y={person.cy - 72 + scarf.extraHeight / 2}
                            width="22"
                            height="22"
                            preserveAspectRatio="xMidYMid meet"
                            transform={`rotate(-13, ${person.cx - 61}, ${
                              person.cy - 63 + scarf.extraHeight / 2
                            })`}
                          />
                        </g>

                        {/* DYNAMIC CURVED TEXT ENGINE */}
                        {lineCurves.map((c) => (
                          <text
                            key={c.id}
                            fill={getContrastColor(secondaryColor)}
                            fontSize={scarf.fontSize}
                            fontWeight="900"
                            fontFamily="Impact, sans-serif"
                            letterSpacing={scarf.fontSize * 0.1}
                          >
                            <textPath
                              href={`#${c.id}`}
                              startOffset="50%" // Forces the text center-mass onto the center of the arc
                              textAnchor="middle" // Symmetrically balances spacing on left and right text sweeps
                              dominantBaseline="central" // Corrects vertical font line registration perfectly onto the path axis
                            >
                              {c.line}
                            </textPath>
                          </text>
                        ))}

                        {/* SIDE 2: Right Wing Badge Placement */}
                        <g mask={`url(#scarf-mask-right-${person.id})`}>
                          <image
                            href={badgeUrl}
                            x={person.cx + 54}
                            y={person.cy - 74 + scarf.extraHeight / 2}
                            width="22"
                            height="22"
                            preserveAspectRatio="xMidYMid meet"
                            transform={`rotate(13, ${person.cx + 55}, ${
                              person.cy - 63 + scarf.extraHeight / 2
                            })`}
                          />
                        </g>
                      </g>
                    )}
                  </g>
                );
              })()}

            {person.gearType === 2 && (
              /* High Double Wave Jumping Variant */
              <g>
                <path
                  d={`M${person.cx - 35},${person.cy + 30} Q${person.cx - 65},${
                    person.cy - 30
                  } ${person.cx - 75},${person.cy - 60}`}
                  stroke={primaryColor}
                  strokeWidth="10"
                  strokeLinecap="round"
                />
                <path
                  d={`M${person.cx + 35},${person.cy + 30} Q${person.cx + 65},${
                    person.cy - 30
                  } ${person.cx + 75},${person.cy - 60}`}
                  stroke={primaryColor}
                  strokeWidth="10"
                  strokeLinecap="round"
                />
              </g>
            )}

            {person.gearType === 3 &&
              (() => {
                const isLeftHand =
                  person.id.charCodeAt(person.id.length - 1) % 2 === 0;
                const handX = isLeftHand ? person.cx - 50 : person.cx + 50;
                const handY = person.cy - 20;
                const poleTopX = isLeftHand ? person.cx - 52 : person.cx + 52;
                const poleTopY = person.cy - 110;

                const armPath = isLeftHand
                  ? `M${person.cx - 25},${person.cy + 25} Q${person.cx - 45},${
                      person.cy
                    } ${handX},${handY}`
                  : `M${person.cx + 25},${person.cy + 25} Q${person.cx + 45},${
                      person.cy
                    } ${handX},${handY}`;

                // Base flag path always generated pointing right relative to local coordinates
                const baseFlagPath = `M${poleTopX},${poleTopY + 5}
    Q${poleTopX + 45},${person.cy - 120} ${poleTopX + 95},${person.cy - 100}
    Q${poleTopX + 60},${person.cy - 75} ${poleTopX + 95},${person.cy - 50}
    Q${poleTopX + 45},${person.cy - 70} ${handX + 1},${person.cy - 55} Z`;

                const baseLogoX = poleTopX + 47;
                const baseLogoY = person.cy - 87;
                const logoSize = 44;

                return (
                  <g key={person.id}>
                    <defs>
                      <clipPath id={`flag-clip-${person.id}`}>
                        <path d={baseFlagPath} />
                      </clipPath>
                    </defs>

                    {/* Smooth, fluid fabric flapping physics utilizing fractional scale values */}
                    <style>{`
          @keyframes flagWave-${person.id} {
            0%   { transform: rotate(-16deg) scaleX(1); }
            20%  { transform: rotate(-6deg)  scaleX(0.2); }  /* Flattening against pole */
            25%  { transform: rotate(0deg)   scaleX(-0.2); } /* Smooth flip starts */
            35%  { transform: rotate(5deg)   scaleX(-1); }   /* Fully extended on left side */
            50%  { transform: rotate(16deg)  scaleX(-1); }   /* Max swing peak left */
            70%  { transform: rotate(6deg)   scaleX(-0.2); } /* Flattening coming back */
            75%  { transform: rotate(0deg)   scaleX(0.2); }  /* Smooth flip returns */
            85%  { transform: rotate(-5deg)  scaleX(1); }    /* Fully extended on right side */
            100% { transform: rotate(-16deg) scaleX(1); }    /* Max swing peak right */
          }
        `}</style>

                    {/* Shoulder-rooted arm rendering */}
                    <path
                      d={armPath}
                      stroke={primaryColor}
                      strokeWidth="10"
                      strokeLinecap="round"
                    />

                    {/* Flagpole and fabric grouping assembly */}
                    <g
                      style={{
                        transformOrigin: `${handX}px ${handY}px`,
                        animation: `flagWave-${person.id} ${
                          person.duration * 2.2
                        }s ease-in-out infinite`,
                        animationDelay: `${person.delay}s`,
                      }}
                    >
                      {/* Pole Line Core Axis */}
                      <line
                        x1={handX}
                        y1={handY}
                        x2={poleTopX}
                        y2={poleTopY}
                        stroke={primaryColor}
                        strokeWidth="7"
                        strokeLinecap="round"
                      />

                      {/* Solid White Opaque Flag Cloth Canvas */}
                      <path
                        fill="#ffffff"
                        stroke={primaryColor}
                        strokeWidth="2"
                        d={baseFlagPath}
                      />

                      {/* Centered logo bound securely by the matching transformed clip layout mask */}
                      {badgeUrl && (
                        <g clipPath={`url(#flag-clip-${person.id})`}>
                          <image
                            href={badgeUrl}
                            x={baseLogoX - logoSize / 2}
                            y={baseLogoY - logoSize / 2}
                            width={logoSize}
                            height={logoSize}
                            preserveAspectRatio="xMidYMid meet"
                          />
                        </g>
                      )}
                    </g>
                  </g>
                );
              })()}
          </motion.g>
        ))}
      </g>

      {/* LAYER 3: FOREGROUND DEEP SILHOUETTE ROW */}
      <g fill="#0c0c0c">
        <motion.g
          animate={{ y: [0, -14, 0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 0.55, ease: 'easeInOut' }}
        >
          {crowdLayout.layer3Positions.map((cx, idx) => (
            <g key={`fg-${idx}`}>
              <circle cx={cx} cy="370" r="21" />
              <path
                d={`M${cx - 50},410 C${cx - 50},390 ${cx + 50},390 ${
                  cx + 50
                },410 L${cx + 60},450 L${cx - 60},450 Z`}
              />
            </g>
          ))}
        </motion.g>
      </g>
    </svg>
  );
}
