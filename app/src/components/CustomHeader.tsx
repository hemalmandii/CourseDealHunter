import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

interface CustomHeaderProps {
    title: string;
    showBack?: boolean;
    rightAction?: React.ReactNode;
}

export function CustomHeader({ title, showBack, rightAction }: CustomHeaderProps) {
    const router = useRouter();
    const { colors, isDark, toggleTheme } = useTheme();

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
            <View style={[styles.container, { backgroundColor: colors.card }]}>
                <View style={styles.leftContainer}>
                    {showBack && (
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <Text style={[styles.backText, { color: colors.text }]}>←</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{title}</Text>

                <View style={styles.rightContainer}>
                    {rightAction && rightAction}
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        borderBottomWidth: 2,
        paddingTop: Platform.OS === 'android' ? 35 : 0,
        elevation: 4,
        zIndex: 100,
    },
    container: {
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },
    leftContainer: {
        width: 40,
        alignItems: 'flex-start',
    },
    rightContainer: {
        width: 40,
        alignItems: 'flex-end',
    },
    title: {
        fontSize: 20,
        fontWeight: '900',
        flex: 1,
        textAlign: 'center',
    },
    backButton: {
        padding: 8,
    },
    backText: {
        fontSize: 24,
        fontWeight: '900',
    },
    iconButton: {
        padding: 8,
    }
});
