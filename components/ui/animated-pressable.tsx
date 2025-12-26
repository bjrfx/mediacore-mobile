import React from 'react';
import { Pressable, PressableProps, ViewStyle } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  WithSpringConfig
} from 'react-native-reanimated';

const AnimatedPressableComponent = Animated.createAnimatedComponent(Pressable);

interface AnimatedPressableProps extends PressableProps {
  scale?: number;
  springConfig?: WithSpringConfig;
  style?: ViewStyle;
}

export function AnimatedPressable({ 
  children, 
  scale = 0.96, 
  springConfig = { damping: 10, stiffness: 100 },
  style,
  ...props 
}: AnimatedPressableProps) {
  const scaleValue = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scaleValue.value }],
    };
  });

  const handlePressIn = () => {
    scaleValue.value = withSpring(scale, springConfig);
  };

  const handlePressOut = () => {
    scaleValue.value = withSpring(1, springConfig);
  };

  return (
    <AnimatedPressableComponent
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[style, animatedStyle]}
      {...props}
    >
      {children}
    </AnimatedPressableComponent>
  );
}
