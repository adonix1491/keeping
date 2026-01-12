import React from 'react';
import { View, Text, Image, StyleSheet, Pressable, Dimensions } from 'react-native';
import { Link } from 'expo-router';
import { Restaurant } from '../services/mockData';
import { Colors } from '../constants/Colors';
import { StatusBadge } from './StatusBadge';

interface RestaurantCardProps {
    restaurant: Restaurant;
    variant?: 'horizontal' | 'list';
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75;

export function RestaurantCard({ restaurant, variant = 'list' }: RestaurantCardProps) {
    const isHorizontal = variant === 'horizontal';

    return (
        <Link href={`/restaurant/${restaurant.id}`} asChild>
            <Pressable
                style={({ pressed }) => [
                    styles.container,
                    isHorizontal ? styles.containerHorizontal : styles.containerList,
                    pressed && styles.pressed
                ]}
            >
                <Image source={{ uri: restaurant.image }} style={styles.image} />
                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.name} numberOfLines={1}>{restaurant.name}</Text>
                        <StatusBadge status={restaurant.status} />
                    </View>
                    <Text style={styles.meta}>{restaurant.location} • ⭐ {restaurant.rating}</Text>
                    <View style={styles.tags}>
                        {restaurant.tags.slice(0, 2).map((tag, index) => (
                            <Text key={index} style={styles.tag}>#{tag}</Text>
                        ))}
                    </View>
                </View>
            </Pressable>
        </Link>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    containerHorizontal: {
        width: CARD_WIDTH,
        marginRight: 16,
    },
    containerList: {
        width: '100%',
        marginBottom: 16,
    },
    pressed: {
        opacity: 0.9,
        transform: [{ scale: 0.98 }],
    },
    image: {
        width: '100%',
        height: 140,
        backgroundColor: '#E2E8F0',
    },
    content: {
        padding: 12,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    name: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.light.text,
        flex: 1,
        marginRight: 8,
    },
    meta: {
        fontSize: 13,
        color: Colors.light.icon,
        marginBottom: 8,
    },
    tags: {
        flexDirection: 'row',
    },
    tag: {
        fontSize: 12,
        color: Colors.light.tint,
        backgroundColor: '#F0F9FF',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginRight: 6,
        overflow: 'hidden',
    },
});
