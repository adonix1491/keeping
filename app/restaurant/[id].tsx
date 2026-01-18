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

    // Booking States
    const [partySize, setPartySize] = useState(2);
    const [partySizeExpanded, setPartySizeExpanded] = useState(false);

    const [selectedDate, setSelectedDate] = useState(() => {
        const d = new Date();
        return {
            date: d,
            label: `${d.getMonth() + 1}月${d.getDate()}日`,
            dayName: ['週日', '週一', '週二', '週三', '週四', '週五', '週六'][d.getDay()],
            fullDate: formatDateISO(d)
        };
    });
    const [dateExpanded, setDateExpanded] = useState(false);

    const [slots, setSlots] = useState<{ time: string, status: 'AVAILABLE' | 'FULL', canWaitlist?: boolean }[]>([]);
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
    }, [id, selectedDate, partySize]);

    const loadRestaurant = async (rId: string) => {
        const data = await api.getRestaurantById(rId);
        setRestaurant(data || null);
        setLoading(false);
    };

    const loadSlots = async () => {
        setLoadingSlots(true);
        const data = await api.getAvailability(id as string, selectedDate.fullDate, partySize);
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
            setSelectedSlot(slot.time);
            setSheetVisible(true);
        }
    };

    // Group slots by period
    const groupedSlots = groupSlotsByPeriod(slots);

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
        <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
            <Stack.Screen options={{ title: '餐廳詳情' }} />

            {/* Header with Restaurant Info */}
            <View style={styles.headerBar}>
                <Text style={styles.breadcrumb}>{restaurant.name}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Party Size Selector */}
                <View style={styles.selectorSection}>
                    <Text style={styles.selectorLabel}>用餐人數</Text>
                    <Pressable
                        style={styles.selectorButton}
                        onPress={() => setPartySizeExpanded(!partySizeExpanded)}
                    >
                        <Text style={styles.selectorButtonText}>{partySize}位大人</Text>
                        <Ionicons name={partySizeExpanded ? "chevron-up" : "chevron-down"} size={20} color="#666" />
                    </Pressable>

                    {partySizeExpanded && (
                        <View style={styles.expandedOptions}>
                            {[1, 2, 3, 4, 5, 6].map(num => (
                                <Pressable
                                    key={num}
                                    style={[styles.optionItem, partySize === num && styles.optionItemSelected]}
                                    onPress={() => {
                                        setPartySize(num);
                                        setPartySizeExpanded(false);
                                    }}
                                >
                                    <Text style={[styles.optionText, partySize === num && styles.optionTextSelected]}>
                                        {num}位大人
                                    </Text>
                                </Pressable>
                            ))}
                        </View>
                    )}
                </View>

                {/* Date Selector */}
                <View style={styles.selectorSection}>
                    <Text style={styles.selectorLabel}>用餐日期</Text>
                    <Pressable
                        style={styles.selectorButton}
                        onPress={() => setDateExpanded(!dateExpanded)}
                    >
                        <Text style={styles.selectorButtonText}>
                            {selectedDate.label} {selectedDate.dayName}
                        </Text>
                        <Ionicons name={dateExpanded ? "chevron-up" : "chevron-down"} size={20} color="#666" />
                    </Pressable>

                    {dateExpanded && (
                        <View style={styles.calendarContainer}>
                            {renderCalendar(new Date(), selectedDate, (newDate: any) => {
                                setSelectedDate(newDate);
                                setDateExpanded(false);
                            })}
                            {renderCalendar(
                                new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
                                selectedDate,
                                (newDate: any) => {
                                    setSelectedDate(newDate);
                                    setDateExpanded(false);
                                }
                            )}
                        </View>
                    )}
                </View>

                {/* Capacity Notice */}
                <View style={styles.noticeBox}>
                    <Text style={styles.noticeText}>
                        可接受 1-6 位訂位（含大人與小孩）* 超過 6 人的訂位，請使用電話預約
                    </Text>
                </View>

                {/* Time Slots */}
                <View style={styles.slotsSection}>
                    <Text style={styles.slotsTitle}>用餐時段</Text>

                    {loadingSlots ? (
                        <ActivityIndicator style={{ marginTop: 20 }} />
                    ) : slots.length === 0 ? (
                        <View style={styles.noSlotsContainer}>
                            <Ionicons name="calendar-outline" size={48} color="#CBD5E1" />
                            <Text style={styles.noSlotsText}>暫時無法接受候位</Text>
                            <Text style={styles.noSlotsHint}>目前此日期尚無可用時段資訊</Text>
                        </View>
                    ) : (
                        <>
                            {groupedSlots.lunch.length > 0 && (
                                <View style={styles.periodSection}>
                                    <Text style={styles.periodLabel}>中午</Text>
                                    <View style={styles.slotsGrid}>
                                        {groupedSlots.lunch.map((slot, i) => renderSlotChip(slot, i, handleSlotPress))}
                                    </View>
                                </View>
                            )}

                            {groupedSlots.afternoon.length > 0 && (
                                <View style={styles.periodSection}>
                                    <Text style={styles.periodLabel}>下午</Text>
                                    <View style={styles.slotsGrid}>
                                        {groupedSlots.afternoon.map((slot, i) => renderSlotChip(slot, i, handleSlotPress))}
                                    </View>
                                </View>
                            )}

                            {groupedSlots.dinner.length > 0 && (
                                <View style={styles.periodSection}>
                                    <Text style={styles.periodLabel}>晚上</Text>
                                    <View style={styles.slotsGrid}>
                                        {groupedSlots.dinner.map((slot, i) => renderSlotChip(slot, i, handleSlotPress))}
                                    </View>
                                </View>
                            )}
                        </>
                    )}
                </View>
            </ScrollView>

            {/* Bottom Bar */}
            <View style={styles.bottomBar}>
                <View style={styles.bottomInfo}>
                    <Text style={styles.bottomInfoText}>{partySize}大</Text>
                    <Ionicons name="chevron-forward" size={16} color="#999" />
                    <Text style={styles.bottomInfoText}>{selectedDate.label}</Text>
                    <Ionicons name="chevron-forward" size={16} color="#999" />
                    <Text style={styles.bottomInfoText}>時段</Text>
                </View>
                <Pressable style={styles.bottomButton}>
                    <Text style={styles.bottomButtonText}>請選擇用餐時段</Text>
                </Pressable>
            </View>

            <BookingSheet
                visible={sheetVisible}
                onClose={() => setSheetVisible(false)}
                restaurant={restaurant}
                preSelectedDate={selectedDate.fullDate}
            />
        </View>
    );
}

