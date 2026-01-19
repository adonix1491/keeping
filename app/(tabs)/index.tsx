import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, FlatList, ActivityIndicator, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { api } from '../../services/api';
import { Restaurant } from '../../services/mockData';
import { RestaurantCard } from '../../components/RestaurantCard';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [selectedTag, setSelectedTag] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await api.getRestaurants();
            setRestaurants(data);
        } finally {
            setLoading(false);
        }
    };

    // 從餐廳資料中提取所有標籤
    const allTags = useMemo(() => {
        const tagSet = new Set<string>();
        restaurants.forEach(r => {
            r.tags?.forEach(tag => tagSet.add(tag));
        });
        return Array.from(tagSet);
    }, [restaurants]);

    // 篩選餐廳列表
    const filteredRestaurants = useMemo(() => {
        return restaurants.filter(r => {
            // 全文搜尋：名稱、地區
            const searchLower = searchText.toLowerCase().trim();
            const matchesSearch = !searchLower ||
                r.name.toLowerCase().includes(searchLower) ||
                r.location?.toLowerCase().includes(searchLower) ||
                r.tags?.some(tag => tag.toLowerCase().includes(searchLower));

            // 標籤篩選
            const matchesTag = !selectedTag || r.tags?.includes(selectedTag);

            return matchesSearch && matchesTag;
        });
    }, [restaurants, searchText, selectedTag]);

    /**
     * 處理標籤點擊
     * 點擊已選標籤則取消選擇，否則選擇該標籤
     */
    const handleTagPress = (tag: string) => {
        setSelectedTag(prev => prev === tag ? null : tag);
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <Text style={styles.appTitle}>候位通 🍽️</Text>

            {/* Search Bar */}
            <View style={styles.searchBar}>
                <Ionicons name="search" size={20} color="#94A3B8" />
                <TextInput
                    placeholder="輸入餐廳名稱或網址..."
                    style={styles.searchInput}
                    placeholderTextColor="#94A3B8"
                    value={searchText}
                    onChangeText={setSearchText}
                />
                {searchText.length > 0 && (
                    <Pressable onPress={() => setSearchText('')}>
                        <Ionicons name="close-circle" size={20} color="#94A3B8" />
                    </Pressable>
                )}
            </View>

            {/* Tag Filters */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
                {allTags.slice(0, 10).map(tag => (
                    <Pressable
                        key={tag}
                        style={selectedTag === tag ? styles.filterChipActive : styles.filterChip}
                        onPress={() => handleTagPress(tag)}
                    >
                        <Text style={selectedTag === tag ? styles.filterTextActive : styles.filterText}>
                            #{tag}
                        </Text>
                    </Pressable>
                ))}
            </ScrollView>

            {/* 搜尋結果提示 */}
            {(searchText || selectedTag) && (
                <Text style={styles.resultHint}>
                    找到 {filteredRestaurants.length} 間餐廳
                    {selectedTag && ` · #${selectedTag}`}
                </Text>
            )}

            <Text style={styles.sectionTitle}>為您推薦</Text>
            {/* Carousel */}
            <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={filteredRestaurants.slice(0, 5)}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <RestaurantCard restaurant={item} variant="horizontal" />}
                contentContainerStyle={styles.carouselContent}
            />

            <Text style={styles.sectionTitle}>熱門餐廳</Text>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={Colors.light.tint} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <FlatList
                data={filteredRestaurants}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <RestaurantCard restaurant={item} variant="list" />}
                ListHeaderComponent={renderHeader}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="search-outline" size={48} color="#CBD5E1" />
                        <Text style={styles.emptyText}>找不到符合的餐廳</Text>
                        <Pressable onPress={() => { setSearchText(''); setSelectedTag(null); }}>
                            <Text style={styles.clearFilterText}>清除篩選條件</Text>
                        </Pressable>
                    </View>
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
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: 16,
    },
    header: {
        marginBottom: 16,
    },
    appTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: Colors.primary,
        marginBottom: 16,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 16,
        color: Colors.light.text,
    },
    filters: {
        marginBottom: 24,
    },
    filterChip: {
        backgroundColor: 'white',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    filterChipActive: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
    },
    filterText: {
        fontSize: 14,
        color: Colors.light.text,
        fontWeight: '600',
    },
    filterTextActive: {
        fontSize: 14,
        color: 'white',
        fontWeight: '600',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.light.text,
        marginBottom: 12,
        marginTop: 8,
    },
    carouselContent: {
        paddingVertical: 8,
        marginBottom: 16,
    },
    // 搜尋結果提示
    resultHint: {
        fontSize: 14,
        color: '#64748B',
        marginBottom: 12,
    },
    // 空狀態
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 16,
        color: '#64748B',
        marginTop: 16,
    },
    clearFilterText: {
        fontSize: 14,
        color: Colors.primary,
        marginTop: 12,
        fontWeight: '600',
    },
});
