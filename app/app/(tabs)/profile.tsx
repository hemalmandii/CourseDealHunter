import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { CustomHeader } from '../../src/components/CustomHeader';
import { getUserStats } from '../../src/services/api';
import { getDeviceId } from '../../src/utils/storage';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
    const [stats, setStats] = useState<any>(null);
    const [refreshing, setRefreshing] = useState(false);

    // Default stats if null
    const displayStats = stats || { total_votes: 0, total_saved: 0, xp: 0, level: 1 };

    const loadStats = async () => {
        const deviceId = await getDeviceId();
        const data = await getUserStats(deviceId);
        setStats(data);
        setRefreshing(false);
    };

    useFocusEffect(
        useCallback(() => {
            loadStats();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        loadStats();
    };

    return (
        <View style={styles.container}>
            <CustomHeader title="My Profile" />
            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {/* Avatar / Level */}
                <View style={styles.headerCard}>
                    <View style={styles.avatar}>
                        <Ionicons name="person" size={40} color="#111" />
                    </View>
                    <View>
                        <Text style={styles.levelLabel}>Level {displayStats.level}</Text>
                        <Text style={styles.username}>Deal Hunter</Text>
                        <Text style={styles.xp}>{displayStats.xp} XP</Text>
                    </View>
                </View>

                {/* Stats Grid */}
                <View style={styles.grid}>
                    <View style={styles.statCard}>
                        <Ionicons name="heart" size={32} color="#F59E0B" />
                        <Text style={styles.statValue}>{displayStats.total_saved}</Text>
                        <Text style={styles.statLabel}>Saved Deals</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Ionicons name="checkmark-circle" size={32} color="#10B981" />
                        <Text style={styles.statValue}>{displayStats.total_votes}</Text>
                        <Text style={styles.statLabel}>Votes Cast</Text>
                    </View>
                </View>

                {/* Settings / Info */}
                <View style={styles.infoCard}>
                    <Text style={styles.infoTitle}>About</Text>
                    <Text style={styles.infoText}>SkillLoot finds free Udemy courses from around the web. Vote to keep the community updated!</Text>
                    <Text style={[styles.infoText, { marginTop: 16, fontWeight: 'bold' }]}>v1.2.0 (AAA Edition)</Text>
                </View>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0F4F8',
    },
    content: {
        padding: 16,
    },
    headerCard: {
        backgroundColor: '#FFF4CC', // Pastel Yellow
        flexDirection: 'row',
        alignItems: 'center',
        padding: 24,
        borderRadius: 20,
        marginBottom: 20,
        borderWidth: 2,
        borderColor: '#111',
        shadowColor: '#111',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 20,
        borderWidth: 2,
        borderColor: '#111',
    },
    levelLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#666',
        textTransform: 'uppercase',
    },
    username: {
        fontSize: 24,
        fontWeight: '900',
        color: '#111',
        marginBottom: 4,
    },
    xp: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#A435F0', // Brand color
    },
    grid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    statCard: {
        backgroundColor: 'white',
        width: '48%',
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#111',
        shadowColor: '#111',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
    },
    statValue: {
        fontSize: 32,
        fontWeight: '900',
        color: '#111',
        marginVertical: 8,
    },
    statLabel: {
        fontSize: 14,
        color: '#666',
        fontWeight: '600',
    },
    infoCard: {
        backgroundColor: 'white',
        padding: 24,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#111',
    },
    infoTitle: {
        fontSize: 20,
        fontWeight: '900',
        marginBottom: 12,
        color: '#111',
    },
    infoText: {
        fontSize: 16,
        color: '#444',
        lineHeight: 24,
    },
});
