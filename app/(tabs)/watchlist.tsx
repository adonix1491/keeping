import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { api } from '../../services/api';
import { WatchlistItem } from '../../services/mockData';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';

export default function WatchlistScreen() {
    const [items, setItems] = useState<WatchlistItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const data = await api.getWatchlist();
        setItems(data);
        setLoading(false);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const getStatusColor = (status: WatchlistItem['status']) => {
        switch (status) {
            case 'FOUND': return Colors.available.primary;
            case 'EXPIRED': return Colors.expired.primary;
            default: return Colors.full.primary; // Loading/Monitoring
        }
    };

    const getStatusText = (item: WatchlistItem) => {
        switch (item.status) {
            case 'FOUND': return `已找到空位！ ${item.foundSlot}`;
            case 'EXPIRED': return '已過期';
            case 'LOADING': return '監控中...';
        }
    };

    const renderItem = ({ item }: { item: WatchlistItem }) => (
        <Link href={`/restaurant/${item.restaurantId}`} asChild>
            <Pressable style={styles.card}>
                <View style={styles.cardContent}>
                    <View style={styles.row}>
                        <Text style={styles.name}>{item.restaurantName}</Text>
                        {item.status === 'LOADING' && (
                            <ActivityIndicator size="small" color={Colors.full.primary} />
                        )}
                    </View>

                    <Text style={styles.details}>
                        {item.targetDate} • {item.partySize} 人
                    </Text>

                    <View style={[styles.statusBadge, { borderColor: getStatusColor(item.status) }]}>
                        <Ionicons
                            name={item.status === 'FOUND' ? 'checkmark-circle' : item.status === 'EXPIRED' ? 'time' : 'pulse'}
                            size={16}
                            color={getStatusColor(item.status)}
                        />
                        <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                            {getStatusText(item)}
                        </Text>
                    </View>
                </View>
            </Pressable>
        </Link>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.title}>我的監控</Text>
            </View>
            <FlatList
                data={items}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    !loading && <Text style={styles.emptyText}>目前沒有正在監控的餐廳</Text>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        padding: 16,
        paddingBottom: 8,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: Colors.primary,
    },
    list: {
        padding: 16,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    cardContent: {
        gap: 8,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    name: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.light.text,
    },
    details: {
        fontSize: 14,
        color: Colors.light.icon,
    },
    statusBadge: {
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1,
        marginTop: 4,
        backgroundColor: '#FAFAFA',
    },
    statusText: {
        fontSize: 13,
        fontWeight: '600',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 40,
        color: Colors.light.icon,
        fontSize: 16,
    },
});
