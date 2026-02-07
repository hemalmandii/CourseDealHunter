import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Dimensions, TouchableOpacity, Linking, AppState, Alert } from 'react-native';
import { OneSignal } from 'react-native-onesignal';

import { CustomHeader } from '../../src/components/CustomHeader';
import { getUserStats } from '../../src/services/api';
import { getDeviceId } from '../../src/utils/storage';

import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { getRankForXP, getNextRank } from '../../src/utils/ranks';
import { RankLadderModal } from '../../src/components/RankLadderModal';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
    const [stats, setStats] = useState<any>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [deviceName, setDeviceName] = useState('Deal Hunter');
    const [modalVisible, setModalVisible] = useState(false);
    const [isPushEnabled, setIsPushEnabled] = useState(false);

    // Check notification status
    const checkNotificationStatus = async () => {
        if (OneSignal) {
            const hasPermission = OneSignal.Notifications.hasPermission();
            setIsPushEnabled(hasPermission);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadStats();
            checkNotificationStatus();

            // Re-check when app comes to foreground (in case user changed settings)
            const subscription = AppState.addEventListener('change', nextAppState => {
                if (nextAppState === 'active') {
                    checkNotificationStatus();
                }
            });

            return () => {
                subscription.remove();
            };
        }, [])
    );



    // Default stats if null
    const displayStats = stats || { total_votes: 0, total_saved: 0, xp: 0, level: 1 };

    const loadStats = async () => {
        const deviceId = await getDeviceId();
        const data = await getUserStats(deviceId);
        setStats(data);
        setRefreshing(false);

        // Use device name if available
        const name = Constants.deviceName || 'Deal Hunter';
        setDeviceName(name);
    };

    useFocusEffect(
        useCallback(() => {
            // loadStats is called in the expanded hook above
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        loadStats();
        checkNotificationStatus();
    };

    const handleNotificationToggle = () => {
        if (isPushEnabled) {
            Alert.alert(
                'Notifications Active',
                'To disable notifications, please go to your device settings.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Open Settings', onPress: () => Linking.openSettings() }
                ]
            );
        } else {
            // Try to request first, if that fails/returns false, open settings
            if (OneSignal) {
                OneSignal.Notifications.requestPermission(true).then((response) => {
                    setIsPushEnabled(response);
                    if (!response) {
                        Alert.alert(
                            'Enable Notifications',
                            'To receive deal alerts, please enable notifications in your device settings.',
                            [
                                { text: 'Cancel', style: 'cancel' },
                                { text: 'Open Settings', onPress: () => Linking.openSettings() }
                            ]
                        );
                    }
                });
            }
        }
    };



    // Leveling Logic Helpers (Hyper-Growth: Level 2 @ 40 XP)
    const getLevelGoal = (level: number) => 20 * level * (level + 1);
    const getLevelStartXP = (level: number) => level === 1 ? 0 : 20 * (level - 1) * level;

    const currentLevel = displayStats.level || 1;
    const currentXP = displayStats.xp || 0;
    const startXP = getLevelStartXP(currentLevel);
    const goalXP = getLevelGoal(currentLevel);
    const progress = Math.min(1, Math.max(0, (currentXP - startXP) / (goalXP - startXP)));

    // Rank Logic
    const currentRank = getRankForXP(currentXP);
    const nextRank = getNextRank(currentXP);
    const xpToNextRank = nextRank ? nextRank.minXP - currentXP : 0;

    return (
        <View style={styles.container}>
            <CustomHeader title="My Profile" />
            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {/* Avatar / Level / Title */}
                <View style={styles.headerCard}>
                    <View style={styles.avatar}>
                        <Ionicons name="person" size={40} color="#111" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <TouchableOpacity onPress={() => setModalVisible(true)}>
                            <View style={styles.titleBadge}>
                                <Text style={styles.titleBadgeText}>{currentRank.title}</Text>
                                <Ionicons name="information-circle" size={10} color="#FFF4CC" style={{ marginLeft: 4 }} />
                            </View>
                        </TouchableOpacity>

                        {/* Rank Teaser Text */}
                        {nextRank ? (
                            <Text style={styles.rankTeaser}>
                                {xpToNextRank} XP to {nextRank.title}
                            </Text>
                        ) : (
                            <Text style={styles.rankTeaser}>Max Rank</Text>
                        )}

                        <Text style={styles.username}>{deviceName}</Text>
                        <View style={styles.levelRow}>
                            <Text style={styles.levelLabel}>Level {displayStats.level}</Text>
                            <Text style={styles.xpText}>{displayStats.xp} / {goalXP} XP</Text>
                        </View>

                        {/* Progress Bar */}
                        <View style={styles.progressBarContainer}>
                            <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
                        </View>
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
                    <Text style={[styles.infoText, { marginTop: 16, fontWeight: 'bold' }]}>v1.3.1 (Loot Legend Update)</Text>

                    <View style={{ height: 1, backgroundColor: '#EEE', marginVertical: 20 }} />

                    <TouchableOpacity onPress={handleNotificationToggle} style={styles.settingRow}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={[styles.iconContainer, { backgroundColor: isPushEnabled ? '#E6FFFA' : '#FFF5F5' }]}>
                                <Ionicons name={isPushEnabled ? "notifications" : "notifications-off"} size={20} color={isPushEnabled ? "#10B981" : "#EF4444"} />
                            </View>
                            <View style={{ marginLeft: 12 }}>
                                <Text style={styles.settingLabel}>Notifications</Text>
                                <Text style={styles.settingSubtext}>{isPushEnabled ? 'Active' : 'Disabled'}</Text>
                            </View>
                        </View>
                        <Ionicons name={isPushEnabled ? "checkmark-circle" : "alert-circle"} size={24} color={isPushEnabled ? "#10B981" : "#EF4444"} />
                    </TouchableOpacity>




                </View>

            </ScrollView>

            <RankLadderModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                currentXP={currentXP}
            />
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
        backgroundColor: '#FFF4CC',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 24,
        marginBottom: 20,
        borderWidth: 2,
        borderColor: '#111',
        shadowColor: '#111',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
    },
    avatar: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        borderWidth: 2,
        borderColor: '#111',
    },
    titleBadge: {
        backgroundColor: '#111',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        alignSelf: 'flex-start',
        marginBottom: 4,
        flexDirection: 'row',
        alignItems: 'center',
    },
    titleBadgeText: {
        color: '#FFF4CC',
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    rankTeaser: {
        fontSize: 10,
        color: '#666',
        fontWeight: '600',
        marginBottom: 4,
        fontStyle: 'italic',
    },
    username: {
        fontSize: 22,
        fontWeight: '900',
        color: '#111',
        marginBottom: 8,
    },
    levelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 4,
    },
    levelLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#111',
    },
    xpText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#666',
    },
    progressBarContainer: {
        height: 12,
        backgroundColor: 'rgba(0,0,0,0.1)',
        borderRadius: 6,
        overflow: 'hidden',
        borderWidth: 1.5,
        borderColor: '#111',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#A435F0',
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
        borderRadius: 20,
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
        borderRadius: 20,
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
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F8F9FA',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    settingLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1F2937',
    },
    settingSubtext: {
        fontSize: 12,
        color: '#6B7280',
    },
});
