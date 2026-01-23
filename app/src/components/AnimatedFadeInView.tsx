import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle, StyleProp } from 'react-native';

interface AnimatedFadeInViewProps {
    index?: number;
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    delay?: number;
    duration?: number;
}

export function AnimatedFadeInView({
    children,
    style,
    index = 0,
    delay = 0,
    duration = 500
}: AnimatedFadeInViewProps) {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        const animationDelay = index * 100 + delay; // Stagger by 100ms per item

        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 1,
                duration: duration,
                delay: animationDelay,
                useNativeDriver: true,
            }),
            Animated.spring(translateY, {
                toValue: 0,
                delay: animationDelay,
                useNativeDriver: true,
                speed: 12,
                bounciness: 2,
            }),
        ]).start();
    }, [index, delay]);

    return (
        <Animated.View style={[style, { opacity, transform: [{ translateY }] }]}>
            {children}
        </Animated.View>
    );
}
