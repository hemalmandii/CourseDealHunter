'use client';

import { useState, useCallback, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { CourseCard } from '@/components/CourseCard';
import { searchDeals, fetchSavedDeals, fetchDeals } from '@/lib/api';
import { getDeviceId } from '@/lib/device';
import styles from './page.module.css';

const CATEGORIES = ['Python', 'React', 'Java', 'Design', 'Marketing', 'Business', 'JavaScript', 'Data Science'];

export default function ExplorePage() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [allDeals, setAllDeals] = useState<any[]>([]);
    const [initialLoading, setInitialLoading] = useState(true);

    useEffect(() => {
        const loadInitial = async () => {
            const deviceId = getDeviceId();
            const data = await fetchDeals(0, 12, deviceId);
            setAllDeals(data);
            setInitialLoading(false);
        };
        loadInitial();
    }, []);

    const performSearch = useCallback(async (text: string) => {
        if (!text.trim()) {
            setResults([]);
            setSearched(false);
            return;
        }
        setLoading(true);
        setSearched(true);
        try {
            const deviceId = getDeviceId();
            const [data, savedDeals] = await Promise.all([
                searchDeals(text),
                fetchSavedDeals(deviceId),
            ]);
            const savedIds = new Set(savedDeals.map((d: any) => d.id));
            const enhanced = (data || []).map((d: any) => ({
                ...d,
                is_saved: savedIds.has(d.id),
            }));
            setResults(enhanced);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleChange = (text: string) => {
        setQuery(text);
        if (text.trim().length > 1) {
            const timer = setTimeout(() => performSearch(text), 400);
            return () => clearTimeout(timer);
        } else if (!text.trim()) {
            setResults([]);
            setSearched(false);
        }
    };

    const handleCategoryClick = (cat: string) => {
        setQuery(cat);
        performSearch(cat);
    };

    const displayDeals = searched ? results : allDeals;

    return (
        <div className={styles.page}>
            <div className="container">
                <div className={styles.header}>
                    <h1>Explore Courses</h1>
                    <p className={styles.subtitle}>Search through hundreds of free Udemy courses</p>
                </div>

                {/* Search Bar */}
                <div className={styles.searchWrapper}>
                    <Search size={20} className={styles.searchIcon} />
                    <input
                        type="text"
                        className={styles.searchInput}
                        placeholder="Search courses (e.g., Python, React, Marketing)..."
                        value={query}
                        onChange={(e) => handleChange(e.target.value)}
                    />
                    {query && (
                        <button className={styles.clearBtn} onClick={() => handleChange('')}>
                            <X size={18} />
                        </button>
                    )}
                </div>

                {/* Categories */}
                {!searched && (
                    <div className={styles.categories}>
                        <h3 className={styles.categoriesTitle}>Popular Categories</h3>
                        <div className={styles.pills}>
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat}
                                    className="pill"
                                    onClick={() => handleCategoryClick(cat)}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Results */}
                {loading || initialLoading ? (
                    <div className={styles.loadingGrid}>
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className={styles.skeletonCard}>
                                <div className={`skeleton ${styles.skeletonImg}`} />
                                <div className={styles.skeletonContent}>
                                    <div className={`skeleton ${styles.skeletonTitle}`} />
                                    <div className={`skeleton ${styles.skeletonMeta}`} />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <>
                        {searched && (
                            <p className={styles.resultCount}>
                                {results.length} result{results.length !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
                            </p>
                        )}
                        <div className="grid-deals">
                            {displayDeals.map((deal, index) => (
                                <CourseCard
                                    key={deal.id}
                                    deal={deal}
                                    initialIsSaved={deal.is_saved}
                                    index={index}
                                />
                            ))}
                        </div>

                        {searched && results.length === 0 && (
                            <div className={styles.empty}>
                                <span className={styles.emptyEmoji}>🔍</span>
                                <h3>No results found</h3>
                                <p>Try a different keyword or browse by category</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
