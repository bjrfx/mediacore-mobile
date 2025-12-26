// Fallback for using MaterialIcons on Android and web.

import { Ionicons } from '@expo/vector-icons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

// Extended mapping for all icons used in the app
type IconMapping = Record<string, ComponentProps<typeof MaterialIcons>['name'] | { ionicon: ComponentProps<typeof Ionicons>['name'] }>;

const MAPPING: IconMapping = {
  // Navigation
  'house': 'home',
  'house.fill': 'home',
  'magnifyingglass': 'search',
  'plus.circle': 'add-circle-outline',
  'plus.circle.fill': 'add-circle',
  'square.stack': 'layers',
  'square.stack.fill': 'layers',
  'folder': 'folder',
  'folder.fill': 'folder',
  
  // Player controls
  'play.fill': 'play-arrow',
  'pause.fill': 'pause',
  'forward.fill': 'fast-forward',
  'backward.fill': 'fast-rewind',
  'forward.end.fill': 'skip-next',
  'backward.end.fill': 'skip-previous',
  'shuffle': 'shuffle',
  'repeat': 'repeat',
  'repeat.1': 'repeat-one',
  'speaker.wave.2.fill': 'volume-up',
  'speaker.slash.fill': 'volume-off',
  'airplayaudio': 'cast',
  'list.bullet': 'queue-music',
  'ellipsis': 'more-horiz',
  'heart': 'favorite-outline',
  'heart.fill': 'favorite',
  'timer': 'timer',
  'waveform': 'equalizer',
  
  // UI elements
  'chevron.down': 'keyboard-arrow-down',
  'chevron.up': 'keyboard-arrow-up',
  'chevron.right': 'chevron-right',
  'chevron.left': 'chevron-left',
  'xmark': 'close',
  'xmark.circle.fill': 'cancel',
  'arrow.down.circle': 'download',
  'arrow.down.circle.fill': 'download',
  'gear': 'settings',
  'person.circle': 'account-circle',
  'bell': 'notifications',
  'bell.fill': 'notifications',
  
  // Media types
  'music.note': 'music-note',
  'video': 'videocam',
  'photo': 'photo',
  'waveform.path': 'graphic-eq',
  
  // Actions
  'plus': 'add',
  'minus': 'remove',
  'checkmark': 'check',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'square.and.arrow.up': 'share',
  
  // Playback states
  'pip': 'picture-in-picture-alt',
  'pip.fill': 'picture-in-picture-alt',
  'rectangle.on.rectangle': 'picture-in-picture',
  'captions.bubble': 'closed-caption',
  'captions.bubble.fill': 'closed-caption',
  'gauge.with.needle': 'speed',
  
  // Library
  'clock': 'access-time',
  'clock.fill': 'access-time',
  'star': 'star-outline',
  'star.fill': 'star',
};

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: string;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  const mapping = MAPPING[name];
  
  if (!mapping) {
    // Fallback to a default icon if not mapped
    return <MaterialIcons color={color} size={size} name="help-outline" style={style} />;
  }
  
  if (typeof mapping === 'object' && 'ionicon' in mapping) {
    return <Ionicons color={color as string} size={size} name={mapping.ionicon} style={style} />;
  }
  
  return <MaterialIcons color={color} size={size} name={mapping as any} style={style} />;
}
