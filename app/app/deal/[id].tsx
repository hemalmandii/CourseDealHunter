import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { fetchDeal, submitVote } from '../../src/services/api';
import { getDeviceId } from '../../src/utils/storage';
import { Badge } from '../../src/components/Badge';
import { VoteBottomSheet } from '../../src/components/VoteBottomSheet';
import { CustomHeader } from '../../src/components/CustomHeader';

export default function DealDetailScreen() {
    const { id } = useLocalSearchParams();
    const [deal, setDeal] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [votingVisible, setVotingVisible] = useState(false);

    useEffect(() => {
        if (id) {
            loadDeal();
        }
    }, [id]);

    const loadDeal = async () => {
        setLoading(true);
        const data = await fetchDeal(id as string);
        setDeal(data);
        setLoading(false);
    };

    const handleOpenUdemy = async () => {
        if (!deal?.udemy_url && !deal?.coursesity_detail_url) {
            Alert.alert('Error', 'No URL available');
            return;
        }

        const urlToOpen = deal.udemy_url || deal.coursesity_detail_url;

        try {
            await WebBrowser.openBrowserAsync(urlToOpen);
            // On return (app state active), we could trigger this, but simpler:
            // Just show the sheet after a short delay or immediately assuming they will come back
            // Since WebBrowser.openBrowserAsync awaits until close on iOS? No, on Android/iOS it might behave differently.
            // Actually openBrowserAsync resolves when browser closes on iOS, but on Android it resolves immediately usually (Custom Tabs).
            // Let's set the modal to visible.
            setTimeout(() => {
                setVotingVisible(true);
            }, 1000);
        } catch (e) {
            console.error(e);
        }
    };

    const handleVote = async (vote: 'free' | 'expired') => {
        setVotingVisible(false);
        try {
            const deviceId = await getDeviceId();
            await submitVote(deal.id, deviceId, vote);
            Alert.alert('Thanks!', 'Your vote helps the community.');
            loadDeal(); // Refresh stats
        } catch (e: any) {
            if (e.message && e.message.includes('Already voted')) {
                Alert.alert('Already Voted', 'You have already voted on this deal today.');
            } else {
                Alert.alert('Error', 'Failed to submit vote.');
            }
        }
    };

    if (loading) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (!deal) {
        return (
            <View style={styles.loading}>
                <Text>Deal not found</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <CustomHeader title="Deal Details" showBack />
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Image
                    source={{ uri: deal.thumbnail_url || 'https://via.placeholder.com/300' }}
                    style={styles.image}
                />
                <View style={styles.content}>
                    <Text style={styles.title}>{deal.title}</Text>

                    <View style={styles.statsRow}>
                        <View style={styles.stat}>
                            <Text style={styles.statLabel}>Rating</Text>
                            <Text style={styles.statValue}>★ {deal.rating_value?.toFixed(1) || '-'}</Text>
                        </View>
                        <View style={styles.stat}>
                            <Text style={styles.statLabel}>Reviews</Text>
                            <Text style={styles.statValue}>{deal.review_count || '-'}</Text>
                        </View>
                        <View style={styles.stat}>
                            <Text style={styles.statLabel}>Duration</Text>
                            <Text style={styles.statValue}>{deal.duration_text || '-'}</Text>
                        </View>
                    </View>

                    <View style={styles.badgeRow}>
                        <Text style={styles.label}>Status: </Text>
                        <Badge type={deal.badge} />
                    </View>

                    {deal.description_snippet && (
                        <Text style={styles.description}>{deal.description_snippet}</Text>
                    )}
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.button} onPress={handleOpenUdemy}>
                    <Text style={styles.buttonText}>Open on Udemy</Text>
                </TouchableOpacity>
            </View>

            <VoteBottomSheet
                visible={votingVisible}
                onVote={handleVote}
                onClose={() => setVotingVisible(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0F4F8', // Match feed bg
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingBottom: 100,
        padding: 16, // Add padding around card
    },
    // Main Detail Card
    image: {
        width: '100%',
        height: 250,
        borderWidth: 2,
        borderColor: '#111',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        // Card styling for image too? Actually lets put image inside card or above.
        // Let's make the whole thing one big cardlook.
        marginBottom: 0,
    },
    content: {
        padding: 20,
        backgroundColor: 'white',
        borderWidth: 2,
        borderTopWidth: 0, // Connect with image
        borderColor: '#111',
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
        // Shadow
        shadowColor: '#111',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
        marginBottom: 16,
        color: '#111',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
        backgroundColor: '#FFF4CC', // Pastel Yellow container
        padding: 12,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#111',
    },
    stat: {
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 12,
        color: '#111',
        fontWeight: 'bold',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    statValue: {
        fontSize: 16,
        fontWeight: '900',
        color: '#111',
    },
    badgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        justifyContent: 'center',
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111',
        marginRight: 8,
    },
    description: {
        fontSize: 16,
        color: '#333',
        lineHeight: 24,
        fontFamily: 'System', // Use default sans
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        // Transparent gradient or just padding
    },
    button: {
        backgroundColor: '#A435F0', // Keep Brand Color
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#111',
        shadowColor: '#111',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '900',
    },
});
