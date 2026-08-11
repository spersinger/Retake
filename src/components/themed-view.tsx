import { Platform, View, type ViewProps, type ViewStyle } from 'react-native';
import { GlassView } from 'expo-glass-effect';

import { ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  type?: ThemeColor;
};

export function ThemedView({ style, lightColor, darkColor, type, ...otherProps }: ThemedViewProps) {
  const theme = useTheme();
  const isGlass = type === 'backgroundElement' || type === 'backgroundSelected';

  const glassBorder: ViewStyle = isGlass ? {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
  } : {};

  if (isGlass && Platform.OS === 'ios') {
    return (
      <GlassView
        glassEffectStyle="regular"
        tintColor={theme[type]}
        style={[glassBorder, style]}
        {...otherProps}
      />
    );
  }

  const bgColor = isGlass && Platform.OS === 'web'
    ? theme[type!]
    : theme[type ?? 'background'];

  const webBlur = isGlass && Platform.OS === 'web' ? {
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
  } as ViewStyle : {};

  return (
    <View
      style={[{ backgroundColor: bgColor }, glassBorder, webBlur, style]}
      {...otherProps}
    />
  );
}
