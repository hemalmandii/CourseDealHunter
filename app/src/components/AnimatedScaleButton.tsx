import React, { useRef } from 'react';
import { TouchableOpacity, Animated, TouchableOpacityProps, StyleProp, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';

interface AnimatedScaleButtonProps extends TouchableOpacityProps {
    scaleTo?: number;
    friction?: number;
    tension?: number;
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    useHaptics?: boolean;
}

export function AnimatedScaleButton({
    children,
    style,
    scaleTo = 0.95,
    onPress,
    onPressIn,
    onPressOut,
    useHaptics = false,
    ...props
}: AnimatedScaleButtonProps) {
    const scaleValue = useRef(new Animated.Value(1)).current;

    const handlePressIn = (e: any) => {
        if (useHaptics) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        Animated.spring(scaleValue, {
            toValue: scaleTo,
            useNativeDriver: true,
            speed: 50,
            bounciness: 10,
        }).start();
        onPressIn && onPressIn(e);
    };

    const handlePressOut = (e: any) => {
        Animated.spring(scaleValue, {
            toValue: 1,
            useNativeDriver: true,
            speed: 50,
            bounciness: 10,
        }).start();
        onPressOut && onPressOut(e);
    };

    return (
        <TouchableOpacity
            activeOpacity={1}
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={style}
            {...props}
        >
            <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
                {children}
            </Animated.View>
        </TouchableOpacity>
    );
}
