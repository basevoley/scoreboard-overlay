type RGB = [number, number, number];
type HSL = [number, number, number]; // h in degrees, s and l in 0..1

export function parseHex(hex?: string): RGB | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex ?? '');
  if (!m) return null;
  const full = m[1].length === 3 ? m[1].replace(/./g, (c) => c + c) : m[1];
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16)) as RGB;
}

const toHex = ([r, g, b]: RGB) =>
  `#${[r, g, b].map((c) => Math.round(c).toString(16).padStart(2, '0')).join('')}`;

// WCAG relative luminance (0 = black, 1 = white)
export function luminance([r, g, b]: RGB) {
  const [lr, lg, lb] = [r, g, b].map((c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
}

// WCAG contrast ratio between two colors (1 = identical, 21 = black on white)
export function contrastRatio(a: RGB, b: RGB) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

export function rgbToHsl([r, g, b]: RGB): HSL {
  const [rn, gn, bn] = [r / 255, g / 255, b / 255];
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = max === rn ? (gn - bn) / d + (gn < bn ? 6 : 0) : max === gn ? (bn - rn) / d + 2 : (rn - gn) / d + 4;
  h *= 60;
  return [h, s, l];
}

export function hslToRgb([h, s, l]: HSL): RGB {
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return 255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)));
  };
  return [f(0), f(8), f(4)];
}

// Below this lightness a deeper tone would be indistinguishable from black.
const MIN_INTENSE_LIGHTNESS = 0.2;
const INTENSE_SATURATION_BOOST = 0.3;
const INTENSE_LIGHTNESS_DROP = 0.15;
const SOFT_LIGHTNESS_RISE = 0.3;
const SOFT_SATURATION_FACTOR = 0.6;
const GREY_SATURATION = 0.1; // below this, boosting saturation would invent a hue

// Second tone for a team color: a more intense (richer, deeper) version of it, or, when the color
// is so dark that a deeper tone would look like black, a softer (lighter, paler) version instead.
export function deriveSecondaryColor(hex: string) {
  const rgb = parseHex(hex);
  if (!rgb) return '#ffffff';
  const [h, s, l] = rgbToHsl(rgb);
  if (l - INTENSE_LIGHTNESS_DROP >= MIN_INTENSE_LIGHTNESS) {
    return toHex(hslToRgb([h, s < GREY_SATURATION ? s : Math.min(1, s + INTENSE_SATURATION_BOOST), l - INTENSE_LIGHTNESS_DROP]));
  }
  return toHex(hslToRgb([h, s * SOFT_SATURATION_FACTOR, Math.min(0.9, l + SOFT_LIGHTNESS_RISE)]));
}

// Dark text tone for a light background: keeps the background's hue (and a solid saturation) and is
// darkened only until it reaches the required contrast, so it reads as a color rather than as black.
export function deriveDarkTextColor(bg: RGB, minContrast: number) {
  const [h, s, l] = rgbToHsl(bg);
  const saturation = s < GREY_SATURATION ? s : Math.max(s, 0.6);
  for (let lightness = Math.min(l, 0.45); lightness >= 0.12; lightness -= 0.03) {
    const candidate = hslToRgb([h, saturation, lightness]);
    if (contrastRatio(bg, candidate) >= minContrast) return toHex(candidate);
  }
  return toHex(hslToRgb([h, saturation, 0.12]));
}
