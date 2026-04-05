import React, { createContext, useContext, useLayoutEffect, useState } from 'react';

interface OverlayContextValue {
  scale: number;
  width: number;
  height: number;
  connectionStatus: string;
}

interface OverlayProviderProps {
  children: React.ReactNode;
  width: number;
  height: number;
  connectionStatus: string;
}

const OverlayContext = createContext<OverlayContextValue>({
  scale: 1,
  width: 1920,
  height: 1080,
  connectionStatus: 'disconnected',
});

export const OverlayProvider = ({ children, width, height, connectionStatus }: OverlayProviderProps) => {
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const updateScale = () => {
      const scaleX = window.innerWidth / width;
      const scaleY = window.innerHeight / height;
      setScale(Math.min(scaleX, scaleY));
    };

    window.addEventListener('resize', updateScale);
    updateScale();
    return () => window.removeEventListener('resize', updateScale);
  }, [width, height]);

  return (
    <OverlayContext.Provider value={{ scale, width, height, connectionStatus }}>
      <ScalableCanvas>{children}</ScalableCanvas>
    </OverlayContext.Provider>
  );
};

export const useOverlay = () => useContext(OverlayContext);

export const ScalableCanvas = ({ children }: { children: React.ReactNode }) => {
  const { scale, width, height, connectionStatus } = useOverlay();

  const canvasStyle = {
    width: `${width}px`,
    height: `${height}px`,
    position: 'absolute',
    top: '50%',
    left: '50%',
    transformOrigin: 'center',
    background: 'transparent',
    overflow: 'hidden',
    backfaceVisibility: 'hidden',
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
    willChange: 'transform',
    transform: `translate(-50%, -50%) scale(${scale}) translateZ(0)`,
    containerType: 'size',
    border: `${connectionStatus === 'no-connection' ? '1px dashed gray' : 'none'}`,
    boxSizing: 'border-box',
  } as React.CSSProperties;

  return (
    <div style={{
      width: '100dvw',
      height: '100dvh',
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: 'transparent',
    } as React.CSSProperties}>
      <div style={canvasStyle}>
        {children}
      </div>
    </div>
  );
};
