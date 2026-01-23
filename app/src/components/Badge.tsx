import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface BadgeProps {
    type: 'Verified Free' | 'Likely Expired' | 'Unverified';
    lastUpdated?: string;
}

export function Badge({ type, lastUpdated }: BadgeProps) {
    let backgroundColor = '#e0e0e0';
    let textColor = '#555';
    let label = type;

    if (type === 'Verified Free') {
        backgroundColor = '#e6fffa';
        textColor = '#047857'; // Green
    } else if (type === 'Likely Expired') {
        backgroundColor = '#fff5f5';
        textColor = '#c53030'; // Red
    }

    return (
        <View style={[styles.container, { backgroundColor }]}>
            <Text style={[styles.text, { color: textColor }]}>
                {label}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        alignSelf: 'flex-start',
        marginTop: 4,
    },
    text: {
        fontSize: 12,
        fontWeight: 'bold',
    },
});
