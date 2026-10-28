import type { ComponentType } from 'react';
import SupermanText from './SupermanText';
import CircularExplosionText from './CircularExplosionText';
import PopText from './PopText';
import ShootingText from './ShootingText';
import GlitchText from './GlitchText';
import JumbotronText from './JumbotronText';
import SlammingText from './SlammingText';
import LaserAceText from './LaserAceText';
import SonicSlashText from './SonicSlashText';
import WavingText from './WavingText';
import type { TextEffectId } from '../../types/matchData';

export interface TextEffectProps {
  text: string;
  primaryColor: string;
  secondaryColor: string;
  /** How long the celebration lasts; effects that schedule their own ending use it */
  durationMs?: number;
}

// Ids match the ones the control app sends in `triggerEffect`
export const TEXT_EFFECT_COMPONENTS: Record<TextEffectId, ComponentType<TextEffectProps>> = {
  superman: SupermanText,
  explosion: CircularExplosionText,
  pop: PopText,
  shooting: ShootingText,
  glitch: GlitchText,
  jumbotron: JumbotronText,
  slam: SlammingText,
  laser: LaserAceText,
  sonic: SonicSlashText,
  wave: WavingText,
};

// Falls back to a safe effect if the tracker ever sends an id this overlay does not know
export const getTextEffectComponent = (id: string): ComponentType<TextEffectProps> =>
  TEXT_EFFECT_COMPONENTS[id as TextEffectId] ?? PopText;
