import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, Image, TouchableOpacity, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../src/context/ThemeContext';
import { AnimatedScaleButton } from '../src/components/AnimatedScaleButton';
import { initializeOneSignal } from '../src/services/notifications';

const { width, height } = Dimensions.get('window');

const SLIDES = [
    {
        key: '1',
        title: 'Discover Deals',
        description: 'Find the best free and discounted courses from across the web. We hunt them so you don\'t have to.',
        image: require('../assets/w1.webp'),
    },
    {
        key: '2',
        title: 'Track Favorites',
        description: 'Save deals you like and get notified when similar ones pop up. Never miss a limited-time offer.',
        image: require('../assets/w2.webp'),
    },
    {
        key: '3',
        title: 'Level Up',
        description: 'Learn new skills without breaking the bank. Your journey to mastery starts here.',
        image: require('../assets/w3.webp'),
    },
    {
        key: '4',
        title: 'Stay Alert',
        description: 'Enable notifications to catch limited-time free courses before they expire!',
        image: require('../assets/icon.png'), // Using app icon as placeholder for notification slide
    },
];

export default function WalkthroughScreen() {
    const router = useRouter();
    const { colors } = useTheme();
    const scrollX = useRef(new Animated.Value(0)).current;

    // Floating animation for images
    const floatAnim = useRef(new Animated.Value(0)).current;

    // Button pulse animation
    const buttonScale = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Continuous floating effect
        Animated.loop(
            Animated.sequence([
                Animated.timing(floatAnim, {
                    toValue: 1,
                    duration: 2000,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
                Animated.timing(floatAnim, {
                    toValue: 0,
                    duration: 2000,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Button pulse effect
        Animated.loop(
            Animated.sequence([
                Animated.timing(buttonScale, {
                    toValue: 1.05,
                    duration: 800,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(buttonScale, {
                    toValue: 1,
                    duration: 800,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const handleComplete = async () => {
        // Initialize notifications AND PROMPT before finishing onboarding
        initializeOneSignal(true);
        await AsyncStorage.setItem('hasSeenWalkthrough_v2', 'true');
        router.replace('/(tabs)');
    };

    const RenderItem = ({ item, index }: { item: typeof SLIDES[0], index: number }) => {
        const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width,
        ];

        const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.6, 1, 0.6],
            extrapolate: 'clamp',
        });

        const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0, 1, 0],
            extrapolate: 'clamp',
        });

        const translateY = scrollX.interpolate({
            inputRange,
            outputRange: [50, 0, 50],
            extrapolate: 'clamp',
        });

        // Text parallax effect (moves slower than image)
        const textTranslateX = scrollX.interpolate({
            inputRange,
            outputRange: [width * 0.3, 0, -width * 0.3],
            extrapolate: 'clamp',
        });

        const floatTranslateY = floatAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -15],
        });

        return (
            <View style={[styles.slide, { backgroundColor: colors.background }]}>
                <Animated.View
                    style={[
                        styles.imageContainer,
                        {
                            transform: [
                                { scale },
                                { translateY: floatTranslateY }
                            ],
                            opacity
                        }
                    ]}
                >
                    <Image source={item.image} style={styles.image} resizeMode="contain" />
                </Animated.View>

                <Animated.View
                    style={[
                        styles.textContainer,
                        {
                            opacity,
                            transform: [
                                { translateY },
                                { translateX: textTranslateX }
                            ]
                        }
                    ]}
                >
                    <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
                    <Text style={[styles.description, { color: colors.textSecondary }]}>{item.description}</Text>
                </Animated.View>
            </View>
        );
    };

    const Pagination = () => {
        return (
            <View style={styles.paginationContainer}>
                {SLIDES.map((_, index) => {
                    const inputRange = [
                        (index - 1) * width,
                        index * width,
                        (index + 1) * width,
                    ];

                    const widthVal = scrollX.interpolate({
                        inputRange,
                        outputRange: [8, 24, 8],
                        extrapolate: 'clamp',
                    });

                    const opacity = scrollX.interpolate({
                        inputRange,
                        outputRange: [0.3, 1, 0.3],
                        extrapolate: 'clamp',
                    });

                    const scaleVal = scrollX.interpolate({
                        inputRange,
                        outputRange: [1, 1.2, 1],
                        extrapolate: 'clamp',
                    });

                    return (
                        <Animated.View
                            key={index}
                            style={[
                                styles.dot,
                                {
                                    width: widthVal,
                                    opacity,
                                    backgroundColor: colors.primary,
                                    transform: [{ scaleY: scaleVal }]
                                }
                            ]}
                        />
                    );
                })}
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Animated.FlatList
                data={SLIDES}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.key}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                    { useNativeDriver: false }
                )}
                scrollEventThrottle={16}
                renderItem={({ item, index }) => <RenderItem item={item} index={index} />}
            />

            <Pagination />

            <View style={styles.footer}>
                <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                    <AnimatedScaleButton
                        scaleTo={0.95}
                        useHaptics
                        style={[styles.button, { backgroundColor: colors.primary }]}
                        onPress={handleComplete}
                    >
                        <Text style={styles.buttonText}>Get Started</Text>
                    </AnimatedScaleButton>
                </Animated.View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    slide: {
        width,
        height,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    imageContainer: {
        width: width * 0.75,
        height: width * 0.75,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
        // Fancy Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 15 },
        shadowOpacity: 0.15,
        shadowRadius: 25,
        elevation: 15,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    textContainer: {
        alignItems: 'center',
        paddingHorizontal: 30,
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        marginBottom: 16,
        textAlign: 'center',
        letterSpacing: -0.5,
    },
    description: {
        fontSize: 17,
        textAlign: 'center',
        lineHeight: 26,
        opacity: 0.8,
    },
    paginationContainer: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: 140,
        alignSelf: 'center',
    },
    dot: {
        height: 8,
        borderRadius: 4,
        marginHorizontal: 5,
    },
    footer: {
        position: 'absolute',
        bottom: 60,
        left: 0,
        right: 0,
        paddingHorizontal: 30,
    },
    button: {
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 8,
    },
    buttonText: {
        color: 'white',
        fontSize: 19,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
});
