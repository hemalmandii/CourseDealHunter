import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';

interface VoteBottomSheetProps {
    visible: boolean;
    onVote: (vote: 'free' | 'expired') => void;
    onClose: () => void;
}

export function VoteBottomSheet({ visible, onVote, onClose }: VoteBottomSheetProps) {
    if (!visible) return null;

    return (
        <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.sheet}>
                    <Text style={styles.title}>Was the course free?</Text>
                    <Text style={styles.subtitle}>Help others find working deals.</Text>

                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={[styles.button, styles.freeButton]} onPress={() => onVote('free')}>
                            <Text style={styles.buttonText}>✅ Yes, Free</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.button, styles.expiredButton]} onPress={() => onVote('expired')}>
                            <Text style={styles.buttonText}>❌ Expired</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.closeText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    sheet: {
        backgroundColor: 'white',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        padding: 24,
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 24,
    },
    buttonRow: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    button: {
        flex: 1,
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginHorizontal: 8,
    },
    freeButton: {
        backgroundColor: '#ecfdf5',
        borderWidth: 1,
        borderColor: '#059669',
    },
    expiredButton: {
        backgroundColor: '#fef2f2',
        borderWidth: 1,
        borderColor: '#dc2626',
    },
    buttonText: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#111',
    },
    closeButton: {
        marginTop: 8,
        padding: 8,
    },
    closeText: {
        color: '#666',
        fontSize: 14,
    }
});