// Helper Functions
function formatDateISO(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function groupSlotsByPeriod(slots: { time: string, status: 'AVAILABLE' | 'FULL', canWaitlist?: boolean }[]) {
    const lunch: typeof slots = [];
    const afternoon: typeof slots = [];
    const dinner: typeof slots = [];

    slots.forEach(slot => {
        const hour = parseInt(slot.time.split(':')[0]);
        if (hour < 14) {
            lunch.push(slot);
        } else if (hour < 17) {
            afternoon.push(slot);
        } else {
            dinner.push(slot);
        }
    });

    return { lunch, afternoon, dinner };
}

function getMonthData(year: number, month: number) {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: (Date | null)[] = [];

    for (let i = 0; i < firstDay; i++) {
        days.push(null);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 60);

    for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(year, month, i);
        if (date >= today && date <= maxDate) {
            days.push(date);
        } else if (date < today) {
            days.push(null); // Past dates shown as empty
        } else {
            days.push(null); // Beyond 60 days
        }
    }

    return days;
}

function renderCalendar(baseDate: Date, selected: any, onSelect: (date: any) => void) {
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

                    const dateStr = formatDateISO(date);
                    const isSelected = selected.fullDate === dateStr;
                    const isToday = dateStr === formatDateISO(new Date());

                    return (
                        <Pressable
                            key={i}
                            style={[
                                styles.dayCell,
                                isSelected && styles.dayCellSelected,
                                isToday && !isSelected && styles.dayCellToday
                            ]}
                            onPress={() => onSelect({
                                date: date,
                                label: `${date.getMonth() + 1}月${date.getDate()}日`,
                                dayName: ['週日', '週一', '週二', '週三', '週四', '週五', '週六'][date.getDay()],
                                fullDate: dateStr
                            })}
                        >
                            <Text style={[
                                styles.dayText,
                                isSelected && styles.dayTextSelected,
                                isToday && !isSelected && styles.dayTextToday
                            ]}>
                                {date.getDate()}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>
        </View>
    );
}

