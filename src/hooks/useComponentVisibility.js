import { useState, useEffect } from 'react';

const useComponentVisibility = (isEnabledStatus, animationDuration = 500) => {
  // isVisible controls whether the component is in the DOM at all
  const [isVisible, setIsVisible] = useState(isEnabledStatus);
  // currentClass tracks the animation state (fade-in/fade-out)
  const [currentClass, setCurrentClass] = useState('');

  useEffect(() => {
    if (isEnabledStatus) {
      // 1. Immediately put component in DOM
      setIsVisible(true); 
      
      // 2. Wait a tiny moment for DOM update, then apply 'fade-in' class
      const fadeInTimer = setTimeout(() => {
        setCurrentClass('fade-in');
      }, 50); // A 10ms delay is usually enough to force the browser to recognize the initial state

      return () => clearTimeout(fadeInTimer);

    } else {
      // 1. Apply 'fade-out' class immediately to start animation
      setCurrentClass('fade-out');
      
      // 2. Wait for animation duration, then remove from DOM
      const fadeOutTimer = setTimeout(() => {
        setIsVisible(false);
      }, animationDuration);

      return () => clearTimeout(fadeOutTimer);
    }
  }, [isEnabledStatus, animationDuration]);

  return { isVisible, animationClass: currentClass };
};

export default useComponentVisibility;
