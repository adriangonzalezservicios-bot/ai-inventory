import React from 'react';

interface AkariLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showText?: boolean;
}

export const AKARI_LOGO_URL = "https://images.jumpseller.com/store/akari-import/store/logo/29915.png?1784138176";

export const AkariLogo: React.FC<AkariLogoProps> = ({ 
  size = 'md',
  className = '',
  showText = true,
}) => {
  const heightMap = {
    sm: 'h-7',
    md: 'h-9',
    lg: 'h-12',
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <img
        src={AKARI_LOGO_URL}
        alt="AKARI Import Logo"
        className={`${heightMap[size]} w-auto object-contain shrink-0 drop-shadow-sm`}
        referrerPolicy="no-referrer"
      />
    </div>
  );
};
