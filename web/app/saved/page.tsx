'use client';

import { useState, useEffect } from 'react';
import { CourseCard } from '@/components/CourseCard';
import { fetchSavedDeals } from '@/lib/api';
import { getDeviceId } from '@/lib/device';
import { Heart, BookOpen } from 'lucide-react';
import Link from 'next/link';
import styles from './page.module.css';

export default function SavedPage() {
    const [deals, setDeals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSaved();
    }, []);

    const loadSaved = async () => {
        setLoading(true);
        const deviceId = getDeviceId();
        const data = await fetchSavedDeals(deviceId);
        setDeals(data || []);
        setLoading(false);
    };

    const handleUnsave = (dealId: string) => {
        setTimeout(() => {
            setDeals(prev => prev.filter(d => d.id !== dealId));
        }, 300);
    };

    return (
        <div className={styles.page}>
            <div className="container">
                <div className={styles.header}>
                    <Heart size={28} fill="var(--color-primary)" stroke="var(--color-primary)" />
                    <h1>Saved Deals</h1>
                    <p className={styles.subtitle}>Your bookmarked free courses</p>
                </div>

                {loading ? (
                    <div className="grid-deals">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className={styles.skeletonCard}>
                                <div className={`skeleton ${styles.skeletonImg}`} />
                                <div className={styles.skeletonContent}>
                                    <div className={`skeleton ${styles.skeletonTitle}`} />
                                    <div className={`skeleton ${styles.skeletonMeta}`} />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : deals.length > 0 ? (
                    <div className="grid-deals">
                        {deals.map((deal, index) => (
                            <CourseCard
                                key={deal.id}
                                deal={deal}
                                initialIsSaved={true}
                                index={index}
                                onToggleSave={(newState) => {
                                    if (!newState) handleUnsave(deal.id);
                                }}
                            />
                        ))}
                    </div>
                ) : (
                    <div className={styles.empty}>
                        <div className={styles.emptyIcon}>
                            <BookOpen size={48} strokeWidth={1.5} />
                        </div>
                        <h3>No saved deals yet</h3>
                        <p>Tap the heart icon on any deal to save it for later!</p>
                        <Link href="/explore" className="btn btn-primary" style={{ marginTop: '16px' }}>
                            Browse Courses
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
