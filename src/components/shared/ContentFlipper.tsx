import React from 'react';
import styles from './ContentFlipper.module.css';

interface ContentFlipperProps {
  front: React.ReactNode;
  back: React.ReactNode;
  duration?: number;
  width?: string;
  height?: string;
}

const ContentFlipper = ({ front, back, duration = 6, width = '300px', height = '400px' }: ContentFlipperProps) => {
  return (
    <div
      className={styles.container}
      style={{
        '--flip-duration': `${duration}s`,
        width,
        height,
      } as React.CSSProperties}
    >
      <div className={styles.card}>
        <div className={`${styles.face} ${styles.front}`}>
          {front}
        </div>
        <div className={`${styles.face} ${styles.back}`}>
          {back}
        </div>
      </div>
    </div>
  );
};

export default ContentFlipper;
