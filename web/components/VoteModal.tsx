'use client';

import { ThumbsUp, ThumbsDown, X } from 'lucide-react';
import styles from './VoteModal.module.css';

interface VoteModalProps {
    visible: boolean;
    onVote: (vote: 'free' | 'expired') => void;
    onClose: () => void;
}

export function VoteModal({ visible, onVote, onClose }: VoteModalProps) {
    if (!visible) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={onClose}>
                    <X size={20} />
                </button>

                <div className={styles.header}>
                    <span className={styles.emoji}>🗳️</span>
                    <h3 className={styles.title}>Is this course still free?</h3>
                    <p className={styles.subtitle}>Your vote helps the community stay updated!</p>
                </div>

                <div className={styles.buttons}>
                    <button
                        className={`${styles.voteBtn} ${styles.voteFree}`}
                        onClick={() => onVote('free')}
                    >
                        <ThumbsUp size={24} />
                        <span>Yes, it&apos;s FREE!</span>
                    </button>

                    <button
                        className={`${styles.voteBtn} ${styles.voteExpired}`}
                        onClick={() => onVote('expired')}
                    >
                        <ThumbsDown size={24} />
                        <span>No, it expired</span>
                    </button>
                </div>

                <p className={styles.xpNote}>+10 XP for voting!</p>
            </div>
        </div>
    );
}
