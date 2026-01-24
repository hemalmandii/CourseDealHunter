import React, { useEffect, useState } from 'react';
import { Stack, useRouter, Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider, useTheme } from '../src/context/ThemeContext';
import { View, ActivityIndicator } from 'react-native';
import { initializeOneSignal, setOneSignalExternalUserId } from '../src/services/notifications';
import { getDeviceId } from '../src/utils/storage';

// Initialize OneSignal on app start
initializeOneSignal();


function RootLayoutNav() {
    const { isDark, colors } = useTheme();
    const router = useRouter();
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        console.log('[Layout] Mounting RootLayoutNav');
        // Check onboarding status and set up OneSignal user ID
        AsyncStorage.getItem('hasSeenWalkthrough').then(async (value) => {
            console.log('[Layout] AsyncStorage hasSeenWalkthrough:', value);

            // Set up OneSignal external user ID for targeting
            const deviceId = await getDeviceId();
            setOneSignalExternalUserId(deviceId);

            if (value !== 'true') {
                console.log('[Layout] Redirecting to /walkthrough');
                setTimeout(() => {
                    router.replace('/walkthrough');
                }, 100);
            } else {
                console.log('[Layout] Staying on (tabs)');
            }
            setIsReady(true);
        }).catch(err => {
            console.error('[Layout] AsyncStorage Error:', err);
            setIsReady(true);
        });
    }, []);

    if (!isReady) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <>
            <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={colors.background} />
            <Stack
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: colors.background },
                    animation: 'fade', // AAA Polish
                }}
            >
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="deal/[id]" options={{ title: 'Deal Details', presentation: 'card' }} />
                <Stack.Screen name="walkthrough" options={{ headerShown: false, gestureEnabled: false, animation: 'fade' }} />
            </Stack>
        </>
    );
}

export default function Layout() {
    return (
        <ThemeProvider>
            <RootLayoutNav />
        </ThemeProvider>
    );
}
