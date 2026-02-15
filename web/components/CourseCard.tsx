'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Star, Clock } from 'lucide-react';
import { Badge } from './Badge';
import { toggleSaveDeal } from '@/lib/api';
import { getDeviceId } from '@/lib/device';
import styles from './CourseCard.module.css';

const FALLBACK_IMAGES = [
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=800&auto=format&fit=crop',
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
    badge?: string;
    is_saved?: boolean;
}

interface CourseCardProps {
    deal: Deal;
    initialIsSaved?: boolean;
    onToggleSave?: (newState: boolean) => void;
    index?: number;
}

export function CourseCard({ deal, initialIsSaved = false, onToggleSave, index = 0 }: CourseCardProps) {
    const [isSaved, setIsSaved] = useState(initialIsSaved);
    const [imgSrc, setImgSrc] = useState(
        deal.thumbnail_url?.includes('placeholder') ? getFallbackImage(deal.title) : (deal.thumbnail_url || getFallbackImage(deal.title))
    );

    useEffect(() => {
        setIsSaved(initialIsSaved);
    }, [initialIsSaved]);

    const handleToggleSave = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const newState = !isSaved;
        setIsSaved(newState);
        if (onToggleSave) onToggleSave(newState);

        try {
            const deviceId = getDeviceId();
            await toggleSaveDeal(deal.id, deviceId);
        } catch {
            setIsSaved(!newState);
            if (onToggleSave) onToggleSave(!newState);
        }
    };

    const staggerClass = index < 6 ? `stagger-${index + 1}` : '';

    return (
        <div className={`${styles.wrapper} animate-fade-in-up ${staggerClass}`}>
            <Link href={`/deal/${deal.id}`} className={styles.card}>
                <div className={styles.thumbnailContainer}>
                    <img
                        src={imgSrc}
                        alt={deal.title}
                        className={styles.thumbnail}
                        onError={() => setImgSrc(getFallbackImage(deal.title))}
                    />
                    <div className={styles.thumbnailOverlay} />
                </div>

                <div className={styles.content}>
                    <h3 className={styles.title}>{deal.title}</h3>

                    <div className={styles.meta}>
                        <div className={styles.rating}>
                            <Star size={14} fill="#B45309" stroke="#B45309" />
                            <span className={styles.ratingText}>
                                {deal.rating_value && deal.rating_value > 0 ? deal.rating_value.toFixed(1) : 'New'}
                            </span>
                            {deal.review_count !== undefined && deal.review_count > 0 && (
                                <span className={styles.reviewCount}>({deal.review_count})</span>
                            )}
                        </div>
                        {deal.duration_text && (
                            <div className={styles.duration}>
                                <Clock size={14} />
                                <span>{deal.duration_text}</span>
                            </div>
                        )}
                    </div>

                    <div className={styles.badgeRow}>
                        <Badge type={deal.badge || 'Unverified'} />
                    </div>
                </div>
            </Link>

            <button
                className={`${styles.heartBtn} ${isSaved ? styles.heartActive : ''}`}
                onClick={handleToggleSave}
                aria-label={isSaved ? 'Unsave deal' : 'Save deal'}
            >
                <Heart
                    size={20}
                    fill={isSaved ? 'white' : 'none'}
                    stroke={isSaved ? 'white' : 'currentColor'}
                />
            </button>
        </div>
    );
}
