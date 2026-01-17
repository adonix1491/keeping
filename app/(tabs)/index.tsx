import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { api } from '../../services/api';
import { Restaurant } from '../../services/mockData';
import { RestaurantCard } from '../../components/RestaurantCard';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [loading, setLoading] = useState(true);

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

    const renderHeader = () => (
        <View style={styles.header}>
            <Text style={styles.appTitle}>候位通 🍽️</Text>
            <Text style={styles.sectionTitle}>餐廳列表 (v2.1 Fixed)</Text>

            {/* Search Bar */}
            <View style={styles.searchBar}>
                <Ionicons name="search" size={20} color="#94A3B8" />
                <TextInput
                    placeholder="輸入餐廳名稱或網址..."
                    style={styles.searchInput}
                    placeholderTextColor="#94A3B8"
                />
            </View>

            {/* Quick Filters */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
                <View style={styles.filterChipActive}>
                    <Text style={styles.filterTextActive}>📅 今天</Text>
                </View>
                <View style={styles.filterChip}>
                    <Text style={styles.filterText}>👥 2 人</Text>
                </View>
                <View style={styles.filterChip}>
                    <Text style={styles.filterText}>🔥 熱門</Text>
                </View>
            </ScrollView>

            <Text style={styles.sectionTitle}>為您推薦</Text>
            {/* Carousel */}
            <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={restaurants}
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
                data={restaurants}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <RestaurantCard restaurant={item} variant="list" />}
                ListHeaderComponent={renderHeader}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
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
});
