import React from 'react';
import { ThemeSwitcher } from '../common/ThemeSwitcher';

interface AdminThemeSwitcherProps {
  variant?: 'pill' | 'compact' | 'toggle-button';
  className?: string;
}

export const AdminThemeSwitcher: React.FC<AdminThemeSwitcherProps> = ({
  variant = 'pill',
  className = '',
}) => {
  return <ThemeSwitcher variant={variant} className={className} />;
};
