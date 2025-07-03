'use client';

import { BaseComponentProps } from '@/lib/types';

interface LoadingSpinnerProps extends BaseComponentProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white';
  text?: string;
  fullScreen?: boolean;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6', 
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
};

const colorClasses = {
  primary: 'border-purple-200 border-t-purple-600',
  secondary: 'border-gray-200 border-t-gray-600',
  white: 'border-white/20 border-t-white',
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary', 
  text,
  fullScreen = false,
  className = '',
}) => {
  const spinner = (
    <div className={`inline-block animate-spin rounded-full border-4 ${sizeClasses[size]} ${colorClasses[color]}`} />
  );

  const content = (
    <div className={`flex flex-col items-center justify-center space-y-2 ${className}`}>
      {spinner}
      {text && (
        <p className={`text-sm ${color === 'white' ? 'text-white' : 'text-gray-600'} font-medium`}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
}; 