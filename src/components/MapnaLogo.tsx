import React from 'react';

interface MapnaLogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Authentic MAPNA Group Logo Component
 * Matches the official MAPNA visual identity:
 * - MAPNA Gray: #6D6E70 (Cooling tower motif & Persian typography)
 * - MAPNA Red: #CF2F2F (Triple turbine/chevron motif)
 */
export const MapnaLogo: React.FC<MapnaLogoProps> = ({ 
  className = '', 
  showText = true,
  size = 'md' 
}) => {
  const dimensions = {
    sm: { iconWidth: 28, iconHeight: 28, textClass: 'text-xs' },
    md: { iconWidth: 38, iconHeight: 38, textClass: 'text-sm' },
    lg: { iconWidth: 52, iconHeight: 52, textClass: 'text-base' }
  }[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <svg
        width={dimensions.iconWidth}
        height={dimensions.iconHeight}
        viewBox="0 0 160 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        {/* Left industrial tower / geometric column in MAPNA Gray (#6D6E70) */}
        <path
          d="M32 18 C32 18 36 28 35 38 C34 46 28 62 25 72 L6 112 C4 116 7 122 13 122 L72 122 C76 122 80 118 80 114 L65 30 C64 24 58 18 52 18 Z"
          fill="#6D6E70"
        />

        {/* 1st Diagonal Blade in MAPNA Red (#CF2F2F) */}
        <path
          d="M62 118 C58 118 55 114 57 110 L94 44 C96 40 102 39 105 42 C109 45 109 50 107 54 L70 120 C68 124 64 122 62 118 Z"
          fill="#CF2F2F"
        />

        {/* 2nd Diagonal Blade in MAPNA Red (#CF2F2F) */}
        <path
          d="M86 118 C82 118 79 114 81 110 L118 44 C120 40 126 39 129 42 C133 45 133 50 131 54 L94 120 C92 124 88 122 86 118 Z"
          fill="#CF2F2F"
        />

        {/* 3rd Diagonal Blade & Triangular Apex in MAPNA Red (#CF2F2F) */}
        <path
          d="M110 118 C106 118 103 114 105 110 L142 44 C144 40 150 39 153 43 C156 46 155 51 153 54 L118 120 C116 124 112 122 110 118 Z"
          fill="#CF2F2F"
        />

        <path
          d="M128 120 L156 120 C159 120 162 116 160 112 L146 76 C144 71 138 73 136 78 L124 116 C123 118 125 120 128 120 Z"
          fill="#CF2F2F"
        />
      </svg>

      {showText && (
        <div className="flex flex-col text-right">
          <span className="font-black tracking-tight text-[#333333] leading-none" style={{ fontSize: size === 'lg' ? '1.25rem' : size === 'md' ? '1.05rem' : '0.875rem' }}>
            گروه مپنا
          </span>
          <span className="text-[10px] font-bold text-[#6D6E70] tracking-wider font-mono mt-0.5">
            MAPNA GROUP
          </span>
        </div>
      )}
    </div>
  );
};
