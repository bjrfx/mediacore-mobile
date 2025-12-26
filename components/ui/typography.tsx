import { Text, TextProps } from 'react-native';
import { cn } from '@/utils/cn';

interface TypographyProps extends TextProps {
  variant?: 'title' | 'subtitle' | 'body' | 'caption';
  color?: 'default' | 'primary' | 'secondary' | 'accent';
}

export function Typography({ 
  children, 
  variant = 'body', 
  color = 'default',
  className, 
  ...props 
}: TypographyProps) {
  const variantStyles = {
    title: 'text-3xl font-bold tracking-tight',
    subtitle: 'text-xl font-semibold tracking-tight',
    body: 'text-base font-normal leading-relaxed',
    caption: 'text-sm font-medium',
  };

  const colorStyles = {
    default: 'text-primary dark:text-primary-dark',
    primary: 'text-primary dark:text-primary-dark',
    secondary: 'text-secondary dark:text-secondary-dark',
    accent: 'text-blue-500', // Example accent
  };

  return (
    <Text 
      className={cn(variantStyles[variant], colorStyles[color], className)} 
      {...props}
    >
      {children}
    </Text>
  );
}

export function Title(props: TypographyProps) {
    return <Typography variant="title" {...props} />;
}

export function Subtitle(props: TypographyProps) {
    return <Typography variant="subtitle" {...props} />;
}

export function Body(props: TypographyProps) {
    return <Typography variant="body" {...props} />;
}

export function Caption(props: TypographyProps) {
    return <Typography variant="caption" color="secondary" {...props} />;
}
