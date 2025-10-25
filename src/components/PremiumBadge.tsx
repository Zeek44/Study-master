import React from 'react';
import { Crown } from 'lucide-react';

interface PremiumBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

const PremiumBadge: React.FC<PremiumBadgeProps> = ({ size = 'md', showText = true }) => {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <div className={`inline-flex items-center space-x-1 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full font-medium text-white ${sizeClasses[size]}`}>
      <Crown className={iconSizes[size]} />
      {showText && <span>Premium</span>}
    </div>
  );
};

export default PremiumBadge;