import { View, ViewProps } from 'react-native';
import { cn } from '@/utils/cn';

interface CardProps extends ViewProps {
    variant?: 'default' | 'outlined' | 'ghost';
}

export function Card({ children, className, variant = 'default', ...props }: CardProps) {
  const variants = {
    default: 'bg-surface dark:bg-surface-dark shadow-sm',
    outlined: 'bg-transparent border border-border dark:border-border-dark',
    ghost: 'bg-transparent',
  };

  return (
    <View 
      className={cn(
        "rounded-xl p-4", 
        variants[variant],
        className
      )} 
      {...props}
    >
      {children}
    </View>
  );
}
