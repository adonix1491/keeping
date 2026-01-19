import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Pressable, ActivityIndicator, Alert, Linking } from 'react-native';
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

    /**
     * 處理時段點擊
     * - AVAILABLE 或 hasWaitlist → 開啟 INLINE URL
     * - FULL 且無 waitlist → 開啟監控訂閱 Sheet
     */
    const handleSlotPress = (slot: { time: string, status: 'AVAILABLE' | 'FULL', hasWaitlist?: boolean }) => {
        if (slot.status === 'AVAILABLE' || slot.hasWaitlist) {
            // 時段可預訂或有候補登記 → 開啟 INLINE 訂位頁面
            if (restaurant?.bookingUrl) {
                Linking.openURL(restaurant.bookingUrl);
            } else {
                Alert.alert('提示', '無法取得訂位連結');
            }
        } else {
            // 時段滿位且無候補 → 開啟監控訂閱
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
                            {/* 第三個月份以完整顯示 30 天 */}
                            {renderCalendar(
                                new Date(new Date().getFullYear(), new Date().getMonth() + 2, 1),
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
                            <Text style={styles.noSlotsText}>目前尚未開放候位</Text>
                            <Text style={styles.noSlotsHint}>請選擇其他日期或稍後再查詢</Text>
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
    const days: { date: Date | null; disabled: boolean }[] = [];

    for (let i = 0; i < firstDay; i++) {
        days.push({ date: null, disabled: true });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30); // 改為 30 天

    for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(year, month, i);
        date.setHours(0, 0, 0, 0);

        if (date < today) {
            // 過去日期：顯示但反灰
            days.push({ date, disabled: true });
        } else if (date > maxDate) {
            // 超過 30 天：顯示但反灰
            days.push({ date, disabled: true });
        } else {
            // 可選日期
            days.push({ date, disabled: false });
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
                {days.map((dayInfo, i) => {
                    if (!dayInfo.date) return <View key={i} style={styles.dayCell} />;

                    const date = dayInfo.date;
                    const isDisabled = dayInfo.disabled;
                    const dateStr = formatDateISO(date);
                    const isSelected = selected.fullDate === dateStr;
                    const isToday = dateStr === formatDateISO(new Date());

                    return (
                        <Pressable
                            key={i}
                            style={[
                                styles.dayCell,
                                isSelected && styles.dayCellSelected,
                                isToday && !isSelected && styles.dayCellToday,
                                isDisabled && styles.dayCellDisabled
                            ]}
                            onPress={() => {
                                if (!isDisabled) {
                                    onSelect({
                                        date: date,
                                        label: `${date.getMonth() + 1}月${date.getDate()}日`,
                                        dayName: ['週日', '週一', '週二', '週三', '週四', '週五', '週六'][date.getDay()],
                                        fullDate: dateStr
                                    });
                                }
                            }}
                            disabled={isDisabled}
                        >
                            <Text style={[
                                styles.dayText,
                                isSelected && styles.dayTextSelected,
                                isToday && !isSelected && styles.dayTextToday,
                                isDisabled && styles.dayTextDisabled
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

/**
 * 渲染時段按鈕
 * - AVAILABLE: 可預訂（綠色）
 * - FULL + hasWaitlist: 可登記候補（橘色，顯示「登記候補」）
 * - FULL + 無 waitlist: 滿位（橘色，顯示「監控候位」）
 */
function renderSlotChip(
    slot: { time: string, status: 'AVAILABLE' | 'FULL', hasWaitlist?: boolean, canWaitlist?: boolean },
    index: number,
    onPress: (slot: any) => void
) {
    const isFull = slot.status === 'FULL';
    const hasWaitlist = slot.hasWaitlist || false;
    const canMonitor = isFull && !hasWaitlist;

    return (
        <Pressable
            key={index}
            style={[
                styles.slotChip,
                isFull && styles.slotChipFull,
                !isFull && styles.slotChipAvailable
            ]}
            onPress={() => onPress(slot)}
        >
            <Text style={[
                styles.slotTime,
                isFull && styles.slotTimeFull,
                !isFull && styles.slotTimeAvailable
            ]}>
                {slot.time}
            </Text>
            {hasWaitlist && (
                <Text style={styles.waitlistText}>登記候補</Text>
            )}
            {canMonitor && (
                <Text style={styles.monitorText}>監控候位</Text>
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
    dayCellDisabled: {
        opacity: 0.3
    },
    dayTextDisabled: {
        color: '#CBD5E1'
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
    // 可預訂時段樣式
    slotChipAvailable: {
        borderColor: '#10B981',
        backgroundColor: '#ECFDF5'
    },
    slotTimeAvailable: {
        color: '#059669'
    },
    // 監控候位文字樣式
    monitorText: {
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
