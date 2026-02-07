import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Badge } from './Badge';
import { Ionicons } from '@expo/vector-icons';
import { toggleSaveDeal } from '../services/api';
import { getDeviceId } from '../utils/storage';
import { useTheme } from '../context/ThemeContext';
import { AnimatedScaleButton } from './AnimatedScaleButton';
import { LinearGradient } from 'expo-linear-gradient';

const FALLBACK_IMAGES = [
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop', // Tech
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=800&auto=format&fit=crop', // Code
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop', // Business
    'https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=800&auto=format&fit=crop', // Design
];

const getFallbackImage = (title: string) => {
    const hash = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return FALLBACK_IMAGES[hash % FALLBACK_IMAGES.length];
};

interface Deal {
    id: string;
    title: string;
    thumbnail_url?: string;
    rating_value?: number;
    review_count?: number;
    duration_text?: string;
    badge?: 'Verified Free' | 'Likely Expired' | 'Unverified';
    is_saved?: boolean;
}

interface CourseCardProps {
    deal: Deal;
    initialIsSaved?: boolean;
    onToggleSave?: (newState: boolean) => void;
}

export function CourseCard({ deal, initialIsSaved = false, onToggleSave }: CourseCardProps) {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const [isSaved, setIsSaved] = useState(initialIsSaved);

    // Sync local state if initialIsSaved changes (e.g. after a refreshing the feed)
    useEffect(() => {
        setIsSaved(initialIsSaved);
    }, [initialIsSaved]);

    const handleNavigation = () => {
        router.push(`/deal/${deal.id}`);
    };

    const handleToggleSave = async () => {
        const newState = !isSaved;
        setIsSaved(newState);
        if (onToggleSave) onToggleSave(newState);

        try {
            const deviceId = await getDeviceId();
            console.log('[Component] Toggling save for:', deal.id);
            await toggleSaveDeal(deal.id, deviceId);
        } catch (e) {
            console.error('Failed to toggle save', e);
            setIsSaved(!newState);
            if (onToggleSave) onToggleSave(!newState);
        }
    };

    return (
        <View style={styles.cardContainer}>
            <AnimatedScaleButton
                scaleTo={0.97}
                onPress={handleNavigation}
                style={[
                    styles.card,
                    {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                        shadowColor: colors.shadow
                    }
                ]}
            >
                <View style={[styles.thumbnailContainer, { borderBottomColor: colors.border }]}>
                    <Image
                        source={{ uri: deal.thumbnail_url?.includes('placeholder') ? getFallbackImage(deal.title) : (deal.thumbnail_url || getFallbackImage(deal.title)) }}
                        style={styles.thumbnailImage}
                        defaultSource={{ uri: getFallbackImage(deal.title) }}
                    />
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.4)']}
                        style={StyleSheet.absoluteFill}
                    />
                </View>

                <View style={styles.content}>
                    <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>{deal.title}</Text>
                    <View style={styles.metaRow}>
                        <View style={[styles.ratingContainer, { backgroundColor: isDark ? '#374151' : '#FFF4CC', borderColor: colors.border }]}>
                            <Text style={[styles.ratingText, { color: isDark ? '#FBBF24' : '#B45309' }]}>
                                ★ {deal.rating_value && deal.rating_value > 0 ? deal.rating_value.toFixed(1) : 'New'}
                            </Text>
                            {deal.review_count !== undefined && deal.review_count > 0 && (
                                <Text style={[styles.reviewText, { color: isDark ? '#9CA3AF' : '#92400E' }]}>
                                    ({deal.review_count})
                                </Text>
                            )}
                        </View>
                        {deal.duration_text && (
                            <View style={[styles.durationContainer, { backgroundColor: isDark ? '#1F2937' : '#E0F2FE', borderColor: colors.border }]}>
                                <Ionicons name="time-outline" size={14} color={colors.text} style={{ marginRight: 4 }} />
                                <Text style={[styles.durationText, { color: colors.text }]}>{deal.duration_text}</Text>
                            </View>
                        )}
                    </View>
                    <View style={{ marginTop: 12 }}>
                        <Badge type={deal.badge || 'Unverified'} />
                    </View>
                </View>
            </AnimatedScaleButton>

            {/* Heart Button Outside Navigation */}
            <AnimatedScaleButton
                scaleTo={0.8}
                useHaptics
                style={[
                    styles.heartContainer,
                    {
                        backgroundColor: isDark ? 'rgba(31, 41, 55, 0.9)' : 'rgba(255,255,255,0.9)',
                        borderColor: colors.border
                    },
                    isSaved && { backgroundColor: colors.primary, borderColor: colors.primary }
                ]}
                onPress={handleToggleSave}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <Ionicons
                    name={isSaved ? "heart" : "heart-outline"}
                    size={24}
                    color={isSaved ? "white" : colors.text}
                />
            </AnimatedScaleButton>
        </View>
    );
}

const styles = StyleSheet.create({
    cardContainer: {
        marginBottom: 16,
        marginHorizontal: 16,
        position: 'relative',
    },
    card: {
        borderRadius: 16,
        borderWidth: 2,
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
        overflow: 'hidden',
    },
    thumbnailContainer: {
        width: '100%',
        height: 180,
        borderBottomWidth: 2,
        borderTopLeftRadius: 14,
        borderTopRightRadius: 14,
        overflow: 'hidden',
    },
    thumbnailImage: {
        width: '100%',
        height: '100%',
    },
    heartContainer: {
        position: 'absolute',
        top: 10,
        right: 10,
        borderRadius: 20,
        padding: 6,
        borderWidth: 2,
        zIndex: 100,
        elevation: 10,
    },
    content: {
        padding: 16,
        marginLeft: 0,
    },
    title: {
        fontSize: 18,
        fontWeight: '900',
        marginBottom: 8,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
        borderWidth: 1.5,
    },
    ratingText: {
        fontSize: 14,
        fontWeight: '900',
    },
    reviewText: {
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 4,
    },
    durationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
        borderWidth: 1.5,
    },
    durationText: {
        fontSize: 12,
        fontWeight: '700',
    },
});
