import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, ActivityIndicator, Alert } from 'react-native';
import { Colors } from '../constants/Colors';
import { Restaurant } from '../services/mockData';
import { api } from '../services/api';

interface BookingSheetProps {
    visible: boolean;
    onClose: () => void;
    restaurant: Restaurant;
}

export function BookingSheet({ visible, onClose, restaurant }: BookingSheetProps) {
    const [loading, setLoading] = useState(false);

    const handleSubscribe = async () => {
        setLoading(true);
        try {
            // Simulate API call
            await api.addToWatchlist(restaurant.id, new Date().toISOString(), 2);
            Alert.alert('成功', '已加入監控清單');
            onClose();
        } catch (e) {
            Alert.alert('錯誤', '無法加入監控清單');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <Pressable style={styles.backdrop} onPress={onClose} />
                <View style={styles.sheet}>
                    <View style={styles.indicator} />

                    <Text style={styles.title}>開啟空位通知</Text>
                    <Text style={styles.subtitle}>當 {restaurant.name} 有空位時，我們會立即通知您。</Text>

                    <View style={styles.infoBox}>
                        <View style={styles.row}>
                            <Text style={styles.label}>餐廳</Text>
                            <Text style={styles.value}>{restaurant.name}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>日期</Text>
                            <Text style={styles.value}>Anytime</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>人數</Text>
                            <Text style={styles.value}>2 人</Text>
                        </View>
                    </View>

                    <Pressable
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleSubscribe}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.buttonText}>確認訂閱</Text>
                        )}
                    </Pressable>

                    <Pressable style={styles.lineButton}>
                        <Text style={styles.lineButtonText}>📲 綁定 LINE 接收通知</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    sheet: {
        backgroundColor: 'white',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
    },
    indicator: {
        width: 40,
        height: 4,
        backgroundColor: '#E2E8F0',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
        color: Colors.light.text,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: Colors.light.icon,
        textAlign: 'center',
        marginBottom: 24,
    },
    infoBox: {
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    label: {
        color: '#64748B',
        fontSize: 14,
    },
    value: {
        color: '#0F172A',
        fontWeight: '600',
        fontSize: 14,
    },
    button: {
        backgroundColor: Colors.full.primary,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 12,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    lineButton: {
        paddingVertical: 12,
        alignItems: 'center',
    },
    lineButtonText: {
        color: '#00B900', // LINE Green
        fontWeight: '600',
    },
});
