// components/UniformIcon.jsx (Alternative method)
import React from 'react';

const UniformIcon = ({ shirtColor, shortsColor }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" >
      {/* <!-- T-Shirt --> */}
      <path d="M16 4 L24 2 H40 L48 4 L56 8 L52 20 L44 16 V42 H20 V16 L12 20 L8 8 Z" fill={shirtColor} stroke="black" stroke-width="1"></path>
      {/* <!-- Shorts --> */}
      <path d="M21 44 L43 44 L52 64 L36 64 L32 58 L28 64 L12 64 Z" fill={shortsColor} stroke="black" stroke-width="1"></path>
    </svg>
  );
};

export default UniformIcon;
