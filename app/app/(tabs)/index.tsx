import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, ActivityIndicator, StyleSheet, Text, RefreshControl, TouchableOpacity } from 'react-native';
import { fetchDeals } from '../../src/services/api';
import { CourseCard } from '../../src/components/CourseCard';
import { CustomHeader } from '../../src/components/CustomHeader';
import { AnimatedFadeInView } from '../../src/components/AnimatedFadeInView';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { getDeviceId } from '../../src/utils/storage';

export default function FeedScreen() {
    const [deals, setDeals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();

    const loadDeals = useCallback(async (reset = false) => {
        if (reset) {
            setLoading(true);
        }

        const currentOffset = reset ? 0 : offset;
        const limit = 10;

        try {
            const deviceId = await getDeviceId();
            console.log('[Feed] Fetching with deviceId:', deviceId);
            const newDeals = await fetchDeals(currentOffset, limit, deviceId);

            if (reset) {
                setDeals(newDeals);
                setOffset(limit);
            } else {
                setDeals(prev => [...prev, ...newDeals]);
                setOffset(prev => prev + limit);
            }

            // Hard Limit 10: Always set hasMore to false
            setHasMore(false);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [offset]);

    useEffect(() => {
        loadDeals(true);
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        loadDeals(true);
    };

    const onEndReached = () => {
        if (!loading && hasMore) {
            loadDeals(false);
        }
    };

    const renderFooter = () => {
        if (!loading) return null;
        return (
            <View style={styles.footer}>
                <ActivityIndicator size="small" color="#0000ff" />
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <CustomHeader
                title="SkillLoot"
                rightAction={
                    <TouchableOpacity onPress={() => router.push('/(tabs)/explore')}>
                        <Ionicons name="search" size={24} color="#111" />
                    </TouchableOpacity>
                }
            />
            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#111" />
                </View>
            ) : (
                <FlatList
                    data={deals}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item, index }) => (
                        <AnimatedFadeInView index={index}>
                            <CourseCard
                                deal={item}
                                initialIsSaved={item.is_saved}
                            />
                        </AnimatedFadeInView>
                    )}
                    onRefresh={onRefresh}
                    refreshing={refreshing}
                    onEndReached={null}
                    onEndReachedThreshold={null}
                    ListFooterComponent={renderFooter}
                    ListEmptyComponent={!loading ? <Text style={styles.empty}>No deals found</Text> : null}
                    contentContainerStyle={{ paddingTop: 16 }}
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
    footer: {
        paddingVertical: 20,
    },
    empty: {
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
        color: '#666',
    },
});
