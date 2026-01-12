import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { api } from '../../services/api';
import { Restaurant } from '../../services/mockData';
import { Ionicons } from '@expo/vector-icons';
import { BookingSheet } from '../../components/BookingSheet';

export default function RestaurantDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [loading, setLoading] = useState(true);
    const [sheetVisible, setSheetVisible] = useState(false);

    useEffect(() => {
        if (id) {
            loadRestaurant(id as string);
        }
    }, [id]);

    const loadRestaurant = async (rId: string) => {
        const data = await api.getRestaurantById(rId);
        setRestaurant(data || null);
        setLoading(false);
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={Colors.light.tint} />
            </View>
        );
    }

    if (!restaurant) {
        return (
            <View style={styles.center}>
                <Text>找不到餐廳資料</Text>
            </View>
        );
    }

    const isAvailable = restaurant.status === 'AVAILABLE';

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            <Stack.Screen options={{ title: restaurant.name }} />
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Image source={{ uri: restaurant.image }} style={styles.image} />

                <View style={styles.content}>
                    <View style={styles.headerRow}>
                        <Text style={styles.name}>{restaurant.name}</Text>
                        <View style={styles.ratingBadge}>
                            <Text style={styles.ratingText}>⭐ {restaurant.rating}</Text>
                        </View>
                    </View>

                    <Text style={styles.location}>📍 {restaurant.location}</Text>

                    <View style={styles.tags}>
                        {restaurant.tags.map((tag, i) => (
                            <Text key={i} style={styles.tag}>#{tag}</Text>
                        ))}
                    </View>

                    <View style={styles.divider} />

                    {/* Status Section */}
                    <View style={[
                        styles.statusCard,
                        { backgroundColor: isAvailable ? Colors.available.secondary : Colors.full.secondary }
                    ]}>
                        <View style={styles.statusHeader}>
                            <Ionicons
                                name={isAvailable ? 'checkmark-circle' : 'alert-circle'}
                                size={24}
                                color={isAvailable ? Colors.available.primary : Colors.full.text}
                            />
                            <Text style={[
                                styles.statusTitle,
                                { color: isAvailable ? Colors.available.text : Colors.full.text }
                            ]}>
                                {isAvailable ? '目前有空位！' : '目前已滿位'}
                            </Text>
                        </View>
                        <Text style={[
                            styles.statusDesc,
                            { color: isAvailable ? Colors.available.text : Colors.full.text }
                        ]}>
                            {isAvailable
                                ? '趕快預訂，機會難得。'
                                : '加入監控清單，我們會在有空位時通知您。'}
                        </Text>
                    </View>

                    {/* Slots if available */}
                    {isAvailable && (
                        <View style={styles.slotsSection}>
                            <Text style={styles.sectionTitle}>可訂時段 (今日)</Text>
                            <View style={styles.slotsGrid}>
                                {restaurant.slots.map((slot, i) => (
                                    <Pressable key={i} style={styles.slotChip} onPress={() => Alert.alert('預訂', `確認預訂 ${slot}?`)}>
                                        <Text style={styles.slotText}>{slot}</Text>
                                    </Pressable>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Static Info */}
                    <View style={styles.infoSection}>
                        <Text style={styles.sectionTitle}>營業資訊</Text>
                        <Text style={styles.infoText}>營業時間：11:30 - 21:30</Text>
                        <Text style={styles.infoText}>電話：02-2345-6789</Text>
                        <Text style={styles.infoText}>地址：{restaurant.location}某條路123號</Text>
                    </View>
                </View>
            </ScrollView>

            {/* Footer Action Bar */}
            <View style={styles.footer}>
                {isAvailable ? (
                    <Pressable style={[styles.actionButton, { backgroundColor: Colors.available.primary }]}>
                        <Text style={styles.actionButtonText}>立即訂位</Text>
                    </Pressable>
                ) : (
                    <Pressable
                        style={[styles.actionButton, { backgroundColor: Colors.full.primary }]}
                        onPress={() => setSheetVisible(true)}
                    >
                        <Ionicons name="notifications-outline" size={20} color="white" style={{ marginRight: 8 }} />
                        <Text style={styles.actionButtonText}>開啟空位通知</Text>
                    </Pressable>
                )}
            </View>

            <BookingSheet
                visible={sheetVisible}
                onClose={() => setSheetVisible(false)}
                restaurant={restaurant}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingBottom: 100,
    },
    image: {
        width: '100%',
        height: 250,
    },
    content: {
        padding: 20,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    name: {
        fontSize: 24,
        fontWeight: '800',
        color: Colors.light.text,
        flex: 1,
    },
    ratingBadge: {
        backgroundColor: '#FFFBEB',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#FCD34D',
    },
    ratingText: {
        fontWeight: '700',
        color: '#B45309',
    },
    location: {
        fontSize: 16,
        color: Colors.light.icon,
        marginBottom: 12,
    },
    tags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 20,
    },
    tag: {
        backgroundColor: '#F1F5F9',
        color: '#64748B',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        marginRight: 8,
        marginBottom: 8,
        overflow: 'hidden',
    },
    divider: {
        height: 1,
        backgroundColor: '#E2E8F0',
        marginBottom: 20,
    },
    statusCard: {
        padding: 16,
        borderRadius: 16,
        marginBottom: 24,
    },
    statusHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    statusTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginLeft: 8,
    },
    statusDesc: {
        fontSize: 14,
        marginLeft: 32,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 12,
        color: Colors.light.text,
    },
    slotsSection: {
        marginBottom: 24,
    },
    slotsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    slotChip: {
        borderWidth: 1,
        borderColor: Colors.available.primary,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: '#F0FDF4',
    },
    slotText: {
        color: Colors.available.text,
        fontWeight: '600',
    },
    infoSection: {
        marginBottom: 24,
    },
    infoText: {
        fontSize: 15,
        color: Colors.light.text,
        marginBottom: 8,
        lineHeight: 22,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        padding: 16,
        paddingBottom: 32,
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
    },
    actionButton: {
        flexDirection: 'row',
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    actionButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '700',
    },
});
