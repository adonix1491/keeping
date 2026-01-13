import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Pressable, ActivityIndicator, Alert, FlatList } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { api } from '../../services/api';
import { Restaurant } from '../../services/mockData';
import { Ionicons } from '@expo/vector-icons';
import { BookingSheet } from '../../components/BookingSheet';

export default function RestaurantDetailScreen() {
    const { id } = useLocalSearchParams();
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [loading, setLoading] = useState(true);
    const [sheetVisible, setSheetVisible] = useState(false);

    // New State
    const [selectedDate, setSelectedDate] = useState(() => {
        const d = new Date();
        return {
            label: `${d.getMonth() + 1}/${d.getDate()}`,
            day: ['日', '一', '二', '三', '四', '五', '六'][d.getDay()],
            fullDate: d.toISOString().split('T')[0]
        };
    });
    const [slots, setSlots] = useState<{ time: string, status: 'AVAILABLE' | 'FULL' }[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            loadRestaurant(id as string);
        }
    }, [id]);

    useEffect(() => {
        if (id && selectedDate) {
            loadSlots();
        }
    }, [id, selectedDate]);

    const loadRestaurant = async (rId: string) => {
        const data = await api.getRestaurantById(rId);
        setRestaurant(data || null);
        setLoading(false);
    };

    const loadSlots = async () => {
        setLoadingSlots(true);
        // Simulate fetching from backend
        const data = await api.getAvailability(id as string, selectedDate.fullDate, 2);
        setSlots(data);
        setLoadingSlots(false);
    };

    const handleSlotPress = (slot: { time: string, status: 'AVAILABLE' | 'FULL' }) => {
        if (slot.status === 'AVAILABLE') {
            Alert.alert('預訂確認', `您想預訂 ${selectedDate.label} ${slot.time} 嗎？`, [
                { text: '取消', style: 'cancel' },
                { text: '確認預訂', onPress: () => Alert.alert('成功', '預訂請求已送出') }
            ]);
        } else {
            // "I want to wait" logic
            setSelectedSlot(slot.time);
            setSheetVisible(true);
        }
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

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            <Stack.Screen options={{ title: restaurant.name }} />
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Image source={{ uri: restaurant.image }} style={styles.image} />

                <View style={styles.content}>
                    <Text style={styles.name}>{restaurant.name}</Text>
                    <Text style={styles.location}>📍 {restaurant.location}</Text>
                    <View style={styles.tags}>
                        {restaurant.tags.map((tag, i) => (
                            <Text key={i} style={styles.tag}>#{tag}</Text>
                        ))}
                    </View>

                    <View style={styles.divider} />

                    {/* Date Picker - 2 Months Grid */}
                    <Text style={styles.sectionTitle}>📅 用餐日期</Text>
                    <View style={styles.calendarContainer}>
                        {renderCalendar(new Date(), selectedDate, setSelectedDate)}
                        {renderCalendar(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1), selectedDate, setSelectedDate)}
                    </View>

                    <View style={styles.divider} />

                    {/* Time Slots */}
                    <Text style={styles.sectionTitle}>🕒 用餐時段</Text>
                    {loadingSlots ? (
                        <ActivityIndicator style={{ marginTop: 20 }} />
                    ) : (
                        <View style={styles.slotsGrid}>
                            {slots.map((slot, i) => {
                                const isFull = slot.status === 'FULL';
                                return (
                                    <Pressable
                                        key={i}
                                        style={[
                                            styles.slotChip,
                                            isFull ? styles.slotFull : styles.slotAvailable
                                        ]}
                                        onPress={() => handleSlotPress(slot)}
                                    >
                                        <Text style={[
                                            styles.slotText,
                                            isFull ? styles.slotTextFull : styles.slotTextAvailable
                                        ]}>
                                            {slot.time}
                                        </Text>
                                        {isFull && <Text style={styles.waitText}>我要候位</Text>}
                                    </Pressable>
                                );
                            })}
                        </View>
                    )}
                </View>
            </ScrollView>

            <BookingSheet
                visible={sheetVisible}
                onClose={() => setSheetVisible(false)}
                restaurant={restaurant}
                preSelectedDate={selectedDate.fullDate} // Pass date
            />
        </View>
    );
}

