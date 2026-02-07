import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RANKS, getRankForXP } from '../utils/ranks';

interface RankLadderModalProps {
    visible: boolean;
    onClose: () => void;
    currentXP: number;
}

export function RankLadderModal({ visible, onClose, currentXP }: RankLadderModalProps) {
    const currentRank = getRankForXP(currentXP);

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.centeredView}>
                    <TouchableWithoutFeedback>
                        <View style={styles.modalView}>
                            <View style={styles.header}>
                                <Text style={styles.modalTitle}>Rank Ladder</Text>
                                <TouchableOpacity onPress={onClose}>
                                    <Ionicons name="close-circle" size={24} color="#ccc" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                                {RANKS.map((rank) => {
                                    const rankIndex = RANKS.findIndex(r => r.title === rank.title);
                                    const currentIndex = RANKS.findIndex(r => r.title === currentRank.title);

                                    const status = rankIndex < currentIndex ? 'passed' : rankIndex === currentIndex ? 'current' : 'locked';

                                    return (
                                        <View key={rank.title} style={[
                                            styles.rankRow,
                                            status === 'current' && styles.currentRankRow
                                        ]}>
                                            <View style={styles.iconContainer}>
                                                {status === 'passed' && <Ionicons name="checkmark-circle" size={24} color="#10B981" />}
                                                {status === 'current' && <Ionicons name="star" size={24} color="#F59E0B" />}
                                                {status === 'locked' && <Ionicons name="lock-closed" size={24} color="#ccc" />}
                                            </View>

                                            <View style={styles.textContainer}>
                                                <Text style={[
                                                    styles.rankTitle,
                                                    status === 'current' && styles.currentRankTitle,
                                                    status === 'locked' && styles.lockedText
                                                ]}>{rank.title}</Text>

                                                <Text style={styles.xpRange}>
                                                    {status === 'locked'
                                                        ? `Unlocks at ${rank.minXP} XP`
                                                        : `${rank.minXP} - ${rank.maxXP >= 5000 ? '∞' : rank.maxXP} XP`
                                                    }
                                                </Text>
                                            </View>
                                        </View>
                                    );
                                })}
                            </ScrollView>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        width: '85%',
        maxHeight: '60%',
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        borderWidth: 2,
        borderColor: '#111',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: '#111',
    },
    scrollView: {
        width: '100%',
    },
    rankRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 12,
        marginBottom: 8,
    },
    currentRankRow: {
        backgroundColor: '#111',
    },
    iconContainer: {
        width: 32,
        alignItems: 'center',
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
    },
    rankTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111',
    },
    currentRankTitle: {
        color: '#FFF4CC',
    },
    lockedText: {
        color: '#999',
    },
    xpRange: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
});
