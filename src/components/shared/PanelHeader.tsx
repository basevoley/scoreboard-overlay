import React from 'react';
import styles from './PanelHeader.module.css';
import { OutlinedLogo } from './OutlinedLogo';

interface PanelHeaderProps {
  competitionLogo?: string;
  title: string;
  subtitle?: string;
}

const PanelHeader = ({ competitionLogo, title, subtitle }: PanelHeaderProps) => (
  <div className={styles['panel-header']}>
    {competitionLogo && (
      <OutlinedLogo key={competitionLogo} src={competitionLogo} alt="Competition Logo" className={styles['competition-logo']} />
    )}
    <div>
      <div className={styles['title']}>{title}</div>
      {subtitle && <div className={styles['subtitle']}>{subtitle}</div>}
    </div>
  </div>
);

export default PanelHeader;
