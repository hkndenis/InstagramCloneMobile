import { Text, TextProps } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

interface ThemedTextProps extends TextProps {
  type?: 'default' | 'title' | 'defaultSemiBold' | 'link';
}

export function ThemedText({ style, type = 'default', ...props }: ThemedTextProps) {
  const colorScheme = useColorScheme();

  const textStyle = {
    color: Colors[colorScheme ?? 'light'].text,
    ...(type === 'title' && { fontSize: 24, fontWeight: 'bold' as const }),
    ...(type === 'defaultSemiBold' && { fontWeight: '600' as const }),
    ...(type === 'link' && { color: Colors[colorScheme ?? 'light'].tint }),
  };

  return <Text style={[textStyle, style]} {...props} />;
}
