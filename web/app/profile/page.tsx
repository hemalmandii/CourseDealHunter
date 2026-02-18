'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { getUserStats } from '@/lib/api';
import { getDeviceId } from '@/lib/device';
import { getRankForXP, getNextRank, getLevelGoal, getLevelStartXP } from '@/lib/ranks';
import { RankLadderModal } from '@/components/RankLadderModal';
import { User, Heart, CheckCircle, Trophy, Info, RefreshCw } from 'lucide-react';
import styles from './page.module.css';

export default function ProfilePage() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        setLoading(true);
        const deviceId = getDeviceId();
        const data = await getUserStats(deviceId);
        setStats(data);
        setLoading(false);
    };

    const displayStats = stats || { total_votes: 0, total_saved: 0, xp: 0, level: 1 };
    const currentLevel = displayStats.level || 1;
    const currentXP = displayStats.xp || 0;
    const startXP = getLevelStartXP(currentLevel);
    const goalXP = getLevelGoal(currentLevel);
    const progress = Math.min(1, Math.max(0, (currentXP - startXP) / (goalXP - startXP)));
    const currentRank = getRankForXP(currentXP);
    const nextRank = getNextRank(currentXP);
    const xpToNextRank = nextRank ? nextRank.minXP - currentXP : 0;

    if (loading) {
        return (
            <div className={styles.page}>
                <div className="container">
                    <div className={styles.loadingState}>
                        <div className={`skeleton ${styles.loadingAvatar}`} />
                        <div className={`skeleton ${styles.loadingTitle}`} />
                        <div className={`skeleton ${styles.loadingBar}`} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <div className="container">
                <div className={styles.profileGrid}>
                    {/* Profile Card */}
                    <div className={`card card-accent ${styles.profileCard}`}>
                        <div className={styles.avatar}>
                            <User size={40} />
                        </div>

                        <div className={styles.profileInfo}>
                            <button className={styles.rankBadge} onClick={() => setModalVisible(true)}>
                                <span>{currentRank.title}</span>
                                <Info size={12} />
                            </button>

                            {nextRank ? (
                                <p className={styles.rankTeaser}>{xpToNextRank} XP to {nextRank.title}</p>
                            ) : (
                                <p className={styles.rankTeaser}>Max Rank 👑</p>
                            )}

                            <h2 className={styles.username}>Deal Hunter</h2>

                            <div className={styles.levelRow}>
                                <span className={styles.levelLabel}>Level {currentLevel}</span>
                                <span className={styles.xpText}>{currentXP} / {goalXP} XP</span>
                            </div>

                            <div className="progress-bar">
                                <div className="progress-bar-fill" style={{ width: `${progress * 100}%` }} />
                            </div>
                        </div>

                        <button className={styles.refreshBtn} onClick={loadStats} aria-label="Refresh stats">
                            <RefreshCw size={18} />
                        </button>
                    </div>

                    {/* Stats Grid */}
                    <div className={styles.statsGrid}>
                        <div className="stat-card">
                            <Heart size={32} color="var(--color-warning)" />
                            <div className="stat-value">{displayStats.total_saved}</div>
                            <div className="stat-label">Saved Deals</div>
                        </div>
                        <div className="stat-card">
                            <CheckCircle size={32} color="var(--color-success)" />
                            <div className="stat-value">{displayStats.total_votes}</div>
                            <div className="stat-label">Votes Cast</div>
                        </div>
                    </div>

                    {/* About Card */}
                    <div className={`card ${styles.aboutCard}`}>
                        <h3 className={styles.aboutTitle}>About SkillLoot</h3>
                        <p className={styles.aboutText}>
                            SkillLoot finds free Udemy courses from around the web. Vote to keep the community updated!
                        </p>

                        <div className={styles.divider} />

                        <div className={styles.howXp}>
                            <Trophy size={20} color="var(--color-warning)" />
                            <div>
                                <h4>How to earn XP</h4>
                                <ul className={styles.xpList}>
                                    <li>Vote on deals — <strong>+10 XP</strong></li>
                                    <li>Save a deal — <strong>+5 XP</strong></li>
                                </ul>
                            </div>
                        </div>

                        <p className={styles.version}>v1.3.1 (Loot Legend Update)</p>
                    </div>
                </div>
            </div>

            <RankLadderModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                currentXP={currentXP}
            />
        </div>
    );
}
