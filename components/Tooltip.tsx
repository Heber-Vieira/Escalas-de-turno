
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TooltipProps {
  children: React.ReactNode;
  text: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'center' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({ 
  children, 
  text, 
  position = 'bottom',
  align = 'center'
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const getPositionClasses = () => {
    let classes = 'absolute z-[150] pointer-events-none ';
    
    // Position
    if (position === 'top') classes += 'bottom-full mb-2 ';
    else if (position === 'bottom') classes += 'top-full mt-2 ';
    else if (position === 'left') classes += 'right-full mr-2 ';
    else if (position === 'right') classes += 'left-full ml-2 ';

    // Alignment
    if (align === 'center') classes += 'left-1/2 -translate-x-1/2 ';
    else if (align === 'left') classes += 'left-0 ';
    else if (align === 'right') classes += 'right-0 ';

    return classes;
  };

  return (
    <div 
      className="relative flex items-center justify-center"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: position === 'bottom' ? -5 : 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: position === 'bottom' ? -5 : 5 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={getPositionClasses()}
          >
            <div className="bg-gray-900/95 backdrop-blur-xl text-white text-[10px] sm:text-xs font-semibold px-3 py-2 rounded-lg shadow-xl border border-white/10 w-max max-w-[220px] text-center leading-snug hidden sm:block">
              {text}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
