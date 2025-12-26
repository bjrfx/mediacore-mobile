import { View, ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cn } from '@/utils/cn';

interface ContainerProps extends ViewProps {
  useSafeArea?: boolean;
}

export function Container({ children, className, useSafeArea = false, ...props }: ContainerProps) {
  const Component = useSafeArea ? SafeAreaView : View;
  
  return (
    <Component 
      className={cn("flex-1 bg-background dark:bg-background-dark px-4", className)} 
      {...props}
    >
      {children}
    </Component>
  );
}
