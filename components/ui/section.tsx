import { View, ViewProps } from 'react-native';
import { cn } from '@/utils/cn';
import { Typography } from './typography';

interface SectionProps extends ViewProps {
  title?: string;
  action?: React.ReactNode;
}

export function Section({ title, action, children, className, ...props }: SectionProps) {
  return (
    <View className={cn("mb-6", className)} {...props}>
      {(title || action) && (
        <View className="flex-row items-center justify-between mb-3 px-1">
          {title && (
            <Typography variant="subtitle" className="text-lg">
              {title}
            </Typography>
          )}
          {action}
        </View>
      )}
      <View>
        {children}
      </View>
    </View>
  );
}
