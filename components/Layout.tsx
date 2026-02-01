
import React from 'react';
import { ThemeStyle, UserConfig } from '../types';
import { THEME_CONFIGS } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  themeStyle: ThemeStyle;
}

export const Layout: React.FC<LayoutProps> = ({ children, themeStyle }) => {
  const theme = THEME_CONFIGS[themeStyle] || THEME_CONFIGS[ThemeStyle.MODERN];

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} ${theme.font} transition-colors duration-500 overflow-x-hidden pb-24`}>
      <div className="max-w-md mx-auto relative px-4 pt-8">
        {children}
      </div>
    </div>
  );
};
