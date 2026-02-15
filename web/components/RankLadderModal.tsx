'use client';

import { X, Trophy } from 'lucide-react';
import { RANKS, getRankForXP } from '@/lib/ranks';
import styles from './RankLadderModal.module.css';

interface RankLadderModalProps {
    visible: boolean;
    onClose: () => void;
    currentXP: number;
}

const RANK_EMOJIS = ['🛒', '🏷️', '⚔️', '⛏️', '👑'];

export function RankLadderModal({ visible, onClose, currentXP }: RankLadderModalProps) {
    if (!visible) return null;

    const currentRank = getRankForXP(currentXP);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={onClose}>
                    <X size={20} />
                </button>

                <div className={styles.header}>
                    <Trophy size={32} color="var(--color-warning)" />
                    <h3 className={styles.title}>Rank Ladder</h3>
                    <p className={styles.subtitle}>Earn XP by voting and saving deals</p>
                </div>

                <div className={styles.ladder}>
                    {RANKS.map((rank, index) => {
                        const isCurrentRank = rank.title === currentRank.title;
                        const isAchieved = currentXP >= rank.minXP;

                        return (
                            <div
                                key={rank.title}
                                className={`${styles.rankItem} ${isCurrentRank ? styles.rankCurrent : ''} ${isAchieved ? styles.rankAchieved : styles.rankLocked}`}
                            >
                                <span className={styles.rankEmoji}>{RANK_EMOJIS[index]}</span>
                                <div className={styles.rankInfo}>
                                    <span className={styles.rankTitle}>{rank.title}</span>
                                    <span className={styles.rankXP}>
                                        {rank.maxXP === Number.MAX_SAFE_INTEGER
                                            ? `${rank.minXP}+ XP`
                                            : `${rank.minXP} - ${rank.maxXP} XP`}
                                    </span>
                                </div>
                                {isCurrentRank && (
                                    <span className={styles.currentBadge}>YOU</span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
