import React, { useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Badge } from './Badge';
import { Ionicons } from '@expo/vector-icons';
import { toggleSaveDeal } from '../services/api';
import { getDeviceId } from '../utils/storage';
import { useTheme } from '../context/ThemeContext';
import { AnimatedScaleButton } from './AnimatedScaleButton';

interface Deal {
    id: string;
    title: string;
    thumbnail_url?: string;
    rating_value?: number;
    review_count?: number;
    duration_text?: string;
    badge?: 'Verified Free' | 'Likely Expired' | 'Unverified';
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
                        source={{ uri: deal.thumbnail_url || 'https://via.placeholder.com/300' }}
                        style={styles.thumbnailImage}
                    />
                </View>

                <View style={styles.content}>
                    <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>{deal.title}</Text>
                    <View style={styles.metaRow}>
                        <Text style={[styles.rating, { color: colors.text, borderColor: colors.border }]}>★ {deal.rating_value?.toFixed(1) || '0.0'} ({deal.review_count || 0})</Text>
                        {deal.duration_text && <Text style={[styles.duration, { color: colors.text, borderColor: colors.border }]}>{deal.duration_text}</Text>}
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
    rating: {
        fontSize: 14,
        fontWeight: 'bold',
        backgroundColor: '#FFF4CC',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
        overflow: 'hidden',
    },
    duration: {
        fontSize: 12,
        fontWeight: '600',
        backgroundColor: '#E0F2FE',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
        overflow: 'hidden',
    },
});
