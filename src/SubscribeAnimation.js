import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import styles from "./SubscribeAnimation.module.css";
import confetti from "canvas-confetti";

const SubscribeAnimation = ({ config }) => {
  const { enabled, position } = config;
  const containerRef = useRef(null);
  const cycleTime = 3;
  const animTime = 0.5;

  const positionClass = position ? styles[position] : '';
  useEffect(() => {
    if (enabled) {
      launchSocialConfetti();
    }
  }, [enabled]);

  const launchSocialConfetti = () => {
    if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 80,
      spread: 180,
      origin: { x, y },
      colors: ["#FF0000", "#1DA1F2", "#E1306C", "#4267B2"],
      ticks: 200, // Cuánto tiempo permanecen en pantalla
    });
  };

  return (
    <div ref={containerRef} className={`${styles['overlay-wrapper']} ${positionClass} ${enabled ? styles.visible : styles.hidden}`}>
      <div className={styles.overlayContainer}>

        <motion.div
          className={styles.logoWrapper}
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <img src="cv_alcala.jpg" alt="CV Alcala Logo" className={styles.logoImage} />
        </motion.div>

        <motion.div
          className={styles.icon}
          animate={{ y: [0, -20, 0], scale: [1, 1.3, 1] }}
          transition={{
            duration: animTime,
            repeat: Infinity,
            repeatDelay: cycleTime - animTime,
            delay: 0.7
          }}
        >
          <svg viewBox="0 0 24 24" style={{ height: '64px', width: '64px', color: 'whitesmoke'}}>
            <path fill="currentColor" d="M23,10C23,8.89 22.1,8 21,8H14.68L15.64,3.43C15.66,3.33 15.67,3.22 15.67,3.11C15.67,2.7 15.5,2.32 15.23,2.05L14.17,1L7.59,7.58C7.22,7.95 7,8.45 7,9V19A2,2 0 0,0 9,21H18C18.83,21 19.54,20.5 19.84,19.78L22.86,12.73C22.95,12.5 23,12.26 23,12V10M1,21H5V9H1V21Z" />
          </svg>
        </motion.div>

        <motion.button
          className={styles.subscribeBtn}
          animate={{ scale: [1, 0.85, 1.1, 1] }}
          transition={{
            duration: animTime,
            repeat: Infinity,
            repeatDelay: cycleTime - animTime,
            delay: 1.5
          }}
        >
          SUSCRÍBETE
        </motion.button>

        <motion.div
          className={styles.icon}
          animate={{ rotate: [0, 25, -25, 25, -25, 0] }}
          transition={{
            duration: animTime,
            repeat: Infinity,
            repeatDelay: cycleTime - animTime,
            delay: 2.1
          }}
        >
          <svg viewBox="0 0 24 24" style={{ height: '64px', width: '64px', color: 'whitesmoke' }}>
            <path fill="currentColor" d="M21,19V20H3V19L5,17V11C5,7.9 7.03,5.17 10,4.29C10,4.19 10,4.1 10,4A2,2 0 0,1 12,2A2,2 0 0,1 14,4C14,4.1 14,4.19 14,4.29C16.97,5.17 19,7.9 19,11V17L21,19M14,21A2,2 0 0,1 12,23A2,2 0 0,1 10,21M19.75,3.19L18.33,4.61C20.04,6.3 21,8.6 21,11H23C23,8.07 21.84,5.25 19.75,3.19M1,11H3C3,8.6 3.96,6.3 5.67,4.61L4.25,3.19C2.16,5.25 1,8.07 1,11Z"></path>
          </svg>
        </motion.div>

      </div>
    </div>
  );
};

export default SubscribeAnimation;
