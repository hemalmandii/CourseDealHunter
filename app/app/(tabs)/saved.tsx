import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, ActivityIndicator, StyleSheet, Text, RefreshControl } from 'react-native';
import { CustomHeader } from '../../src/components/CustomHeader';
import { CourseCard } from '../../src/components/CourseCard';
import { fetchSavedDeals } from '../../src/services/api';
import { getDeviceId } from '../../src/utils/storage';
import { useFocusEffect } from 'expo-router';

export default function SavedScreen() {
    const [deals, setDeals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadSaved = async () => {
        setLoading(true);
        const deviceId = await getDeviceId();
        const data = await fetchSavedDeals(deviceId);
        setDeals(data || []);
        setLoading(false);
        setRefreshing(false);
    };

    useFocusEffect(
        useCallback(() => {
            loadSaved();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        loadSaved();
    };

    return (
        <View style={styles.container}>
            <CustomHeader title="Saved Deals" />

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#111" />
                </View>
            ) : (
                <FlatList
                    data={deals}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <CourseCard
                            deal={item}
                            initialIsSaved={true}
                            onToggleSave={(newState) => {
                                if (!newState) {
                                    // Remove from list after a small delay for animation
                                    setTimeout(() => {
                                        setDeals(prev => prev.filter(d => d.id !== item.id));
                                    }, 300);
                                }
                            }}
                        />
                    )}
                    onRefresh={onRefresh}
                    refreshing={refreshing}
                    contentContainerStyle={{ paddingTop: 16 }}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyTitle}>No saved deals yet</Text>
                            <Text style={styles.emptyText}>Tap the heart icon on any deal to save it for later!</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0F4F8',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        padding: 40,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '900',
        marginBottom: 8,
        color: '#111',
    },
    emptyText: {
        textAlign: 'center',
        color: '#666',
        fontSize: 16,
        lineHeight: 24,
    },
});