// Calendar Helpers
const getMonthData = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1).getDay(); // 0 = Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];

    // Empty slots for padding
    for (let i = 0; i < firstDay; i++) {
        days.push(null);
    }

    // Actual days
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(new Date(year, month, i));
    }

    return days;
};

const renderCalendar = (baseDate: Date, selected: any, onSelect: any) => {
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();
    const days = getMonthData(year, month);

    return (
        <View style={styles.monthContainer} key={`${year}-${month}`}>
            <Text style={styles.monthTitle}>{year}年 {month + 1}月</Text>
            <View style={styles.weekRow}>
                {['日', '一', '二', '三', '四', '五', '六'].map(d => (
                    <Text key={d} style={styles.weekHeader}>{d}</Text>
                ))}
            </View>
            <View style={styles.daysGrid}>
                {days.map((date, i) => {
                    if (!date) return <View key={i} style={styles.dayCell} />;

                    const dateStr = date.toISOString().split('T')[0];
                    const isSelected = selected.fullDate === dateStr;
                    const isToday = dateStr === new Date().toISOString().split('T')[0];
                    const isPast = date < new Date() && !isToday;

                    return (
                        <Pressable
                            key={i}
                            style={[
                                styles.dayCell,
                                isSelected && styles.dayCellSelected,
                                isToday && styles.dayCellToday
                            ]}
                            onPress={() => !isPast && onSelect({
                                label: `${date.getMonth() + 1}/${date.getDate()}`,
                                day: ['日', '一', '二', '三', '四', '五', '六'][date.getDay()],
                                fullDate: dateStr
                            })}
                            disabled={isPast}
                        >
                            <Text style={[
                                styles.dayText,
                                isSelected && styles.dayTextSelected,
                                isToday && styles.dayTextToday,
                                isPast && styles.dayTextDisabled
                            ]}>
                                {date.getDate()}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scrollContent: { paddingBottom: 100 },
    image: { width: '100%', height: 200 },
    content: { padding: 20 },
    name: { fontSize: 24, fontWeight: '800', marginBottom: 4 },
    location: { fontSize: 16, color: '#64748B', marginBottom: 12 },
    tags: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 },
    tag: { backgroundColor: '#F1F5F9', color: '#64748B', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginRight: 8, overflow: 'hidden' },
    divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 16 },
    sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },

    // Calendar Styles
    calendarContainer: { gap: 24 },
    monthContainer: { marginBottom: 8 },
    monthTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12, textAlign: 'center', color: '#334155' },
    weekRow: { flexDirection: 'row', marginBottom: 8, justifyContent: 'space-around' },
    weekHeader: { width: 40, textAlign: 'center', color: '#94A3B8', fontSize: 12 },
    daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
    dayCell: { width: '14.28%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 20 },
    dayCellSelected: { backgroundColor: Colors.light.tint },
    dayCellToday: { borderWidth: 1, borderColor: Colors.light.tint },
    dayText: { fontSize: 14, color: '#334155' },
    dayTextSelected: { color: 'white', fontWeight: 'bold' },
    dayTextToday: { color: Colors.light.tint, fontWeight: 'bold' },
    dayTextDisabled: { color: '#CBD5E1' },

    // Slots
    slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    slotChip: {
        width: '30%', paddingVertical: 12, borderRadius: 8, borderWidth: 1,
        justifyContent: 'center', alignItems: 'center'
    },
    slotAvailable: { backgroundColor: '#F0FDF4', borderColor: '#22C55E' },
    slotFull: { backgroundColor: '#FEF2F2', borderColor: '#EF4444' },
    slotText: { fontSize: 16, fontWeight: '600' },
    slotTextAvailable: { color: '#16A34A' },
    slotTextFull: { color: '#DC2626', textDecorationLine: 'line-through', opacity: 0.6 },
    waitText: { fontSize: 10, color: '#DC2626', fontWeight: 'bold', marginTop: 2 }
});
