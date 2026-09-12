import React from 'react';

interface SchoolLogoProps {
  variant?: 'full' | 'emblem' | 'horizontal';
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showSubtitle?: boolean;
}

export const SchoolLogo: React.FC<SchoolLogoProps> = ({
  variant = 'full',
  className = '',
  size = 'md',
  showSubtitle = true,
}) => {
  const sizeMap = {
    xs: { emblem: 'w-7 h-7', textSchool: 'text-[9px]', textName: 'text-xs', textSub: 'text-[9px]' },
    sm: { emblem: 'w-10 h-10', textSchool: 'text-[10px]', textName: 'text-sm', textSub: 'text-[10px]' },
    md: { emblem: 'w-14 h-14', textSchool: 'text-xs', textName: 'text-lg', textSub: 'text-xs' },
    lg: { emblem: 'w-20 h-20', textSchool: 'text-sm', textName: 'text-2xl', textSub: 'text-sm' },
    xl: { emblem: 'w-28 h-28', textSchool: 'text-base', textName: 'text-3xl', textSub: 'text-base' },
    '2xl': { emblem: 'w-36 h-36', textSchool: 'text-lg', textName: 'text-4xl', textSub: 'text-lg' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  // Horizontal layout: Emblem on the side + stylized typography on the other
  if (variant === 'horizontal') {
    return (
      <div className={`inline-flex items-center gap-3 select-none ${className}`}>
        {/* Emblem */}
        <div className={`relative shrink-0 flex items-center justify-center ${currentSize.emblem}`}>
          <img
            src="/anas-school-logo.svg"
            alt="شعار مدرسة أنس بن مالك الخاصة"
            className="w-full h-full object-contain drop-shadow-xs"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Text stack */}
        <div className="flex flex-col text-right leading-tight">
          <span className={`font-extrabold text-[#3BA3B8] ${currentSize.textSchool}`}>
            مدرسة
          </span>
          <span className={`font-black text-[#F5A623] tracking-tight ${currentSize.textName}`}>
            أنس بن مالك
          </span>
          {showSubtitle && (
            <span className={`font-bold text-[#3BA3B8] ${currentSize.textSub}`}>
              الـخـاصـة
            </span>
          )}
        </div>
      </div>
    );
  }

  // Emblem only: Laurel wreath, sun, pencil, open book, 1990
  if (variant === 'emblem') {
    return (
      <div className={`relative shrink-0 flex items-center justify-center ${currentSize.emblem} ${className}`}>
        <img
          src="/anas-school-logo.svg"
          alt="شعار مدرسة أنس بن مالك الخاصة"
          className="w-full h-full object-contain drop-shadow-xs"
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  // Full stacked badge layout
  return (
    <div className={`inline-flex flex-col items-center text-center select-none ${className}`}>
      <div className={`relative ${currentSize.emblem}`}>
        <img
          src="/anas-school-logo.svg"
          alt="شعار مدرسة أنس بن مالك الخاصة"
          className="w-full h-full object-contain"
          referrerPolicy="no-referrer"
        />
      </div>
    </div>
  );
};
