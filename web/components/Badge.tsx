'use client';

import styles from './Badge.module.css';

interface BadgeProps {
    type: 'Verified Free' | 'Likely Expired' | 'Unverified' | string;
}

export function Badge({ type }: BadgeProps) {
    const getVariant = () => {
        switch (type) {
            case 'Verified Free': return 'verified';
            case 'Likely Expired': return 'expired';
            default: return 'unverified';
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'Verified Free': return '✓';
            case 'Likely Expired': return '✕';
            default: return '?';
        }
    };

    return (
        <span className={`badge badge-${getVariant()}`}>
            {getIcon()} {type || 'Unverified'}
        </span>
    );
}