function renderSlotChip(
    slot: { time: string, status: 'AVAILABLE' | 'FULL', canWaitlist?: boolean },
    index: number,
    onPress: (slot: any) => void
) {
    const isFull = slot.status === 'FULL';

    return (
        <Pressable
            key={index}
            style={[styles.slotChip, isFull && styles.slotChipFull]}
            onPress={() => onPress(slot)}
        >
            <Text style={[styles.slotTime, isFull && styles.slotTimeFull]}>{slot.time}</Text>
            {isFull && slot.canWaitlist && (
                <Text style={styles.waitlistText}>登記候補</Text>
            )}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    headerBar: {
        backgroundColor: 'white',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5'
    },
    breadcrumb: {
        fontSize: 14,
        color: '#666'
    },

    scrollContent: {
        paddingBottom: 120
    },

    // Selector Sections
    selectorSection: {
        backgroundColor: 'white',
        marginBottom: 8
    },
    selectorLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 8
    },
    selectorButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: '#E5E5E5',
        borderRadius: 8,
        marginHorizontal: 16,
        marginBottom: 12,
        backgroundColor: 'white'
    },
    selectorButtonText: {
        fontSize: 16,
        color: '#333'
    },

    expandedOptions: {
        paddingHorizontal: 16,
        paddingBottom: 12
    },
    optionItem: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginBottom: 4
    },
    optionItemSelected: {
        backgroundColor: Colors.light.tint + '20'
    },
    optionText: {
        fontSize: 16,
        color: '#333'
    },
    optionTextSelected: {
        color: Colors.light.tint,
        fontWeight: '600'
    },

    // Calendar
    calendarContainer: {
        paddingHorizontal: 16,
        paddingBottom: 16
    },
    monthContainer: {
        marginBottom: 16
    },
    monthTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
        color: '#334155'
    },
    weekRow: {
        flexDirection: 'row',
        marginBottom: 8,
        justifyContent: 'space-around'
    },
    weekHeader: {
        width: 40,
        textAlign: 'center',
        color: '#94A3B8',
        fontSize: 12
    },
    daysGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap'
    },
    dayCell: {
        width: '14.28%',
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20
    },
    dayCellSelected: {
        backgroundColor: Colors.light.tint
    },
    dayCellToday: {
        borderWidth: 1,
        borderColor: Colors.light.tint
    },
    dayText: {
        fontSize: 14,
        color: '#334155'
    },
    dayTextSelected: {
        color: 'white',
        fontWeight: 'bold'
    },
    dayTextToday: {
        color: Colors.light.tint,
        fontWeight: 'bold'
    },

    // Notice
    noticeBox: {
        backgroundColor: 'white',
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 8
    },
    noticeText: {
        fontSize: 13,
        color: '#666',
        lineHeight: 20
    },

    // Slots
    slotsSection: {
        backgroundColor: 'white',
        padding: 16
    },
    slotsTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 16
    },
    periodSection: {
        marginBottom: 20
    },
    periodLabel: {
        fontSize: 14,
        color: '#999',
        marginBottom: 12
    },
    slotsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10
    },
    slotChip: {
        width: '31%',
        paddingVertical: 14,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E5E5',
        alignItems: 'center',
        backgroundColor: 'white'
    },
    slotChipFull: {
        borderColor: '#E5E5E5',
        backgroundColor: '#FAFAFA'
    },
    slotTime: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333'
    },
    slotTimeFull: {
        color: '#E97F3D'
    },
    waitlistText: {
        fontSize: 11,
        color: '#E97F3D',
        marginTop: 2
    },

    // Bottom Bar
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#E5E5E5',
        padding: 16,
        paddingBottom: 32
    },
    bottomInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        gap: 8
    },
    bottomInfoText: {
        fontSize: 14,
        color: '#333'
    },
    bottomButton: {
        backgroundColor: '#CCCCCC',
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center'
    },
    bottomButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white'
    },
    // 無時段資料樣式
    noSlotsContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },
    noSlotsText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#64748B',
        marginTop: 16,
    },
    noSlotsHint: {
        fontSize: 14,
        color: '#94A3B8',
        marginTop: 8,
    }
});
