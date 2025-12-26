/**
 * MediaCore Design System
 * Inspired by: Spotify, Apple Music, YouTube Music, SoundCloud
 * 
 * Color philosophy:
 * - Deep, rich backgrounds for immersive media experience
 * - Vibrant accent colors for interactive elements
 * - Subtle gradients for depth and visual interest
 */

import { Platform } from 'react-native';

// Brand Colors - Vibrant gradient palette
export const BrandColors = {
  // Primary accent - Electric violet/purple gradient
  primary: '#8B5CF6',      // Violet-500
  primaryLight: '#A78BFA', // Violet-400
  primaryDark: '#7C3AED',  // Violet-600
  
  // Secondary accent - Cyan/teal for highlights
  secondary: '#06B6D4',    // Cyan-500
  secondaryLight: '#22D3EE', // Cyan-400
  secondaryDark: '#0891B2', // Cyan-600
  
  // Tertiary - Pink for special accents
  tertiary: '#EC4899',     // Pink-500
  tertiaryLight: '#F472B6', // Pink-400
  tertiaryDark: '#DB2777',  // Pink-600
  
  // Success/Live indicators
  success: '#10B981',      // Emerald-500
  warning: '#F59E0B',      // Amber-500
  error: '#EF4444',        // Red-500
};

// Semantic Colors
export const Colors = {
  light: {
    // Backgrounds
    background: '#FFFFFF',
    backgroundSecondary: '#F8FAFC', // Slate-50
    surface: '#F1F5F9',            // Slate-100
    surfaceElevated: '#FFFFFF',
    
    // Text
    text: '#0F172A',               // Slate-900
    textSecondary: '#64748B',      // Slate-500
    textTertiary: '#94A3B8',       // Slate-400
    textInverse: '#FFFFFF',
    
    // Borders
    border: '#E2E8F0',             // Slate-200
    borderSubtle: '#F1F5F9',       // Slate-100
    
    // Interactive
    tint: BrandColors.primary,
    icon: '#64748B',
    tabIconDefault: '#94A3B8',
    tabIconSelected: BrandColors.primary,
    
    // Components
    cardBackground: '#FFFFFF',
    inputBackground: '#F1F5F9',
    overlayBackground: 'rgba(15, 23, 42, 0.5)',
  },
  dark: {
    // Backgrounds - Deep, rich blacks
    background: '#0A0A0F',         // Near black with hint of blue
    backgroundSecondary: '#12121A', // Slightly elevated
    surface: '#1A1A24',            // Card/surface level
    surfaceElevated: '#22222E',    // Elevated surfaces
    
    // Text
    text: '#F8FAFC',               // Slate-50
    textSecondary: '#94A3B8',      // Slate-400
    textTertiary: '#64748B',       // Slate-500
    textInverse: '#0F172A',
    
    // Borders
    border: '#2A2A38',             // Subtle dark border
    borderSubtle: '#1E1E28',
    
    // Interactive
    tint: BrandColors.primaryLight,
    icon: '#94A3B8',
    tabIconDefault: '#64748B',
    tabIconSelected: BrandColors.primaryLight,
    
    // Components
    cardBackground: '#1A1A24',
    inputBackground: '#1E1E28',
    overlayBackground: 'rgba(0, 0, 0, 0.7)',
  },
};

// Gradient presets for backgrounds and accents
export const Gradients = {
  // Player background gradient
  playerBackground: ['#0A0A0F', '#1A1A24', '#0A0A0F'],
  
  // Accent gradients
  primary: ['#8B5CF6', '#EC4899'],        // Violet to Pink
  secondary: ['#06B6D4', '#8B5CF6'],      // Cyan to Violet
  tertiary: ['#EC4899', '#F59E0B'],       // Pink to Amber
  
  // Glass effect base
  glass: ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)'],
  glassDark: ['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.1)'],
  
  // Tab bar
  tabBar: ['rgba(10,10,15,0.95)', 'rgba(10,10,15,0.98)'],
  tabBarLight: ['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.98)'],
};

// Spacing scale (8pt grid)
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
};

// Border radius scale
export const BorderRadius = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  full: 9999,
};

// Typography
export const Fonts = Platform.select({
  ios: {
    sans: 'System',
    serif: 'Georgia',
    rounded: 'System',
    mono: 'Menlo',
  },
  default: {
    sans: 'System',
    serif: 'serif',
    rounded: 'System',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "system-ui, -apple-system, sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
});

// Shadow presets
export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  }),
};

// Animation presets
export const Animations = {
  spring: {
    damping: 15,
    stiffness: 150,
    mass: 1,
  },
  springBouncy: {
    damping: 10,
    stiffness: 100,
    mass: 0.8,
  },
  timing: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
};
