import React from 'react';

// Props interface for the component extending standard image attributes
interface OutlinedLogoProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
}

// Pure, safe CSS — no canvas/CORS dependency:
export const OutlinedLogo: React.FC<OutlinedLogoProps> = ({
  src,
  alt,
  className,
  ...props
}) => {
  return (
    <img
      {...props}
      src={src}
      alt={alt}
      className={className}
      style={{
        objectFit: 'contain',
        // 🌟 Creates a sharp, visible white outline behind ANY dark graphic text
        filter: `
          drop-shadow(1px 1px 0px rgba(255,255,255,0.9))
          drop-shadow(-1px -1px 0px rgba(255,255,255,0.9))
          drop-shadow(1px -1px 0px rgba(255,255,255,0.9))
          drop-shadow(-1px 1px 0px rgba(255,255,255,0.9))
          drop-shadow(0px 0px 4px rgba(255,255,255,0.8))
        `,
        ...props.style
      }}
    />
  );
};
