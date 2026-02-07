export interface Rank {
    title: string;
    minXP: number;
    maxXP: number;
}

export const RANKS: Rank[] = [
    { title: 'Window Shopper', minXP: 0, maxXP: 50 },
    { title: 'Bargain Bin Raider', minXP: 51, maxXP: 250 },
    { title: 'Loot Commando', minXP: 251, maxXP: 1000 },
    { title: 'Gold Miner', minXP: 1001, maxXP: 5000 },
    { title: 'Loot Legend', minXP: 5001, maxXP: Number.MAX_SAFE_INTEGER },
];

export const getRankForXP = (xp: number): Rank => {
    return RANKS.find(r => xp >= r.minXP && xp <= r.maxXP) || RANKS[0];
};

export const getNextRank = (xp: number): Rank | null => {
    const current = getRankForXP(xp);
    const currentIndex = RANKS.findIndex(r => r.title === current.title);
    if (currentIndex < RANKS.length - 1) {
        return RANKS[currentIndex + 1];
    }
    return null; // Max rank reached
};
