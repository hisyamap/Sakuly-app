import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

interface BlinkingIconProps {
  name: string;
  size?: number;
  color?: string;
}

export default function BlinkingIcon({
  size = 20,
  name,
  color
}: BlinkingIconProps) {
  const opacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.delay(200),
        Animated.timing(opacity, {
          toValue: 0.6,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(1800),
      ])
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [opacity]);

  return (
    <Animated.View style={{ opacity }}>
      <MaterialCommunityIcons
        name={name as any}
        size={size}
        color={color as any}
      />
    </Animated.View>
  );
}