import type { ThemeTokens } from '../types/config';

// ── HSL helpers ───────────────────────────────────────────────────────────────

function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [h, s, l];
}

function hslToHex(h: number, s: number, l: number): string {
  const hue2rgb = (p: number, q: number, t: number): number => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const toHex = (x: number) => Math.round(hue2rgb(p, q, x) * 255).toString(16).padStart(2, '0');
  return `#${toHex(h + 1 / 3)}${toHex(h)}${toHex(h - 1 / 3)}`;
}

/** Shift HSL lightness by `delta` (−1 to +1 range). */
function shiftL(hex: string, delta: number): string {
  const [h, s, l] = hexToHsl(hex);
  return hslToHex(h, s, Math.max(0, Math.min(1, l + delta)));
}

// ── RGB helpers ───────────────────────────────────────────────────────────────

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r} ${g} ${b}`;
}

// ── Theme application ─────────────────────────────────────────────────────────

/** Apply a (partial) ThemeTokens object to the document root CSS variables.
 *  Only defined fields are written; undefined fields retain their theme.css defaults.
 *
 *  When `background` is set, the three derived variables are also recomputed:
 *  --ov-bg-alt   (−5 % L)   darker variant used by scoreboard & subscribe
 *  --ov-row-odd  (+13 % L)  lighter alternating table row
 *  --ov-row-even (+2 % L)   slightly lighter alternating table row
 */
export function applyTheme(theme: ThemeTokens): void {
  const root = document.documentElement;
  const { colors, font, radius, animation } = theme;

  if (colors?.background) {
    const bg = colors.background;
    const bgAlt = shiftL(bg, -0.05);
    root.style.setProperty('--ov-bg',         bg);
    root.style.setProperty('--ov-bg-alt',     bgAlt);
    root.style.setProperty('--ov-bg-alt-rgb', hexToRgb(bgAlt));
    root.style.setProperty('--ov-row-even',   shiftL(bg, +0.02));
    root.style.setProperty('--ov-row-odd',    shiftL(bg, +0.13));
  }
  if (colors?.text) {
    root.style.setProperty('--ov-text',     colors.text);
    root.style.setProperty('--ov-text-rgb', hexToRgb(colors.text));
  }
  if (colors?.secondary) root.style.setProperty('--ov-text-muted', colors.secondary);
  if (colors?.primary) {
    root.style.setProperty('--ov-primary',     colors.primary);
    root.style.setProperty('--ov-primary-rgb', hexToRgb(colors.primary));
  }
  if (colors?.accent)  root.style.setProperty('--ov-accent',  colors.accent);
  if (colors?.serving) root.style.setProperty('--ov-serving', colors.serving);
  if (font)      root.style.setProperty('--ov-font',   font);
  if (radius)    root.style.setProperty('--ov-radius', radius);
  if (animation) root.style.setProperty('--ov-anim',   animation);
}
