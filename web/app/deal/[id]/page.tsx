'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { fetchDeal, submitVote, toggleSaveDeal } from '@/lib/api';
import { getDeviceId } from '@/lib/device';
import { Badge } from '@/components/Badge';
import { VoteModal } from '@/components/VoteModal';
import { Heart, Star, Users, Clock, ExternalLink, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import styles from './page.module.css';

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

export default function DealDetailPage() {
    const params = useParams();
    const id = params?.id as string;
    const [deal, setDeal] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isSaved, setIsSaved] = useState(false);
    const [votingVisible, setVotingVisible] = useState(false);
    const [voteMessage, setVoteMessage] = useState('');

    useEffect(() => {
        if (id) loadDeal();
    }, [id]);

    const loadDeal = async () => {
        setLoading(true);
        try {
            const deviceId = getDeviceId();
            const data = await fetchDeal(id, deviceId);
            setDeal(data);
            if (data?.is_saved !== undefined) setIsSaved(data.is_saved);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleSave = async () => {
        if (!deal) return;
        const newState = !isSaved;
        setIsSaved(newState);
        try {
            const deviceId = getDeviceId();
            await toggleSaveDeal(deal.id, deviceId);
        } catch {
            setIsSaved(!newState);
        }
    };

    const handleOpenUdemy = () => {
        const url = deal?.udemy_url || deal?.coursesity_detail_url;
        if (url) {
            window.open(url, '_blank', 'noopener,noreferrer');
            setTimeout(() => setVotingVisible(true), 1000);
        }
    };

    const handleVote = async (vote: 'free' | 'expired') => {
        setVotingVisible(false);
        try {
            const deviceId = getDeviceId();
            await submitVote(deal.id, deviceId, vote);
            setVoteMessage('Thanks! Your vote helps the community. +10 XP');
            loadDeal();
        } catch (e: any) {
            if (e.message?.includes('Already voted')) {
                setVoteMessage('You already voted on this deal today.');
            } else {
                setVoteMessage('Failed to submit vote.');
            }
        }
        setTimeout(() => setVoteMessage(''), 4000);
    };

    if (loading) {
        return (
            <div className={styles.page}>
                <div className="container">
                    <div className={styles.loading}>
                        <div className={`skeleton ${styles.loadingImg}`} />
                        <div className={styles.loadingContent}>
                            <div className={`skeleton ${styles.loadingTitle}`} />
                            <div className={`skeleton ${styles.loadingMeta}`} />
                            <div className={`skeleton ${styles.loadingDesc}`} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!deal) {
        return (
            <div className={styles.page}>
                <div className="container">
                    <div className={styles.notFound}>
                        <span>😕</span>
                        <h2>Deal not found</h2>
                        <Link href="/" className="btn btn-primary">Back to Home</Link>
                    </div>
                </div>
            </div>
        );
    }

    const imgSrc = deal.thumbnail_url?.includes('placeholder')
        ? getFallbackImage(deal.title)
        : (deal.thumbnail_url || getFallbackImage(deal.title));

    return (
        <div className={styles.page}>
            <div className="container">
                <Link href="/" className={styles.backLink}>
                    <ArrowLeft size={18} />
                    Back to deals
                </Link>

                <div className={styles.detailCard}>
                    <div className={styles.imageContainer}>
                        <img src={imgSrc} alt={deal.title} className={styles.image} />
                        <div className={styles.imageOverlay} />
                    </div>

                    <div className={styles.content}>
                        <div className={styles.topRow}>
                            <Badge type={deal.badge || 'Unverified'} />
                            <button
                                className={`${styles.saveBtn} ${isSaved ? styles.saveBtnActive : ''}`}
                                onClick={handleToggleSave}
                            >
                                <Heart size={20} fill={isSaved ? 'white' : 'none'} />
                                {isSaved ? 'Saved' : 'Save'}
                            </button>
                        </div>

                        <h1 className={styles.title}>{deal.title}</h1>

                        <div className={styles.statsRow}>
                            <div className={styles.stat}>
                                <Star size={18} color="#B45309" />
                                <div>
                                    <span className={styles.statLabel}>Rating</span>
                                    <span className={styles.statValue}>
                                        {deal.rating_value && deal.rating_value > 0 ? deal.rating_value.toFixed(1) : 'New'}
                                    </span>
                                </div>
                            </div>
                            <div className={styles.stat}>
                                <Users size={18} />
                                <div>
                                    <span className={styles.statLabel}>Reviews</span>
                                    <span className={styles.statValue}>{deal.review_count || '0'}</span>
                                </div>
                            </div>
                            <div className={styles.stat}>
                                <Clock size={18} />
                                <div>
                                    <span className={styles.statLabel}>Duration</span>
                                    <span className={styles.statValue}>{deal.duration_text || 'N/A'}</span>
                                </div>
                            </div>
                        </div>

                        {deal.description_snippet && (
                            <div className={styles.description}>
                                <h3>About this Course</h3>
                                <p>{deal.description_snippet}</p>
                            </div>
                        )}

                        <button className="btn btn-primary btn-lg" onClick={handleOpenUdemy} style={{ width: '100%' }}>
                            <ExternalLink size={20} />
                            Open on Udemy
                        </button>

                        {voteMessage && (
                            <div className={styles.voteMessage}>
                                {voteMessage}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <VoteModal
                visible={votingVisible}
                onVote={handleVote}
                onClose={() => setVotingVisible(false)}
            />
        </div>
    );
}
